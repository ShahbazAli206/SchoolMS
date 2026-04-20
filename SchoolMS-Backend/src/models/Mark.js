const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User    = require('./User');
const Student = require('./Student');
const Subject = require('./Subject');

const Mark = sequelize.define('Mark', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  student_id: {type: DataTypes.INTEGER, allowNull: false},
  subject_id: {type: DataTypes.INTEGER, allowNull: false},
  teacher_id: {type: DataTypes.INTEGER, allowNull: false},
  exam_type:  {
    type: DataTypes.ENUM('unit_test', 'mid_term', 'final', 'assignment', 'quiz'),
    allowNull: false,
  },
  marks:      {type: DataTypes.DECIMAL(5, 2), allowNull: false},
  max_marks:  {type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100},
  remarks:    {type: DataTypes.TEXT, allowNull: true},
  exam_date:  {type: DataTypes.DATEONLY, allowNull: true},
}, {tableName: 'marks'});

Mark.belongsTo(Student, {foreignKey: 'student_id', as: 'student'});
Mark.belongsTo(Subject, {foreignKey: 'subject_id', as: 'subject'});
Mark.belongsTo(User,    {foreignKey: 'teacher_id', as: 'teacher'});

module.exports = Mark;
