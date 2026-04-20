const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User    = require('./User');
const Class   = require('./Class');
const Subject = require('./Subject');

const Material = sequelize.define('Material', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title:       {type: DataTypes.STRING(200), allowNull: false},
  description: {type: DataTypes.TEXT, allowNull: true},
  file_url:    {type: DataTypes.STRING(500), allowNull: false},
  file_name:   {type: DataTypes.STRING(255), allowNull: true},
  file_type:   {type: DataTypes.ENUM('pdf', 'video', 'image', 'document'), allowNull: false},
  file_size:   {type: DataTypes.INTEGER, allowNull: true},   // bytes
  teacher_id:  {type: DataTypes.INTEGER, allowNull: false},
  class_id:    {type: DataTypes.INTEGER, allowNull: true},
  subject_id:  {type: DataTypes.INTEGER, allowNull: true},
}, {tableName: 'materials'});

Material.belongsTo(User,    {foreignKey: 'teacher_id', as: 'teacher'});
Material.belongsTo(Class,   {foreignKey: 'class_id',   as: 'class'});
Material.belongsTo(Subject, {foreignKey: 'subject_id', as: 'subject'});

module.exports = Material;
