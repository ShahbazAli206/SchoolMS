const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING(100), allowNull: false},
  email: {type: DataTypes.STRING(150), allowNull: true, unique: true, validate: {isEmail: true}},
  phone: {type: DataTypes.STRING(20), allowNull: true, unique: true},
  username: {type: DataTypes.STRING(50), allowNull: true, unique: true},
  password: {type: DataTypes.STRING(255), allowNull: false},
  role: {
    type: DataTypes.ENUM('admin', 'teacher', 'student', 'parent', 'staff'),
    defaultValue: 'student',
    allowNull: false,
  },
  is_active: {type: DataTypes.BOOLEAN, defaultValue: true},
  fcm_token: {type: DataTypes.TEXT, allowNull: true},
  profile_image: {type: DataTypes.STRING(500), allowNull: true},
  last_login_at: {type: DataTypes.DATE, allowNull: true},
  last_login_device: {type: DataTypes.STRING(255), allowNull: true},
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async user => {
      if (user.password) user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async user => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
    },
  },
});

User.prototype.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toJSON = function () {
  const values = {...this.get()};
  delete values.password;
  return values;
};

module.exports = User;
