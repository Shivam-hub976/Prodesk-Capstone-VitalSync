// backend/middleware/errorMiddleware.js

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Intercept Mongoose Invalid ObjectId Error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found: Invalid ID format.';
  }

  // Intercept Zod Schema Validation Errors (FIXED)
  if (err.name === 'ZodError') {
    statusCode = 400;
    const validationErrors = err.issues || err.errors || [];
    message = validationErrors.map(e => {
      const field = e.path && e.path.length > 0 ? `${e.path.join('.')}: ` : '';
      return `${field}${e.message}`;
    }).join(', ');
  }

  // Intercept Mongoose Duplicate Key Error
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