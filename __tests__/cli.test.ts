import { parseArgs } from '../src/cli.js';

describe('CLI argument parsing', () => {
  it('parses "list" command', () => {
    const result = parseArgs(['list']);
    expect(result.command).toBe('list');
    expect(result.args).toEqual([]);
  });

  it('parses "push" command with filename argument', () => {
    const result = parseArgs(['push', 'workflow.ts']);
    expect(result.command).toBe('push');
    expect(result.args).toEqual(['workflow.ts']);
  });

  it('parses "pull" command with id argument', () => {
    const result = parseArgs(['pull', '42']);
    expect(result.command).toBe('pull');
    expect(result.args).toEqual(['42']);
  });

  it('parses "verify" command with id argument', () => {
    const result = parseArgs(['verify', '123']);
    expect(result.command).toBe('verify');
    expect(result.args).toEqual(['123']);
  });

  it('parses "search" command with query', () => {
    const result = parseArgs(['search', 'email validation']);
    expect(result.command).toBe('search');
    expect(result.args).toEqual(['email validation']);
  });

  it('parses "api" command with method and path', () => {
    const result = parseArgs(['api', 'GET', '/api/v1/workflows']);
    expect(result.command).toBe('api');
    expect(result.args).toEqual(['GET', '/api/v1/workflows']);
  });

  it('returns help for --help flag', () => {
    const result = parseArgs(['--help']);
    expect(result.command).toBe('help');
  });

  it('returns help for no arguments', () => {
    const result = parseArgs([]);
    expect(result.command).toBe('help');
  });

  it('extracts --host flag', () => {
    const result = parseArgs(['--host', 'http://myhost:5678', 'list']);
    expect(result.command).toBe('list');
    expect(result.options.host).toBe('http://myhost:5678');
  });

  it('handles unknown commands', () => {
    const result = parseArgs(['unknown']);
    expect(result.command).toBe('unknown');
  });
});
