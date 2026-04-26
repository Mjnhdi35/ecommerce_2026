import { NextFunction, Request, Response, Router } from "express";

interface ErrorAwareController {
  handleError?: (error: unknown, res: Response) => void;
}

export abstract class BaseRoutes {
  protected router: Router;

  protected constructor() {
    this.router = Router();
  }

  protected handle(
    controller: unknown,
    action: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await action(req, res, next);
      } catch (error) {
        const errorAwareController = controller as ErrorAwareController;

        if (!errorAwareController.handleError) {
          next(error);
          return;
        }

        try {
          errorAwareController.handleError(error, res);
        } catch (unhandledError) {
          next(unhandledError);
        }
      }
    };
  }

  public getRouter(): Router {
    return this.router;
  }
}
