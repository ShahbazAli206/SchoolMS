const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User    = require('./User');
const Class   = require('./Class');
const Subject = require('./Subject');

const ClassTeacher = sequelize.define('ClassTeacher', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  class_id:   {type: DataTypes.INTEGER, allowNull: false},
  teacher_id: {type: DataTypes.INTEGER, allowNull: false},
  subject_id: {type: DataTypes.INTEGER, allowNull: true},
  role: {
    type: DataTypes.ENUM('class_teacher', 'subject_teacher'),
    allowNull: false,
    defaultValue: 'subject_teacher',
  },
  is_active:  {type: DataTypes.BOOLEAN, defaultValue: true},
}, {
  tableName: 'class_teachers',
  indexes: [
    {fields: ['class_id']},
    {fields: ['teacher_id']},
    {fields: ['subject_id']},
    {unique: true, fields: ['class_id', 'teacher_id', 'subject_id', 'role']},
  ],
});

ClassTeacher.belongsTo(Class,   {foreignKey: 'class_id',   as: 'class'});
ClassTeacher.belongsTo(User,    {foreignKey: 'teacher_id', as: 'teacher'});
ClassTeacher.belongsTo(Subject, {foreignKey: 'subject_id', as: 'subject', constraints: false});

Class.hasMany(ClassTeacher, {foreignKey: 'class_id',   as: 'teacherAssignments'});
User.hasMany(ClassTeacher,  {foreignKey: 'teacher_id', as: 'classAssignments'});

module.exports = ClassTeacher;
