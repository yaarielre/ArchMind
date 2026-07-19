import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errorCode: "INTERNAL_ERROR",
  });
}
