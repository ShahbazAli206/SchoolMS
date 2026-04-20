const {Op, fn, col, literal} = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

// ── Dashboard Stats ───────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalStaff,
      activeUsers,
      inactiveUsers,
      newThisMonth,
    ] = await Promise.all([
      User.count({where: {role: 'student', is_active: true}}),
      User.count({where: {role: 'teacher', is_active: true}}),
      User.count({where: {role: 'parent', is_active: true}}),
      User.count({where: {role: 'staff', is_active: true}}),
      User.count({where: {is_active: true}}),
      User.count({where: {is_active: false}}),
      User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const stats = {
      users: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalStaff,
        totalActive: activeUsers,
        totalInactive: inactiveUsers,
        newThisMonth,
      },
      // Placeholders — will be populated in Phase 6 (fees) and Phase 4 (attendance)
      fees: {
        totalCollected: 0,
        totalPending: 0,
        overdueCount: 0,
      },
      attendance: {
        todayPresent: 0,
        todayAbsent: 0,
        avgAttendancePercent: 0,
      },
      assignments: {
        total: 0,
        dueSoon: 0,
      },
    };

    return ApiResponse.success(res, stats, 'Dashboard stats retrieved');
  } catch (err) {
    next(err);
  }
};

// ── Student CRUD ──────────────────────────────────────────────────────────
exports.getStudents = async (req, res, next) => {
  try {
    const {page = 1, limit = 20, search, class_id, is_active} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const userWhere = {role: 'student'};
    if (is_active !== undefined) userWhere.is_active = is_active === 'true';
    if (search) {
      userWhere[Op.or] = [
        {name: {[Op.like]: `%${search}%`}},
        {email: {[Op.like]: `%${search}%`}},
        {phone: {[Op.like]: `%${search}%`}},
      ];
    }

    const studentWhere = {};
    if (class_id) studentWhere.class_id = class_id;

    const {count, rows} = await Student.findAndCountAll({
      where: studentWhere,
      include: [{model: User, where: userWhere, as: 'user', attributes: {exclude: ['password']}}],
      limit: parseInt(limit),
      offset,
      order: [[{model: User, as: 'user'}, 'name', 'ASC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const {name, email, phone, username, password, roll_number, admission_no, class_id, date_of_birth, address} = req.body;

    const existingUser = await User.findOne({
      where: {[Op.or]: [email ? {email} : null, phone ? {phone} : null].filter(Boolean)},
    });
    if (existingUser) return ApiResponse.error(res, 'User with this email/phone already exists', 409);

    const t = await sequelize.transaction();
    try {
      const user = await User.create({name, email, phone, username, password, role: 'student'}, {transaction: t});
      const student = await Student.create(
        {user_id: user.id, roll_number, admission_no, class_id, date_of_birth, address},
        {transaction: t},
      );
      await t.commit();
      return ApiResponse.created(res, {user: user.toJSON(), student}, 'Student created successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {name, email, phone, roll_number, class_id, date_of_birth, address, is_active} = req.body;

    const student = await Student.findByPk(id, {include: [{model: User, as: 'user'}]});
    if (!student) return ApiResponse.notFound(res, 'Student not found');

    const t = await sequelize.transaction();
    try {
      await student.user.update({name, email, phone, is_active}, {transaction: t});
      await student.update({roll_number, class_id, date_of_birth, address}, {transaction: t});
      await t.commit();
      return ApiResponse.success(res, {student}, 'Student updated successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, {include: [{model: User, as: 'user'}]});
    if (!student) return ApiResponse.notFound(res, 'Student not found');

    const t = await sequelize.transaction();
    try {
      await student.destroy({transaction: t});
      await student.user.destroy({transaction: t});
      await t.commit();
      return ApiResponse.success(res, {}, 'Student deleted successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// ── Teacher CRUD ──────────────────────────────────────────────────────────
exports.getTeachers = async (req, res, next) => {
  try {
    const {page = 1, limit = 20, search} = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const userWhere = {role: 'teacher'};
    if (search) {
      userWhere[Op.or] = [
        {name: {[Op.like]: `%${search}%`}},
        {email: {[Op.like]: `%${search}%`}},
      ];
    }

    const {count, rows} = await Teacher.findAndCountAll({
      include: [{model: User, where: userWhere, as: 'user', attributes: {exclude: ['password']}}],
      limit: parseInt(limit),
      offset,
      order: [[{model: User, as: 'user'}, 'name', 'ASC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const {name, email, phone, username, password, employee_id, qualification, specialization, joining_date} = req.body;

    const existingUser = await User.findOne({
      where: {[Op.or]: [email ? {email} : null, phone ? {phone} : null].filter(Boolean)},
    });
    if (existingUser) return ApiResponse.error(res, 'User with this email/phone already exists', 409);

    const t = await sequelize.transaction();
    try {
      const user = await User.create({name, email, phone, username, password, role: 'teacher'}, {transaction: t});
      const teacher = await Teacher.create(
        {user_id: user.id, employee_id, qualification, specialization, joining_date},
        {transaction: t},
      );
      await t.commit();
      return ApiResponse.created(res, {user: user.toJSON(), teacher}, 'Teacher created successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {include: [{model: User, as: 'user'}]});
    if (!teacher) return ApiResponse.notFound(res, 'Teacher not found');

    const {name, email, phone, employee_id, qualification, specialization, joining_date, is_active} = req.body;
    const t = await sequelize.transaction();
    try {
      await teacher.user.update({name, email, phone, is_active}, {transaction: t});
      await teacher.update({employee_id, qualification, specialization, joining_date}, {transaction: t});
      await t.commit();
      return ApiResponse.success(res, {teacher}, 'Teacher updated successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {include: [{model: User, as: 'user'}]});
    if (!teacher) return ApiResponse.notFound(res, 'Teacher not found');
    const t = await sequelize.transaction();
    try {
      await teacher.destroy({transaction: t});
      await teacher.user.destroy({transaction: t});
      await t.commit();
      return ApiResponse.success(res, {}, 'Teacher deleted successfully');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// ── Toggle user status (admin shortcut) ──────────────────────────────────
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    if (user.id === req.user.id) return ApiResponse.error(res, 'Cannot deactivate your own account', 400);

    await user.update({is_active: !user.is_active});
    const action = user.is_active ? 'activated' : 'deactivated';
    logger.info(`Admin ${req.user.id} ${action} user ${user.id}`);
    return ApiResponse.success(res, {user: user.toJSON()}, `User ${action} successfully`);
  } catch (err) {
    next(err);
  }
};

// ── Assign role ───────────────────────────────────────────────────────────
exports.assignRole = async (req, res, next) => {
  try {
    const {role} = req.body;
    const validRoles = ['admin', 'teacher', 'student', 'parent', 'staff'];
    if (!validRoles.includes(role)) return ApiResponse.error(res, 'Invalid role', 400);

    const user = await User.findByPk(req.params.userId);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    if (user.id === req.user.id) return ApiResponse.error(res, 'Cannot change your own role', 400);

    await user.update({role});
    logger.info(`Admin ${req.user.id} assigned role '${role}' to user ${user.id}`);
    return ApiResponse.success(res, {user: user.toJSON()}, 'Role assigned successfully');
  } catch (err) {
    next(err);
  }
};
