import pino, { Logger as PinoLogger } from "pino";

const rootLogger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
            messageFormat: "[{context}] {msg}",
            translateTime: "SYS:standard",
            ignore: "context,pid,hostname",
          },
        },
});

export class Logger {
  private logger: PinoLogger;

  constructor(context: string = "API") {
    this.logger = rootLogger.child({ context });
  }

  public info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  public error(message: string, error?: unknown): void {
    this.log("error", message, error);
  }

  public warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  public debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  private log(
    level: "debug" | "error" | "info" | "warn",
    message: string,
    data?: unknown,
  ): void {
    if (data === undefined) {
      this.logger[level](message);
      return;
    }

    if (data instanceof Error) {
      this.logger[level]({ err: data }, message);
      return;
    }

    if (this.isLogObject(data)) {
      this.logger[level](data, message);
      return;
    }

    this.logger[level]({ data }, message);
  }

  private isLogObject(data: unknown): data is Record<string, unknown> {
    return Boolean(data) && typeof data === "object" && !Array.isArray(data);
  }
}

export class LoggerFactory {
  public create(context: string): Logger {
    return new Logger(context);
  }
}
