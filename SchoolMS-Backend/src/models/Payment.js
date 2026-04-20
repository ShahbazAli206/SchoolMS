const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const Fee         = require('./Fee');
const Student     = require('./Student');
const User        = require('./User');

const Payment = sequelize.define('Payment', {
  id:            {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  fee_id:        {type: DataTypes.INTEGER, allowNull: false},
  student_id:    {type: DataTypes.INTEGER, allowNull: false},
  amount_paid:   {type: DataTypes.DECIMAL(10, 2), allowNull: false},
  paid_date:     {type: DataTypes.DATEONLY, allowNull: false},
  payment_method:{
    type: DataTypes.ENUM('cash', 'bank_transfer', 'online', 'cheque', 'other'),
    allowNull: false,
    defaultValue: 'cash',
  },
  reference_no:  {type: DataTypes.STRING(100), allowNull: true},
  remarks:       {type: DataTypes.TEXT, allowNull: true},
  collected_by:  {type: DataTypes.INTEGER, allowNull: true},  // admin user id
  status: {
    type: DataTypes.ENUM('paid', 'partial', 'refunded'),
    allowNull: false,
    defaultValue: 'paid',
  },
}, {
  tableName: 'payments',
  indexes: [
    {fields: ['student_id']},
    {fields: ['fee_id']},
  ],
});

Payment.belongsTo(Fee,     {foreignKey: 'fee_id',        as: 'fee'});
Payment.belongsTo(Student, {foreignKey: 'student_id',    as: 'student'});
Payment.belongsTo(User,    {foreignKey: 'collected_by',  as: 'collector', constraints: false});

Fee.hasMany(Payment, {foreignKey: 'fee_id', as: 'payments'});

module.exports = Payment;
