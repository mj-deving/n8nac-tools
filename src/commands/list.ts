import { runN8nac } from '../n8nac.js';
import type { CommandResult } from '../types.js';

export async function run(_args: string[]): Promise<CommandResult> {
  return runN8nac(['list']);
}
