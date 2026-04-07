#!/usr/bin/env node

import { parseArgs, runCli } from './cli.js';

async function main(): Promise<void> {
  // MCP mode: when stdin is piped (non-TTY), run as MCP server
  if (!process.stdin.isTTY) {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    return;
  }

  // CLI mode
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);
  const result = await runCli(parsed);

  process.stdout.write(result.output + '\n');
  process.exit(result.exitCode);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
