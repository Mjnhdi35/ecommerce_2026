export class Logger {
  private context: string;

  constructor(context: string = "API") {
    this.context = context;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : "";
    return `[${timestamp}] ${this.context} ${level}: ${message}${dataStr}`;
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage("INFO", message, data));
  }

  error(message: string, error?: any): void {
    console.error(this.formatMessage("ERROR", message, error));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage("WARN", message, data));
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("DEBUG", message, data));
    }
  }
} 