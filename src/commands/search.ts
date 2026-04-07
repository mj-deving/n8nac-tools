import { runN8nac } from '../n8nac.js';
import type { CommandResult } from '../types.js';

export async function run(args: string[]): Promise<CommandResult> {
  const query = args[0];
  if (!query) {
    return { output: 'Error: search requires a query argument', exitCode: 1 };
  }
  return runN8nac(['skills', 'search', query]);
}
