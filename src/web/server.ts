#!/usr/bin/env node

/**
 * Web Server for MCP Demo
 * 
 * Provides a beautiful web interface to interact with the MCP server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	CallToolResultSchema,
	ListResourcesResultSchema,
	ListToolsResultSchema,
	ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MCP Client instance
let mcpClient: Client | null = null;

/**
 * Initialize MCP client connection
 */
async function initializeMCPClient(): Promise<Client> {
	const client = new Client(
		{
			name: "mcp-web-client",
			version: "1.0.0",
		},
		{
			capabilities: {},
		}
	);

	const transport = new StdioClientTransport({
		command: "node",
		args: [path.join(__dirname, "..", "server", "index.js")],
	});

	await client.connect(transport);
	return client;
}

/**
 * API endpoint: List tools
 */
app.get("/api/tools", async (req, res) => {
	try {
		if (!mcpClient) {
			mcpClient = await initializeMCPClient();
		}

		const result = await mcpClient.request(
			{
				method: "tools/list",
			},
			ListToolsResultSchema
		);

		res.json({ success: true, tools: result.tools });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : String(error),
		});
	}
});

/**
 * API endpoint: Call a tool
 */
app.post("/api/tools/call", async (req, res) => {
	try {
		if (!mcpClient) {
			mcpClient = await initializeMCPClient();
		}

		const { name, arguments: args } = req.body;

		const result = await mcpClient.request(
			{
				method: "tools/call",
				params: {
					name,
					arguments: args,
				},
			},
			CallToolResultSchema
		);

		res.json({ success: true, result: result.content });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : String(error),
		});
	}
});

/**
 * API endpoint: List resources
 */
app.get("/api/resources", async (req, res) => {
	try {
		if (!mcpClient) {
			mcpClient = await initializeMCPClient();
		}

		const result = await mcpClient.request(
			{
				method: "resources/list",
			},
			ListResourcesResultSchema
		);

		res.json({ success: true, resources: result.resources });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : String(error),
		});
	}
});

/**
 * API endpoint: Read a resource
 */
app.get("/api/resources/read", async (req, res) => {
	try {
		if (!mcpClient) {
			mcpClient = await initializeMCPClient();
		}

		const { uri } = req.query;

		if (typeof uri !== "string") {
			res.status(400).json({ success: false, error: "URI is required" });
			return;
		}

		const result = await mcpClient.request(
			{
				method: "resources/read",
				params: { uri },
			},
			ReadResourceResultSchema
		);

		res.json({ success: true, contents: result.contents });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : String(error),
		});
	}
});

/**
 * Serve the main page
 */
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Start the server
 */
app.listen(PORT, () => {
	console.log(`🌐 MCP Demo Web Interface running at http://localhost:${PORT}`);
	console.log("📖 Open your browser to interact with the MCP server");
});

/**
 * Cleanup on exit
 */
process.on("SIGINT", async () => {
	console.log("\n👋 Shutting down...");
	if (mcpClient) {
		await mcpClient.close();
	}
	process.exit(0);
});
