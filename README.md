# n8nac-tools

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square) ![CLI](https://img.shields.io/badge/-CLI-333333?style=flat-square) ![npm](https://img.shields.io/badge/-npm-CB3837?style=flat-square)

**CLI-first wrapper for n8nac commands.** Use from terminal, AI agents (via Bash), or MCP clients — same binary, two interfaces.

## Install

```bash
npm install -g n8nac-tools
```

Requires [n8nac](https://www.npmjs.com/package/@n8n-as-code/cli) (`npm install -g n8nac`) and a running n8n instance.

## CLI Usage

```bash
n8nac-tools list                          # List workflows with status
n8nac-tools push workflow.ts              # Push workflow to n8n
n8nac-tools pull <id>                     # Pull workflow from n8n
n8nac-tools verify <id>                   # Verify workflow against n8n
n8nac-tools search "email validation"     # Search available n8n nodes
n8nac-tools api GET /api/v1/workflows     # Direct n8n REST API call
n8nac-tools --help                        # Show usage
```

### Options

```
--host <url>    n8n host URL (default: http://localhost:5678, or N8N_HOST env var)
                Note: --host only applies to the `api` command.
                n8nac commands use their own credential configuration.
```

## MCP Mode

When stdin is piped (non-TTY), n8nac-tools runs as an MCP server:

```json
{
  "mcpServers": {
    "n8nac": {
      "command": "n8nac-tools"
    }
  }
}
```

**MCP Tools:**

| Tool | Description |
|------|-------------|
| `n8nac.list` | List workflows with status |
| `n8nac.push` | Push workflow to n8n |
| `n8nac.pull` | Pull workflow from n8n |
| `n8nac.verify` | Verify workflow |
| `n8nac.search` | Search available nodes |
| `n8n.api` | Direct n8n REST API call (accepts host param) |

## Credentials

n8nac commands use credentials from `~/.config/n8nac-nodejs/Config/credentials.json` (set up during `n8nac init-auth`).

The `api` command reads the API key from the same file, keyed by host URL.

## Architecture

```
CLI mode:    n8nac-tools <command> [args]  →  spawn n8nac / fetch n8n API  →  stdout
MCP mode:    stdin (JSON-RPC)              →  same logic                   →  stdout (JSON-RPC)
```

Follows [ADR-0001: CLI-First Over MCP-Only](https://github.com/mj-deving/code-mode/blob/main/docs/decisions/ADR-0001-cli-first-over-mcp-only.md) — build as CLI first, wrap with MCP adapter in same binary.

## Related

- **[code-mode-tools](https://github.com/mj-deving/code-mode-tools)** — Execute TypeScript code chains in isolated sandbox (CLI + MCP)
- **[n8n-nodes-utcp-codemode](https://github.com/mj-deving/n8n-nodes-utcp-codemode)** — n8n community node for code-mode
- **[Code-First n8n Proving Ground](https://github.com/mj-deving/code-mode)** — The bigger picture

## License

MIT
