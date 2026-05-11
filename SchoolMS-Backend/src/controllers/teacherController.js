const {Op} = require('sequelize');
const path = require('path');
const Assignment = require('../models/Assignment');
const Material   = require('../models/Material');
const Mark       = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const Class      = require('../models/Class');
const Subject    = require('../models/Subject');
const User       = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const logger      = require('../config/logger');
const Parent      = require('../models/Parent');
const {notifyMany, notifyUser} = require('../utils/notifyHelper');

// ── Helpers ───────────────────────────────────────────────────────────────
const teacherOrAdmin = (req) =>
  req.user.role === 'admin' || req.user.role === 'teacher';

// ─────────────────────────────────────────────────────────────────────────
//  ASSIGNMENTS
// ─────────────────────────────────────────────────────────────────────────
exports.getAssignments = async (req, res, next) => {
  try {
    const {page = 1, limit = 20, class_id, subject_id, student_id} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'teacher') where.teacher_id = req.user.id;
    if (class_id)   where.class_id   = class_id;
    if (subject_id) where.subject_id = subject_id;
    if (student_id) where.student_id = student_id;

    const {count, rows} = await Assignment.findAndCountAll({
      where,
      include: [
        {model: User,    as: 'teacher', attributes: ['id', 'name']},
        {model: Class,   as: 'class',   attributes: ['id', 'name', 'section']},
        {model: Subject, as: 'subject', attributes: ['id', 'name', 'code']},
        {model: Student, as: 'student', include: [{model: User, as: 'user', attributes: ['id', 'name']}]},
      ],
      limit: parseInt(limit),
      offset,
      order: [['due_date', 'ASC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const {title, description, class_id, student_id, subject_id, due_date, max_marks} = req.body;
    const file_url = req.file ? req.file.path : null;

    const assignment = await Assignment.create({
      title,
      description,
      file_url,
      teacher_id: req.user.id,
      class_id:   class_id   || null,
      student_id: student_id || null,
      subject_id: subject_id || null,
      due_date,
      max_marks:  max_marks || 100,
    });

    logger.info(`Assignment '${title}' created by teacher ${req.user.id}`);

    // Notify recipients (fire-and-forget — don't block the response)
    const notifTitle = `New Assignment: ${title}`;
    const notifBody  = due_date ? `Due: ${due_date}` : 'Check your assignments';
    const notifData  = {assignment_id: String(assignment.id), type: 'assignment'};
    if (class_id) {
      // Notify all students in the class
      const students = await Student.findAll({where: {class_id}, attributes: ['user_id']});
      const userIds  = students.map(s => s.user_id);
      if (userIds.length) notifyMany({recipientIds: userIds, senderId: req.user.id, title: notifTitle, body: notifBody, type: 'assignment', data: notifData});
    } else if (student_id) {
      // Notify the individual student
      const s = await Student.findByPk(student_id, {attributes: ['user_id']});
      if (s) notifyUser({recipientId: s.user_id, senderId: req.user.id, title: notifTitle, body: notifBody, type: 'assignment', data: notifData});
    }

    return ApiResponse.created(res, {assignment}, 'Assignment created successfully');
  } catch (err) { next(err); }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return ApiResponse.notFound(res, 'Assignment not found');
    if (req.user.role === 'teacher' && assignment.teacher_id !== req.user.id)
      return ApiResponse.forbidden(res, 'You can only update your own assignments');

    const {title, description, due_date, max_marks, class_id, student_id, subject_id} = req.body;
    const file_url = req.file ? req.file.path : assignment.file_url;

    await assignment.update({title, description, file_url, due_date, max_marks, class_id, student_id, subject_id});
    return ApiResponse.success(res, {assignment}, 'Assignment updated');
  } catch (err) { next(err); }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return ApiResponse.notFound(res, 'Assignment not found');
    if (req.user.role === 'teacher' && assignment.teacher_id !== req.user.id)
      return ApiResponse.forbidden(res, 'You can only delete your own assignments');

    await assignment.destroy();
    return ApiResponse.success(res, {}, 'Assignment deleted');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────
//  MATERIALS
// ─────────────────────────────────────────────────────────────────────────
exports.getMaterials = async (req, res, next) => {
  try {
    const {page = 1, limit = 20, class_id, subject_id, file_type} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'teacher') where.teacher_id = req.user.id;
    if (class_id)   where.class_id  = class_id;
    if (subject_id) where.subject_id = subject_id;
    if (file_type)  where.file_type  = file_type;

    const {count, rows} = await Material.findAndCountAll({
      where,
      include: [
        {model: User,    as: 'teacher', attributes: ['id', 'name']},
        {model: Class,   as: 'class',   attributes: ['id', 'name', 'section']},
        {model: Subject, as: 'subject', attributes: ['id', 'name']},
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

exports.uploadMaterial = async (req, res, next) => {
  try {
    if (!req.file) return ApiResponse.error(res, 'No file uploaded', 400);

    const {title, description, class_id, subject_id} = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase();

    const typeMap = {
      '.pdf': 'pdf',
      '.mp4': 'video', '.mpeg': 'video', '.mov': 'video',
      '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.webp': 'image',
      '.doc': 'document', '.docx': 'document', '.xls': 'document', '.xlsx': 'document',
    };
    const file_type = typeMap[ext] || 'document';

    const material = await Material.create({
      title,
      description,
      file_url:   req.file.path,
      file_name:  req.file.originalname,
      file_type,
      file_size:  req.file.size,
      teacher_id: req.user.id,
      class_id:   class_id   || null,
      subject_id: subject_id || null,
    });

    logger.info(`Material '${title}' uploaded by teacher ${req.user.id}`);
    return ApiResponse.created(res, {material}, 'Material uploaded successfully');
  } catch (err) { next(err); }
};

exports.updateMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return ApiResponse.notFound(res, 'Material not found');
    if (req.user.role === 'teacher' && material.teacher_id !== req.user.id)
      return ApiResponse.forbidden(res, 'You can only edit your own materials');

    const {title, description} = req.body;
    await material.update({title, description});
    return ApiResponse.success(res, {material}, 'Material updated');
  } catch (err) { next(err); }
};

exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return ApiResponse.notFound(res, 'Material not found');
    if (req.user.role === 'teacher' && material.teacher_id !== req.user.id)
      return ApiResponse.forbidden(res, 'You can only delete your own materials');

    await material.destroy();
    return ApiResponse.success(res, {}, 'Material deleted');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────
//  MARKS
// ─────────────────────────────────────────────────────────────────────────
exports.getMarks = async (req, res, next) => {
  try {
    const {student_id, subject_id, class_id, exam_type, page = 1, limit = 50} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'teacher') where.teacher_id = req.user.id;
    if (student_id) where.student_id = student_id;
    if (subject_id) where.subject_id = subject_id;
    if (exam_type)  where.exam_type  = exam_type;

    const {count, rows} = await Mark.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{model: User, as: 'user', attributes: ['id', 'name']}],
          ...(class_id ? {where: {class_id}} : {}),
        },
        {model: Subject, as: 'subject', attributes: ['id', 'name', 'code']},
      ],
      limit: parseInt(limit),
      offset,
      order: [['exam_date', 'DESC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

exports.upsertMark = async (req, res, next) => {
  try {
    const {student_id, subject_id, exam_type, marks, max_marks, remarks, exam_date} = req.body;

    // Upsert: update if same student+subject+exam_type exists, else create
    const [mark, created] = await Mark.findOrCreate({
      where: {student_id, subject_id, exam_type},
      defaults: {teacher_id: req.user.id, marks, max_marks: max_marks || 100, remarks, exam_date},
    });

    if (!created) {
      await mark.update({marks, max_marks: max_marks || mark.max_marks, remarks, exam_date, teacher_id: req.user.id});
    }

    return created
      ? ApiResponse.created(res, {mark}, 'Mark recorded')
      : ApiResponse.success(res, {mark}, 'Mark updated');
  } catch (err) { next(err); }
};

exports.bulkUpsertMarks = async (req, res, next) => {
  try {
    const {marks} = req.body; // array of {student_id, subject_id, exam_type, marks, max_marks, exam_date}
    if (!Array.isArray(marks) || marks.length === 0)
      return ApiResponse.error(res, 'marks array is required', 400);

    const results = await Promise.all(
      marks.map(async (m) => {
        const [record, created] = await Mark.findOrCreate({
          where: {student_id: m.student_id, subject_id: m.subject_id, exam_type: m.exam_type},
          defaults: {...m, teacher_id: req.user.id},
        });
        if (!created) await record.update({...m, teacher_id: req.user.id});
        return record;
      }),
    );

    return ApiResponse.success(res, {marks: results, count: results.length}, 'Marks saved successfully');
  } catch (err) { next(err); }
};

exports.deleteMark = async (req, res, next) => {
  try {
    const mark = await Mark.findByPk(req.params.id);
    if (!mark) return ApiResponse.notFound(res, 'Mark not found');
    if (req.user.role === 'teacher' && mark.teacher_id !== req.user.id)
      return ApiResponse.forbidden(res, 'You can only delete your own marks');

    await mark.destroy();
    return ApiResponse.success(res, {}, 'Mark deleted');
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────
//  ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────
exports.getAttendance = async (req, res, next) => {
  try {
    const {class_id, date, student_id, month, year} = req.query;

    const where = {};
    if (req.user.role === 'teacher') where.teacher_id = req.user.id;
    if (class_id)   where.class_id   = class_id;
    if (student_id) where.student_id = student_id;
    if (date)       where.date        = date;
    if (month && year) {
      where.date = {
        [Op.between]: [
          `${year}-${String(month).padStart(2, '0')}-01`,
          `${year}-${String(month).padStart(2, '0')}-31`,
        ],
      };
    }

    const rows = await Attendance.findAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{model: User, as: 'user', attributes: ['id', 'name']}],
        },
      ],
      order: [['date', 'DESC'], ['student_id', 'ASC']],
    });

    return ApiResponse.success(res, {attendance: rows, count: rows.length});
  } catch (err) { next(err); }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const {student_id, class_id, date, status, remarks} = req.body;

    const [record, created] = await Attendance.findOrCreate({
      where: {student_id, date},
      defaults: {class_id, teacher_id: req.user.id, status: status || 'present', remarks},
    });

    if (!created) {
      await record.update({status: status || record.status, remarks, teacher_id: req.user.id});
    }

    return created
      ? ApiResponse.created(res, {attendance: record}, 'Attendance marked')
      : ApiResponse.success(res, {attendance: record}, 'Attendance updated');
  } catch (err) { next(err); }
};

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const {class_id, date, attendance} = req.body;
    // attendance: [{student_id, status, remarks}]
    if (!Array.isArray(attendance) || !date || !class_id)
      return ApiResponse.error(res, 'class_id, date, and attendance[] required', 400);

    const results = await Promise.all(
      attendance.map(async (a) => {
        const [record, created] = await Attendance.findOrCreate({
          where: {student_id: a.student_id, date},
          defaults: {class_id, teacher_id: req.user.id, status: a.status || 'present', remarks: a.remarks},
        });
        if (!created) await record.update({status: a.status || record.status, remarks: a.remarks, teacher_id: req.user.id});
        return record;
      }),
    );

    logger.info(`Bulk attendance marked for class ${class_id} on ${date} by teacher ${req.user.id}`);

    // Notify parents of absent/late students (fire-and-forget)
    const absentIds = attendance
      .filter(a => a.status === 'absent' || a.status === 'late')
      .map(a => a.student_id);
    if (absentIds.length) {
      const absentStudents = await Student.findAll({
        where: {id: absentIds},
        attributes: ['parent_id'],
        include: [{model: User, as: 'user', attributes: ['name']}],
      });
      const parentNotifs = absentStudents
        .filter(s => s.parent_id)
        .map(async s => {
          const parentUser = await Parent.findByPk(s.parent_id, {attributes: ['user_id']});
          if (parentUser) {
            const statusEntry = attendance.find(a => a.student_id === s.id);
            notifyUser({
              recipientId: parentUser.user_id,
              senderId: req.user.id,
              title: 'Attendance Alert',
              body: `${s.user?.name || 'Your child'} was marked ${statusEntry?.status || 'absent'} on ${date}.`,
              type: 'attendance',
              data: {date, class_id: String(class_id)},
            });
          }
        });
      await Promise.allSettled(parentNotifs);
    }

    return ApiResponse.success(res, {attendance: results, count: results.length}, 'Attendance saved successfully');
  } catch (err) { next(err); }
};

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const {student_id, class_id, month, year} = req.query;
    if (!student_id && !class_id) return ApiResponse.error(res, 'student_id or class_id required', 400);

    const where = {};
    if (student_id) where.student_id = student_id;
    if (class_id)   where.class_id   = class_id;
    if (month && year) {
      where.date = {
        [Op.between]: [
          `${year}-${String(month).padStart(2, '0')}-01`,
          `${year}-${String(month).padStart(2, '0')}-31`,
        ],
      };
    }

    const records = await Attendance.findAll({where});
    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return ApiResponse.success(res, {total, present, absent, late, excused, attendancePercent: percent});
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────
//  CLASS MANAGEMENT (teacher view)
// ─────────────────────────────────────────────────────────────────────────
exports.getMyClasses = async (req, res, next) => {
  try {
    const where = req.user.role === 'teacher' ? {teacher_id: req.user.id, is_active: true} : {is_active: true};
    const classes = await Class.findAll({
      where,
      include: [{model: User, as: 'classTeacher', attributes: ['id', 'name']}],
      order: [['name', 'ASC']],
    });
    return ApiResponse.success(res, {classes, count: classes.length});
  } catch (err) { next(err); }
};

exports.getClassStudents = async (req, res, next) => {
  try {
    const {class_id} = req.params;
    const students = await Student.findAll({
      where: {class_id},
      include: [{model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'profile_image']}],
      order: [[{model: User, as: 'user'}, 'name', 'ASC']],
    });
    return ApiResponse.success(res, {students, count: students.length});
  } catch (err) { next(err); }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const {class_id} = req.query;
    const where = {};
    if (class_id) where.class_id = class_id;
    if (req.user.role === 'teacher') where.teacher_id = req.user.id;

    const subjects = await Subject.findAll({
      where,
      include: [{model: Class, as: 'class', attributes: ['id', 'name', 'section']}],
      order: [['name', 'ASC']],
    });
    return ApiResponse.success(res, {subjects, count: subjects.length});
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────
//  TEACHER DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────
exports.getTeacherStats = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [myClasses, totalAssignments, dueSoonAssignments, todayAttendanceCount] = await Promise.all([
      Class.count({where: {teacher_id: teacherId, is_active: true}}),
      Assignment.count({where: {teacher_id: teacherId}}),
      Assignment.count({
        where: {
          teacher_id: teacherId,
          due_date: {[Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]},
        },
      }),
      Attendance.count({where: {teacher_id: teacherId, date: today}}),
    ]);

    return ApiResponse.success(res, {
      myClasses,
      totalAssignments,
      dueSoonAssignments,
      todayAttendanceMarked: todayAttendanceCount,
    });
  } catch (err) { next(err); }
};
