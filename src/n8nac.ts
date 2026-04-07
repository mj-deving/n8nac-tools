import { execFile } from 'child_process';
import type { CommandResult } from './types.js';

/**
 * Shell out to `npx n8nac <args>` and capture output.
 */
export function runN8nac(args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile('npx', ['n8nac', ...args], { timeout: 30_000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          output: stderr || stdout || error.message,
          exitCode: 1,
        });
      } else {
        resolve({
          output: stdout.trim(),
          exitCode: 0,
        });
      }
    });
  });
}
