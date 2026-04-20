const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');
const Class = require('./Class');

const Subject = sequelize.define('Subject', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name:       {type: DataTypes.STRING(100), allowNull: false},
  code:       {type: DataTypes.STRING(20), allowNull: true, unique: true},
  class_id:   {type: DataTypes.INTEGER, allowNull: true},
  teacher_id: {type: DataTypes.INTEGER, allowNull: true},
}, {tableName: 'subjects'});

Subject.belongsTo(Class, {foreignKey: 'class_id', as: 'class'});
Subject.belongsTo(User,  {foreignKey: 'teacher_id', as: 'teacher'});
Class.hasMany(Subject,   {foreignKey: 'class_id', as: 'subjects'});

module.exports = Subject;
