import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { COMMANDS } from './commands/registry.js';
import type { CommandResult } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

function resultToMcp(result: CommandResult) {
  return {
    content: [{ type: 'text' as const, text: result.output }],
    isError: result.exitCode !== 0,
  };
}

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: 'n8nac-tools',
    version: pkg.version,
  });

  // Register n8nac commands (no host parameter — they use n8nac's own config)
  for (const cmd of COMMANDS) {
    if (cmd.name === 'api') continue; // api gets special registration below

    switch (cmd.name) {
      case 'list':
        server.tool(cmd.mcpName, cmd.description, {}, async () => {
          const { run } = await cmd.load();
          return resultToMcp(await run([]));
        });
        break;
      case 'push':
        server.tool(
          cmd.mcpName, cmd.description,
          { filename: z.string().describe('Workflow filename to push (e.g., workflow.ts)') },
          async ({ filename }) => {
            const { run } = await cmd.load();
            return resultToMcp(await run([filename]));
          }
        );
        break;
      case 'pull':
        server.tool(
          cmd.mcpName, cmd.description,
          { id: z.string().describe('Workflow ID to pull') },
          async ({ id }) => {
            const { run } = await cmd.load();
            return resultToMcp(await run([id]));
          }
        );
        break;
      case 'verify':
        server.tool(
          cmd.mcpName, cmd.description,
          { id: z.string().describe('Workflow ID to verify') },
          async ({ id }) => {
            const { run } = await cmd.load();
            return resultToMcp(await run([id]));
          }
        );
        break;
      case 'search':
        server.tool(
          cmd.mcpName, cmd.description,
          { query: z.string().describe('Search query for n8n nodes') },
          async ({ query }) => {
            const { run } = await cmd.load();
            return resultToMcp(await run([query]));
          }
        );
        break;
    }
  }

  // api command — the only one that accepts a host override
  const apiCmd = COMMANDS.find(c => c.name === 'api')!;
  server.tool(
    apiCmd.mcpName,
    apiCmd.description,
    {
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET').describe('HTTP method'),
      path: z.string().describe('API path (e.g., /api/v1/workflows)'),
      host: z.string().optional().describe('n8n host URL override'),
    },
    async ({ method, path, host }) => {
      const { run } = await apiCmd.load();
      return resultToMcp(await run([method, path], host));
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
