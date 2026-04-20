const {DataTypes} = require('sequelize');
const {sequelize}  = require('../config/database');
const User         = require('./User');
const Conversation = require('./Conversation');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id:              {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  conversation_id: {type: DataTypes.INTEGER, allowNull: false},
  user_id:         {type: DataTypes.INTEGER, allowNull: false},
  joined_at:       {type: DataTypes.DATE, defaultValue: DataTypes.NOW},
}, {
  tableName: 'conversation_participants',
  timestamps: false,
  indexes: [
    {fields: ['user_id']},
    {unique: true, fields: ['conversation_id', 'user_id']},
  ],
});

Conversation.belongsToMany(User,         {through: ConversationParticipant, foreignKey: 'conversation_id', otherKey: 'user_id', as: 'participants'});
User.belongsToMany(Conversation,         {through: ConversationParticipant, foreignKey: 'user_id', otherKey: 'conversation_id', as: 'conversations'});
ConversationParticipant.belongsTo(User,  {foreignKey: 'user_id',         as: 'user'});
ConversationParticipant.belongsTo(Conversation, {foreignKey: 'conversation_id', as: 'conversation'});

module.exports = ConversationParticipant;
