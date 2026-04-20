const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const User        = require('./User');

const Notification = sequelize.define('Notification', {
  id:           {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  recipient_id: {type: DataTypes.INTEGER, allowNull: false},   // user who receives it
  sender_id:    {type: DataTypes.INTEGER, allowNull: true},    // user/system who sent it
  title:        {type: DataTypes.STRING(200), allowNull: false},
  body:         {type: DataTypes.TEXT, allowNull: false},
  type: {
    type: DataTypes.ENUM('assignment', 'fee', 'attendance', 'marks', 'general', 'announcement'),
    allowNull: false,
    defaultValue: 'general',
  },
  data:     {type: DataTypes.JSON, allowNull: true},    // arbitrary extra payload
  is_read:  {type: DataTypes.BOOLEAN, defaultValue: false},
  read_at:  {type: DataTypes.DATE, allowNull: true},
}, {
  tableName: 'notifications',
  indexes: [
    {fields: ['recipient_id']},
    {fields: ['recipient_id', 'is_read']},
  ],
});

Notification.belongsTo(User, {foreignKey: 'recipient_id', as: 'recipient'});
Notification.belongsTo(User, {foreignKey: 'sender_id',    as: 'sender', constraints: false});

module.exports = Notification;
