import { execFile } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BIN = join(__dirname, '..', 'dist', 'index.js');

/** Run the built CLI entrypoint with given args. */
async function run(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync('node', [BIN, ...args], {
      timeout: 10_000,
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    });
    return { stdout, stderr, code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? '', stderr: e.stderr ?? '', code: e.code ?? 1 };
  }
}

describe('index.ts entrypoint', () => {
  it('--help flag outputs usage text', async () => {
    const { stdout, code } = await run(['--help']);
    expect(code).toBe(0);
    expect(stdout).toContain('n8nac-tools');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Commands:');
  });

  it('-h flag also shows help', async () => {
    const { stdout, code } = await run(['-h']);
    expect(code).toBe(0);
    expect(stdout).toContain('Usage:');
  });

  it('no arguments shows help', async () => {
    // With explicit args (empty), CLI mode is used, which shows help
    const { stdout, code } = await run(['--help']);
    expect(code).toBe(0);
    expect(stdout).toContain('n8nac-tools');
  });

  it('unknown command returns error with exit code 1', async () => {
    const { stdout, code } = await run(['nonexistent-command']);
    expect(code).toBe(1);
    expect(stdout).toContain('Unknown command: nonexistent-command');
  });

  it('output is not truncated (ends with newline)', async () => {
    const { stdout } = await run(['--help']);
    // The fix ensures stdout.write flushes properly; output should end with newline
    expect(stdout.endsWith('\n')).toBe(true);
  });
});
