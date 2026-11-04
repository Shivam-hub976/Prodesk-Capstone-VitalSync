export const validate = (schema) => (req, res, next) => {
  try {
    // Parse forces the request body to match the strict Zod schema
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // Forward the ZodError directly to the global error middleware
    next(error);
  }
};