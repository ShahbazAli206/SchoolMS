const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Teacher = sequelize.define('Teacher', {
  id:             {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  user_id:        {type: DataTypes.INTEGER, allowNull: false, unique: true},
  employee_id:    {type: DataTypes.STRING(30), allowNull: true, unique: true},
  qualification:  {type: DataTypes.STRING(200), allowNull: true},
  specialization: {type: DataTypes.STRING(200), allowNull: true},
  joining_date:   {type: DataTypes.DATEONLY, allowNull: true},
}, {tableName: 'teachers'});

Teacher.belongsTo(User, {foreignKey: 'user_id', as: 'user'});
User.hasOne(Teacher, {foreignKey: 'user_id', as: 'teacherProfile'});

module.exports = Teacher;
