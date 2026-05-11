const ApiResponse  = require('../utils/ApiResponse');
const ClassTeacher = require('../models/ClassTeacher');
const Class        = require('../models/Class');
const Subject      = require('../models/Subject');
const User         = require('../models/User');
const {sequelize}  = require('../config/database');

const TEACHER_INCLUDE = {model: User, as: 'teacher', attributes: ['id', 'name', 'email', 'phone', 'profile_image']};
const SUBJECT_INCLUDE = {model: Subject, as: 'subject', required: false};
const CLASS_INCLUDE   = {model: Class, as: 'class', required: false};

// ─── Admin: list all classes (for picker UIs) ──────────────────────────────

exports.listClasses = async (req, res) => {
  try {
    const rows = await Class.findAll({order: [['name', 'ASC']]});
    return ApiResponse.success(res, rows);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: list teacher assignments for a class ───────────────────────────

exports.getClassTeachers = async (req, res) => {
  try {
    const class_id = Number(req.params.classId);
    const rows = await ClassTeacher.findAll({
      where: {class_id},
      include: [TEACHER_INCLUDE, SUBJECT_INCLUDE],
      order: [['role', 'ASC']],
    });
    return ApiResponse.success(res, rows);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: list classes a teacher is assigned to ──────────────────────────

exports.getTeacherClasses = async (req, res) => {
  try {
    const teacher_id = Number(req.params.teacherId);
    const rows = await ClassTeacher.findAll({
      where: {teacher_id, is_active: true},
      include: [CLASS_INCLUDE, SUBJECT_INCLUDE],
      order: [['created_at', 'DESC']],
    });
    return ApiResponse.success(res, rows);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: assign teacher(s) to a class ───────────────────────────────────
// body: { assignments: [{teacher_id, role, subject_id?}, ...] }
//       OR { teacher_id, role, subject_id? } for a single assignment.
//       role: 'class_teacher' | 'subject_teacher'

exports.assignTeachers = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const class_id = Number(req.params.classId);
    const cls = await Class.findByPk(class_id);
    if (!cls) {
      await t.rollback();
      return ApiResponse.notFound(res, 'Class not found');
    }

    let assignments = req.body.assignments;
    if (!Array.isArray(assignments)) {
      const {teacher_id, role, subject_id} = req.body;
      if (!teacher_id) {
        await t.rollback();
        return ApiResponse.error(res, 'teacher_id is required', 400);
      }
      assignments = [{teacher_id, role: role || 'subject_teacher', subject_id: subject_id || null}];
    }

    const created = [];
    for (const a of assignments) {
      if (!a.teacher_id) continue;
      const role = a.role === 'class_teacher' ? 'class_teacher' : 'subject_teacher';
      const subject_id = role === 'class_teacher' ? null : (a.subject_id || null);

      // For class_teacher: ensure only one active class teacher per class
      if (role === 'class_teacher') {
        await ClassTeacher.update(
          {is_active: false},
          {where: {class_id, role: 'class_teacher', is_active: true}, transaction: t},
        );
        await cls.update({teacher_id: a.teacher_id}, {transaction: t});
      }

      const [row] = await ClassTeacher.findOrCreate({
        where: {class_id, teacher_id: a.teacher_id, subject_id, role},
        defaults: {is_active: true},
        transaction: t,
      });
      if (!row.is_active) {
        await row.update({is_active: true}, {transaction: t});
      }
      created.push(row);
    }

    await t.commit();
    const fresh = await ClassTeacher.findAll({
      where: {class_id},
      include: [TEACHER_INCLUDE, SUBJECT_INCLUDE],
    });
    return ApiResponse.created(res, fresh);
  } catch (e) {
    await t.rollback();
    return ApiResponse.error(res, e.message);
  }
};

// ─── Admin: remove a teacher assignment ────────────────────────────────────

exports.removeAssignment = async (req, res) => {
  try {
    const id = Number(req.params.assignmentId);
    const row = await ClassTeacher.findByPk(id);
    if (!row) return ApiResponse.notFound(res, 'Assignment not found');

    // If we're removing the class teacher, unset Class.teacher_id too
    if (row.role === 'class_teacher') {
      await Class.update({teacher_id: null}, {where: {id: row.class_id, teacher_id: row.teacher_id}});
    }
    await row.destroy();
    return ApiResponse.success(res, {message: 'Assignment removed'});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
