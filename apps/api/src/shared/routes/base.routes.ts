import { NextFunction, Request, RequestHandler, Response, Router } from "express";

type AccessLevel = "admin" | "authenticated" | "public";
type HttpMethod = "delete" | "get" | "patch" | "post" | "put";
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export interface RouteDefinition {
  method: string;
  path: string;
  access: AccessLevel;
}

export abstract class BaseRoutes {
  protected router: Router;
  private routes: RouteDefinition[] = [];

  protected constructor() {
    this.router = Router();
  }

  protected route(
    method: HttpMethod,
    path: string,
    access: AccessLevel,
    ...handlers: RequestHandler[]
  ): void {
    const action = handlers.pop();

    if (!action) {
      throw new Error(`Missing route handler for ${method.toUpperCase()} ${path}`);
    }

    this.router[method](
      path,
      ...handlers,
      this.handle(action as unknown as AsyncRequestHandler),
    );
    this.routes.push({ method: method.toUpperCase(), path, access });
  }

  protected handle(action: AsyncRequestHandler): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await action(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRoutes(): RouteDefinition[] {
    return this.routes;
  }
}
