/**
 * AppleScript Integration Module
 *
 * This module provides the bridge between Node.js and Things 3 via AppleScript.
 * It uses the run-applescript package to execute AppleScript commands and handle responses.
 *
 * Things 3 AppleScript Dictionary Reference:
 * - Open Things 3 > Script Editor > File > Open Dictionary > Things 3
 * - Documentation: https://culturedcode.com/things/support/articles/2803573/
 */

import { runAppleScript } from "run-applescript";

/**
 * Error thrown when AppleScript execution fails
 */
export class AppleScriptError extends Error {
	constructor(
		message: string,
		public readonly originalError?: Error,
	) {
		super(message);
		this.name = "AppleScriptError";
	}
}

/**
 * Error thrown when Things 3 is not accessible
 */
export class Things3NotAccessibleError extends AppleScriptError {
	constructor(message = "Things 3 is not running or not accessible") {
		super(message);
		this.name = "Things3NotAccessibleError";
	}
}

/**
 * TypeScript type definitions for Things 3 task responses
 */
export interface Things3Task {
	id: string;
	name: string;
	notes?: string;
	dueDate?: string;
	tags?: string[];
	project?: string;
	area?: string;
	status: "open" | "completed" | "canceled";
	creationDate?: string;
	modificationDate?: string;
}

/**
 * TypeScript type definitions for Things 3 project responses
 */
export interface Things3Project {
	id: string;
	name: string;
	notes?: string;
	area?: string;
	tags?: string[];
}

/**
 * TypeScript type definitions for Things 3 area responses
 */
export interface Things3Area {
	id: string;
	name: string;
	tags?: string[];
}

/**
 * Execute an AppleScript command with proper error handling
 *
 * @param script - The AppleScript code to execute
 * @returns The result of the AppleScript execution
 * @throws {Things3NotAccessibleError} When Things 3 is not running or accessible
 * @throws {AppleScriptError} When AppleScript execution fails
 */
export async function executeAppleScript(script: string): Promise<string> {
	try {
		const result = await runAppleScript(script);
		return result;
	} catch (error) {
		// Check if error is related to Things 3 not being accessible
		const errorMessage = error instanceof Error ? error.message : String(error);

		if (
			errorMessage.includes("application isn't running") ||
			errorMessage.includes("application is not running") ||
			errorMessage.includes("Can't get application") ||
			errorMessage.includes("not found")
		) {
			throw new Things3NotAccessibleError();
		}

		// Generic AppleScript error
		throw new AppleScriptError(
			`AppleScript execution failed: ${errorMessage}`,
			error instanceof Error ? error : undefined,
		);
	}
}

/**
 * Check if Things 3 is running and accessible
 *
 * @returns True if Things 3 is accessible, false otherwise
 */
export async function isThings3Accessible(): Promise<boolean> {
	try {
		const script = `
      tell application "System Events"
        return exists (processes where name is "Things3")
      end tell
    `;
		const result = await executeAppleScript(script);
		return result.trim() === "true";
	} catch (error) {
		return false;
	}
}

/**
 * Verify Things 3 is running before executing commands
 *
 * @throws {Things3NotAccessibleError} When Things 3 is not accessible
 */
export async function verifyThings3Access(): Promise<void> {
	const accessible = await isThings3Accessible();
	if (!accessible) {
		throw new Things3NotAccessibleError(
			"Things 3 is not running. Please open Things 3 and try again.",
		);
	}
}
