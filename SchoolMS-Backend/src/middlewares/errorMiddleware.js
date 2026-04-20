const logger = require('../config/logger');
const ApiResponse = require('../utils/ApiResponse');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} — ${err.message}`, {stack: err.stack});

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({field: e.path, message: e.message}));
    return ApiResponse.validationError(res, errors);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: `File too large. Max ${process.env.MAX_FILE_SIZE_MB}MB`,
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    };
    return ApiResponse.error(res, messages[err.code] || err.message, 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorMiddleware;
