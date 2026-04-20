const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.unauthorized(res, 'Invalid or expired token');
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return ApiResponse.forbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

module.exports = {protect, authorize};
