#!/usr/bin/env node

/**
 * Thangs CLI - A TypeScript wrapper for Things 3
 * Entry point for the command-line interface
 */

import { Command } from "commander";
import {
	listTasks,
	addTask,
	completeTask,
	editTask,
	cancelTask,
	addProject,
	addArea,
	installSkill,
} from "./things";
import {
	displayTasksTable,
	displayTasksJson,
	displayError,
	displaySuccess,
} from "./formatter";

const program = new Command();

// Configure program metadata
program
	.name("thangs")
	.description("A CLI wrapper around Things 3, built in TypeScript")
	.version("0.1.0");

// List command - display tasks
program
	.command("list")
	.description("Display tasks from Things 3")
	.option(
		"--list <name>",
		"Filter by built-in list (Today, Upcoming, Anytime, Someday)",
	)
	.option("--project <name>", "Filter by project name")
	.option("--area <name>", "Filter by area name")
	.option("--tag <name>", "Filter by tag name")
	.option("--json", "Output as JSON instead of formatted table")
	.action(async (options) => {
		try {
			const tasks = await listTasks({
				list: options.list,
				project: options.project,
				area: options.area,
				tag: options.tag,
			});

			if (options.json) {
				displayTasksJson(tasks);
			} else {
				displayTasksTable(tasks);
			}
		} catch (error) {
			displayError(error instanceof Error ? error.message : String(error));
			process.exit(1);
		}
	});

// Add command - create new task
program
	.command("add <name>")
	.description("Create a new task in Things 3 Inbox")
	.option("--notes <text>", "Task notes")
	.option("--due <date>", "Due date (YYYY-MM-DD format)")
	.option("--tags <tags>", "Comma-separated list of tags")
	.option("--project <name>", "Assign to project by name")
	.option("--area <name>", "Assign to area by name")
	.option("--json", "Output as JSON")
	.action(async (name, options) => {
		try {
			const createdTaskName = await addTask(name, {
				notes: options.notes,
				due: options.due,
				tags: options.tags,
				project: options.project,
				area: options.area,
			});

			if (options.json) {
				console.log(
					JSON.stringify({ success: true, task: createdTaskName }, null, 2),
				);
			} else {
				displaySuccess(`Task created: ${createdTaskName}`);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Edit command - update existing task
program
	.command("edit <task>")
	.description("Modify an existing task in Things 3")
	.option("--name <newName>", "Rename the task")
	.option("--notes <text>", "Update task notes")
	.option("--due <date>", "Change due date (YYYY-MM-DD format)")
	.option("--tags <tags>", "Replace tags (comma-separated list)")
	.option("--project <name>", "Move to different project by name")
	.option("--area <name>", "Move to different area by name")
	.option("--json", "Output as JSON")
	.action(async (task, options) => {
		try {
			const result = await editTask(task, {
				name: options.name,
				notes: options.notes,
				due: options.due,
				tags: options.tags,
				project: options.project,
				area: options.area,
			});

			if (options.json) {
				console.log(
					JSON.stringify({ success: true, message: result }, null, 2),
				);
			} else {
				displaySuccess(result);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Complete command - mark task as done
program
	.command("complete <task>")
	.description("Mark a task as completed in Things 3")
	.option("--json", "Output as JSON")
	.action(async (task, options) => {
		try {
			const completedTaskName = await completeTask(task);

			if (options.json) {
				console.log(
					JSON.stringify({ success: true, task: completedTaskName }, null, 2),
				);
			} else {
				displaySuccess(`Task completed: ${completedTaskName}`);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Cancel command - cancel task
program
	.command("cancel <task>")
	.description("Cancel a task in Things 3 (move to trash)")
	.option("--json", "Output as JSON")
	.action(async (task, options) => {
		try {
			const canceledTaskName = await cancelTask(task);

			if (options.json) {
				console.log(
					JSON.stringify({ success: true, task: canceledTaskName }, null, 2),
				);
			} else {
				displaySuccess(`Task canceled: ${canceledTaskName}`);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Add-project command - create new project
program
	.command("add-project <name>")
	.description("Create a new project in Things 3")
	.option("--area <name>", "Create project within specific area")
	.option("--notes <text>", "Project notes")
	.option("--deadline <date>", "Project deadline (YYYY-MM-DD format)")
	.option("--json", "Output as JSON")
	.action(async (name, options) => {
		try {
			const createdProjectName = await addProject(name, {
				area: options.area,
				notes: options.notes,
				deadline: options.deadline,
			});

			if (options.json) {
				console.log(
					JSON.stringify(
						{ success: true, project: createdProjectName },
						null,
						2,
					),
				);
			} else {
				displaySuccess(`Project created: ${createdProjectName}`);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Add-area command - create new area
program
	.command("add-area <name>")
	.description("Create a new area in Things 3")
	.option("--json", "Output as JSON")
	.action(async (name, options) => {
		try {
			const createdAreaName = await addArea(name);

			if (options.json) {
				console.log(
					JSON.stringify({ success: true, area: createdAreaName }, null, 2),
				);
			} else {
				displaySuccess(`Area created: ${createdAreaName}`);
			}
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Install-skill command - install Claude Skill
program
	.command("install-skill")
	.description("Install the Things3 Claude Skill to ~/.claude/skills/")
	.option("--force", "Overwrite existing installation")
	.option("--json", "Output as JSON")
	.action(async (options) => {
		try {
			const result = await installSkill({ force: options.force });

			if (options.json) {
				console.log(JSON.stringify(result, null, 2));
			} else {
				if (result.success) {
					displaySuccess(result.message || "Skill installed successfully");
					console.log(`Installation path: ${result.installPath}`);
					if (result.files && result.files.length > 0) {
						console.log(`\nInstalled files (${result.files.length}):`);
						for (const file of result.files) {
							console.log(`  - ${file}`);
						}
					}
				} else {
					displayError(result.error || "Installation failed");
				}
			}

			// Exit with appropriate code
			process.exit(result.success ? 0 : 1);
		} catch (error) {
			if (options.json) {
				console.log(
					JSON.stringify(
						{
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
						null,
						2,
					),
				);
			} else {
				displayError(error instanceof Error ? error.message : String(error));
			}
			process.exit(1);
		}
	});

// Error handling for unknown commands
program.on("command:*", () => {
	console.error(
		"Invalid command: %s\nSee --help for a list of available commands.",
		program.args.join(" "),
	);
	process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
}
