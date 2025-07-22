// No file system imports needed

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  constructor() {
    // No file system initialization needed
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    let formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;
    
    if (meta) {
      if (typeof meta === 'object') {
        formattedMessage += ` ${JSON.stringify(meta)}`;
      } else {
        formattedMessage += ` ${meta}`;
      }
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Only log to console
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  // Special method for API requests
  apiRequest(method: string, path: string, statusCode: number, duration: number, ip?: string): void {
    const message = `${method} ${path} ${statusCode} ${duration}ms`;
    const meta = { ip, method, path, statusCode, duration };
    this.info(message, meta);
  }

  // Special method for save record operations
  saveRecord(recordId: string, processGroup: string, success: boolean, error?: string): void {
    const message = `Save Record: ${recordId} (${processGroup}) - ${success ? 'SUCCESS' : 'FAILED'}`;
    const meta = { recordId, processGroup, success, error };
    if (success) {
      this.info(message, meta);
    } else {
      this.error(message, meta);
    }
  }

  // Special method for question retrieval
  questionRetrieval(params: any, count: number, success: boolean, error?: string): void {
    const message = `Question Retrieval: ${count} questions - ${success ? 'SUCCESS' : 'FAILED'}`;
    const meta = { params, count, success, error };
    if (success) {
      this.info(message, meta);
    } else {
      this.error(message, meta);
    }
  }
}

// Create singleton instance
export const logger = new Logger(); 