const {DataTypes} = require('sequelize');
const {sequelize}  = require('../config/database');
const Student      = require('./Student');
const Class        = require('./Class');

const Fee = sequelize.define('Fee', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title:       {type: DataTypes.STRING(200), allowNull: false},
  description: {type: DataTypes.TEXT, allowNull: true},
  fee_type: {
    type: DataTypes.ENUM('tuition', 'transport', 'exam', 'library', 'sports', 'other'),
    allowNull: false,
    defaultValue: 'tuition',
  },
  amount:      {type: DataTypes.DECIMAL(10, 2), allowNull: false},
  due_date:    {type: DataTypes.DATEONLY, allowNull: false},
  // Scope: assign to a whole class OR an individual student (mutually exclusive)
  class_id:    {type: DataTypes.INTEGER, allowNull: true},
  student_id:  {type: DataTypes.INTEGER, allowNull: true},
  academic_year: {type: DataTypes.STRING(10), allowNull: true},  // e.g. "2024-25"
  month:       {type: DataTypes.STRING(20), allowNull: true},    // e.g. "January"
  is_recurring:{type: DataTypes.BOOLEAN, defaultValue: false},
}, {tableName: 'fees'});

Fee.belongsTo(Class,   {foreignKey: 'class_id',   as: 'class',   constraints: false});
Fee.belongsTo(Student, {foreignKey: 'student_id', as: 'student', constraints: false});

module.exports = Fee;
