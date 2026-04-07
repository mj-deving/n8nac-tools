import { runN8nac } from '../n8nac.js';
import type { CommandResult } from '../types.js';

export async function run(args: string[]): Promise<CommandResult> {
  const id = args[0];
  if (!id) {
    return { output: 'Error: pull requires a workflow ID argument', exitCode: 1 };
  }
  return runN8nac(['pull', id]);
}
