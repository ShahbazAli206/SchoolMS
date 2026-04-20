const {Op}                   = require('sequelize');
const {sequelize}             = require('../config/database');
const ApiResponse             = require('../utils/ApiResponse');
const Conversation            = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const Message                 = require('../models/Message');
const User                    = require('../models/User');
const {notifyUser}            = require('../utils/notifyHelper');

// ─── helpers ───────────────────────────────────────────────────────────────

const participantIds = async convId =>
  (await ConversationParticipant.findAll({
    where: {conversation_id: convId},
    attributes: ['user_id'],
  })).map(p => p.user_id);

const isParticipant = async (convId, userId) => {
  const p = await ConversationParticipant.findOne({
    where: {conversation_id: convId, user_id: userId},
  });
  return !!p;
};

// ─── getConversations ──────────────────────────────────────────────────────

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // IDs of conversations this user is part of
    const participations = await ConversationParticipant.findAll({
      where: {user_id: userId},
      attributes: ['conversation_id'],
    });
    const convIds = participations.map(p => p.conversation_id);

    if (!convIds.length) return ApiResponse.success(res, []);

    const conversations = await Conversation.findAll({
      where: {id: convIds},
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name', 'role', 'profile_image'],
          through: {attributes: []},
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    // Attach last message to each conversation
    const withLastMsg = await Promise.all(
      conversations.map(async conv => {
        const last = await Message.findOne({
          where: {conversation_id: conv.id},
          order: [['createdAt', 'DESC']],
          include: [{model: User, as: 'sender', attributes: ['id', 'name']}],
        });
        const unreadCount = last
          ? await Message.count({
              where: {
                conversation_id: conv.id,
                sender_id: {[Op.ne]: userId},
                // unread = read_by does not contain this userId
              },
            })
          : 0;
        return {...conv.toJSON(), lastMessage: last, unreadCount};
      })
    );

    return ApiResponse.success(res, withLastMsg);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── createConversation ────────────────────────────────────────────────────

exports.createConversation = async (req, res) => {
  try {
    const {type = 'direct', name, participantIds: pIds} = req.body;
    const userId = req.user.id;

    if (!pIds?.length) return ApiResponse.error(res, 'participantIds is required');

    const allIds = [...new Set([userId, ...pIds])];

    // For direct: check if a direct conversation already exists between the two users
    if (type === 'direct' && allIds.length === 2) {
      const otherId = allIds.find(id => id !== userId);
      const existing = await ConversationParticipant.findAll({
        where: {user_id: userId},
        include: [{
          model: Conversation,
          as: 'conversation',
          where: {type: 'direct'},
          required: true,
        }],
      });
      for (const p of existing) {
        const otherIn = await ConversationParticipant.findOne({
          where: {conversation_id: p.conversation_id, user_id: otherId},
        });
        if (otherIn) {
          const conv = await Conversation.findByPk(p.conversation_id, {
            include: [{model: User, as: 'participants', attributes: ['id', 'name', 'role', 'profile_image'], through: {attributes: []}}],
          });
          return ApiResponse.success(res, conv);
        }
      }
    }

    const conv = await sequelize.transaction(async t => {
      const c = await Conversation.create(
        {type, name: name || null, created_by: userId},
        {transaction: t}
      );
      await ConversationParticipant.bulkCreate(
        allIds.map(id => ({conversation_id: c.id, user_id: id})),
        {transaction: t}
      );
      return c;
    });

    const full = await Conversation.findByPk(conv.id, {
      include: [{model: User, as: 'participants', attributes: ['id', 'name', 'role', 'profile_image'], through: {attributes: []}}],
    });

    return ApiResponse.created(res, full);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── getMessages ───────────────────────────────────────────────────────────

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = Number(req.params.id);
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 30);
    const offset = (page - 1) * limit;

    if (!await isParticipant(convId, userId)) return ApiResponse.forbidden(res, 'Not a participant');

    const {count, rows} = await Message.findAndCountAll({
      where: {conversation_id: convId},
      include: [{model: User, as: 'sender', attributes: ['id', 'name', 'profile_image']}],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return ApiResponse.paginated(res, rows.reverse(), count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── sendMessage ───────────────────────────────────────────────────────────

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = Number(req.params.id);
    const {body, type = 'text', attachment_url} = req.body;

    // Handle image upload
    let messageType = type;
    let attachmentUrl = attachment_url;
    if (req.file) {
      messageType = 'image';
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    if (!body && !attachmentUrl) return ApiResponse.error(res, 'body, attachment_url, or image file required');
    if (!await isParticipant(convId, userId)) return ApiResponse.forbidden(res, 'Not a participant');

    const msg = await Message.create({
      conversation_id: convId,
      sender_id: userId,
      body: body || null,
      type: messageType,
      attachment_url: attachmentUrl,
      read_by: {[userId]: new Date().toISOString()},
    });

    // Touch conversation updatedAt for ordering
    await Conversation.update({updatedAt: new Date()}, {where: {id: convId}});

    const full = await Message.findByPk(msg.id, {
      include: [{model: User, as: 'sender', attributes: ['id', 'name', 'profile_image']}],
    });

    // Notify other participants (fire-and-forget)
    const others = (await participantIds(convId)).filter(id => id !== userId);
    const sender = await User.findByPk(userId, {attributes: ['name']});
    others.forEach(recipientId => {
      notifyUser({
        recipientId,
        senderId: userId,
        title: sender.name,
        body: body || (messageType === 'image' ? '📷 Image' : '📎 Attachment'),
        type: 'general',
        data: {conversationId: String(convId), messageId: String(msg.id)},
      });
    });

    return ApiResponse.created(res, full);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── markRead ──────────────────────────────────────────────────────────────

exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = Number(req.params.id);

    if (!await isParticipant(convId, userId)) return ApiResponse.forbidden(res, 'Not a participant');

    // Mark all messages in conversation as read by this user
    const messages = await Message.findAll({
      where: {conversation_id: convId, sender_id: {[Op.ne]: userId}},
    });

    const now = new Date().toISOString();
    await Promise.all(
      messages
        .filter(m => !m.read_by?.[userId])
        .map(m => m.update({read_by: {...(m.read_by || {}), [userId]: now}}))
    );

    return ApiResponse.success(res, {markedCount: messages.length});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── addParticipants (group only) ──────────────────────────────────────────

exports.addParticipants = async (req, res) => {
  try {
    const userId  = req.user.id;
    const convId  = Number(req.params.id);
    const {userIds} = req.body;

    if (!userIds?.length) return ApiResponse.error(res, 'userIds required');

    const conv = await Conversation.findByPk(convId);
    if (!conv) return ApiResponse.notFound(res, 'Conversation not found');
    if (conv.type !== 'group') return ApiResponse.error(res, 'Only group conversations support adding participants');
    if (!await isParticipant(convId, userId)) return ApiResponse.forbidden(res, 'Not a participant');

    const existing = await participantIds(convId);
    const toAdd    = userIds.filter(id => !existing.includes(id));

    if (toAdd.length) {
      await ConversationParticipant.bulkCreate(
        toAdd.map(id => ({conversation_id: convId, user_id: id}))
      );
    }

    return ApiResponse.success(res, {added: toAdd.length});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── leaveConversation ─────────────────────────────────────────────────────

exports.leaveConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = Number(req.params.id);

    const conv = await Conversation.findByPk(convId);
    if (!conv) return ApiResponse.notFound(res, 'Conversation not found');
    if (conv.type !== 'group') return ApiResponse.error(res, 'Cannot leave a direct conversation');

    await ConversationParticipant.destroy({where: {conversation_id: convId, user_id: userId}});
    return ApiResponse.success(res, {message: 'Left conversation'});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
