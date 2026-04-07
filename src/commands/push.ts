import { runN8nac } from '../n8nac.js';
import type { CommandResult } from '../types.js';

export async function run(args: string[]): Promise<CommandResult> {
  const file = args[0];
  if (!file) {
    return { output: 'Error: push requires a filename argument', exitCode: 1 };
  }
  return runN8nac(['push', file]);
}
