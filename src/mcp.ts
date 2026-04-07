import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { CommandResult } from './types.js';

function resultToMcp(result: CommandResult) {
  return {
    content: [{ type: 'text' as const, text: result.output }],
    isError: result.exitCode !== 0,
  };
}

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: 'n8nac-tools',
    version: '1.0.0',
  });

  server.tool('n8nac.list', 'List all n8n workflows with status', {}, async () => {
    const { run } = await import('./commands/list.js');
    return resultToMcp(await run([]));
  });

  server.tool(
    'n8nac.push',
    'Push a workflow file to n8n (filename only, no path)',
    { filename: z.string().describe('Workflow filename to push (e.g., workflow.ts)') },
    async ({ filename }) => {
      const { run } = await import('./commands/push.js');
      return resultToMcp(await run([filename]));
    }
  );

  server.tool(
    'n8nac.pull',
    'Pull a workflow from n8n by ID',
    { id: z.string().describe('Workflow ID to pull') },
    async ({ id }) => {
      const { run } = await import('./commands/pull.js');
      return resultToMcp(await run([id]));
    }
  );

  server.tool(
    'n8nac.verify',
    'Verify a workflow against n8n',
    { id: z.string().describe('Workflow ID to verify') },
    async ({ id }) => {
      const { run } = await import('./commands/verify.js');
      return resultToMcp(await run([id]));
    }
  );

  server.tool(
    'n8nac.search',
    'Search available n8n nodes',
    { query: z.string().describe('Search query for n8n nodes') },
    async ({ query }) => {
      const { run } = await import('./commands/search.js');
      return resultToMcp(await run([query]));
    }
  );

  server.tool(
    'n8n.api',
    'Direct n8n REST API call',
    {
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET').describe('HTTP method'),
      path: z.string().describe('API path (e.g., /api/v1/workflows)'),
      host: z.string().optional().describe('n8n host URL override'),
    },
    async ({ method, path, host }) => {
      const { run } = await import('./commands/api.js');
      return resultToMcp(await run([method, path], host));
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
