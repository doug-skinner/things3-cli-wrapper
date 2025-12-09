/**
 * Things 3 Operations Module
 *
 * Provides high-level functions for interacting with Things 3 via AppleScript.
 * Handles task retrieval, filtering, and data transformation.
 */

import {
	executeAppleScript,
	verifyThings3Access,
	type Things3Task,
} from "./applescript";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

/**
 * Options for listing tasks
 */
export interface ListOptions {
	list?: string; // Built-in list: Today, Upcoming, Anytime, Someday
	project?: string; // Filter by project name
	area?: string; // Filter by area name
	tag?: string; // Filter by tag name
}

/**
 * Get all tasks from Things 3 with optional filters
 *
 * @param options - Filtering options
 * @returns Array of tasks matching the filters
 */
export async function listTasks(
	options: ListOptions = {},
): Promise<Things3Task[]> {
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
		return "set theTasks to to dos";
	}

	const normalizedList = listName.toLowerCase();

	switch (normalizedList) {
		case "today":
			return 'set theTasks to to dos of list "Today"';
		case "upcoming":
			return 'set theTasks to to dos of list "Upcoming"';
		case "anytime":
			return 'set theTasks to to dos of list "Anytime"';
		case "someday":
			return 'set theTasks to to dos of list "Someday"';
		default:
			throw new Error(
				`Unknown list: ${listName}. Valid lists are: Today, Upcoming, Anytime, Someday`,
			);
	}
}

/**
 * Parse AppleScript result into task objects
 *
 * Format is: ID:xxx||NAME:xxx||STATUS:xxx||TASK_END\n
 */
function parseAppleScriptTaskList(result: string): Things3Task[] {
	if (!result || result.trim() === "") {
		return [];
	}

	const tasks: Things3Task[] = [];
	const taskStrings = result.split("TASK_END\n").filter((t) => t.trim() !== "");

	for (const taskString of taskStrings) {
		const task: Partial<Things3Task> = {
			status: "open",
			tags: [],
		};

		// Split by field separator
		const fields = taskString.split("||");

		for (const field of fields) {
			const colonIndex = field.indexOf(":");
			if (colonIndex === -1) continue;

			const key = field.substring(0, colonIndex);
			const value = field.substring(colonIndex + 1).trim();

			if (!value) continue;

			switch (key) {
				case "ID":
					task.id = value;
					break;
				case "NAME":
					task.name = value;
					break;
				case "STATUS":
					task.status = value as "open" | "completed" | "canceled";
					break;
				case "NOTES":
					task.notes = value;
					break;
				case "PROJECT":
					task.project = value;
					break;
				case "AREA":
					task.area = value;
					break;
				case "DUE":
					// AppleScript returns date like "Monday, December 9, 2025 at 12:00:00 AM"
					// Convert to YYYY-MM-DD format
					task.dueDate = parseDateString(value);
					break;
				case "TAGS":
					task.tags = value.split(",").map((t) => t.trim());
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
		return date.toISOString().split("T")[0];
	} catch {
		return dateStr;
	}
}

/**
 * Apply additional filters to tasks
 */
function filterTasks(
	tasks: Things3Task[],
	options: ListOptions,
): Things3Task[] {
	let filtered = tasks;

	// Filter by project
	if (options.project) {
		const projectLower = options.project.toLowerCase();
		filtered = filtered.filter((task) =>
			task.project?.toLowerCase().includes(projectLower),
		);
	}

	// Filter by area
	if (options.area) {
		const areaLower = options.area.toLowerCase();
		filtered = filtered.filter((task) =>
			task.area?.toLowerCase().includes(areaLower),
		);
	}

	// Filter by tag
	if (options.tag) {
		const tagLower = options.tag.toLowerCase();
		filtered = filtered.filter((task) =>
			task.tags?.some((t) => t.toLowerCase().includes(tagLower)),
		);
	}

	return filtered;
}

/**
 * Options for adding a task
 */
export interface AddTaskOptions {
	notes?: string;
	due?: string; // YYYY-MM-DD format
	tags?: string; // Comma-separated
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
export async function addTask(
	name: string,
	options: AddTaskOptions = {},
): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Validate date format if provided
	if (options.due) {
		if (!isValidDateFormat(options.due)) {
			throw new Error(
				`Invalid date format: ${options.due}. Expected YYYY-MM-DD format (e.g., 2025-12-31)`,
			);
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
		const tagList = options.tags.split(",").map((t) => t.trim());
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
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r");
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

/**
 * Complete a task in Things 3 by name
 *
 * @param taskName - Name of the task to complete
 * @returns The completed task name
 * @throws Error if task not found, multiple tasks found, or other issues
 */
export async function completeTask(taskName: string): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Find tasks with matching name
	const script = `
    tell application "Things3"
      -- Find all to-dos with matching name (case-insensitive)
      set matchingTasks to (to dos whose name is "${escapeAppleScript(taskName)}")

      -- Check how many tasks matched
      set taskCount to count of matchingTasks

      if taskCount is 0 then
        return "NOT_FOUND:" & "${escapeAppleScript(taskName)}"
      else if taskCount > 1 then
        -- Multiple tasks found - return their details
        set output to "MULTIPLE:"
        repeat with t in matchingTasks
          set output to output & "ID:" & id of t & "|NAME:" & name of t & "|STATUS:" & status of t

          -- Add project if exists
          try
            set taskProject to name of project of t
            if taskProject is not missing value then
              set output to output & "|PROJECT:" & taskProject
            end if
          end try

          -- Add area if exists
          try
            set taskArea to name of area of t
            if taskArea is not missing value then
              set output to output & "|AREA:" & taskArea
            end if
          end try

          set output to output & "||"
        end repeat
        return output
      else
        -- Single task found
        set theTask to first item of matchingTasks
        set taskStatus to status of theTask

        -- Check if already completed
        if taskStatus is completed then
          return "ALREADY_COMPLETED:" & name of theTask
        end if

        -- Mark as completed
        set status of theTask to completed
        return "COMPLETED:" & name of theTask
      end if
    end tell
  `;

	const result = await executeAppleScript(script);
	const trimmedResult = result.trim();

	// Handle task not found
	if (trimmedResult.startsWith("NOT_FOUND:")) {
		const taskName = trimmedResult.substring("NOT_FOUND:".length);
		throw new Error(`Task not found: ${taskName}`);
	}

	// Handle multiple tasks found
	if (trimmedResult.startsWith("MULTIPLE:")) {
		const tasksData = trimmedResult.substring("MULTIPLE:".length);
		const tasks = tasksData.split("||").filter((t) => t.trim() !== "");

		let errorMsg = `Multiple tasks found with name "${taskName}":\n`;
		tasks.forEach((taskData, index) => {
			const fields: Record<string, string> = {};
			const parts = taskData.split("|");

			for (const part of parts) {
				const colonIndex = part.indexOf(":");
				if (colonIndex !== -1) {
					const key = part.substring(0, colonIndex);
					const value = part.substring(colonIndex + 1);
					fields[key] = value;
				}
			}

			errorMsg += `  ${index + 1}. ${fields.NAME} (Status: ${fields.STATUS}`;
			if (fields.PROJECT) {
				errorMsg += `, Project: ${fields.PROJECT}`;
			}
			if (fields.AREA) {
				errorMsg += `, Area: ${fields.AREA}`;
			}
			errorMsg += ")\n";
		});

		errorMsg += "\nPlease be more specific or use unique task names.";
		throw new Error(errorMsg);
	}

	// Handle already completed
	if (trimmedResult.startsWith("ALREADY_COMPLETED:")) {
		const taskName = trimmedResult.substring("ALREADY_COMPLETED:".length);
		throw new Error(`Task "${taskName}" is already completed`);
	}

	// Handle success
	if (trimmedResult.startsWith("COMPLETED:")) {
		return trimmedResult.substring("COMPLETED:".length);
	}

	// Unexpected result
	throw new Error(`Unexpected result from AppleScript: ${trimmedResult}`);
}

/**
 * Options for editing a task
 */
export interface EditTaskOptions {
	name?: string; // New task name
	notes?: string; // New notes
	due?: string; // New due date (YYYY-MM-DD format)
	tags?: string; // New tags (comma-separated, replaces existing)
	project?: string; // Move to different project
	area?: string; // Move to different area
}

/**
 * Edit an existing task in Things 3 by name
 *
 * @param taskName - Name of the task to edit
 * @param options - Properties to update
 * @returns Summary of changes made
 * @throws Error if task not found, multiple tasks found, or validation fails
 */
export async function editTask(
	taskName: string,
	options: EditTaskOptions = {},
): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Validate that at least one option is provided
	const hasChanges =
		options.name !== undefined ||
		options.notes !== undefined ||
		options.due !== undefined ||
		options.tags !== undefined ||
		options.project !== undefined ||
		options.area !== undefined;

	if (!hasChanges) {
		throw new Error(
			"No changes specified. Please provide at least one option to update (--name, --notes, --due, --tags, --project, or --area)",
		);
	}

	// Validate date format if provided
	if (options.due && !isValidDateFormat(options.due)) {
		throw new Error(
			`Invalid date format: ${options.due}. Expected YYYY-MM-DD format (e.g., 2025-12-31)`,
		);
	}

	// First, find the task to ensure it exists and is unique
	const findScript = `
    tell application "Things3"
      set matchingTasks to (to dos whose name is "${escapeAppleScript(taskName)}")
      set taskCount to count of matchingTasks

      if taskCount is 0 then
        return "NOT_FOUND:" & "${escapeAppleScript(taskName)}"
      else if taskCount > 1 then
        set output to "MULTIPLE:"
        repeat with t in matchingTasks
          set output to output & "ID:" & id of t & "|NAME:" & name of t & "|STATUS:" & status of t
          try
            set taskProject to name of project of t
            if taskProject is not missing value then
              set output to output & "|PROJECT:" & taskProject
            end if
          end try
          try
            set taskArea to name of area of t
            if taskArea is not missing value then
              set output to output & "|AREA:" & taskArea
            end if
          end try
          set output to output & "||"
        end repeat
        return output
      else
        return "FOUND:" & id of (first item of matchingTasks)
      end if
    end tell
  `;

	const findResult = await executeAppleScript(findScript);
	const trimmedResult = findResult.trim();

	// Handle task not found
	if (trimmedResult.startsWith("NOT_FOUND:")) {
		const taskName = trimmedResult.substring("NOT_FOUND:".length);
		throw new Error(`Task not found: ${taskName}`);
	}

	// Handle multiple tasks
	if (trimmedResult.startsWith("MULTIPLE:")) {
		const tasksData = trimmedResult.substring("MULTIPLE:".length);
		const tasks = tasksData.split("||").filter((t) => t.trim() !== "");

		let errorMsg = `Multiple tasks found with name "${taskName}":\n`;
		tasks.forEach((taskData, index) => {
			const fields: Record<string, string> = {};
			const parts = taskData.split("|");

			for (const part of parts) {
				const colonIndex = part.indexOf(":");
				if (colonIndex !== -1) {
					const key = part.substring(0, colonIndex);
					const value = part.substring(colonIndex + 1);
					fields[key] = value;
				}
			}

			errorMsg += `  ${index + 1}. ${fields.NAME} (Status: ${fields.STATUS}`;
			if (fields.PROJECT) {
				errorMsg += `, Project: ${fields.PROJECT}`;
			}
			if (fields.AREA) {
				errorMsg += `, Area: ${fields.AREA}`;
			}
			errorMsg += ")\n";
		});

		errorMsg += "\nPlease be more specific or use unique task names.";
		throw new Error(errorMsg);
	}

	// Extract task ID
	const taskId = trimmedResult.substring("FOUND:".length);

	// Build update script
	let updateScript = `
    tell application "Things3"
      set theTask to to do id "${taskId}"
  `;

	const changes: string[] = [];

	// Update name if provided
	if (options.name) {
		updateScript += `
      set name of theTask to "${escapeAppleScript(options.name)}"
    `;
		changes.push(`name changed to "${options.name}"`);
	}

	// Update notes if provided
	if (options.notes !== undefined) {
		updateScript += `
      set notes of theTask to "${escapeAppleScript(options.notes)}"
    `;
		changes.push("notes updated");
	}

	// Update due date if provided
	if (options.due) {
		updateScript += `
      set due date of theTask to date "${options.due}"
    `;
		changes.push(`due date set to ${options.due}`);
	}

	// Update tags if provided
	if (options.tags !== undefined) {
		const tagList = options.tags
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t !== "");

		// Ensure all tags exist first
		for (const tag of tagList) {
			updateScript += `
        try
          set targetTag to first tag whose name is "${escapeAppleScript(tag)}"
        on error
          set targetTag to make new tag with properties {name:"${escapeAppleScript(tag)}"}
        end try
      `;
		}

		// Build the new tag list
		if (tagList.length > 0) {
			let tagListScript = "";
			for (let i = 0; i < tagList.length; i++) {
				if (i === 0) {
					tagListScript = `"${escapeAppleScript(tagList[i])}"`;
				} else {
					tagListScript += ` & "${escapeAppleScript(tagList[i])}"`;
				}
			}

			updateScript += `
        set tag names of theTask to ${tagListScript}
      `;
			changes.push(`tags set to: ${options.tags}`);
		} else {
			// Empty tags - clear them
			updateScript += `
        set tag names of theTask to ""
      `;
			changes.push("tags cleared");
		}
	}

	// Move to project if specified
	if (options.project) {
		updateScript += `
      try
        set targetProject to first project whose name is "${escapeAppleScript(options.project)}"
        move theTask to targetProject
      on error
        error "PROJECT_NOT_FOUND:${escapeAppleScript(options.project)}"
      end try
    `;
		changes.push(`moved to project "${options.project}"`);
	}

	// Move to area if specified
	if (options.area) {
		updateScript += `
      try
        set targetArea to first area whose name is "${escapeAppleScript(options.area)}"
        set area of theTask to targetArea
      on error
        error "AREA_NOT_FOUND:${escapeAppleScript(options.area)}"
      end try
    `;
		changes.push(`moved to area "${options.area}"`);
	}

	updateScript += `
      return name of theTask
    end tell
  `;

	try {
		const result = await executeAppleScript(updateScript);
		const finalTaskName = result.trim();

		return `Task "${finalTaskName}" updated: ${changes.join(", ")}`;
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);

		// Check for project/area not found errors
		if (errorMsg.includes("PROJECT_NOT_FOUND:")) {
			const projectName = errorMsg.split("PROJECT_NOT_FOUND:")[1];
			throw new Error(`Project not found: ${projectName}`);
		}
		if (errorMsg.includes("AREA_NOT_FOUND:")) {
			const areaName = errorMsg.split("AREA_NOT_FOUND:")[1];
			throw new Error(`Area not found: ${areaName}`);
		}

		throw error;
	}
}

/**
 * Cancel a task in Things 3 by name
 *
 * @param taskName - Name of the task to cancel
 * @returns The canceled task name
 * @throws Error if task not found, multiple tasks found, or other issues
 */
export async function cancelTask(taskName: string): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Find tasks with matching name
	const script = `
    tell application "Things3"
      -- Find all to-dos with matching name
      set matchingTasks to (to dos whose name is "${escapeAppleScript(taskName)}")

      -- Check how many tasks matched
      set taskCount to count of matchingTasks

      if taskCount is 0 then
        return "NOT_FOUND:" & "${escapeAppleScript(taskName)}"
      else if taskCount > 1 then
        -- Multiple tasks found - return their details
        set output to "MULTIPLE:"
        repeat with t in matchingTasks
          set output to output & "ID:" & id of t & "|NAME:" & name of t & "|STATUS:" & status of t

          -- Add project if exists
          try
            set taskProject to name of project of t
            if taskProject is not missing value then
              set output to output & "|PROJECT:" & taskProject
            end if
          end try

          -- Add area if exists
          try
            set taskArea to name of area of t
            if taskArea is not missing value then
              set output to output & "|AREA:" & taskArea
            end if
          end try

          set output to output & "||"
        end repeat
        return output
      else
        -- Single task found
        set theTask to first item of matchingTasks
        set taskStatus to status of theTask

        -- Check if already canceled
        if taskStatus is canceled then
          return "ALREADY_CANCELED:" & name of theTask
        end if

        -- Check if already completed
        if taskStatus is completed then
          return "ALREADY_COMPLETED:" & name of theTask
        end if

        -- Mark as canceled
        set status of theTask to canceled
        return "CANCELED:" & name of theTask
      end if
    end tell
  `;

	const result = await executeAppleScript(script);
	const trimmedResult = result.trim();

	// Handle task not found
	if (trimmedResult.startsWith("NOT_FOUND:")) {
		const taskName = trimmedResult.substring("NOT_FOUND:".length);
		throw new Error(`Task not found: ${taskName}`);
	}

	// Handle multiple tasks found
	if (trimmedResult.startsWith("MULTIPLE:")) {
		const tasksData = trimmedResult.substring("MULTIPLE:".length);
		const tasks = tasksData.split("||").filter((t) => t.trim() !== "");

		let errorMsg = `Multiple tasks found with name "${taskName}":\n`;
		tasks.forEach((taskData, index) => {
			const fields: Record<string, string> = {};
			const parts = taskData.split("|");

			for (const part of parts) {
				const colonIndex = part.indexOf(":");
				if (colonIndex !== -1) {
					const key = part.substring(0, colonIndex);
					const value = part.substring(colonIndex + 1);
					fields[key] = value;
				}
			}

			errorMsg += `  ${index + 1}. ${fields.NAME} (Status: ${fields.STATUS}`;
			if (fields.PROJECT) {
				errorMsg += `, Project: ${fields.PROJECT}`;
			}
			if (fields.AREA) {
				errorMsg += `, Area: ${fields.AREA}`;
			}
			errorMsg += ")\n";
		});

		errorMsg += "\nPlease be more specific or use unique task names.";
		throw new Error(errorMsg);
	}

	// Handle already canceled
	if (trimmedResult.startsWith("ALREADY_CANCELED:")) {
		const taskName = trimmedResult.substring("ALREADY_CANCELED:".length);
		throw new Error(`Task "${taskName}" is already canceled`);
	}

	// Handle already completed
	if (trimmedResult.startsWith("ALREADY_COMPLETED:")) {
		const taskName = trimmedResult.substring("ALREADY_COMPLETED:".length);
		throw new Error(
			`Task "${taskName}" is already completed and cannot be canceled`,
		);
	}

	// Handle success
	if (trimmedResult.startsWith("CANCELED:")) {
		return trimmedResult.substring("CANCELED:".length);
	}

	// Unexpected result
	throw new Error(`Unexpected result from AppleScript: ${trimmedResult}`);
}

/**
 * Options for adding a project
 */
export interface AddProjectOptions {
	area?: string; // Area to create project in
	notes?: string; // Project notes
	deadline?: string; // Project deadline (YYYY-MM-DD format)
}

/**
 * Add a new project to Things 3
 *
 * @param name - Project name (required)
 * @param options - Project options
 * @returns The created project name
 */
export async function addProject(
	name: string,
	options: AddProjectOptions = {},
): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Validate project name
	if (!name || name.trim() === "") {
		throw new Error("Project name cannot be empty");
	}

	// Validate deadline format if provided
	if (options.deadline && !isValidDateFormat(options.deadline)) {
		throw new Error(
			`Invalid date format: ${options.deadline}. Expected YYYY-MM-DD format (e.g., 2025-12-31)`,
		);
	}

	// Build AppleScript to create project
	let script = `
    tell application "Things3"
      -- Create new project
      set newProject to make new project with properties {name:"${escapeAppleScript(name)}"}
  `;

	// Add notes if provided
	if (options.notes) {
		script += `
      set notes of newProject to "${escapeAppleScript(options.notes)}"
    `;
	}

	// Add deadline if provided
	if (options.deadline) {
		script += `
      set completion date of newProject to date "${options.deadline}"
    `;
	}

	// Add to area if specified
	if (options.area) {
		script += `
      -- Find area by name
      try
        set targetArea to first area whose name is "${escapeAppleScript(options.area)}"
        set area of newProject to targetArea
      on error
        error "AREA_NOT_FOUND:${escapeAppleScript(options.area)}"
      end try
    `;
	}

	script += `
      return name of newProject
    end tell
  `;

	try {
		const result = await executeAppleScript(script);
		return result.trim();
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);

		// Check for area not found error
		if (errorMsg.includes("AREA_NOT_FOUND:")) {
			const areaName = errorMsg.split("AREA_NOT_FOUND:")[1];
			throw new Error(`Area not found: ${areaName}`);
		}

		throw error;
	}
}

/**
 * Add a new area to Things 3
 *
 * @param name - Area name (required)
 * @returns The created area name
 */
export async function addArea(name: string): Promise<string> {
	// Verify Things 3 is accessible
	await verifyThings3Access();

	// Validate area name
	if (!name || name.trim() === "") {
		throw new Error("Area name cannot be empty");
	}

	// Build AppleScript to create area
	const script = `
    tell application "Things3"
      -- Create new area
      set newArea to make new area with properties {name:"${escapeAppleScript(name)}"}
      return name of newArea
    end tell
  `;

	const result = await executeAppleScript(script);
	return result.trim();
}

/**
 * Get the source path of the skill directory
 * Handles both global and local installations
 *
 * @returns Absolute path to the skill/ directory
 */
export function getSkillSourcePath(): string {
	// __dirname in compiled code is in dist/, so skill/ is one level up
	return path.join(__dirname, "..", "skill");
}

/**
 * Get the destination path for the skill installation
 *
 * @returns Absolute path to ~/.claude/skills/things3-cli-wrapper/
 */
export function getSkillDestinationPath(): string {
	const homeDir = os.homedir();
	return path.join(homeDir, ".claude", "skills", "things3-cli-wrapper");
}

/**
 * Validate that the skill directory exists and contains required files
 *
 * @param skillPath - Path to the skill directory
 * @throws Error if validation fails
 */
export async function validateSkillDirectory(skillPath: string): Promise<void> {
	try {
		// Check if directory exists
		const stats = await fs.stat(skillPath);
		if (!stats.isDirectory()) {
			throw new Error(`Skill path is not a directory: ${skillPath}`);
		}

		// Check if SKILL.md exists
		const skillMdPath = path.join(skillPath, "SKILL.md");
		await fs.access(skillMdPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(
				"Skill directory not found. This package may not include the skill files. " +
					"Please ensure you're using a published version or the skill/ directory exists.",
			);
		}
		throw error;
	}
}

/**
 * Options for installing the skill
 */
export interface InstallSkillOptions {
	force?: boolean;
}

/**
 * Result of skill installation
 */
export interface InstallSkillResult {
	success: boolean;
	message?: string;
	installPath?: string;
	files?: string[];
	error?: string;
}

/**
 * Install the Things3 Claude Skill to ~/.claude/skills/
 *
 * @param options - Installation options
 * @returns Installation result
 */
export async function installSkill(
	options: InstallSkillOptions = {},
): Promise<InstallSkillResult> {
	try {
		// Get source and destination paths
		const sourcePath = getSkillSourcePath();
		const destPath = getSkillDestinationPath();

		// Validate skill directory exists
		await validateSkillDirectory(sourcePath);

		// Check if ~/.claude/ exists
		const claudeDir = path.join(os.homedir(), ".claude");
		try {
			await fs.access(claudeDir);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return {
					success: false,
					error:
						"Claude Code configuration directory (~/.claude/) not found. " +
						"Please ensure Claude Code is installed. Visit https://claude.com/code for installation instructions.",
					installPath: destPath,
				};
			}
			throw error;
		}

		// Check if destination already exists
		try {
			await fs.access(destPath);
			// Destination exists
			if (!options.force) {
				return {
					success: false,
					error: `Skill already installed at ${destPath}. Use --force to overwrite.`,
					installPath: destPath,
				};
			}
			// Force mode - remove existing directory
			await fs.rm(destPath, { recursive: true, force: true });
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw error;
			}
			// Destination doesn't exist - this is fine
		}

		// Create ~/.claude/skills/ directory if it doesn't exist
		const skillsDir = path.join(claudeDir, "skills");
		await fs.mkdir(skillsDir, { recursive: true });

		// Copy skill directory recursively
		await copyDirectory(sourcePath, destPath);

		// Get list of installed files
		const files = await getFilesRecursively(destPath);

		return {
			success: true,
			message: "Skill installed successfully",
			installPath: destPath,
			files: files.map((f) => path.relative(destPath, f)),
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
			installPath: getSkillDestinationPath(),
		};
	}
}

/**
 * Copy a directory recursively
 *
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
async function copyDirectory(src: string, dest: string): Promise<void> {
	// Create destination directory
	await fs.mkdir(dest, { recursive: true });

	// Read source directory
	const entries = await fs.readdir(src, { withFileTypes: true });

	// Copy each entry
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			// Recursively copy subdirectory
			await copyDirectory(srcPath, destPath);
		} else {
			// Copy file
			await fs.copyFile(srcPath, destPath);
		}
	}
}

/**
 * Get all files in a directory recursively
 *
 * @param dir - Directory path
 * @returns Array of file paths
 */
async function getFilesRecursively(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			const subFiles = await getFilesRecursively(fullPath);
			files.push(...subFiles);
		} else {
			files.push(fullPath);
		}
	}

	return files;
}
