/**
 * Type definitions for the MCP Demo Server
 */

/**
 * Note stored in the system
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  tags: string[];
}

/**
 * Weather information
 */
export interface WeatherData {
  location: string;
  temperature: number;
  unit: string;
  condition: string;
  humidity: number;
  windSpeed: number;
}

/**
 * System information
 */
export interface SystemInfo {
  platform: string;
  nodeVersion: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
  };
  cpu: {
    model: string;
    cores: number;
  };
}

/**
 * Calculation result
 */
export interface CalculationResult {
  expression: string;
  result: number;
  steps?: string[];
}
