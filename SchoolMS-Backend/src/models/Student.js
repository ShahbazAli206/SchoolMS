const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Student = sequelize.define('Student', {
  id:           {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  user_id:      {type: DataTypes.INTEGER, allowNull: false, unique: true},
  class_id:     {type: DataTypes.INTEGER, allowNull: true},
  roll_number:  {type: DataTypes.STRING(20), allowNull: true, unique: true},
  admission_no: {type: DataTypes.STRING(30), allowNull: true, unique: true},
  date_of_birth:{type: DataTypes.DATEONLY, allowNull: true},
  address:      {type: DataTypes.TEXT, allowNull: true},
  parent_id:    {type: DataTypes.INTEGER, allowNull: true},  // FK to parents.id
}, {tableName: 'students'});

const Parent = require('./Parent');
const Class  = require('./Class');

Student.belongsTo(User,   {foreignKey: 'user_id',  as: 'user'});
Student.belongsTo(Parent, {foreignKey: 'parent_id', as: 'parent', constraints: false});
Student.belongsTo(Class,  {foreignKey: 'class_id',  as: 'class',  constraints: false});
User.hasOne(Student,   {foreignKey: 'user_id',   as: 'studentProfile'});
Parent.hasMany(Student, {foreignKey: 'parent_id', as: 'children'});

module.exports = Student;
