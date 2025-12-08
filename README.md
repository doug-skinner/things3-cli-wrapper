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
