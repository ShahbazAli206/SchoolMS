const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Session = sequelize.define('Session', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  user_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'users', key: 'id'}},
  refresh_token: {type: DataTypes.TEXT, allowNull: false},
  device_info: {type: DataTypes.STRING(255), allowNull: true},
  ip_address: {type: DataTypes.STRING(45), allowNull: true},
  expires_at: {type: DataTypes.DATE, allowNull: false},
  is_active: {type: DataTypes.BOOLEAN, defaultValue: true},
}, {
  tableName: 'sessions',
  timestamps: false,
});

Session.belongsTo(User, {foreignKey: 'user_id'});
User.hasMany(Session, {foreignKey: 'user_id'});

module.exports = Session;
