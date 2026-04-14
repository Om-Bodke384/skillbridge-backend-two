/**
 * Async Handler - wraps async route handlers to catch errors
 * Eliminates repetitive try-catch blocks in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
