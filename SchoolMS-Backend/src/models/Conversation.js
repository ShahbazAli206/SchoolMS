const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User        = require('./User');

const Conversation = sequelize.define('Conversation', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  type:       {type: DataTypes.ENUM('direct', 'group'), allowNull: false, defaultValue: 'direct'},
  name:       {type: DataTypes.STRING(150), allowNull: true},   // group name; null for direct
  created_by: {type: DataTypes.INTEGER, allowNull: false},
}, {tableName: 'conversations'});

Conversation.belongsTo(User, {foreignKey: 'created_by', as: 'creator'});

module.exports = Conversation;
