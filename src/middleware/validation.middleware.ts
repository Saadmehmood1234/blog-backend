import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
export const validationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        next({ statusCode: 400, message: "Validation Failed" });
      } else {
        next({
          message: "Something went wrong during validation",
          statusCode: 500,
        });
      }
    }
  };
};
