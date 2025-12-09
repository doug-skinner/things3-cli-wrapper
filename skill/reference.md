# Things3 CLI - Complete Command Reference

This document provides comprehensive documentation for all `thangs` CLI commands, including every option, flag, validation rule, output format, and error case.

## Table of Contents

- [list - Display Tasks](#list---display-tasks)
- [add - Create Task](#add---create-task)
- [edit - Update Task](#edit---update-task)
- [complete - Mark Task Done](#complete---mark-task-done)
- [cancel - Cancel Task](#cancel---cancel-task)
- [add-project - Create Project](#add-project---create-project)
- [add-area - Create Area](#add-area---create-area)
- [Output Formats](#output-formats)
- [Error Cases](#error-cases)

---

## list - Display Tasks

View and filter tasks from Things 3.

### Syntax

```bash
thangs list [options]
```

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--list` | string | Filter by built-in list name | No | none |
| `--project` | string | Filter by project name | No | none |
| `--area` | string | Filter by area name | No | none |
| `--tag` | string | Filter by tag name | No | none |
| `--json` | boolean | Output JSON instead of table | No | false |

### Option Details

#### `--list <name>`

Filters tasks by Things 3's built-in smart lists. Valid values:
- `Today` - Tasks scheduled for today
- `Upcoming` - Tasks scheduled for future dates
- `Anytime` - Tasks without specific dates
- `Someday` - Tasks marked for someday/maybe

**Validation:**
- Case-sensitive (must match exactly)
- Only one list can be specified per query
- Invalid list names are ignored (returns all tasks)

**Example:**
```bash
thangs list --list Today
thangs list --list Upcoming
```

#### `--project <name>`

Filters tasks by project name. Uses case-insensitive partial matching.

**Matching behavior:**
- Partial matches work: `--project "Web"` matches "Website Redesign"
- Case-insensitive: `--project "website"` matches "Website Redesign"
- Returns tasks in projects that match the filter

**Example:**
```bash
thangs list --project "Marketing"
thangs list --project "Q1"
```

#### `--area <name>`

Filters tasks by area name. Uses case-insensitive partial matching.

**Matching behavior:**
- Partial matches work: `--area "wor"` matches "Work"
- Case-insensitive: `--area "WORK"` matches "Work"
- Returns tasks in areas that match the filter
- Also returns tasks in projects within matching areas

**Example:**
```bash
thangs list --area "Work"
thangs list --area "Personal"
```

#### `--tag <name>`

Filters tasks by tag name. Uses case-insensitive partial matching.

**Matching behavior:**
- Partial matches work: `--tag "urg"` matches tasks with "urgent" tag
- Case-insensitive: `--tag "URGENT"` matches "urgent"
- Returns tasks that have a matching tag

**Example:**
```bash
thangs list --tag "urgent"
thangs list --tag "quick-win"
```

### Output Formats

#### Table Output (default)

Displays tasks in a formatted table with columns:
- **Task** - Task name (white)
- **Project** - Project name (blue), or "-" if none
- **Area** - Area name (green), or "-" if none
- **Tags** - Comma-separated tags (yellow), or "-" if none
- **Due Date** - Due date with color coding:
  - Red: Overdue dates
  - Yellow: Dates in next 3 days
  - White: Future dates
  - "-" if no due date

**Example output:**
```
┌─────────────────────────┬──────────────────┬────────┬──────────────┬────────────┐
│ Task                    │ Project          │ Area   │ Tags         │ Due Date   │
├─────────────────────────┼──────────────────┼────────┼──────────────┼────────────┤
│ Review budget           │ Finance          │ Work   │ urgent       │ 2025-12-10 │
│ Call client             │ Sales            │ Work   │ phone        │ 2025-12-15 │
│ Morning workout         │ -                │ Health │ routine      │ -          │
└─────────────────────────┴──────────────────┴────────┴──────────────┴────────────┘
```

#### JSON Output (--json flag)

Returns array of task objects:

```json
[
  {
    "name": "Review budget",
    "project": "Finance",
    "area": "Work",
    "tags": ["urgent"],
    "dueDate": "2025-12-10",
    "notes": "Include Q4 numbers",
    "creationDate": "2025-12-08",
    "modificationDate": "2025-12-09"
  }
]
```

**Field descriptions:**
- `name` (string) - Task name
- `project` (string | null) - Project name or null
- `area` (string | null) - Area name or null
- `tags` (string[]) - Array of tag names
- `dueDate` (string | null) - Due date in YYYY-MM-DD format or null
- `notes` (string) - Task notes/description
- `creationDate` (string) - When task was created (YYYY-MM-DD format)
- `modificationDate` (string) - When task was last modified (YYYY-MM-DD format)

### Examples

```bash
# List all tasks
thangs list

# Today's tasks
thangs list --list Today

# Work area tasks
thangs list --area Work

# Urgent tasks
thangs list --tag urgent

# Marketing project tasks as JSON
thangs list --project Marketing --json

# Combine filters (Today + Work area)
thangs list --list Today --area Work
```

### Error Cases

- **Things 3 not installed**: "Things 3 is not accessible. Please ensure it is installed and running."
- **No tasks found**: Returns empty table or empty JSON array `[]`
- **Invalid list name**: Silently ignored, returns all tasks (no error)

---

## add - Create Task

Create a new task in Things 3 Inbox or assign it to a project/area.

### Syntax

```bash
thangs add <name> [options]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<name>` | string | Task name (positional) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--notes` | string | Task notes/description | No | empty |
| `--due` | string | Due date (YYYY-MM-DD) | No | none |
| `--tags` | string | Comma-separated tags | No | none |
| `--project` | string | Assign to project by name | No | none |
| `--area` | string | Assign to area by name | No | none |
| `--json` | boolean | Output JSON response | No | false |

### Option Details

#### `<name>` (required)

The task name/title.

**Validation:**
- Cannot be empty string
- Can include any characters (quotes, special characters, etc.)
- Will be exactly as provided (no trimming or modification)

**Example:**
```bash
thangs add "Review budget"
thangs add "Call client re: contract"
```

#### `--notes <text>`

Task notes/description. Can be multi-word text.

**Behavior:**
- Supports any text content
- Preserves formatting (newlines, special characters)
- Optional field

**Example:**
```bash
thangs add "Prepare presentation" --notes "Include Q4 metrics and forecast"
thangs add "Research topic" --notes "Focus on recent studies"
```

#### `--due <date>`

Due date in YYYY-MM-DD format.

**Validation:**
- Must match YYYY-MM-DD format exactly
- Invalid formats cause error: "Invalid date format. Use YYYY-MM-DD"
- Date must be valid calendar date
- Past dates are allowed (will show in Today if today, or Anytime if past)

**Example:**
```bash
thangs add "Submit report" --due 2025-12-31
thangs add "Team meeting" --due 2025-12-15
```

**Invalid examples:**
```bash
thangs add "Task" --due 12/31/2025    # Error: Invalid date format
thangs add "Task" --due 2025-13-01    # Error: Invalid date (month 13)
thangs add "Task" --due tomorrow      # Error: Invalid date format
```

#### `--tags <tags>`

Comma-separated list of tags to apply.

**Behavior:**
- Multiple tags separated by commas (no spaces)
- Tags are created if they don't exist
- Case-sensitive
- Whitespace around commas is trimmed

**Example:**
```bash
thangs add "Review contracts" --tags urgent,legal
thangs add "Quick task" --tags quick-win,low-priority
```

#### `--project <name>`

Assign task to existing project by name.

**Validation:**
- Project must exist (error if not found)
- Case-insensitive partial matching
- First matching project is used if multiple matches

**Error if project not found:**
"Project 'ProjectName' not found"

**Example:**
```bash
thangs add "Design mockups" --project "Website Redesign"
thangs add "Write tests" --project "Backend API"
```

#### `--area <name>`

Assign task to existing area by name.

**Validation:**
- Area must exist (error if not found)
- Case-insensitive partial matching
- First matching area is used if multiple matches
- Cannot use both --project and --area (project takes precedence)

**Error if area not found:**
"Area 'AreaName' not found"

**Example:**
```bash
thangs add "Schedule checkup" --area Health
thangs add "Update resume" --area Personal
```

### Output Formats

#### Default Output

Success message with created task name:
```
Task created: Review budget
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "task": "Review budget"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Examples

```bash
# Simple task
thangs add "Call dentist"

# Task with due date
thangs add "Submit report" --due 2025-12-31

# Task with all metadata
thangs add "Prepare presentation" \
  --notes "Include Q4 metrics" \
  --due 2025-12-20 \
  --tags urgent,presentation \
  --project "Marketing Campaign"

# Task in area (no project)
thangs add "Schedule doctor visit" --area Health

# JSON output
thangs add "Quick task" --json
```

### Error Cases

- **Empty task name**: "Task name cannot be empty"
- **Invalid date format**: "Invalid date format. Use YYYY-MM-DD"
- **Project not found**: "Project 'Name' not found"
- **Area not found**: "Area 'Name' not found"
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## edit - Update Task

Modify properties of an existing task.

### Syntax

```bash
thangs edit <task> [options]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<task>` | string | Current task name (must be unique) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--name` | string | New task name | No | unchanged |
| `--notes` | string | Update task notes | No | unchanged |
| `--due` | string | Change due date (YYYY-MM-DD) | No | unchanged |
| `--tags` | string | Replace all tags (comma-separated) | No | unchanged |
| `--project` | string | Move to different project | No | unchanged |
| `--area` | string | Move to different area | No | unchanged |
| `--json` | boolean | Output JSON response | No | false |

### Option Details

#### `<task>` (required)

The current task name to edit. **Must be unique.**

**Uniqueness requirement:**
- If multiple tasks exist with the same name, command will error
- Error lists all matching tasks with their project/area/due date
- You must make task names unique before editing

**Example error:**
```
Multiple tasks found with name "Meeting":
- "Meeting" (Project: Q1 Planning, Due: 2025-12-10)
- "Meeting" (Area: Work, Due: 2025-12-11)

Please provide a unique task name or rename one of these tasks first.
```

#### `--name <newName>`

Rename the task to a new name.

**Behavior:**
- Updates task name in Things 3
- New name can be any string
- Other task properties are preserved

**Example:**
```bash
thangs edit "Old task name" --name "New task name"
thangs edit "Call client" --name "Call client re: Q1 contract"
```

#### `--notes <text>`

Update or replace task notes.

**Behavior:**
- Replaces existing notes entirely
- Use empty string `""` to clear notes
- Preserves formatting

**Example:**
```bash
thangs edit "Prepare report" --notes "Updated requirements: include 2024 data"
thangs edit "Task" --notes ""  # Clear notes
```

#### `--due <date>`

Change task due date.

**Validation:**
- Must match YYYY-MM-DD format
- Invalid formats cause error
- Use empty string `""` to clear due date

**Example:**
```bash
thangs edit "Submit report" --due 2025-12-31
thangs edit "Flexible task" --due ""  # Remove due date
```

#### `--tags <tags>`

Replace all tags on the task.

**Behavior:**
- Replaces existing tags entirely
- Comma-separated list: `tag1,tag2,tag3`
- Use empty string `""` to clear all tags
- Tags are created if they don't exist

**Example:**
```bash
thangs edit "Review budget" --tags urgent,finance
thangs edit "Task" --tags ""  # Remove all tags
```

#### `--project <name>`

Move task to a different project.

**Validation:**
- Project must exist (error if not found)
- Removes task from current project/area
- Task belongs to project only (not area)

**Example:**
```bash
thangs edit "Design mockups" --project "Website Redesign"
thangs edit "Migrate task" --project "New Project"
```

#### `--area <name>`

Move task to a different area (not in a project).

**Validation:**
- Area must exist (error if not found)
- Removes task from current project
- Task belongs to area directly (not via project)

**Example:**
```bash
thangs edit "General task" --area Work
thangs edit "Personal item" --area Personal
```

### Output Formats

#### Default Output

Success message describing changes:
```
Updated task: Review budget
- Changed due date to 2025-12-31
- Updated tags: urgent, finance
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "message": "Updated task: Review budget - Changed due date to 2025-12-31"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Examples

```bash
# Rename task
thangs edit "Old name" --name "New name"

# Change due date
thangs edit "Submit report" --due 2025-12-31

# Update multiple properties
thangs edit "Review budget" \
  --name "Complete budget review" \
  --due 2025-12-20 \
  --tags urgent,finance \
  --project "Q4 Planning"

# Move task between projects
thangs edit "Update docs" --project "New Project"

# Clear due date and tags
thangs edit "Flexible task" --due "" --tags ""

# JSON output
thangs edit "Task name" --name "New name" --json
```

### Error Cases

- **Task not found**: "Task 'TaskName' not found"
- **Multiple tasks found**: Lists all matching tasks with details
- **Invalid date format**: "Invalid date format. Use YYYY-MM-DD"
- **Project not found**: "Project 'Name' not found"
- **Area not found**: "Area 'Name' not found"
- **No changes specified**: "No changes specified. Provide at least one option to update."
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## complete - Mark Task Done

Mark a task as completed in Things 3.

### Syntax

```bash
thangs complete <task> [--json]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<task>` | string | Task name to complete (must be unique) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--json` | boolean | Output JSON response | No | false |

### Task Name Uniqueness

The task name must be unique. If multiple tasks exist with the same name:
- Command will error with a list of matching tasks
- Shows each task's project, area, and due date
- You must make names unique before completing

**Example error:**
```
Multiple tasks found with name "Meeting":
- "Meeting" (Project: Q1 Planning, Due: 2025-12-10)
- "Meeting" (Area: Work, Due: 2025-12-11)
```

### Output Formats

#### Default Output

Success message:
```
Task completed: Review budget
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "task": "Review budget"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Examples

```bash
# Complete a task
thangs complete "Review budget"

# Complete with JSON output
thangs complete "Call client" --json
```

### Error Cases

- **Task not found**: "Task 'TaskName' not found"
- **Multiple tasks found**: Lists all matching tasks
- **Already completed**: "Task 'TaskName' is already completed"
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## cancel - Cancel Task

Move a task to trash (cancel it).

### Syntax

```bash
thangs cancel <task> [--json]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<task>` | string | Task name to cancel (must be unique) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--json` | boolean | Output JSON response | No | false |

### Behavior

- Moves task to Things 3 trash
- Task can be restored from trash in Things 3 UI
- Cannot cancel already completed tasks

### Task Name Uniqueness

Same uniqueness requirements as `complete` command.

### Output Formats

#### Default Output

Success message:
```
Task canceled: Old task
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "task": "Old task"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Examples

```bash
# Cancel a task
thangs cancel "Outdated task"

# Cancel with JSON output
thangs cancel "Old meeting" --json
```

### Error Cases

- **Task not found**: "Task 'TaskName' not found"
- **Multiple tasks found**: Lists all matching tasks
- **Already canceled**: "Task 'TaskName' is already canceled"
- **Already completed**: "Cannot cancel completed task 'TaskName'"
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## add-project - Create Project

Create a new project in Things 3.

### Syntax

```bash
thangs add-project <name> [options]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<name>` | string | Project name (positional) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--area` | string | Create project within area | No | none |
| `--notes` | string | Project notes | No | empty |
| `--deadline` | string | Project deadline (YYYY-MM-DD) | No | none |
| `--json` | boolean | Output JSON response | No | false |

### Option Details

#### `<name>` (required)

The project name.

**Validation:**
- Cannot be empty
- Can include any characters

#### `--area <name>`

Create project within a specific area.

**Validation:**
- Area must exist (error if not found)
- Projects can only belong to one area
- Optional - project can exist without an area

#### `--notes <text>`

Project notes/description.

**Behavior:**
- Any text content
- Optional field

#### `--deadline <date>`

Project deadline in YYYY-MM-DD format.

**Validation:**
- Must match YYYY-MM-DD format
- Invalid formats cause error
- Optional field

### Output Formats

#### Default Output

Success message:
```
Project created: Website Redesign
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "project": "Website Redesign"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Examples

```bash
# Simple project
thangs add-project "Q1 Planning"

# Project in area with deadline
thangs add-project "Website Redesign" \
  --area Work \
  --deadline 2025-03-31 \
  --notes "Focus on mobile-first design"

# JSON output
thangs add-project "New Project" --json
```

### Error Cases

- **Empty project name**: "Project name cannot be empty"
- **Area not found**: "Area 'Name' not found"
- **Invalid deadline format**: "Invalid date format. Use YYYY-MM-DD"
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## add-area - Create Area

Create a new area in Things 3.

### Syntax

```bash
thangs add-area <name> [--json]
```

### Required Arguments

| Argument | Type | Description |
|----------|------|-------------|
| `<name>` | string | Area name (positional) |

### Options

| Option | Type | Description | Required | Default |
|--------|------|-------------|----------|---------|
| `--json` | boolean | Output JSON response | No | false |

### Option Details

#### `<name>` (required)

The area name.

**Validation:**
- Cannot be empty
- Can include any characters

### Output Formats

#### Default Output

Success message:
```
Area created: Work
```

#### JSON Output (--json flag)

Success response:
```json
{
  "success": true,
  "area": "Work"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Examples

```bash
# Create area
thangs add-area "Work"

# Create with JSON output
thangs add-area "Health" --json
```

### Error Cases

- **Empty area name**: "Area name cannot be empty"
- **Things 3 not accessible**: "Things 3 is not accessible. Please ensure it is installed and running."

---

## Output Formats

### Table Format (Default)

Used by `list` command. Formatted table with:
- Column headers
- Unicode box-drawing characters
- Color coding (when terminal supports it)
- Automatic column width adjustment

**Colors:**
- Task names: White/default
- Project names: Blue
- Area names: Green
- Tags: Yellow
- Due dates: Red (overdue), Yellow (soon), White (future)

### JSON Format (--json flag)

Used by all commands when `--json` flag is present.

**Characteristics:**
- Valid JSON output
- Pretty-printed with 2-space indentation
- Consistent schema across commands
- Sent to stdout
- Errors still use JSON format in JSON mode

**Common structure:**
```json
{
  "success": boolean,
  "data": { ... }      // On success
  "error": string      // On failure
}
```

---

## Error Cases

### Common Errors Across Commands

#### Things 3 Not Accessible

**Error message:**
```
Things 3 is not accessible. Please ensure it is installed and running.
```

**Causes:**
- Things 3 not installed
- Things 3 not running (will auto-launch, but may delay)
- AppleScript permissions not granted

**Solution:**
1. Install Things 3
2. Launch Things 3
3. Grant AppleScript/Automation permissions in System Settings

#### Invalid Date Format

**Error message:**
```
Invalid date format. Use YYYY-MM-DD
```

**Causes:**
- Date not in YYYY-MM-DD format
- Invalid date (e.g., month 13, day 32)

**Solution:**
- Use YYYY-MM-DD format only
- Ensure valid calendar dates

#### Task/Project/Area Not Found

**Error messages:**
```
Task 'Name' not found
Project 'Name' not found
Area 'Name' not found
```

**Causes:**
- Item doesn't exist in Things 3
- Typo in name
- Case-sensitive mismatch

**Solution:**
- Verify item exists with `thangs list`
- Check spelling and capitalization
- Use `thangs list --area` or `thangs list --project` to find items

#### Multiple Tasks Found

**Error message:**
```
Multiple tasks found with name "TaskName":
- "TaskName" (Project: Project1, Due: 2025-12-10)
- "TaskName" (Area: Area1, Due: 2025-12-11)

Please provide a unique task name or rename one of these tasks first.
```

**Causes:**
- Multiple tasks have the same name
- Cannot determine which task to modify/complete/cancel

**Solution:**
1. Make task names unique:
   ```bash
   thangs edit "TaskName" --name "TaskName - Project1"
   ```
2. Then complete/cancel the uniquely named task

### AppleScript-Specific Errors

These errors come from the underlying AppleScript integration:

- **Permission denied**: System Settings → Privacy & Security → Automation
- **Script execution failed**: Things 3 may need to be restarted
- **Timeout errors**: Things 3 database may be large, increase timeout or filter queries

---

## Best Practices

### Use Filters to Improve Performance

Large task databases (1000+ tasks) can slow down `list` commands:
```bash
# Slow: List all tasks
thangs list

# Fast: List only Today's tasks
thangs list --list Today

# Fast: List only Work area tasks
thangs list --area Work
```

### Make Task Names Unique

Avoid naming conflicts for easier task management:
```bash
# Good: Unique descriptive names
thangs add "Q1 Budget Review"
thangs add "Q2 Budget Review"

# Problematic: Generic names
thangs add "Meeting"  # Which meeting?
thangs add "Review"   # Which review?
```

### Use JSON for Automation

When scripting or integrating with other tools:
```bash
# Get tasks as JSON and process with jq
thangs list --list Today --json | jq '.[] | select(.project == "Marketing")'

# Create task and capture output
result=$(thangs add "New task" --json)
if echo "$result" | jq -e '.success' > /dev/null; then
  echo "Task created successfully"
fi
```

### Leverage Tags for Cross-Cutting Concerns

Tags work across projects and areas:
```bash
# Tag tasks by priority
thangs add "Review contracts" --tags high-priority
thangs add "Update docs" --tags low-priority

# Tag by status
thangs add "Email John" --tags waiting-response
thangs add "Get approval" --tags blocked

# Filter by tag
thangs list --tag high-priority
```

### Organize with Areas and Projects

Use the three-level hierarchy effectively:
- **Areas** for life domains (Work, Personal, Health)
- **Projects** for specific initiatives (Website Redesign, Q1 Planning)
- **Tasks** for actionable items

```bash
# Set up structure
thangs add-area "Work"
thangs add-project "Website Redesign" --area Work

# Add tasks
thangs add "Create wireframes" --project "Website Redesign"
thangs add "Review designs" --project "Website Redesign"
```
