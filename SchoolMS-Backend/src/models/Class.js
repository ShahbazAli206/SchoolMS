const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Class = sequelize.define('Class', {
  id:        {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name:      {type: DataTypes.STRING(100), allowNull: false},
  section:   {type: DataTypes.STRING(10), allowNull: true},
  grade:     {type: DataTypes.STRING(20), allowNull: true},
  teacher_id:{type: DataTypes.INTEGER, allowNull: true},
  is_active: {type: DataTypes.BOOLEAN, defaultValue: true},
}, {tableName: 'classes'});

Class.belongsTo(User, {foreignKey: 'teacher_id', as: 'classTeacher'});
User.hasMany(Class, {foreignKey: 'teacher_id', as: 'classes'});

module.exports = Class;
