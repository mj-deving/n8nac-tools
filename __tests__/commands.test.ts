import { jest } from '@jest/globals';

// Mock child_process before importing
jest.unstable_mockModule('child_process', () => ({
  execFile: jest.fn(),
}));

const { execFile } = await import('child_process');
const { runN8nac } = await import('../src/n8nac.js');

describe('n8nac runner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls npx n8nac with provided arguments', async () => {
    const mockExecFile = execFile as unknown as jest.Mock;
    mockExecFile.mockImplementation(
      (_cmd: string, _args: string[], _opts: object, cb: Function) => {
        cb(null, 'workflow list output', '');
      }
    );

    const result = await runN8nac(['list']);
    expect(result.output).toBe('workflow list output');
    expect(result.exitCode).toBe(0);
    expect(mockExecFile).toHaveBeenCalledWith(
      'npx',
      ['n8nac', 'list'],
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('returns exitCode 1 on error', async () => {
    const mockExecFile = execFile as unknown as jest.Mock;
    const error = new Error('command failed') as any;
    error.code = 1;
    error.stdout = '';
    error.stderr = 'error output';
    mockExecFile.mockImplementation(
      (_cmd: string, _args: string[], _opts: object, cb: Function) => {
        cb(error, '', 'error output');
      }
    );

    const result = await runN8nac(['bad-command']);
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('error output');
  });
});

describe('command modules', () => {
  it('list command exports a run function', async () => {
    const { run } = await import('../src/commands/list.js');
    expect(typeof run).toBe('function');
  });

  it('push command exports a run function', async () => {
    const { run } = await import('../src/commands/push.js');
    expect(typeof run).toBe('function');
  });

  it('pull command exports a run function', async () => {
    const { run } = await import('../src/commands/pull.js');
    expect(typeof run).toBe('function');
  });

  it('verify command exports a run function', async () => {
    const { run } = await import('../src/commands/verify.js');
    expect(typeof run).toBe('function');
  });

  it('search command exports a run function', async () => {
    const { run } = await import('../src/commands/search.js');
    expect(typeof run).toBe('function');
  });

  it('api command exports a run function', async () => {
    const { run } = await import('../src/commands/api.js');
    expect(typeof run).toBe('function');
  });
});
