const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./User');

const Event = sequelize.define('Event', {
  id:          {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title:       {type: DataTypes.STRING(200), allowNull: false},
  description: {type: DataTypes.TEXT, allowNull: true},
  event_type: {
    type: DataTypes.ENUM('holiday', 'exam', 'meeting', 'event', 'reminder', 'other'),
    allowNull: false,
    defaultValue: 'event',
  },
  audience: {
    type: DataTypes.ENUM('all', 'students', 'teachers', 'parents', 'staff'),
    allowNull: false,
    defaultValue: 'all',
  },
  start_date:  {type: DataTypes.DATE, allowNull: false},
  end_date:    {type: DataTypes.DATE, allowNull: true},
  location:    {type: DataTypes.STRING(200), allowNull: true},
  is_active:   {type: DataTypes.BOOLEAN, defaultValue: true},
  created_by:  {type: DataTypes.INTEGER, allowNull: true},
}, {
  tableName: 'events',
  indexes: [
    {fields: ['event_type']},
    {fields: ['audience']},
    {fields: ['start_date']},
    {fields: ['is_active']},
  ],
});

Event.belongsTo(User, {foreignKey: 'created_by', as: 'creator', constraints: false});

module.exports = Event;
