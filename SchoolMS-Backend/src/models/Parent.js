const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Parent = sequelize.define('Parent', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  user_id:    {type: DataTypes.INTEGER, allowNull: false, unique: true},
  occupation: {type: DataTypes.STRING(100), allowNull: true},
  address:    {type: DataTypes.TEXT, allowNull: true},
}, {tableName: 'parents'});

Parent.belongsTo(User, {foreignKey: 'user_id', as: 'user'});
User.hasOne(Parent, {foreignKey: 'user_id', as: 'parentProfile'});

module.exports = Parent;
