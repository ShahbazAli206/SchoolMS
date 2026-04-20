const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User    = require('./User');
const Student = require('./Student');
const Class   = require('./Class');

const Attendance = sequelize.define('Attendance', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  student_id: {type: DataTypes.INTEGER, allowNull: false},
  class_id:   {type: DataTypes.INTEGER, allowNull: false},
  teacher_id: {type: DataTypes.INTEGER, allowNull: false},
  date:       {type: DataTypes.DATEONLY, allowNull: false},
  status:     {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present',
  },
  remarks:    {type: DataTypes.TEXT, allowNull: true},
}, {
  tableName: 'attendance',
  indexes: [{unique: true, fields: ['student_id', 'date']}],
});

Attendance.belongsTo(Student, {foreignKey: 'student_id', as: 'student'});
Attendance.belongsTo(Class,   {foreignKey: 'class_id',   as: 'class'});
Attendance.belongsTo(User,    {foreignKey: 'teacher_id', as: 'teacher'});

module.exports = Attendance;
