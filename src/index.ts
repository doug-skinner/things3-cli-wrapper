#!/usr/bin/env node

/**
 * Thangs CLI - A TypeScript wrapper for Things 3
 * Entry point for the command-line interface
 */

import { Command } from 'commander';
import { listTasks } from './things';
import { displayTasksTable, displayTasksJson, displayError } from './formatter';

const program = new Command();

// Configure program metadata
program
  .name('thangs')
  .description('A CLI wrapper around Things 3, built in TypeScript')
  .version('0.1.0');

// List command - display tasks
program
  .command('list')
  .description('Display tasks from Things 3')
  .option('--list <name>', 'Filter by built-in list (Today, Upcoming, Anytime, Someday)')
  .option('--project <name>', 'Filter by project name')
  .option('--area <name>', 'Filter by area name')
  .option('--tag <name>', 'Filter by tag name')
  .option('--json', 'Output as JSON instead of formatted table')
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
  .command('add <name>')
  .description('Create a new task in Things 3 Inbox')
  .option('--notes <text>', 'Task notes')
  .option('--due <date>', 'Due date (YYYY-MM-DD format)')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .option('--project <name>', 'Assign to project by name')
  .option('--area <name>', 'Assign to area by name')
  .option('--json', 'Output as JSON')
  .action((name, options) => {
    console.log('Add command called for:', name, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Edit command - update existing task
program
  .command('edit <task>')
  .description('Modify an existing task in Things 3')
  .option('--name <newName>', 'Rename the task')
  .option('--notes <text>', 'Update task notes')
  .option('--due <date>', 'Change due date (YYYY-MM-DD format)')
  .option('--tags <tags>', 'Replace tags (comma-separated list)')
  .option('--project <name>', 'Move to different project by name')
  .option('--area <name>', 'Move to different area by name')
  .option('--json', 'Output as JSON')
  .action((task, options) => {
    console.log('Edit command called for:', task, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Complete command - mark task as done
program
  .command('complete <task>')
  .description('Mark a task as completed in Things 3')
  .option('--json', 'Output as JSON')
  .action((task, options) => {
    console.log('Complete command called for:', task, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Cancel command - cancel task
program
  .command('cancel <task>')
  .description('Cancel a task in Things 3 (move to trash)')
  .option('--json', 'Output as JSON')
  .action((task, options) => {
    console.log('Cancel command called for:', task, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Add-project command - create new project
program
  .command('add-project <name>')
  .description('Create a new project in Things 3')
  .option('--area <name>', 'Create project within specific area')
  .option('--notes <text>', 'Project notes')
  .option('--deadline <date>', 'Project deadline (YYYY-MM-DD format)')
  .option('--json', 'Output as JSON')
  .action((name, options) => {
    console.log('Add-project command called for:', name, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Add-area command - create new area
program
  .command('add-area <name>')
  .description('Create a new area in Things 3')
  .option('--json', 'Output as JSON')
  .action((name, options) => {
    console.log('Add-area command called for:', name, 'with options:', options);
    // Implementation will be added in later requirements
  });

// Error handling for unknown commands
program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
