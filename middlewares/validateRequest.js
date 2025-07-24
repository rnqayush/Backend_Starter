import { validationResult } from 'express-validator';
import { formatResponse } from '../utils/responseFormatter.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json(
      formatResponse(false, 'Validation failed', {
        errors: errorMessages,
      })
    );
  }

  next();
};

