const {validationResult} = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({field: e.path, message: e.msg}));
    return ApiResponse.validationError(res, formatted);
  }
  next();
};

module.exports = validateRequest;
