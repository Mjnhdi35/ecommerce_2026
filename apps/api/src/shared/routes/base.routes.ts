import { NextFunction, Request, Response, Router } from "express";

export interface RouteDefinition {
  method: string;
  path: string;
  access?: "admin" | "authenticated" | "public";
}

export abstract class BaseRoutes {
  protected router: Router;

  protected constructor() {
    this.router = Router();
  }

  protected handle(
    _controller: unknown,
    action: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ) {
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
    return [];
  }
}
