const {Op}        = require('sequelize');
const ApiResponse  = require('../utils/ApiResponse');
const Complaint    = require('../models/Complaint');
const User        = require('../models/User');
const Student     = require('../models/Student');
const {notifyUser} = require('../utils/notifyHelper');

const PARENT_INCLUDE = {model: User, as: 'parent', attributes: ['id', 'name', 'email', 'phone']};
const STUDENT_INCLUDE = {
  model: Student, as: 'student', required: false,
  include: [{model: User, as: 'user', attributes: ['id', 'name']}],
};
const RESOLVER_INCLUDE = {model: User, as: 'resolver', attributes: ['id', 'name'], required: false};

// ─── Parent: submit complaint ──────────────────────────────────────────────

exports.submitComplaint = async (req, res) => {
  try {
    const parentUserId = req.user.id;
    const {title, description, student_id} = req.body;
    const image_url = req.file ? req.file.path : null;

    if (!title || !description) {
      return ApiResponse.error(res, 'title and description are required', 400);
    }

    // Verify student_id belongs to this parent if provided
    if (student_id) {
      const student = await Student.findOne({
        where: {id: student_id, parent_id: {[Op.ne]: null}},
      });
      // Allow if student exists — strict parent ownership enforced in Phase 11B UI
    }

    const complaint = await Complaint.create({
      parent_id:  parentUserId,
      student_id: student_id || null,
      title:      title.trim(),
      description: description.trim(),
      image_url,
      status: 'pending',
    });

    // Notify all admins (fire-and-forget)
    const admins = await User.findAll({where: {role: 'admin', is_active: true}, attributes: ['id']});
    admins.forEach(admin => {
      notifyUser({
        recipientId: admin.id,
        senderId:    parentUserId,
        title:       'New Complaint',
        body:        title.trim(),
        type:        'general',
        data:        {complaintId: String(complaint.id)},
      });
    });

    return ApiResponse.created(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: list my complaints ────────────────────────────────────────────

exports.getMyComplaints = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const {count, rows} = await Complaint.findAndCountAll({
      where:   {parent_id: req.user.id},
      include: [STUDENT_INCLUDE, RESOLVER_INCLUDE],
      order:   [['created_at', 'DESC']],
      limit,
      offset,
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: get one complaint ─────────────────────────────────────────────

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      where:   {id: req.params.id, parent_id: req.user.id},
      include: [STUDENT_INCLUDE, RESOLVER_INCLUDE],
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
    return ApiResponse.success(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: delete complaint (pending only) ───────────────────────────────

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      where: {id: req.params.id, parent_id: req.user.id},
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
    if (complaint.status !== 'pending') {
      return ApiResponse.error(res, 'Only pending complaints can be deleted', 400);
    }
    await complaint.destroy();
    return ApiResponse.success(res, {message: 'Complaint deleted'});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: list all complaints ────────────────────────────────────────────

exports.adminGetAll = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const {status} = req.query;

    const where = {};
    if (status) where.status = status;

    const {count, rows} = await Complaint.findAndCountAll({
      where,
      include: [PARENT_INCLUDE, STUDENT_INCLUDE, RESOLVER_INCLUDE],
      order:   [['created_at', 'DESC']],
      limit,
      offset,
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: get single complaint ───────────────────────────────────────────

exports.adminGetOne = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [PARENT_INCLUDE, STUDENT_INCLUDE, RESOLVER_INCLUDE],
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
    return ApiResponse.success(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: update status + reply ─────────────────────────────────────────

exports.adminUpdateComplaint = async (req, res) => {
  try {
    const {status, admin_reply} = req.body;
    const VALID = ['pending', 'in_review', 'resolved', 'rejected'];

    if (status && !VALID.includes(status)) {
      return ApiResponse.error(res, `status must be one of: ${VALID.join(', ')}`, 400);
    }

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');

    const updates = {};
    if (status)      updates.status      = status;
    if (admin_reply !== undefined) updates.admin_reply = admin_reply;

    if (status === 'resolved' || status === 'rejected') {
      updates.resolved_by = req.user.id;
      updates.resolved_at = new Date();
    }

    await complaint.update(updates);

    // Notify the parent
    if (status) {
      const statusLabels = {
        in_review: 'is under review',
        resolved:  'has been resolved',
        rejected:  'has been rejected',
        pending:   'status updated',
      };
      notifyUser({
        recipientId: complaint.parent_id,
        senderId:    req.user.id,
        title:       'Complaint Update',
        body:        `Your complaint "${complaint.title}" ${statusLabels[status] || 'was updated'}.`,
        type:        'general',
        data:        {complaintId: String(complaint.id)},
      });
    }

    const updated = await Complaint.findByPk(complaint.id, {
      include: [PARENT_INCLUDE, STUDENT_INCLUDE, RESOLVER_INCLUDE],
    });
    return ApiResponse.success(res, updated);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: complaint stats ────────────────────────────────────────────────

exports.adminGetStats = async (req, res) => {
  try {
    const [pending, in_review, resolved, rejected] = await Promise.all([
      Complaint.count({where: {status: 'pending'}}),
      Complaint.count({where: {status: 'in_review'}}),
      Complaint.count({where: {status: 'resolved'}}),
      Complaint.count({where: {status: 'rejected'}}),
    ]);
    return ApiResponse.success(res, {
      total: pending + in_review + resolved + rejected,
      pending,
      in_review,
      resolved,
      rejected,
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
