# Thangs

A cli wrapper around Things 3, built in Typescript.

## Installation

```bash
npm install -g things3-cli-wrapper
```

## Usage

### List Tasks

List all tasks in Things 3:

```bash
thangs list
```

You can also list tasks by the built in lists:

```bash
thangs list --list "Today"
thangs list --list "Upcoming"
thangs list --list "Anytime"
thangs list --list "Someday"
```

Finally, you can also filter tasks by project, area, or tag:

```bash
thangs list --project "Project Name"
thangs list --area "Area Name"
thangs list --tag "Tag Name"
```

### Add Task

Add a new task to the Inbox:

```bash
thangs add "Task Name"
```

You can also specify additional options such as notes, due date, tags, project, and area:

```bash
thangs add "Task Name" --notes "These are the task notes" --due "2024-12-31" --tags "Tag1,Tag2" --project "Project Name" --area "Area Name"
```

### Edit Tasks

Edit a task by its name. You can update the name, notes, due date, tags, project, and area:

```bash
thangs edit "Task Name" --name "New Task Name" --notes "Updated notes" --due "2025-01-15" --tags "NewTag1,NewTag2" --project "New Project Name" --area "New Area Name"
```

### Complete Task

Complete a task by its name:

```bash
thangs complete "Task Name"
```

### Cancel Task

Cancel a task by its name:

```bash
thangs cancel "Task Name"
```

### Add Project

Add a new project:

```bash
thangs add-project "Project Name"
```

### Add Area

Add a new area:

```bash
thangs add-area "Area Name"
```

## Claude Code Integration

Thangs includes a Claude Skill that teaches Claude Code how to effectively use the Things3 CLI wrapper. A Claude Skill is a specialized instruction set that helps Claude understand your tools and workflows, enabling natural language task management through Claude.

### What is a Claude Skill?

Claude Skills are markdown documents that teach Claude Code about specific tools, APIs, or workflows. When you install the Thangs skill, Claude learns:
- All available CLI commands and their options
- Things 3 core concepts (Areas, Projects, Tags, Lists)
- Common task management workflows and patterns
- Best practices for working with Things 3

### Installation

Install the Claude Skill with a single command:

```bash
thangs install-skill
```

This copies the skill files to `~/.claude/skills/things3-cli-wrapper/`, making them available to Claude Code.

### Updating the Skill

To update the skill after upgrading Thangs (or if you made local modifications):

```bash
thangs install-skill --force
```

The `--force` flag overwrites the existing installation.

### Verification

Verify the skill was installed correctly:

```bash
ls ~/.claude/skills/things3-cli-wrapper/
```

You should see:
- `SKILL.md` - Main skill instruction file
- `reference.md` - Complete command reference
- `examples.md` - Usage examples and workflows
- `LICENSE.txt` - MIT license
- `README.md` - Developer documentation

### Using with Claude

Once installed, you can interact with Claude Code using natural language for task management:

**Examples:**
```
"Show me all tasks due today in my Work project"
"Add a task 'Review PR #123' with tag 'code-review' to my Development project"
"Complete the task 'Finish documentation'"
"Create a new project called 'Q1 Planning' in my Work area"
```

Claude will understand your intent and execute the appropriate `thangs` commands using the installed skill's guidance.

### What Claude Learns

The skill teaches Claude:
- **Commands**: All 8 CLI commands (list, add, edit, complete, cancel, add-project, add-area, install-skill)
- **Filtering**: How to use --list, --project, --area, and --tag filters
- **Task Properties**: Working with notes, due dates, tags, projects, and areas
- **Workflows**: Common patterns like daily task reviews, project planning, and task organization
- **Error Handling**: How to handle ambiguous task names, missing entities, and validation errors

### Developer Documentation

If you're interested in modifying or improving the skill, see the developer documentation:

```bash
cat ~/.claude/skills/things3-cli-wrapper/README.md
```

Or view it in the repository at [skill/README.md](skill/README.md).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Development

To build the project locally, clone the repository and run:

```bash
npm ci
npm run build
```

You can then link the package globally for testing:

```bash
npm link
```

### Tools Used

- [Things 3 AppleScript Dictionary](https://culturedcode.com/things/support/articles/4562654) - for interacting with Things 3 via AppleScript.
- [Commander.js](https://github.com/tj/commander.js) - for building the CLI interface.
- [TypeScript](https://www.typescriptlang.org/) - for type-safe JavaScript development.
- [Biome](https://biomejs.dev/) - for code formatting and linting.
