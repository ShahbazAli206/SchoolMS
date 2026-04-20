const {DataTypes} = require('sequelize');
const {sequelize}  = require('../config/database');
const User         = require('./User');
const Conversation = require('./Conversation');

const Message = sequelize.define('Message', {
  id:              {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  conversation_id: {type: DataTypes.INTEGER, allowNull: false},
  sender_id:       {type: DataTypes.INTEGER, allowNull: false},
  body:            {type: DataTypes.TEXT, allowNull: true},
  type:            {type: DataTypes.ENUM('text', 'image', 'file'), allowNull: false, defaultValue: 'text'},
  attachment_url:  {type: DataTypes.STRING(500), allowNull: true},
  // JSON map of { userId: ISODateString } for per-user read receipts
  read_by:         {type: DataTypes.JSON, allowNull: true, defaultValue: {}},
}, {
  tableName: 'messages',
  indexes: [
    {fields: ['conversation_id']},
    {fields: ['conversation_id', 'created_at']},
  ],
});

Message.belongsTo(Conversation, {foreignKey: 'conversation_id', as: 'conversation'});
Message.belongsTo(User,         {foreignKey: 'sender_id',       as: 'sender'});
Conversation.hasMany(Message,   {foreignKey: 'conversation_id', as: 'messages'});

module.exports = Message;
