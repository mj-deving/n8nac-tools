import { COMMAND_MAP } from './commands/registry.js';
import type { ParsedArgs, CommandResult } from './types.js';

const HELP_TEXT = `
n8nac-tools - CLI wrapper for n8nac commands

Usage:
  n8nac-tools <command> [args...]

Commands:
  list                          List workflows with status
  push <filename>               Push workflow to n8n (filename only, no path)
  pull <id>                     Pull workflow from n8n
  verify <id>                   Verify workflow against n8n
  search <query>                Search available n8n nodes
  api <METHOD> <path>           Direct n8n REST API call

Options:
  --host <url>                  n8n host URL (only applies to the api command)
                                Also configurable via N8N_HOST env var
  --help                        Show this help message

MCP Mode:
  When stdin is piped (non-TTY), runs as an MCP server.
  Tools: n8nac.list, n8nac.push, n8nac.pull, n8nac.verify, n8nac.search, n8n.api

Examples:
  n8nac-tools list
  n8nac-tools push workflow.ts
  n8nac-tools pull 42
  n8nac-tools verify 123
  n8nac-tools search "email validation"
  n8nac-tools api GET /api/v1/workflows
  n8nac-tools --host http://myhost:5678 api GET /api/v1/workflows
`.trim();

/**
 * Parse CLI arguments into command, args, and options.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const options: ParsedArgs['options'] = {};
  const remaining: string[] = [];

  let i = 0;
  while (i < argv.length) {
    if (argv[i] === '--help' || argv[i] === '-h') {
      return { command: 'help', args: [], options };
    }
    if (argv[i] === '--host' && i + 1 < argv.length) {
      options.host = argv[i + 1];
      i += 2;
      continue;
    }
    remaining.push(argv[i]!);
    i++;
  }

  if (remaining.length === 0) {
    return { command: 'help', args: [], options };
  }

  const command = remaining[0]!;
  const args = remaining.slice(1);

  return { command, args, options };
}

/**
 * Run the CLI with given parsed arguments.
 */
export async function runCli(parsed: ParsedArgs): Promise<CommandResult> {
  if (parsed.command === 'help') {
    return { output: HELP_TEXT, exitCode: 0 };
  }

  const descriptor = COMMAND_MAP.get(parsed.command);
  if (!descriptor) {
    return {
      output: `Unknown command: ${parsed.command}\n\nRun "n8nac-tools --help" for usage.`,
      exitCode: 1,
    };
  }

  const mod = await descriptor.load();
  // Only pass --host to commands that accept it (api). Others use n8nac's own config.
  const host = descriptor.acceptsHost ? parsed.options.host : undefined;
  return mod.run(parsed.args, host);
}

export { HELP_TEXT };
