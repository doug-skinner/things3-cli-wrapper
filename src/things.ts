/**
 * Things 3 Operations Module
 *
 * Provides high-level functions for interacting with Things 3 via AppleScript.
 * Handles task retrieval, filtering, and data transformation.
 */

import { executeAppleScript, verifyThings3Access, type Things3Task } from './applescript';

/**
 * Options for listing tasks
 */
export interface ListOptions {
  list?: string;      // Built-in list: Today, Upcoming, Anytime, Someday
  project?: string;   // Filter by project name
  area?: string;      // Filter by area name
  tag?: string;       // Filter by tag name
}

/**
 * Get all tasks from Things 3 with optional filters
 *
 * @param options - Filtering options
 * @returns Array of tasks matching the filters
 */
export async function listTasks(options: ListOptions = {}): Promise<Things3Task[]> {
  // Verify Things 3 is accessible
  await verifyThings3Access();

  // Build AppleScript to retrieve tasks
  // We'll format output as JSON-like string for easier parsing
  const script = `
    tell application "Things3"
      -- Get tasks based on list filter
      ${getListFilterScript(options.list)}

      set output to ""

      -- Process each task
      repeat with t in theTasks
        -- ID
        set output to output & "ID:" & id of t & "||"

        -- Name
        set output to output & "NAME:" & name of t & "||"

        -- Status
        set output to output & "STATUS:" & status of t & "||"

        -- Notes (may be empty)
        try
          set taskNotes to notes of t
          if taskNotes is not missing value and taskNotes is not "" then
            set output to output & "NOTES:" & taskNotes & "||"
          end if
        end try

        -- Project (may not exist)
        try
          set taskProject to name of project of t
          if taskProject is not missing value then
            set output to output & "PROJECT:" & taskProject & "||"
          end if
        end try

        -- Area (may not exist)
        try
          set taskArea to name of area of t
          if taskArea is not missing value then
            set output to output & "AREA:" & taskArea & "||"
          end if
        end try

        -- Due date (may not exist)
        try
          set taskDue to due date of t
          if taskDue is not missing value then
            set output to output & "DUE:" & (taskDue as string) & "||"
          end if
        end try

        -- Tags (may be empty list)
        try
          set taskTags to name of tags of t
          if (count of taskTags) > 0 then
            set tagList to ""
            repeat with tagName in taskTags
              if tagList is "" then
                set tagList to tagName
              else
                set tagList to tagList & "," & tagName
              end if
            end repeat
            set output to output & "TAGS:" & tagList & "||"
          end if
        end try

        -- Task separator
        set output to output & "TASK_END" & linefeed
      end repeat

      return output
    end tell
  `;

  const result = await executeAppleScript(script);

  // Parse AppleScript result into task objects
  const tasks = parseAppleScriptTaskList(result);

  // Apply additional filters
  return filterTasks(tasks, options);
}

/**
 * Generate AppleScript for list filter
 */
function getListFilterScript(listName?: string): string {
  if (!listName) {
    // No filter - get all tasks
    return 'set theTasks to to dos';
  }

  const normalizedList = listName.toLowerCase();

  switch (normalizedList) {
    case 'today':
      return 'set theTasks to to dos of list "Today"';
    case 'upcoming':
      return 'set theTasks to to dos of list "Upcoming"';
    case 'anytime':
      return 'set theTasks to to dos of list "Anytime"';
    case 'someday':
      return 'set theTasks to to dos of list "Someday"';
    default:
      throw new Error(`Unknown list: ${listName}. Valid lists are: Today, Upcoming, Anytime, Someday`);
  }
}

/**
 * Parse AppleScript result into task objects
 *
 * Format is: ID:xxx||NAME:xxx||STATUS:xxx||TASK_END\n
 */
function parseAppleScriptTaskList(result: string): Things3Task[] {
  if (!result || result.trim() === '') {
    return [];
  }

  const tasks: Things3Task[] = [];
  const taskStrings = result.split('TASK_END\n').filter(t => t.trim() !== '');

  for (const taskString of taskStrings) {
    const task: Partial<Things3Task> = {
      status: 'open',
      tags: [],
    };

    // Split by field separator
    const fields = taskString.split('||');

    for (const field of fields) {
      const colonIndex = field.indexOf(':');
      if (colonIndex === -1) continue;

      const key = field.substring(0, colonIndex);
      const value = field.substring(colonIndex + 1).trim();

      if (!value) continue;

      switch (key) {
        case 'ID':
          task.id = value;
          break;
        case 'NAME':
          task.name = value;
          break;
        case 'STATUS':
          task.status = value as 'open' | 'completed' | 'canceled';
          break;
        case 'NOTES':
          task.notes = value;
          break;
        case 'PROJECT':
          task.project = value;
          break;
        case 'AREA':
          task.area = value;
          break;
        case 'DUE':
          // AppleScript returns date like "Monday, December 9, 2025 at 12:00:00 AM"
          // Convert to YYYY-MM-DD format
          task.dueDate = parseDateString(value);
          break;
        case 'TAGS':
          task.tags = value.split(',').map(t => t.trim());
          break;
      }
    }

    // Only add task if it has required fields
    if (task.id && task.name) {
      tasks.push(task as Things3Task);
    }
  }

  return tasks;
}

/**
 * Parse AppleScript date string to YYYY-MM-DD format
 */
function parseDateString(dateStr: string): string {
  try {
    // AppleScript returns something like "Monday, December 9, 2025 at 12:00:00 AM"
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return dateStr; // Return as-is if can't parse
    }
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Apply additional filters to tasks
 */
function filterTasks(tasks: Things3Task[], options: ListOptions): Things3Task[] {
  let filtered = tasks;

  // Filter by project
  if (options.project) {
    const projectLower = options.project.toLowerCase();
    filtered = filtered.filter(task =>
      task.project?.toLowerCase().includes(projectLower)
    );
  }

  // Filter by area
  if (options.area) {
    const areaLower = options.area.toLowerCase();
    filtered = filtered.filter(task =>
      task.area?.toLowerCase().includes(areaLower)
    );
  }

  // Filter by tag
  if (options.tag) {
    const tagLower = options.tag.toLowerCase();
    filtered = filtered.filter(task =>
      task.tags?.some(t => t.toLowerCase().includes(tagLower))
    );
  }

  return filtered;
}

/**
 * Options for adding a task
 */
export interface AddTaskOptions {
  notes?: string;
  due?: string;        // YYYY-MM-DD format
  tags?: string;       // Comma-separated
  project?: string;
  area?: string;
}

/**
 * Add a new task to Things 3
 *
 * @param name - Task name (required)
 * @param options - Task options
 * @returns The created task name
 */
export async function addTask(name: string, options: AddTaskOptions = {}): Promise<string> {
  // Verify Things 3 is accessible
  await verifyThings3Access();

  // Validate date format if provided
  if (options.due) {
    if (!isValidDateFormat(options.due)) {
      throw new Error(`Invalid date format: ${options.due}. Expected YYYY-MM-DD format (e.g., 2025-12-31)`);
    }
  }

  // Build AppleScript to create task
  let script = `
    tell application "Things3"
      -- Create new to-do
      set newTodo to make new to do with properties {name:"${escapeAppleScript(name)}"}
  `;

  // Add notes if provided
  if (options.notes) {
    script += `
      set notes of newTodo to "${escapeAppleScript(options.notes)}"
    `;
  }

  // Add due date if provided
  if (options.due) {
    script += `
      set due date of newTodo to date "${options.due}"
    `;
  }

  // Add to project if specified
  if (options.project) {
    script += `
      -- Find project by name
      try
        set targetProject to first project whose name is "${escapeAppleScript(options.project)}"
        move newTodo to targetProject
      on error
        error "Project not found: ${escapeAppleScript(options.project)}"
      end try
    `;
  }

  // Add to area if specified
  if (options.area) {
    script += `
      -- Find area by name
      try
        set targetArea to first area whose name is "${escapeAppleScript(options.area)}"
        set area of newTodo to targetArea
      on error
        error "Area not found: ${escapeAppleScript(options.area)}"
      end try
    `;
  }

  // Add tags if specified
  if (options.tags) {
    const tagList = options.tags.split(',').map(t => t.trim());
    for (const tag of tagList) {
      script += `
        -- Create or get tag and add to task
        try
          set targetTag to first tag whose name is "${escapeAppleScript(tag)}"
        on error
          set targetTag to make new tag with properties {name:"${escapeAppleScript(tag)}"}
        end try
        tell newTodo
          set tag names to (tag names & "${escapeAppleScript(tag)}")
        end tell
      `;
    }
  }

  script += `
      return name of newTodo
    end tell
  `;

  const result = await executeAppleScript(script);
  return result.trim();
}

/**
 * Escape special characters for AppleScript strings
 */
function escapeAppleScript(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Validate date format YYYY-MM-DD
 */
function isValidDateFormat(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime());
}
