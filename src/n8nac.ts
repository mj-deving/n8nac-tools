import { execFile, execFileSync } from 'child_process';
import type { CommandResult } from './types.js';

/** Resolve n8nac binary once at import time; fall back to npx. */
let n8nacBin: string;
let n8nacPrefix: string[];
try {
  n8nacBin = execFileSync('which', ['n8nac'], { encoding: 'utf-8' }).trim();
  n8nacPrefix = [];
} catch {
  n8nacBin = 'npx';
  n8nacPrefix = ['n8nac'];
}

/** Exposed for testing */
export function getResolvedBin(): { bin: string; prefix: string[] } {
  return { bin: n8nacBin, prefix: n8nacPrefix };
}

/**
 * Shell out to n8nac and capture output.
 * Uses the resolved binary path, falling back to `npx n8nac` if not found globally.
 */
export function runN8nac(args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile(n8nacBin, [...n8nacPrefix, ...args], { timeout: 30_000 }, (error, stdout, stderr) => {
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
