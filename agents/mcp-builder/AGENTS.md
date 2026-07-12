# AGENTS.md — MCP Builder Agent Configuration

## Purpose
Build local MCP servers on demand. Given a target service/API, this agent researches, designs, implements, tests, and delivers a working MCP server.

## Skills Used
- `~/.openclaw/skills/mcp-builder/SKILL.md` — Official MCP builder skill (full process, evaluation, best practices)
- Inline skill below — Local MCP specific patterns (Microsoft-friendly, stdio/localhost HTTP)

---

## Agent Workflow

When instructed to "create a local MCP for X":

### Step 1: Research
- Understand the target API/service exhaustively
- Read official API docs, auth requirements, rate limits
- Identify most valuable endpoints for agent workflows
- Load MCP best practices from skill reference files

### Step 2: Plan
- Select 3-10 high-impact tools (not just API wrappers)
- Choose stack (Python/FastMCP or TypeScript/MCP SDK)
- Choose transport (stdio default, HTTP on request)
- Design input schemas, output formats, error messages

### Step 3: Implement
- Create project structure per skill layout
- Build shared utilities first (API helpers, error handling, formatting)
- Implement tools with full validation
- Add comprehensive docstrings/descriptions

### Step 4: Test & Review
- Syntax check (py_compile or npm run build)
- Smoke test each tool
- Code quality review (DRY, type safety, error handling)
- Verify security (127.0.0.1 only, no secrets in logs)

### Step 5: Deliver
- README with setup instructions
- Run scripts (stdio + optional HTTP)
- Wire into VS Code / Copilot config if requested
- Optional: evaluation XML for quality testing

---

## Local MCP Decision Tree

1. **Language:**
   - TypeScript/Node → Official MCP TS SDK
   - Python → FastMCP or official Python SDK

2. **Transport:**
   - Stdio → Best for local, editor-integrated, simple
   - HTTP on localhost → Best for testing streaming or browser-style clients

3. **Capabilities:**
   - Tools: 3-10 clear operations
   - Resources: Optional read-only views
   - Prompts: Optional reusable templates

4. **Security:**
   - Stdio: Trust based on local user; still validate inputs
   - HTTP: Bind to 127.0.0.1, no external exposure; optional API key

---

## Standard Project Layout

```
mcp-local-<name>/
  src/
    server.(ts|py)          # main MCP server
    tools/                   # tool implementations
    resources/               # resource providers (optional)
    prompts/                 # prompt definitions (optional)
  config/
    mcp.json                 # MCP manifest (optional but recommended)
  scripts/
    run-stdio.(sh|ps1)       # local stdio launcher
    run-http.(sh|ps1)        # local HTTP launcher
  README.md
```

Always provide at least one run script and a short README.

---

## Minimal MCP Manifest (config/mcp.json)

```json
{
  "name": "mcp-local-example",
  "version": "1.0.0",
  "description": "Local MCP server providing tools on this machine.",
  "transport": ["stdio", "http"],
  "tools": [
    {
      "name": "get_status",
      "description": "Return health and environment info.",
      "input_schema": { "type": "object", "properties": {} },
      "output_schema": { "type": "object" }
    }
  ]
}
```

Keep name, version, transport, tools in sync with code.

---

## TypeScript Local MCP (stdio)

### Setup
```bash
mkdir mcp-local-ts && cd mcp-local-ts
npm init -y
npm install @modelcontextprotocol/sdk
```

### src/server.ts
```typescript
import { Server } from "@modelcontextprotocol/sdk/server";

const server = new Server({
  name: "mcp-local-ts",
  version: "1.0.0"
});

server.tool("get_status", {
  description: "Return health info for local MCP.",
  inputSchema: { type: "object", properties: {} },
  outputSchema: { type: "object" },
  async handler() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development"
    };
  }
});

server.runStdio();
```

### Run script (scripts/run-stdio.ps1)
```powershell
node dist/server.js
```

---

## Python Local MCP (stdio or localhost HTTP)

### Setup
```bash
mkdir mcp-local-py && cd mcp-local-py
uv init
uv add fastmcp
```

### src/server.py (stdio)
```python
from fastmcp import MCPServer, tool

server = MCPServer(
  name="mcp-local-py",
  version="1.0.0",
)

@tool
async def get_status() -> dict:
  """Return health info for local MCP."""
  return {
    "status": "ok",
    "timestamp": server.now_iso(),
    "env": "local"
  }

if __name__ == "__main__":
  server.run_stdio()
```

### src/server_http.py (localhost HTTP)
```python
from fastmcp import MCPServer, tool

server = MCPServer(
  name="mcp-local-py-http",
  version="1.0.0",
)

@tool
async def get_status() -> dict:
  return {
    "status": "ok",
    "timestamp": server.now_iso(),
    "env": "local-http"
  }

if __name__ == "__main__":
  server.run_http(host="127.0.0.1", port=8080, enable_streaming=True)
```

Bind HTTP servers to 127.0.0.1 for local-only access.

---

## Local Security Rules

- Validate inputs: Never assume trusted data; check types and ranges
- Limit side effects: Tools should have clear, bounded behavior
- Avoid secrets in logs: If tools touch local secrets, do not print them
- Separate logs from protocol: Use stderr or a logger, not stdout (stdout is for MCP JSON-RPC)
- HTTP: Bind 127.0.0.1 only; optional API key header if multiple local users

---

## Wiring Into Clients

### VS Code (.vscode/mcp.json)

Stdio (TypeScript):
```json
{
  "mcpServers": {
    "mcp-local-ts": {
      "command": "node",
      "args": ["dist/server.js"],
      "transport": "stdio"
    }
  }
}
```

HTTP (Python):
```json
{
  "mcpServers": {
    "mcp-local-py-http": {
      "transport": "http",
      "url": "http://127.0.0.1:8080"
    }
  }
}
```

### GitHub Copilot (%USERPROFILE%\.config\copilot\mcp.json)

Stdio:
```json
{
  "servers": {
    "mcp-local-ts": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\path\\to\\mcp-local-ts\\dist\\server.js"]
    }
  }
}
```

HTTP:
```json
{
  "servers": {
    "mcp-local-py-http": {
      "type": "http",
      "url": "http://127.0.0.1:8080"
    }
  }
}
```

---

## Minimal Info Mode

When constrained on tokens, always include:
- Server name, version
- At least one tool (get_status)
- Transport choice (stdio or http://127.0.0.1:<port>)

Prefer stdio for simplest local integration.

Still enforce:
- No secrets in code
- No non-JSON output on MCP channel