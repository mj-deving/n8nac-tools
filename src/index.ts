#!/usr/bin/env node

import { parseArgs, runCli } from './cli.js';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  // MCP mode: when stdin is piped (non-TTY) AND no CLI arguments given
  // CLI arguments always force CLI mode, even when piped
  if (!process.stdin.isTTY && argv.length === 0) {
    const { startMcpServer } = await import('./mcp.js');
    await startMcpServer();
    return;
  }

  // CLI mode
  const parsed = parseArgs(argv);
  const result = await runCli(parsed);

  process.stdout.write(result.output + '\n');
  process.exit(result.exitCode);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
