// Strip HTML tags and dangerous patterns from all string values in req.body.
// Protects against stored XSS — Sequelize already parameterizes queries for SQLi.
const sanitizeValue = val => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')          // strip all HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');      // strip inline event handlers
};

const sanitizeObject = obj => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    clean[key] = typeof val === 'object' ? sanitizeObject(val) : sanitizeValue(val);
  }
  return clean;
};

const sanitizeMiddleware = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = sanitizeMiddleware;
