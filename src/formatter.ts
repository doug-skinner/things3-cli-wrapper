/**
 * Output Formatter Module
 *
 * Provides formatted table output for tasks using cli-table3 and chalk.
 * Supports colorized output with accessibility considerations (NO_COLOR env var).
 */

import Table from "cli-table3";
import chalk from "chalk";
import type { Things3Task } from "./applescript";

/**
 * Check if color output should be disabled
 * Respects NO_COLOR environment variable and --no-color flag
 */
function shouldDisableColors(): boolean {
	return (
		process.env.NO_COLOR !== undefined || process.argv.includes("--no-color")
	);
}

/**
 * Color helper functions
 * Returns colored text or plain text if colors are disabled
 */
const color = {
	taskName: (text: string) =>
		shouldDisableColors() ? text : chalk.white(text),
	project: (text: string) => (shouldDisableColors() ? text : chalk.blue(text)),
	area: (text: string) => (shouldDisableColors() ? text : chalk.green(text)),
	tag: (text: string) => (shouldDisableColors() ? text : chalk.yellow(text)),
	dueDateOverdue: (text: string) =>
		shouldDisableColors() ? text : chalk.red(text),
	dueDateSoon: (text: string) =>
		shouldDisableColors() ? text : chalk.yellow(text),
	dueDateFuture: (text: string) =>
		shouldDisableColors() ? text : chalk.white(text),
	status: (text: string) => (shouldDisableColors() ? text : chalk.gray(text)),
};

/**
 * Determine due date color based on date
 * - Red: overdue
 * - Yellow: due within 3 days
 * - White: future
 */
function colorDueDate(dueDate: string): string {
	if (!dueDate) return "";

	const due = new Date(dueDate);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

	const diffMs = dueDay.getTime() - today.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return color.dueDateOverdue(dueDate);
	}
	if (diffDays <= 3) {
		return color.dueDateSoon(dueDate);
	}
	return color.dueDateFuture(dueDate);
}

/**
 * Format tags array for display
 */
function formatTags(tags?: string[]): string {
	if (!tags || tags.length === 0) return "";
	return tags.map((tag) => color.tag(tag)).join(", ");
}

/**
 * Display tasks in a formatted table
 *
 * @param tasks - Array of Things 3 tasks to display
 */
export function displayTasksTable(tasks: Things3Task[]): void {
	if (tasks.length === 0) {
		console.log("No tasks found.");
		return;
	}

	const table = new Table({
		head: ["Task", "Project", "Area", "Tags", "Due Date", "Status"],
		style: {
			head: shouldDisableColors() ? [] : ["cyan"],
			border: shouldDisableColors() ? [] : ["gray"],
		},
		wordWrap: true,
	});

	for (const task of tasks) {
		table.push([
			color.taskName(task.name),
			task.project ? color.project(task.project) : "",
			task.area ? color.area(task.area) : "",
			formatTags(task.tags),
			task.dueDate ? colorDueDate(task.dueDate) : "",
			color.status(task.status),
		]);
	}

	console.log(table.toString());
}

/**
 * Display tasks in JSON format
 *
 * @param tasks - Array of Things 3 tasks to display
 */
export function displayTasksJson(tasks: Things3Task[]): void {
	console.log(JSON.stringify(tasks, null, 2));
}

/**
 * Display error message in formatted way
 *
 * @param message - Error message to display
 */
export function displayError(message: string): void {
	const errorText = shouldDisableColors()
		? `Error: ${message}`
		: chalk.red(`Error: ${message}`);
	console.error(errorText);
}

/**
 * Display success message in formatted way
 *
 * @param message - Success message to display
 */
export function displaySuccess(message: string): void {
	const successText = shouldDisableColors() ? message : chalk.green(message);
	console.log(successText);
}
