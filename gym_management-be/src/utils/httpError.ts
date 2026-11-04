import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

/** An error whose message is safe to show to the API caller. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
  }
}

export const asyncHandler =
  (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    handler(req, res).catch(next);
  };

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, code: error.code });
    return;
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    const field = issue.path.join(".");
    res.status(400).json({ message: field ? `${field}: ${issue.message}` : issue.message });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `Invalid ${error.path}` });
    return;
  }
  console.error("Unhandled API error:", error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
};

export const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
