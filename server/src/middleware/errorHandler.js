import { env } from "../config/env.js";

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.isOperational || statusCode < 500 ? err.message : "Internal server error",
    errors: err.errors || []
  };

  if (env.nodeEnv !== "production" && statusCode >= 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
