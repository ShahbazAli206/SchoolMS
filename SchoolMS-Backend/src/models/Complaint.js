const {DataTypes} = require('sequelize');
const {sequelize}  = require('../config/database');
const User         = require('./User');
const Student      = require('./Student');

const Complaint = sequelize.define('Complaint', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  parent_id:   {type: DataTypes.INTEGER, allowNull: false},  // users.id of the parent
  student_id:  {type: DataTypes.INTEGER, allowNull: true},   // students.id (optional)
  title:       {type: DataTypes.STRING(200), allowNull: false},
  description: {type: DataTypes.TEXT, allowNull: false},
  image_url:   {type: DataTypes.STRING(500), allowNull: true},
  status: {
    type: DataTypes.ENUM('pending', 'in_review', 'resolved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  admin_reply:  {type: DataTypes.TEXT, allowNull: true},
  resolved_by:  {type: DataTypes.INTEGER, allowNull: true},
  resolved_at:  {type: DataTypes.DATE, allowNull: true},
}, {
  tableName: 'complaints',
  indexes: [
    {fields: ['parent_id']},
    {fields: ['student_id']},
    {fields: ['status']},
  ],
});

Complaint.belongsTo(User,    {foreignKey: 'parent_id',  as: 'parent'});
Complaint.belongsTo(Student, {foreignKey: 'student_id', as: 'student', constraints: false});
Complaint.belongsTo(User,    {foreignKey: 'resolved_by', as: 'resolver', constraints: false});

module.exports = Complaint;
