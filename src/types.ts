export interface CommandResult {
  output: string;
  exitCode: number;
}

export interface ParsedArgs {
  command: string;
  args: string[];
  options: {
    host?: string;
  };
}
