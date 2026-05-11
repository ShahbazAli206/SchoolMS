const {Op} = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const Event       = require('../models/Event');
const User        = require('../models/User');
const {notifyUser} = require('../utils/notifyHelper');

const CREATOR_INCLUDE = {model: User, as: 'creator', attributes: ['id', 'name', 'role'], required: false};

const ROLE_TO_AUDIENCE = {
  admin:     ['all'],
  principal: ['all', 'teachers', 'staff'],
  staff:     ['all', 'staff'],
  teacher:   ['all', 'teachers'],
  parent:    ['all', 'parents'],
  student:   ['all', 'students'],
};

// ─── Admin/Principal: create event ─────────────────────────────────────────

exports.createEvent = async (req, res) => {
  try {
    const {title, description, event_type, audience, start_date, end_date, location} = req.body;
    if (!title || !start_date) {
      return ApiResponse.error(res, 'title and start_date are required', 400);
    }

    const event = await Event.create({
      title:       title.trim(),
      description: description?.trim() || null,
      event_type:  event_type || 'event',
      audience:    audience || 'all',
      start_date,
      end_date:    end_date || null,
      location:    location?.trim() || null,
      created_by:  req.user.id,
    });

    // Fan-out notify the audience (fire-and-forget)
    const where = {is_active: true};
    if (event.audience === 'students') where.role = 'student';
    else if (event.audience === 'teachers') where.role = 'teacher';
    else if (event.audience === 'parents')  where.role = 'parent';
    else if (event.audience === 'staff')    where.role = 'staff';

    const recipients = await User.findAll({where, attributes: ['id']});
    recipients.forEach(r => {
      notifyUser({
        recipientId: r.id,
        senderId:    req.user.id,
        title:       `📅 ${event.title}`,
        body:        event.description || event.event_type,
        type:        'announcement',
        data:        {eventId: String(event.id)},
      });
    });

    return ApiResponse.created(res, event);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin/Principal: update event ─────────────────────────────────────────

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return ApiResponse.notFound(res, 'Event not found');

    const allowed = ['title', 'description', 'event_type', 'audience', 'start_date', 'end_date', 'location', 'is_active'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await event.update(updates);
    return ApiResponse.success(res, event);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin/Principal: delete ───────────────────────────────────────────────

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return ApiResponse.notFound(res, 'Event not found');
    await event.destroy();
    return ApiResponse.success(res, {message: 'Event deleted'});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Anyone: list events visible to my role ────────────────────────────────

exports.listEvents = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(100, Number(req.query.limit) || 30);
    const offset = (page - 1) * limit;
    const upcoming = req.query.upcoming === 'true';

    const audiences = ROLE_TO_AUDIENCE[req.user.role] || ['all'];
    const where = {
      is_active: true,
      audience:  {[Op.in]: audiences},
    };
    if (req.query.event_type) where.event_type = req.query.event_type;
    if (upcoming) where.start_date = {[Op.gte]: new Date()};

    const {count, rows} = await Event.findAndCountAll({
      where,
      include: [CREATOR_INCLUDE],
      order:   [['start_date', upcoming ? 'ASC' : 'DESC']],
      limit,
      offset,
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Get one ───────────────────────────────────────────────────────────────

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {include: [CREATOR_INCLUDE]});
    if (!event) return ApiResponse.notFound(res, 'Event not found');
    return ApiResponse.success(res, event);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
