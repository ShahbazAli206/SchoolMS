const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const {Op} = require('sequelize');

exports.updateOwnProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return ApiResponse.notFound(res, 'User not found');

    const {name, email, phone, profile_image} = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (profile_image !== undefined) updateData.profile_image = profile_image;

    await user.update(updateData);
    return ApiResponse.success(res, {user}, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const {page = 1, limit = 20, role, search, is_active} = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = {};

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      where[Op.or] = [
        {name: {[Op.like]: `%${search}%`}},
        {email: {[Op.like]: `%${search}%`}},
        {phone: {[Op.like]: `%${search}%`}},
      ];
    }

    const {count, rows} = await User.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [['created_at', 'DESC']],
    });

    return ApiResponse.paginated(res, rows, count, page, limit);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    return ApiResponse.success(res, {user});
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const {name, email, phone, username, password, role} = req.body;
    const exists = await User.findOne({
      where: {[Op.or]: [email ? {email} : null, phone ? {phone} : null, username ? {username} : null].filter(Boolean)},
    });
    if (exists) return ApiResponse.error(res, 'User already exists with this email/phone/username', 409);
    const user = await User.create({name, email, phone, username, password, role});
    return ApiResponse.created(res, {user}, 'User created successfully');
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    const {name, email, phone, username, role, profile_image} = req.body;
    await user.update({name, email, phone, username, role, profile_image});
    return ApiResponse.success(res, {user}, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    await user.destroy();
    return ApiResponse.success(res, {}, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    await user.update({is_active: !user.is_active});
    return ApiResponse.success(res, {user}, `User ${user.is_active ? 'activated' : 'deactivated'}`);
  } catch (err) {
    next(err);
  }
};

exports.assignRole = async (req, res, next) => {
  try {
    const {role} = req.body;
    const validRoles = ['admin', 'teacher', 'student', 'parent', 'staff'];
    if (!validRoles.includes(role)) return ApiResponse.error(res, 'Invalid role', 400);
    const user = await User.findByPk(req.params.id);
    if (!user) return ApiResponse.notFound(res, 'User not found');
    await user.update({role});
    return ApiResponse.success(res, {user}, 'Role assigned successfully');
  } catch (err) {
    next(err);
  }
};
