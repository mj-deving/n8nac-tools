import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { CommandResult } from '../types.js';

const DEFAULT_HOST = 'http://localhost:5678';
const CREDENTIALS_PATH = join(homedir(), '.config', 'n8nac-nodejs', 'Config', 'credentials.json');

/**
 * Normalize a host URL: strip trailing slashes and lowercase.
 */
export function normalizeHost(host: string): string {
  return host.replace(/\/+$/, '').toLowerCase();
}

/**
 * Resolve the n8n host from: --host flag > N8N_HOST env > default.
 * Result is always normalized.
 */
export function resolveHost(flagHost: string | undefined): string {
  if (flagHost) return normalizeHost(flagHost);
  if (process.env.N8N_HOST) return normalizeHost(process.env.N8N_HOST);
  return DEFAULT_HOST;
}

/**
 * Load API key from n8nac credentials file.
 * Both the lookup host and credential keys are normalized before matching.
 */
export async function loadCredentials(host: string): Promise<string> {
  const raw = await readFile(CREDENTIALS_PATH, 'utf-8');
  const data = JSON.parse(raw) as { hosts: Record<string, string> };
  const normalizedHost = normalizeHost(host);
  // Normalize credential keys for comparison
  const key = Object.entries(data.hosts).find(
    ([k]) => normalizeHost(k) === normalizedHost
  )?.[1];
  if (!key) {
    throw new Error(`No API key found for host "${host}" in ${CREDENTIALS_PATH}`);
  }
  return key;
}

export async function run(args: string[], host?: string): Promise<CommandResult> {
  const method = (args[0] || 'GET').toUpperCase();
  const path = args[1];

  if (!path) {
    return { output: 'Error: api requires a method and path (e.g., api GET /api/v1/workflows)', exitCode: 1 };
  }

  const resolvedHost = resolveHost(host);

  let apiKey: string;
  try {
    apiKey = await loadCredentials(resolvedHost);
  } catch (err) {
    return {
      output: `Error loading credentials: ${(err as Error).message}`,
      exitCode: 1,
    };
  }

  const url = `${resolvedHost}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.text();

    if (!response.ok) {
      return {
        output: `HTTP ${response.status}: ${body}`,
        exitCode: 1,
      };
    }

    // Pretty-print JSON responses
    try {
      const json = JSON.parse(body);
      return { output: JSON.stringify(json, null, 2), exitCode: 0 };
    } catch {
      return { output: body, exitCode: 0 };
    }
  } catch (err) {
    return {
      output: `Request failed: ${(err as Error).message}`,
      exitCode: 1,
    };
  }
}
