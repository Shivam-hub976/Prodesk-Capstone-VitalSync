// backend/middleware/errorMiddleware.js

// Fallback for requests targeting undefined routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error interceptor
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Intercept Mongoose Invalid ObjectId Error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found: Invalid ID format.';
  }

  // Intercept Zod Schema Validation Errors (Preparing for Step 1.2)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  // Intercept Mongoose Duplicate Key Error (e.g., registering existing email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Strip stack traces in production to prevent leaking server directory structures
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};