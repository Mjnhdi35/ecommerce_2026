import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  requestId?: string;
  errors?: unknown;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data?: T,
    statusCode = 200,
    message?: string,
  ): void {
    if (res.headersSent) {
      return;
    }

    const body: SuccessResponse<T> = {
      success: true,
    };

    if (data !== undefined) {
      body.data = data;
    }

    if (message) {
      body.message = message;
    }

    res.status(statusCode).json(body);
  }

  public static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown,
    errorCode?: string,
  ): void {
    if (res.headersSent) {
      return;
    }

    const body: ErrorResponse = {
      errorCode: errorCode || this.getDefaultErrorCode(statusCode),
      success: false,
      message,
    };
    const requestId = res.locals.requestId as string | undefined;

    if (requestId) {
      body.requestId = requestId;
    }

    if (errors !== undefined) {
      body.errors = errors;
    }

    res.status(statusCode).json(body);
  }

  public static noContent(res: Response): void {
    if (res.headersSent) {
      return;
    }

    res.status(204).send();
  }

  private static getDefaultErrorCode(statusCode: number): string {
    return `HTTP_${statusCode}`;
  }
}
