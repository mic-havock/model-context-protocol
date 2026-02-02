#!/usr/bin/env node

/**
 * MCP Demo Client
 * 
 * This client demonstrates how to connect to an MCP server and:
 * - Discover available tools
 * - Call tools with parameters
 * - Read resources
 * - Use prompt templates
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	CallToolResultSchema,
	ListResourcesResultSchema,
	ListToolsResultSchema,
	ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Main client function
 */
async function main() {
	console.log("🚀 MCP Demo Client Starting...\n");

	// Create client instance
	const client = new Client(
		{
			name: "mcp-demo-client",
			version: "1.0.0",
		},
		{
			capabilities: {},
		}
	);

	// Create transport to connect to server
	const transport = new StdioClientTransport({
		command: "node",
		args: ["dist/server/index.js"],
	});

	// Connect to server
	await client.connect(transport);
	console.log("✅ Connected to MCP server\n");

	try {
		// 1. Discover available tools
		console.log("📋 Discovering available tools...");
		const toolsResult = await client.request(
			{
				method: "tools/list",
			},
			ListToolsResultSchema
		);

		console.log(`Found ${toolsResult.tools.length} tools:`);
		toolsResult.tools.forEach((tool) => {
			console.log(`  - ${tool.name}: ${tool.description}`);
		});
		console.log();

		// 2. Call the calculate tool
		console.log("🧮 Calling 'calculate' tool...");
		const calcResult = await client.request(
			{
				method: "tools/call",
				params: {
					name: "calculate",
					arguments: {
						expression: "(10 + 5) * 2",
					},
				},
			},
			CallToolResultSchema
		);

		console.log("Result:", calcResult.content[0]);
		console.log();

		// 3. Call the weather tool
		console.log("🌤️  Calling 'get_weather' tool...");
		const weatherResult = await client.request(
			{
				method: "tools/call",
				params: {
					name: "get_weather",
					arguments: {
						location: "San Francisco",
						unit: "celsius",
					},
				},
			},
			CallToolResultSchema
		);

		console.log("Result:", weatherResult.content[0]);
		console.log();

		// 4. Store some notes
		console.log("📝 Storing notes...");
		await client.request(
			{
				method: "tools/call",
				params: {
					name: "store_note",
					arguments: {
						title: "MCP Demo",
						content: "Model Context Protocol is a powerful way to extend AI capabilities!",
						tags: ["mcp", "demo", "ai"],
					},
				},
			},
			CallToolResultSchema
		);

		await client.request(
			{
				method: "tools/call",
				params: {
					name: "store_note",
					arguments: {
						title: "Meeting Notes",
						content: "Discussed implementation details of the MCP server.",
						tags: ["meeting", "implementation"],
					},
				},
			},
			CallToolResultSchema
		);

		console.log("✅ Notes stored successfully");
		console.log();

		// 5. Retrieve notes
		console.log("📖 Retrieving notes with query 'mcp'...");
		const notesResult = await client.request(
			{
				method: "tools/call",
				params: {
					name: "retrieve_notes",
					arguments: {
						query: "mcp",
					},
				},
			},
			CallToolResultSchema
		);

		console.log("Result:", notesResult.content[0]);
		console.log();

		// 6. List available resources
		console.log("📚 Discovering available resources...");
		const resourcesResult = await client.request(
			{
				method: "resources/list",
			},
			ListResourcesResultSchema
		);

		console.log(`Found ${resourcesResult.resources.length} resources:`);
		resourcesResult.resources.forEach((resource) => {
			console.log(`  - ${resource.name} (${resource.uri})`);
		});
		console.log();

		// 7. Read system info resource
		console.log("💻 Reading 'system-info' resource...");
		const systemInfoResult = await client.request(
			{
				method: "resources/read",
				params: {
					uri: "mcp://demo/system-info",
				},
			},
			ReadResourceResultSchema
		);

		console.log("Result:", systemInfoResult.contents[0]);
		console.log();

		// 8. Generate UUID
		console.log("🔑 Generating UUID...");
		const uuidResult = await client.request(
			{
				method: "tools/call",
				params: {
					name: "generate_uuid",
					arguments: {},
				},
			},
			CallToolResultSchema
		);

		console.log("Generated UUID:", uuidResult.content[0]);
		console.log();

		console.log("✅ Demo completed successfully!");
	} catch (error) {
		console.error("❌ Error:", error);
	} finally {
		await client.close();
	}
}

// Run the client
main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
