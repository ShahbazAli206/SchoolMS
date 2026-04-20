require('dotenv').config();
const app = require('./src/app');
const {connectDB} = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`SchoolMS Backend running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
