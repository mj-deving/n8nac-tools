import type { CommandResult } from '../types.js';

export interface CommandDescriptor {
  name: string;
  description: string;
  mcpName: string;
  /** true if this command accepts a host override */
  acceptsHost: boolean;
  load: () => Promise<{ run: (args: string[], host?: string) => Promise<CommandResult> }>;
}

export const COMMANDS: CommandDescriptor[] = [
  { name: 'list',   description: 'List workflows with status',                  mcpName: 'n8nac.list',   acceptsHost: false, load: () => import('./list.js') },
  { name: 'push',   description: 'Push workflow to n8n (filename only, no path)', mcpName: 'n8nac.push',   acceptsHost: false, load: () => import('./push.js') },
  { name: 'pull',   description: 'Pull workflow from n8n by ID',                mcpName: 'n8nac.pull',   acceptsHost: false, load: () => import('./pull.js') },
  { name: 'verify', description: 'Verify workflow against n8n',                 mcpName: 'n8nac.verify', acceptsHost: false, load: () => import('./verify.js') },
  { name: 'search', description: 'Search available n8n nodes',                  mcpName: 'n8nac.search', acceptsHost: false, load: () => import('./search.js') },
  { name: 'api',    description: 'Direct n8n REST API call',                    mcpName: 'n8n.api',      acceptsHost: true,  load: () => import('./api.js') },
];

/** Lookup map for CLI routing */
export const COMMAND_MAP = new Map(COMMANDS.map(c => [c.name, c]));
