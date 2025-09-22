// Simple logging utility with environment-based log levels
const isDevelopment = process.env.NODE_ENV === "development";

// Type for logger arguments - allows common loggable types
type LoggableValue = string | number | boolean | null | undefined | object;

export const logger = {
  debug: (message: string, ...args: LoggableValue[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: LoggableValue[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: LoggableValue[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message: string, ...args: LoggableValue[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};
