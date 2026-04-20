const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User    = require('./User');
const Class   = require('./Class');
const Student = require('./Student');
const Subject = require('./Subject');

const Assignment = sequelize.define('Assignment', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title:       {type: DataTypes.STRING(200), allowNull: false},
  description: {type: DataTypes.TEXT, allowNull: true},
  file_url:    {type: DataTypes.STRING(500), allowNull: true},
  teacher_id:  {type: DataTypes.INTEGER, allowNull: false},
  class_id:    {type: DataTypes.INTEGER, allowNull: true},   // null = individual
  student_id:  {type: DataTypes.INTEGER, allowNull: true},   // null = whole class
  subject_id:  {type: DataTypes.INTEGER, allowNull: true},
  due_date:    {type: DataTypes.DATE, allowNull: false},
  max_marks:   {type: DataTypes.DECIMAL(5, 2), defaultValue: 100},
}, {tableName: 'assignments'});

Assignment.belongsTo(User,    {foreignKey: 'teacher_id', as: 'teacher'});
Assignment.belongsTo(Class,   {foreignKey: 'class_id',   as: 'class'});
Assignment.belongsTo(Student, {foreignKey: 'student_id', as: 'student'});
Assignment.belongsTo(Subject, {foreignKey: 'subject_id', as: 'subject'});

module.exports = Assignment;
