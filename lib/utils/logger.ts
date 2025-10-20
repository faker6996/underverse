/**
 * Simple logger utility for development and production
 * Allows toggling log levels and centralized log management
 */

import { LOG_LEVEL } from "@/lib/constants/enum";

interface LoggerConfig {
  level: LOG_LEVEL;
  enabled: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private shouldLog(level: LOG_LEVEL): boolean {
    if (!this.config.enabled) return false;

    const levels: LOG_LEVEL[] = [LOG_LEVEL.DEBUG, LOG_LEVEL.INFO, LOG_LEVEL.WARN, LOG_LEVEL.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LOG_LEVEL, message: string, data?: any): [string, any?] {
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : "";
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `${timestamp} ${prefix}${message}`;

    return data !== undefined ? [formattedMessage, data] : [formattedMessage];
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVEL.DEBUG)) {
      const [msg, ...args] = this.formatMessage(LOG_LEVEL.DEBUG, message, data);
      console.debug(`🐛 ${msg}`, ...args);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVEL.INFO)) {
      const [msg, ...args] = this.formatMessage(LOG_LEVEL.INFO, message, data);
      console.info(`ℹ️ ${msg}`, ...args);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVEL.WARN)) {
      const [msg, ...args] = this.formatMessage(LOG_LEVEL.WARN, message, data);
      console.warn(`⚠️ ${msg}`, ...args);
    }
  }

  error(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVEL.ERROR)) {
      const [msg, ...args] = this.formatMessage(LOG_LEVEL.ERROR, message, data);
      console.error(`❌ ${msg}`, ...args);
    }
  }
}

// Create logger instances for different modules
export const signalRLogger = new Logger({
  level: process.env.NODE_ENV === "development" ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN,
  enabled: true,
  prefix: "SignalR",
});

export const messengerLogger = new Logger({
  level: process.env.NODE_ENV === "development" ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN,
  enabled: true,
  prefix: "Messenger",
});

export const createLogger = (prefix: string, level: LOG_LEVEL = LOG_LEVEL.INFO) => {
  return new Logger({
    level: process.env.NODE_ENV === "development" ? level : LOG_LEVEL.WARN,
    enabled: true,
    prefix,
  });
};
