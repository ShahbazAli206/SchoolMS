const {DataTypes} = require('sequelize');
const {sequelize}  = require('../config/database');
const User         = require('./User');
const Student      = require('./Student');

const Complaint = sequelize.define('Complaint', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},

  // submitter (parent for parent_to_school, teacher for teacher_to_parent)
  submitter_id: {type: DataTypes.INTEGER, allowNull: false},

  // back-compat: parent_id used by old rows; mirrors submitter_id when parent submits
  parent_id:   {type: DataTypes.INTEGER, allowNull: true},

  // student the complaint is about (optional)
  student_id:  {type: DataTypes.INTEGER, allowNull: true},

  // type of complaint
  complaint_type: {
    type: DataTypes.ENUM('parent_to_school', 'teacher_to_parent'),
    allowNull: false,
    defaultValue: 'parent_to_school',
  },

  // tagging — who the complaint is addressed to
  tagged_role: {
    type: DataTypes.ENUM('admin', 'principal', 'staff', 'teacher', 'parent'),
    allowNull: true,
  },
  tagged_user_id: {type: DataTypes.INTEGER, allowNull: true},

  // for teacher_to_parent: the parent being notified
  target_parent_id: {type: DataTypes.INTEGER, allowNull: true},

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
    {fields: ['submitter_id']},
    {fields: ['parent_id']},
    {fields: ['student_id']},
    {fields: ['status']},
    {fields: ['complaint_type']},
    {fields: ['tagged_role']},
    {fields: ['tagged_user_id']},
    {fields: ['target_parent_id']},
  ],
});

Complaint.belongsTo(User,    {foreignKey: 'submitter_id',     as: 'submitter'});
Complaint.belongsTo(User,    {foreignKey: 'parent_id',        as: 'parent', constraints: false});
Complaint.belongsTo(Student, {foreignKey: 'student_id',       as: 'student', constraints: false});
Complaint.belongsTo(User,    {foreignKey: 'resolved_by',      as: 'resolver', constraints: false});
Complaint.belongsTo(User,    {foreignKey: 'tagged_user_id',   as: 'taggedUser', constraints: false});
Complaint.belongsTo(User,    {foreignKey: 'target_parent_id', as: 'targetParent', constraints: false});

module.exports = Complaint;
