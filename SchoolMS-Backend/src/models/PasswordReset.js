const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  email:       {type: DataTypes.STRING(150), allowNull: false},
  otp:         {type: DataTypes.STRING(6), allowNull: false},
  is_used:     {type: DataTypes.BOOLEAN, defaultValue: false},
  expires_at:  {type: DataTypes.DATE, allowNull: false},
}, {tableName: 'password_resets'});

module.exports = PasswordReset;
