/**
 * Cloud seeder — run ONCE after schema is imported on Clever Cloud.
 * Usage: node seed-cloud.js
 * Set these env vars before running (replace with your Clever Cloud values):
 *   DB_HOST=xxx DB_PORT=xxx DB_USER=xxx DB_PASSWORD=xxx DB_NAME=xxx node seed-cloud.js
 */
process.env.DB_HOST     = process.env.DB_HOST     || 'PASTE_CLEVER_CLOUD_HOST';
process.env.DB_PORT     = process.env.DB_PORT     || '3306';
process.env.DB_USER     = process.env.DB_USER     || 'PASTE_CLEVER_CLOUD_USER';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'PASTE_CLEVER_CLOUD_PASSWORD';
process.env.DB_NAME     = process.env.DB_NAME     || 'PASTE_CLEVER_CLOUD_DBNAME';

// Re-use main seed logic
require('./seed.js');
