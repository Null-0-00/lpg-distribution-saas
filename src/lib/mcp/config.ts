export interface MCPConfig {
  maxThoughts: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  tenantIsolationRequired: boolean;
}

export const defaultMCPConfig: MCPConfig = {
  maxThoughts: 50,
  enableLogging: process.env.NODE_ENV === 'development',
  logLevel: 'info',
  tenantIsolationRequired: true,
};

export function createMCPConfig(overrides: Partial<MCPConfig> = {}): MCPConfig {
  return { ...defaultMCPConfig, ...overrides };
}
