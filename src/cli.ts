import type { ParsedArgs, CommandResult } from './types.js';

const VALID_COMMANDS = ['list', 'push', 'pull', 'verify', 'search', 'api', 'help'] as const;

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
  --host <url>                  n8n host URL (default: http://localhost:5678)
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
  n8nac-tools --host http://myhost:5678 list
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

  const commandMap: Record<string, () => Promise<{ run: (args: string[], host?: string) => Promise<CommandResult> }>> = {
    list: () => import('./commands/list.js'),
    push: () => import('./commands/push.js'),
    pull: () => import('./commands/pull.js'),
    verify: () => import('./commands/verify.js'),
    search: () => import('./commands/search.js'),
    api: () => import('./commands/api.js'),
  };

  const loader = commandMap[parsed.command];
  if (!loader) {
    return {
      output: `Unknown command: ${parsed.command}\n\nRun "n8nac-tools --help" for usage.`,
      exitCode: 1,
    };
  }

  const mod = await loader();
  return mod.run(parsed.args, parsed.options.host);
}

export { HELP_TEXT };
