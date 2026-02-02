# Model Context Protocol (MCP) Demo Application

A comprehensive demonstration of the **Model Context Protocol (MCP)** - a standardized protocol that enables AI assistants to interact with external tools and data sources.

![MCP Demo](https://img.shields.io/badge/MCP-Demo-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## 🎯 What is Model Context Protocol?

The Model Context Protocol is an open protocol that enables seamless integration between AI applications and external data sources. It provides:

- **🔧 Tools**: Functions that AI can execute (e.g., calculations, API calls)
- **📚 Resources**: Data sources that AI can read (e.g., files, databases)
- **💬 Prompts**: Pre-defined prompt templates for consistent interactions
- **🔒 Security**: Controlled access with clear boundaries

## ✨ Features

This demo application showcases:

### MCP Server
- Implements 5 different tools
- Provides 2 data resources
- Includes prompt templates
- Full TypeScript type safety

### Tools Implemented
1. **calculate** - Perform mathematical calculations
2. **get_weather** - Get weather information (simulated)
3. **store_note** - Store notes with tags
4. **retrieve_notes** - Search and retrieve notes
5. **generate_uuid** - Generate unique identifiers

### Resources Available
1. **system-info** - Current system statistics
2. **notes-list** - All stored notes

### Interactive Web Interface
- Beautiful, modern UI
- Real-time tool execution
- Resource visualization
- Live result display

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project directory
cd model-context-protocol

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### Running the Application

#### Option 1: Web Interface (Recommended)

Start the interactive web interface:

```bash
npm run web
```

Then open your browser to:
```
http://localhost:3000
```

The web interface provides:
- Visual list of all available tools
- Interactive form to call tools
- Real-time result display
- Resource browser

#### Option 2: Command Line Client

Run the demo client that showcases all features:

```bash
npm run client
```

This will:
- Connect to the MCP server
- List all available tools and resources
- Execute sample tool calls
- Display results in the terminal

#### Option 3: Server Only

Run just the MCP server (for integration with other clients):

```bash
npm run server
```

## 📁 Project Structure

```
model-context-protocol/
├── src/
│   ├── server/
│   │   ├── index.ts       # MCP server implementation
│   │   └── types.ts       # TypeScript type definitions
│   ├── client/
│   │   └── index.ts       # Demo client implementation
│   └── web/
│       ├── server.ts      # Express web server
│       └── public/
│           └── index.html # Web interface
├── dist/                  # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── README.md
```

## 🎮 Usage Examples

### Using the Web Interface

1. Start the web server: `npm run web`
2. Open `http://localhost:3000` in your browser
3. Click on any tool in the left panel to auto-fill the form
4. Modify arguments as needed
5. Click "Execute Tool" to see results

### Example Tool Calls

#### Calculate Expression
```json
{
  "tool": "calculate",
  "arguments": {
    "expression": "(10 + 5) * 2"
  }
}
```
**Result**: `30`

#### Get Weather
```json
{
  "tool": "get_weather",
  "arguments": {
    "location": "San Francisco",
    "unit": "celsius"
  }
}
```
**Result**: Weather data for San Francisco

#### Store a Note
```json
{
  "tool": "store_note",
  "arguments": {
    "title": "Project Ideas",
    "content": "Build an MCP-powered application",
    "tags": ["ideas", "projects", "mcp"]
  }
}
```
**Result**: Note stored with unique ID

#### Retrieve Notes
```json
{
  "tool": "retrieve_notes",
  "arguments": {
    "query": "project"
  }
}
```
**Result**: All notes matching "project"

#### Generate UUID
```json
{
  "tool": "generate_uuid",
  "arguments": {}
}
```
**Result**: A new UUID like `550e8400-e29b-41d4-a716-446655440000`

### Reading Resources

#### System Information
```
URI: mcp://demo/system-info
```
Returns current system stats including OS, memory, CPU info, and uptime.

#### Notes List
```
URI: mcp://demo/notes-list
```
Returns all notes stored in the system.

## 🏗️ How It Works

### 1. Server Initialization

The MCP server registers available tools and resources:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "calculate",
      description: "Perform mathematical calculations",
      inputSchema: { /* JSON Schema */ }
    }
  ]
}));
```

### 2. Client Connection

The client connects to the server via stdio transport:

```typescript
const client = new Client({ name: "demo-client", version: "1.0.0" });
const transport = new StdioClientTransport({ command: "node", args: ["server.js"] });
await client.connect(transport);
```

### 3. Tool Discovery

The client discovers available capabilities:

```typescript
const tools = await client.request({ method: "tools/list" }, ListToolsResultSchema);
```

### 4. Tool Execution

The client calls a tool with parameters:

```typescript
const result = await client.request({
  method: "tools/call",
  params: {
    name: "calculate",
    arguments: { expression: "2 + 2" }
  }
}, CallToolResultSchema);
```

### 5. Resource Access

The client reads data resources:

```typescript
const resource = await client.request({
  method: "resources/read",
  params: { uri: "mcp://demo/system-info" }
}, ReadResourceResultSchema);
```

## 🛠️ Development

### Build the Project

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This will build and start the web interface.

### Project Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run server` - Run the MCP server
- `npm run client` - Run the demo client
- `npm run web` - Start the web interface
- `npm run dev` - Build and run web interface

## 🎨 Architecture

### MCP Server (src/server/index.ts)
- Implements the MCP protocol
- Registers tools and resources
- Handles requests from clients
- Validates input using Zod schemas
- Returns structured responses

### MCP Client (src/client/index.ts)
- Connects to the MCP server
- Discovers available capabilities
- Executes tools and reads resources
- Displays results

### Web Server (src/web/server.ts)
- Express-based HTTP server
- Proxies requests to MCP server
- Provides REST API endpoints
- Serves static web interface

### Web Interface (src/web/public/index.html)
- Modern, responsive design
- Interactive tool execution
- Real-time result display
- Resource browser

## 🔑 Key MCP Concepts

### Tools
Functions that can be executed by AI assistants. Each tool has:
- **Name**: Unique identifier
- **Description**: What the tool does
- **Input Schema**: JSON Schema defining required/optional parameters
- **Handler**: Implementation that processes requests

### Resources
Data sources that can be read. Each resource has:
- **URI**: Unique identifier (e.g., `mcp://demo/system-info`)
- **Name**: Human-readable name
- **Description**: What data it provides
- **MIME Type**: Data format (e.g., `application/json`)

### Prompts
Pre-defined prompt templates that:
- Can accept parameters
- Provide consistent interaction patterns
- Help structure AI conversations

## 🌟 Benefits of MCP

1. **Standardization** - Common protocol for AI-tool integration
2. **Security** - Controlled, explicit access to capabilities
3. **Flexibility** - Easy to add new tools and resources
4. **Discoverability** - AI can discover available capabilities
5. **Type Safety** - Strong typing with JSON Schema validation
6. **Interoperability** - Works with any MCP-compatible client

## 📚 Technologies Used

- **TypeScript** - Type-safe development
- **@modelcontextprotocol/sdk** - Official MCP SDK
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **Zod** - Runtime type validation

## 🔗 Resources

- [MCP Specification](https://modelcontextprotocol.io/introduction)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Documentation](https://modelcontextprotocol.io)

## 📝 License

MIT

## 🤝 Contributing

This is a demo application for learning purposes. Feel free to:
- Extend it with new tools
- Add more resources
- Improve the UI
- Add tests
- Create documentation

## 💡 Next Steps

To build your own MCP server:

1. Define your tools and their schemas
2. Implement tool handlers
3. Add resources for data access
4. Create prompt templates
5. Test with MCP clients
6. Deploy and integrate with AI applications

---

**Built with ❤️ to demonstrate the power of Model Context Protocol**
