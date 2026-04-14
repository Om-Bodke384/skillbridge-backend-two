const { ApiError } = require('../utils/apiResponse');

/**
 * Joi Validation Middleware Factory
 * @param {Object} schema - Joi schema object
 * @param {string} target - 'body' | 'query' | 'params'
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }

    req[target] = value;
    next();
  };
};

module.exports = { validate };
