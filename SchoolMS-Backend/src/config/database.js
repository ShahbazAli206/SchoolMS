const {Sequelize} = require('sequelize');
require('dotenv').config();

const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:    process.env.DB_HOST,
    port:    parseInt(process.env.DB_PORT, 10),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development'
      ? msg => logger.debug(msg)
      : false,
    pool: {max: 10, min: 0, acquire: 30000, idle: 10000},
    define: {
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected successfully');

    // Note: Database schema is already created from schema.sql
    // Sequelize sync is disabled to prevent schema conflicts
    // Uncomment below if you need to manage schema via ORM:
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({alter: true});
    //   logger.info('Database synced (development)');
    // }
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {sequelize, connectDB};
