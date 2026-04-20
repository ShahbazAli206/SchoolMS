const {Op} = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const Student    = require('../models/Student');
const User       = require('../models/User');
const Class      = require('../models/Class');
const Subject    = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Material   = require('../models/Material');
const Mark       = require('../models/Mark');
const Attendance = require('../models/Attendance');

// Resolve Student record from the logged-in user
const getStudentRecord = async userId => {
  return Student.findOne({where: {user_id: userId}});
};

// GET /student/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const student = await getStudentRecord(req.user.id);
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const studentId = student.id;
    const classId   = student.class_id;
    const today     = new Date().toISOString().slice(0, 10);
    const weekEnd   = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const [
      totalAssignments,
      dueSoonAssignments,
      totalMarks,
      presentDays,
      absentDays,
      totalDays,
    ] = await Promise.all([
      Assignment.count({
        where: {
          [Op.or]: [
            {class_id: classId, student_id: null},
            {student_id: studentId},
          ],
        },
      }),
      Assignment.count({
        where: {
          [Op.or]: [
            {class_id: classId, student_id: null},
            {student_id: studentId},
          ],
          due_date: {[Op.between]: [today, weekEnd]},
        },
      }),
      Mark.count({where: {student_id: studentId}}),
      Attendance.count({where: {student_id: studentId, status: 'present'}}),
      Attendance.count({where: {student_id: studentId, status: 'absent'}}),
      Attendance.count({where: {student_id: studentId}}),
    ]);

    return ApiResponse.success(res, {
      totalAssignments,
      dueSoonAssignments,
      totalMarks,
      presentDays,
      absentDays,
      totalDays,
      attendancePct: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null,
      classId,
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /student/assignments
const getMyAssignments = async (req, res) => {
  try {
    const student = await getStudentRecord(req.user.id);
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const {page = 1, limit = 20, status} = req.query;
    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        {class_id: student.class_id, student_id: null},
        {student_id: student.id},
      ],
    };

    if (status === 'overdue') where.due_date = {[Op.lt]: new Date()};
    if (status === 'upcoming') where.due_date = {[Op.gte]: new Date()};

    const {count, rows} = await Assignment.findAndCountAll({
      where,
      include: [
        {model: Class,   as: 'class',   attributes: ['id', 'name', 'section']},
        {model: Subject, as: 'subject', attributes: ['id', 'name']},
      ],
      order: [['due_date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /student/marks
const getMyMarks = async (req, res) => {
  try {
    const student = await getStudentRecord(req.user.id);
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const {subject_id, exam_type} = req.query;
    const where = {student_id: student.id};
    if (subject_id) where.subject_id = subject_id;
    if (exam_type)  where.exam_type  = exam_type;

    const marks = await Mark.findAll({
      where,
      include: [
        {model: Subject, as: 'subject', attributes: ['id', 'name']},
        {model: User,    as: 'teacher', attributes: ['id', 'name']},
      ],
      order: [['createdAt', 'DESC']],
    });

    // Compute summary per subject
    const subjectMap = {};
    marks.forEach(m => {
      const sName = m.subject?.name || 'Unknown';
      if (!subjectMap[sName]) subjectMap[sName] = {obtained: 0, max: 0, count: 0};
      subjectMap[sName].obtained += parseFloat(m.marks);
      subjectMap[sName].max      += parseFloat(m.max_marks);
      subjectMap[sName].count++;
    });

    const summary = Object.entries(subjectMap).map(([subject, s]) => ({
      subject,
      totalObtained: s.obtained,
      totalMax: s.max,
      percentage: s.max > 0 ? Math.round((s.obtained / s.max) * 100) : null,
      count: s.count,
    }));

    return ApiResponse.success(res, {marks, summary});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /student/attendance
const getMyAttendance = async (req, res) => {
  try {
    const student = await getStudentRecord(req.user.id);
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const {month, year} = req.query;
    const where = {student_id: student.id};

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0);
      const end = endDate.toISOString().slice(0, 10);
      where.date = {[Op.between]: [start, end]};
    }

    const records = await Attendance.findAll({
      where,
      include: [{model: Class, as: 'class', attributes: ['id', 'name']}],
      order: [['date', 'DESC']],
    });

    const total   = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent  = records.filter(r => r.status === 'absent').length;
    const late    = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    return ApiResponse.success(res, {
      records,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        percentage: total > 0 ? Math.round(((present + late) / total) * 100) : null,
      },
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /student/materials
const getMyMaterials = async (req, res) => {
  try {
    const student = await getStudentRecord(req.user.id);
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const {subject_id, file_type, page = 1, limit = 20} = req.query;
    const where = {class_id: student.class_id};
    if (subject_id) where.subject_id = subject_id;
    if (file_type)  where.file_type  = file_type;

    const {count, rows} = await Material.findAndCountAll({
      where,
      include: [
        {model: Subject, as: 'subject', attributes: ['id', 'name']},
        {model: User,    as: 'teacher', attributes: ['id', 'name']},
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit),
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

module.exports = {getDashboardStats, getMyAssignments, getMyMarks, getMyAttendance, getMyMaterials};
