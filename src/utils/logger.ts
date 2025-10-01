/**
 * Logging Utility for Fitness Tracker Application
 *
 * Provides environment-aware logging with different log levels.
 * In development mode, all logs are shown. In production, only warnings and errors are displayed.
 * This helps with debugging during development while keeping production logs clean.
 */

// Check if we're in development mode for conditional logging
const isDevelopment = import.meta.env.DEV;

/**
 * Type definition for values that can be logged
 * Supports common JavaScript types that are useful for debugging
 */
type LoggableValue = string | number | boolean | null | undefined | object;

/**
 * Logger object with different log levels
 * Each method provides formatted output with appropriate log level indicators
 */
export const logger = {
  /**
   * Debug level logging - only shown in development
   * Use for detailed debugging information that's not needed in production
   */
  debug: (message: string, ...args: LoggableValue[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Info level logging - only shown in development
   * Use for general information about application flow
   */
  info: (message: string, ...args: LoggableValue[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Warning level logging - shown in all environments
   * Use for potentially problematic situations that don't break functionality
   */
  warn: (message: string, ...args: LoggableValue[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Error level logging - shown in all environments
   * Use for error conditions that need immediate attention
   */
  error: (message: string, ...args: LoggableValue[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};
