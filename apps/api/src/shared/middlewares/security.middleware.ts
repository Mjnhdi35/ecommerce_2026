import cors, { CorsOptions } from "cors";
import { RequestHandler } from "express";
import helmet from "helmet";
import { environment } from "../../config/environment";

export class SecurityMiddleware {
  public readonly cors: RequestHandler;
  public readonly helmet: RequestHandler;

  constructor() {
    this.helmet = helmet();
    this.cors = cors(this.getCorsOptions());
  }

  private getCorsOptions(): CorsOptions {
    const allowedOrigins = environment.CLIENT_ORIGINS
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    return {
      credentials: true,
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
    };
  }
}
