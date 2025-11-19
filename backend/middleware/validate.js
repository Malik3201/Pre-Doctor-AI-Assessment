import { ZodError } from 'zod';

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors,
      });
    }
    return next(err);
  }
};

