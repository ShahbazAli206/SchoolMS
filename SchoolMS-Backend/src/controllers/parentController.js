const {Op} = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const Parent     = require('../models/Parent');
const Student    = require('../models/Student');
const User       = require('../models/User');
const Class      = require('../models/Class');
const Subject    = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Mark       = require('../models/Mark');
const Attendance = require('../models/Attendance');

// Resolve all children linked to this parent via parent_id on Student
// Requires students table to have a parent_id column (set when admin creates student).
// Falls back gracefully if column is absent.
const getChildren = async parentUserId => {
  const parent = await Parent.findOne({where: {user_id: parentUserId}});
  if (!parent) return null;

  const children = await Student.findAll({
    where: {parent_id: parent.id},
    include: [
      {model: User,  as: 'user',  attributes: ['id', 'name', 'email']},
      {model: Class, as: 'class', attributes: ['id', 'name', 'section'], required: false},
    ],
  });
  return children;
};

// GET /parent/children
const getMyChildren = async (req, res) => {
  try {
    const children = await getChildren(req.user.id);
    if (children === null) return ApiResponse.notFound(res, 'Parent profile not found');
    return ApiResponse.success(res, {children});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /parent/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const children = await getChildren(req.user.id);
    if (children === null) return ApiResponse.notFound(res, 'Parent profile not found');

    const today   = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const childSummaries = await Promise.all(
      children.map(async child => {
        const [presentToday, dueSoon, totalMarks] = await Promise.all([
          Attendance.findOne({where: {student_id: child.id, date: today, status: 'present'}}),
          Assignment.count({
            where: {
              [Op.or]: [
                {class_id: child.class_id, student_id: null},
                {student_id: child.id},
              ],
              due_date: {[Op.between]: [today, weekEnd]},
            },
          }),
          Mark.count({where: {student_id: child.id}}),
        ]);
        return {
          id: child.id,
          name: child.user?.name,
          class: child.class ? `${child.class.name} ${child.class.section || ''}`.trim() : null,
          presentToday: !!presentToday,
          dueSoonAssignments: dueSoon,
          totalMarks,
        };
      })
    );

    return ApiResponse.success(res, {childCount: children.length, children: childSummaries});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /parent/children/:studentId/marks
const getChildMarks = async (req, res) => {
  try {
    const children = await getChildren(req.user.id);
    if (children === null) return ApiResponse.notFound(res, 'Parent profile not found');

    const child = children.find(c => String(c.id) === String(req.params.studentId));
    if (!child) return ApiResponse.forbidden(res, 'Not your child');

    const {subject_id, exam_type} = req.query;
    const where = {student_id: child.id};
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

    return ApiResponse.success(res, {marks, summary, childName: child.user?.name});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /parent/children/:studentId/attendance
const getChildAttendance = async (req, res) => {
  try {
    const children = await getChildren(req.user.id);
    if (children === null) return ApiResponse.notFound(res, 'Parent profile not found');

    const child = children.find(c => String(c.id) === String(req.params.studentId));
    if (!child) return ApiResponse.forbidden(res, 'Not your child');

    const {month, year} = req.query;
    const where = {student_id: child.id};

    if (month && year) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end   = new Date(year, month, 0).toISOString().slice(0, 10);
      where.date  = {[Op.between]: [start, end]};
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
      summary: {total, present, absent, late, excused, percentage: total > 0 ? Math.round(((present + late) / total) * 100) : null},
      childName: child.user?.name,
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /parent/children/:studentId/assignments
const getChildAssignments = async (req, res) => {
  try {
    const children = await getChildren(req.user.id);
    if (children === null) return ApiResponse.notFound(res, 'Parent profile not found');

    const child = children.find(c => String(c.id) === String(req.params.studentId));
    if (!child) return ApiResponse.forbidden(res, 'Not your child');

    const assignments = await Assignment.findAll({
      where: {
        [Op.or]: [
          {class_id: child.class_id, student_id: null},
          {student_id: child.id},
        ],
      },
      include: [
        {model: Class,   as: 'class',   attributes: ['id', 'name']},
        {model: Subject, as: 'subject', attributes: ['id', 'name']},
      ],
      order: [['due_date', 'ASC']],
    });

    return ApiResponse.success(res, {assignments, childName: child.user?.name});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

module.exports = {getMyChildren, getDashboardStats, getChildMarks, getChildAttendance, getChildAssignments};
