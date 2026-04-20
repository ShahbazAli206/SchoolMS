const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const OtpVerification = sequelize.define('OtpVerification', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  identifier: {type: DataTypes.STRING(150), allowNull: false},
  otp: {type: DataTypes.STRING(6), allowNull: false},
  type: {type: DataTypes.ENUM('email', 'sms'), defaultValue: 'email'},
  purpose: {type: DataTypes.ENUM('login', 'new_device', 'forgot_password'), defaultValue: 'login'},
  resend_count: {type: DataTypes.INTEGER, defaultValue: 0},
  is_verified: {type: DataTypes.BOOLEAN, defaultValue: false},
  expires_at: {type: DataTypes.DATE, allowNull: false},
}, {tableName: 'otp_verifications'});

module.exports = OtpVerification;
