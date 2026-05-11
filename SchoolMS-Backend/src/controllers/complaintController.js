const {Op}        = require('sequelize');
const ApiResponse  = require('../utils/ApiResponse');
const Complaint    = require('../models/Complaint');
const ClassTeacher = require('../models/ClassTeacher');
const User         = require('../models/User');
const Student      = require('../models/Student');
const Parent       = require('../models/Parent');
const {notifyUser} = require('../utils/notifyHelper');

const SUBMITTER_INCLUDE   = {model: User, as: 'submitter',    attributes: ['id', 'name', 'role', 'email', 'phone']};
const PARENT_INCLUDE      = {model: User, as: 'parent',       attributes: ['id', 'name', 'email', 'phone'], required: false};
const TARGET_PARENT_INC   = {model: User, as: 'targetParent', attributes: ['id', 'name', 'email', 'phone'], required: false};
const TAGGED_USER_INCLUDE = {model: User, as: 'taggedUser',   attributes: ['id', 'name', 'role'], required: false};
const STUDENT_INCLUDE     = {
  model: Student, as: 'student', required: false,
  include: [{model: User, as: 'user', attributes: ['id', 'name']}],
};
const RESOLVER_INCLUDE = {model: User, as: 'resolver', attributes: ['id', 'name'], required: false};
const FULL_INCLUDE = [SUBMITTER_INCLUDE, PARENT_INCLUDE, TARGET_PARENT_INC, TAGGED_USER_INCLUDE, STUDENT_INCLUDE, RESOLVER_INCLUDE];

const VALID_TAGS = ['admin', 'principal', 'staff', 'teacher', 'parent'];
const VALID_STATUS = ['pending', 'in_review', 'resolved', 'rejected'];

const fanOutNotify = (recipientIds, opts) => {
  recipientIds.forEach(rid => {
    notifyUser({recipientId: rid, ...opts});
  });
};

// ─── Parent: submit complaint (with optional tagging) ──────────────────────

exports.submitComplaint = async (req, res) => {
  try {
    const parentUserId = req.user.id;
    const {title, description, student_id, tagged_role, tagged_user_id} = req.body;
    const image_url = req.file ? req.file.path : null;

    if (!title || !description) {
      return ApiResponse.error(res, 'title and description are required', 400);
    }
    if (tagged_role && !VALID_TAGS.includes(tagged_role)) {
      return ApiResponse.error(res, `tagged_role must be one of: ${VALID_TAGS.join(', ')}`, 400);
    }

    const complaint = await Complaint.create({
      submitter_id:   parentUserId,
      parent_id:      parentUserId,
      student_id:     student_id || null,
      complaint_type: 'parent_to_school',
      tagged_role:    tagged_role || null,
      tagged_user_id: tagged_user_id || null,
      title:          title.trim(),
      description:    description.trim(),
      image_url,
      status:         'pending',
    });

    // Notify recipients based on tag
    const notifPayload = {
      senderId: parentUserId,
      title:    'New Complaint',
      body:     title.trim(),
      type:     'general',
      data:     {complaintId: String(complaint.id)},
    };

    if (tagged_user_id) {
      fanOutNotify([tagged_user_id], notifPayload);
    } else if (tagged_role && tagged_role !== 'parent') {
      const recipients = await User.findAll({
        where: {role: tagged_role, is_active: true},
        attributes: ['id'],
      });
      fanOutNotify(recipients.map(r => r.id), notifPayload);
    } else {
      // default: notify all admins
      const admins = await User.findAll({where: {role: 'admin', is_active: true}, attributes: ['id']});
      fanOutNotify(admins.map(r => r.id), notifPayload);
    }

    return ApiResponse.created(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Teacher: submit complaint about a student to their parent ─────────────

exports.teacherSubmitComplaint = async (req, res) => {
  try {
    const teacherUserId = req.user.id;
    const {title, description, student_id} = req.body;
    const image_url = req.file ? req.file.path : null;

    if (!title || !description || !student_id) {
      return ApiResponse.error(res, 'title, description and student_id are required', 400);
    }

    const student = await Student.findByPk(student_id, {
      include: [{model: Parent, as: 'parent', required: false}],
    });
    if (!student) return ApiResponse.notFound(res, 'Student not found');

    // Resolve parent user_id (Student.parent_id → Parent → user_id)
    let parentUserId = null;
    if (student.parent && student.parent.user_id) {
      parentUserId = student.parent.user_id;
    }

    const complaint = await Complaint.create({
      submitter_id:     teacherUserId,
      parent_id:        null,
      student_id:       student.id,
      complaint_type:   'teacher_to_parent',
      tagged_role:      'parent',
      tagged_user_id:   parentUserId,
      target_parent_id: parentUserId,
      title:            title.trim(),
      description:      description.trim(),
      image_url,
      status:           'pending',
    });

    if (parentUserId) {
      fanOutNotify([parentUserId], {
        senderId: teacherUserId,
        title:    'Note from teacher',
        body:     title.trim(),
        type:     'general',
        data:     {complaintId: String(complaint.id)},
      });
    }

    return ApiResponse.created(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Build a where-clause that filters complaints by viewer role ───────────
//
// Visibility rules:
//   admin                    → all complaints
//   principal                → all complaints
//   staff                    → complaints tagged_role='staff' OR tagged_user_id=me OR untagged parent_to_school
//   teacher                  → tagged_user_id=me, OR (tagged_role='teacher' AND I'm the student's class/subject teacher),
//                              OR my own teacher_to_parent submissions.
//                              NEVER tagged_role in (staff, principal, admin).
//   parent (received inbox)  → complaints where target_parent_id=me OR tagged_user_id=me (teacher_to_parent)
//   parent (own list)        → submitter_id=me

async function buildVisibilityWhere(user) {
  const role = user.role;
  const uid  = user.id;

  if (role === 'admin' || role === 'principal') return {};

  if (role === 'staff') {
    return {
      [Op.or]: [
        {tagged_role: 'staff'},
        {tagged_user_id: uid},
        {[Op.and]: [{complaint_type: 'parent_to_school'}, {tagged_role: null}]},
      ],
    };
  }

  if (role === 'teacher') {
    // Find class_ids and student_ids the teacher is responsible for
    const assignments = await ClassTeacher.findAll({
      where: {teacher_id: uid, is_active: true},
      attributes: ['class_id'],
    });
    const classIds = [...new Set(assignments.map(a => a.class_id))];

    let studentIds = [];
    if (classIds.length) {
      const students = await Student.findAll({
        where: {class_id: {[Op.in]: classIds}},
        attributes: ['id'],
      });
      studentIds = students.map(s => s.id);
    }

    const conds = [
      {tagged_user_id: uid},
      {submitter_id: uid},
    ];
    if (studentIds.length) {
      conds.push({
        [Op.and]: [
          {tagged_role: 'teacher'},
          {student_id: {[Op.in]: studentIds}},
        ],
      });
    } else {
      // teacher with no class still shouldn't see arbitrary teacher-tagged complaints
    }

    return {
      [Op.and]: [
        {[Op.or]: conds},
        // never expose admin/principal/staff-tagged complaints
        {tagged_role: {[Op.notIn]: ['admin', 'principal', 'staff']}},
      ],
    };
  }

  if (role === 'parent') {
    return {
      [Op.or]: [
        {target_parent_id: uid},
        {[Op.and]: [{tagged_role: 'parent'}, {tagged_user_id: uid}]},
      ],
    };
  }

  // unknown role: see nothing
  return {[Op.and]: [{id: -1}]};
}

// ─── Generic role-aware list ───────────────────────────────────────────────

async function listVisible(req, res, extra = {}) {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(100, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const visibility = await buildVisibilityWhere(req.user);
    const where = {...visibility, ...extra};
    if (status) where.status = status;

    const {count, rows} = await Complaint.findAndCountAll({
      where,
      include: FULL_INCLUDE,
      order:   [['created_at', 'DESC']],
      limit,
      offset,
    });
    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
}

exports.adminGetAll      = (req, res) => listVisible(req, res);
exports.staffGetAll      = (req, res) => listVisible(req, res);
exports.principalGetAll  = (req, res) => listVisible(req, res);
exports.teacherGetInbox  = (req, res) => listVisible(req, res);

// ─── Parent: own submissions ───────────────────────────────────────────────

exports.getMyComplaints = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const {count, rows} = await Complaint.findAndCountAll({
      where:   {submitter_id: req.user.id},
      include: FULL_INCLUDE,
      order:   [['created_at', 'DESC']],
      limit,
      offset,
    });
    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: received complaints (from teachers) ───────────────────────────

exports.getReceivedComplaints = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page)  || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const {count, rows} = await Complaint.findAndCountAll({
      where: {
        complaint_type: 'teacher_to_parent',
        [Op.or]: [{target_parent_id: req.user.id}, {tagged_user_id: req.user.id}],
      },
      include: FULL_INCLUDE,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Get one (visibility-filtered) ─────────────────────────────────────────

exports.getOneVisible = async (req, res) => {
  try {
    const visibility = await buildVisibilityWhere(req.user);
    const complaint = await Complaint.findOne({
      where: {id: req.params.id, ...visibility},
      include: FULL_INCLUDE,
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
    return ApiResponse.success(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: get own complaint ─────────────────────────────────────────────

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      where:   {id: req.params.id, submitter_id: req.user.id},
      include: FULL_INCLUDE,
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
    return ApiResponse.success(res, complaint);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Parent: delete (pending only, own) ────────────────────────────────────

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      where: {id: req.params.id, submitter_id: req.user.id},
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

// ─── Reply / status (any visible viewer with reply privilege) ──────────────

exports.replyOrUpdateStatus = async (req, res) => {
  try {
    const {status, admin_reply} = req.body;
    if (status && !VALID_STATUS.includes(status)) {
      return ApiResponse.error(res, `status must be one of: ${VALID_STATUS.join(', ')}`, 400);
    }

    const visibility = await buildVisibilityWhere(req.user);
    const complaint = await Complaint.findOne({
      where: {id: req.params.id, ...visibility},
    });
    if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');

    const role = req.user.role;
    // teachers can only reply to teacher-targeted ones, parents cannot resolve
    if (role === 'parent') return ApiResponse.forbidden(res, 'Parents cannot update complaint status');

    const updates = {};
    if (status)      updates.status      = status;
    if (admin_reply !== undefined) updates.admin_reply = admin_reply;
    if (status === 'resolved' || status === 'rejected') {
      updates.resolved_by = req.user.id;
      updates.resolved_at = new Date();
    }
    await complaint.update(updates);

    // notify the submitter
    if (status) {
      const labels = {
        in_review: 'is under review',
        resolved:  'has been resolved',
        rejected:  'has been rejected',
        pending:   'status updated',
      };
      notifyUser({
        recipientId: complaint.submitter_id,
        senderId:    req.user.id,
        title:       'Complaint Update',
        body:        `Your complaint "${complaint.title}" ${labels[status] || 'was updated'}.`,
        type:        'general',
        data:        {complaintId: String(complaint.id)},
      });
    }

    const updated = await Complaint.findByPk(complaint.id, {include: FULL_INCLUDE});
    return ApiResponse.success(res, updated);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// alias kept for back-compat
exports.adminUpdateComplaint = exports.replyOrUpdateStatus;
exports.adminGetOne          = exports.getOneVisible;

// ─── Stats (visibility-filtered) ───────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const visibility = await buildVisibilityWhere(req.user);
    const [pending, in_review, resolved, rejected] = await Promise.all([
      Complaint.count({where: {...visibility, status: 'pending'}}),
      Complaint.count({where: {...visibility, status: 'in_review'}}),
      Complaint.count({where: {...visibility, status: 'resolved'}}),
      Complaint.count({where: {...visibility, status: 'rejected'}}),
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

// alias kept for back-compat
exports.adminGetStats = exports.getStats;
