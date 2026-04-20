const {Op}           = require('sequelize');
const ApiResponse    = require('../utils/ApiResponse');
const Notification   = require('../models/Notification');
const User           = require('../models/User');
const Student        = require('../models/Student');
const Class          = require('../models/Class');
const {notifyUser, notifyMany} = require('../utils/notifyHelper');

// ── GET /notifications/my  ─────────────────────────────────────────────────
// Paginated list of notifications for the authenticated user.
exports.getMyNotifications = async (req, res) => {
  try {
    const {page = 1, limit = 20, type, unread_only} = req.query;
    const where = {recipient_id: req.user.id};
    if (type)                    where.type    = type;
    if (unread_only === 'true')  where.is_read = false;

    const {count, rows} = await Notification.findAndCountAll({
      where,
      include: [{model: User, as: 'sender', attributes: ['id', 'name'], required: false}],
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── GET /notifications/unread-count  ──────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {recipient_id: req.user.id, is_read: false},
    });
    return ApiResponse.success(res, {count});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── PATCH /notifications/:id/read  ────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOne({
      where: {id: req.params.id, recipient_id: req.user.id},
    });
    if (!n) return ApiResponse.notFound(res, 'Notification not found');
    n.is_read = true;
    n.read_at = new Date();
    await n.save();
    return ApiResponse.success(res, {notification: n});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── PATCH /notifications/mark-all-read  ───────────────────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      {is_read: true, read_at: new Date()},
      {where: {recipient_id: req.user.id, is_read: false}}
    );
    return ApiResponse.success(res, {}, 'All notifications marked as read');
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── DELETE /notifications/:id  ────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const n = await Notification.findOne({
      where: {id: req.params.id, recipient_id: req.user.id},
    });
    if (!n) return ApiResponse.notFound(res, 'Notification not found');
    await n.destroy();
    return ApiResponse.success(res, {}, 'Notification deleted');
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── POST /notifications/send  (admin only) ────────────────────────────────
// Admin can send a manual notification to: a user, a class, or all users.
exports.adminSend = async (req, res) => {
  try {
    const {title, body, type = 'announcement', recipient_user_id, class_id, role, data = {}} = req.body;

    if (!title || !body) return ApiResponse.error(res, 'title and body are required', 422);

    // Target: single user
    if (recipient_user_id) {
      await notifyUser({recipientId: recipient_user_id, senderId: req.user.id, title, body, type, data});
      return ApiResponse.success(res, {sent: 1}, 'Notification sent');
    }

    // Target: whole class (notify students + their parents)
    if (class_id) {
      const students = await Student.findAll({
        where: {class_id},
        attributes: ['user_id', 'parent_id'],
      });
      const userIds = students.map(s => s.user_id);
      const parentIds = students.map(s => s.parent_id).filter(Boolean);
      const allIds = [...new Set([...userIds, ...parentIds])];
      await notifyMany({recipientIds: allIds, senderId: req.user.id, title, body, type, data});
      return ApiResponse.success(res, {sent: allIds.length}, 'Notification sent to class');
    }

    // Target: by role
    if (role) {
      const users = await User.findAll({where: {role, is_active: true}, attributes: ['id']});
      const ids = users.map(u => u.id);
      await notifyMany({recipientIds: ids, senderId: req.user.id, title, body, type, data});
      return ApiResponse.success(res, {sent: ids.length}, `Notification sent to all ${role}s`);
    }

    // Target: all active users
    const users = await User.findAll({where: {is_active: true}, attributes: ['id']});
    const ids = users.map(u => u.id);
    await notifyMany({recipientIds: ids, senderId: req.user.id, title, body, type, data});
    return ApiResponse.success(res, {sent: ids.length}, 'Notification sent to all users');
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ── GET /notifications/admin/all  (admin only) ────────────────────────────
// Admin views all notifications in the system (for audit).
exports.adminGetAll = async (req, res) => {
  try {
    const {page = 1, limit = 30, type, recipient_id} = req.query;
    const where = {};
    if (type)         where.type         = type;
    if (recipient_id) where.recipient_id = recipient_id;

    const {count, rows} = await Notification.findAndCountAll({
      where,
      include: [
        {model: User, as: 'recipient', attributes: ['id', 'name', 'role']},
        {model: User, as: 'sender',    attributes: ['id', 'name'], required: false},
      ],
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
