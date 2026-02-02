#!/usr/bin/env node

/**
 * MCP Demo Server
 * 
 * This server demonstrates the Model Context Protocol by providing:
 * - Tools: Functions that can be called (calculate, weather, notes)
 * - Resources: Data that can be accessed (system info, notes list)
 * - Prompts: Pre-defined prompt templates
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import os from "os";
import { z } from "zod";
import type { CalculationResult, Note, SystemInfo, WeatherData } from "./types.js";

/**
 * In-memory storage for notes
 */
const notesStore: Map<string, Note> = new Map();

/**
 * Create the MCP server instance
 */
const server = new Server(
	{
		name: "mcp-demo-server",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
			resources: {},
			prompts: {},
		},
	}
);

/**
 * Tool: Calculate mathematical expressions
 * Safely evaluates mathematical expressions
 */
function calculate(expression: string): CalculationResult {
	// Simple safe evaluation for basic math
	// In production, use a proper math parser library
	const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");

	try {
		// Using Function constructor for evaluation (safe for math only)
		const result = Function(`"use strict"; return (${sanitized})`)() as number;

		return {
			expression,
			result,
			steps: [`Evaluated: ${sanitized}`, `Result: ${result}`],
		};
	} catch (error) {
		throw new Error(`Invalid expression: ${expression}`);
	}
}

/**
 * Tool: Get weather information
 * Simulates fetching weather data for a location
 */
function getWeather(location: string, unit: string = "celsius"): WeatherData {
	// Simulated weather data
	// In production, call a real weather API
	const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Windy"];
	const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
	const baseTemp = unit === "celsius" ? 20 : 68;

	return {
		location,
		temperature: baseTemp + Math.floor(Math.random() * 15),
		unit,
		condition: randomCondition,
		humidity: 40 + Math.floor(Math.random() * 40),
		windSpeed: Math.floor(Math.random() * 30),
	};
}

/**
 * Tool: Store a note
 * Saves a note to the in-memory store
 */
function storeNote(title: string, content: string, tags: string[] = []): Note {
	const note: Note = {
		id: randomUUID(),
		title,
		content,
		timestamp: new Date(),
		tags,
	};

	notesStore.set(note.id, note);
	return note;
}

/**
 * Tool: Retrieve notes
 * Searches and retrieves notes based on a query
 */
function retrieveNotes(query?: string): Note[] {
	const allNotes = Array.from(notesStore.values());

	if (!query) {
		return allNotes;
	}

	const lowerQuery = query.toLowerCase();
	return allNotes.filter(
		(note) =>
			note.title.toLowerCase().includes(lowerQuery) ||
			note.content.toLowerCase().includes(lowerQuery) ||
			note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
	);
}

/**
 * Resource: Get system information
 * Returns current system stats and info
 */
function getSystemInfo(): SystemInfo {
	const cpus = os.cpus();
	const totalMem = os.totalmem();
	const freeMem = os.freemem();

	return {
		platform: `${os.platform()} ${os.release()}`,
		nodeVersion: process.version,
		uptime: os.uptime(),
		memory: {
			total: totalMem,
			free: freeMem,
			used: totalMem - freeMem,
		},
		cpu: {
			model: cpus[0]?.model || "Unknown",
			cores: cpus.length,
		},
	};
}

/**
 * Handler: List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: [
		{
			name: "calculate",
			description: "Perform mathematical calculations. Supports basic arithmetic operations (+, -, *, /) and parentheses.",
			inputSchema: {
				type: "object",
				properties: {
					expression: {
						type: "string",
						description: "Mathematical expression to evaluate (e.g., '2 + 2' or '(10 * 5) / 2')",
					},
				},
				required: ["expression"],
			},
		},
		{
			name: "get_weather",
			description: "Get current weather information for a specified location.",
			inputSchema: {
				type: "object",
				properties: {
					location: {
						type: "string",
						description: "City name or location to get weather for",
					},
					unit: {
						type: "string",
						enum: ["celsius", "fahrenheit"],
						description: "Temperature unit",
						default: "celsius",
					},
				},
				required: ["location"],
			},
		},
		{
			name: "store_note",
			description: "Store a note in the system with optional tags for organization.",
			inputSchema: {
				type: "object",
				properties: {
					title: {
						type: "string",
						description: "Title of the note",
					},
					content: {
						type: "string",
						description: "Content of the note",
					},
					tags: {
						type: "array",
						items: { type: "string" },
						description: "Optional tags for categorization",
					},
				},
				required: ["title", "content"],
			},
		},
		{
			name: "retrieve_notes",
			description: "Search and retrieve notes. Searches in title, content, and tags.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "Search query (optional - returns all notes if not provided)",
					},
				},
			},
		},
		{
			name: "generate_uuid",
			description: "Generate a random UUID (Universally Unique Identifier).",
			inputSchema: {
				type: "object",
				properties: {},
			},
		},
	],
}));

/**
 * Handler: Call a tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case "calculate": {
				const schema = z.object({ expression: z.string() });
				const { expression } = schema.parse(args);
				const result = calculate(expression);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(result, null, 2),
						},
					],
				};
			}

			case "get_weather": {
				const schema = z.object({
					location: z.string(),
					unit: z.enum(["celsius", "fahrenheit"]).optional(),
				});
				const { location, unit } = schema.parse(args);
				const weather = getWeather(location, unit);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(weather, null, 2),
						},
					],
				};
			}

			case "store_note": {
				const schema = z.object({
					title: z.string(),
					content: z.string(),
					tags: z.array(z.string()).optional(),
				});
				const { title, content, tags } = schema.parse(args);
				const note = storeNote(title, content, tags);

				return {
					content: [
						{
							type: "text",
							text: `Note stored successfully: ${JSON.stringify(note, null, 2)}`,
						},
					],
				};
			}

			case "retrieve_notes": {
				const schema = z.object({
					query: z.string().optional(),
				});
				const { query } = schema.parse(args);
				const notes = retrieveNotes(query);

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(notes, null, 2),
						},
					],
				};
			}

			case "generate_uuid": {
				const uuid = randomUUID();

				return {
					content: [
						{
							type: "text",
							text: uuid,
						},
					],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			content: [
				{
					type: "text",
					text: `Error: ${errorMessage}`,
				},
			],
			isError: true,
		};
	}
});

/**
 * Handler: List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
	resources: [
		{
			uri: "mcp://demo/system-info",
			name: "System Information",
			description: "Current system information including OS, memory, and CPU stats",
			mimeType: "application/json",
		},
		{
			uri: "mcp://demo/notes-list",
			name: "Notes List",
			description: "List of all stored notes",
			mimeType: "application/json",
		},
	],
}));

/**
 * Handler: Read a resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	const { uri } = request.params;

	switch (uri) {
		case "mcp://demo/system-info": {
			const info = getSystemInfo();
			return {
				contents: [
					{
						uri,
						mimeType: "application/json",
						text: JSON.stringify(info, null, 2),
					},
				],
			};
		}

		case "mcp://demo/notes-list": {
			const notes = Array.from(notesStore.values());
			return {
				contents: [
					{
						uri,
						mimeType: "application/json",
						text: JSON.stringify(notes, null, 2),
					},
				],
			};
		}

		default:
			throw new Error(`Unknown resource: ${uri}`);
	}
});

/**
 * Handler: List available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
	prompts: [
		{
			name: "analyze-system",
			description: "Analyze system information and provide insights",
		},
		{
			name: "summarize-notes",
			description: "Summarize all stored notes",
			arguments: [
				{
					name: "format",
					description: "Output format (brief, detailed, or bullet)",
					required: false,
				},
			],
		},
	],
}));

/**
 * Handler: Get a specific prompt
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	switch (name) {
		case "analyze-system": {
			const info = getSystemInfo();
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `Please analyze this system information and provide insights:\n\n${JSON.stringify(info, null, 2)}`,
						},
					},
				],
			};
		}

		case "summarize-notes": {
			const notes = Array.from(notesStore.values());
			const format = args?.format || "brief";
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `Please summarize these notes in ${format} format:\n\n${JSON.stringify(notes, null, 2)}`,
						},
					},
				],
			};
		}

		default:
			throw new Error(`Unknown prompt: ${name}`);
	}
});

/**
 * Start the server
 */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("MCP Demo Server running on stdio");
	console.error("Available tools: calculate, get_weather, store_note, retrieve_notes, generate_uuid");
	console.error("Available resources: system-info, notes-list");
}

main().catch((error) => {
	console.error("Server error:", error);
	process.exit(1);
});
