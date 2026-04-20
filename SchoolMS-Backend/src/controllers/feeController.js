const {Op, Sequelize} = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const Fee         = require('../models/Fee');
const Payment     = require('../models/Payment');
const Student     = require('../models/Student');
const User        = require('../models/User');
const Class       = require('../models/Class');
const Parent      = require('../models/Parent');
const {notifyUser} = require('../utils/notifyHelper');

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN — Fee Management
// ─────────────────────────────────────────────────────────────────────────────

// GET /fees  — list all fees (admin)
exports.getAllFees = async (req, res) => {
  try {
    const {page = 1, limit = 20, class_id, fee_type, student_id, academic_year} = req.query;
    const where = {};
    if (class_id)       where.class_id      = class_id;
    if (fee_type)       where.fee_type       = fee_type;
    if (student_id)     where.student_id     = student_id;
    if (academic_year)  where.academic_year  = academic_year;

    const {count, rows} = await Fee.findAndCountAll({
      where,
      include: [
        {model: Class,   as: 'class',   attributes: ['id', 'name', 'section'], required: false},
        {
          model: Student, as: 'student', required: false,
          include: [{model: User, as: 'user', attributes: ['id', 'name']}],
        },
        {model: Payment, as: 'payments', attributes: ['id', 'amount_paid', 'status', 'paid_date']},
      ],
      order: [['due_date', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    // Annotate each fee with paid/pending amount
    const data = rows.map(fee => {
      const totalPaid = fee.payments.reduce((s, p) => s + parseFloat(p.amount_paid), 0);
      const balance   = parseFloat(fee.amount) - totalPaid;
      return {
        ...fee.toJSON(),
        totalPaid,
        balance: balance < 0 ? 0 : balance,
        paymentStatus: balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
      };
    });

    return ApiResponse.paginated(res, data, count, page, limit);
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// POST /fees  — create fee record (admin)
exports.createFee = async (req, res) => {
  try {
    const {title, description, fee_type, amount, due_date, class_id, student_id, academic_year, month, is_recurring} = req.body;

    if (!title || !fee_type || !amount || !due_date) {
      return ApiResponse.error(res, 'title, fee_type, amount, due_date are required', 422);
    }
    if (!class_id && !student_id) {
      return ApiResponse.error(res, 'Either class_id or student_id is required', 422);
    }

    const fee = await Fee.create({
      title, description, fee_type, amount, due_date,
      class_id: class_id || null,
      student_id: student_id || null,
      academic_year, month,
      is_recurring: is_recurring || false,
    });

    return ApiResponse.created(res, {fee});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// PUT /fees/:id  — update fee (admin)
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return ApiResponse.notFound(res, 'Fee not found');

    const allowed = ['title', 'description', 'fee_type', 'amount', 'due_date', 'academic_year', 'month'];
    allowed.forEach(k => { if (req.body[k] !== undefined) fee[k] = req.body[k]; });
    await fee.save();

    return ApiResponse.success(res, {fee});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// DELETE /fees/:id  — delete fee (admin)
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return ApiResponse.notFound(res, 'Fee not found');
    await fee.destroy();
    return ApiResponse.success(res, {}, 'Fee deleted');
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /fees/dashboard  — admin fee dashboard stats
exports.getFeeDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [totalFees, overdueFees, allPayments, recentPayments] = await Promise.all([
      Fee.count(),
      Fee.count({where: {due_date: {[Op.lt]: today}}}),
      Payment.sum('amount_paid'),
      Payment.findAll({
        order: [['paid_date', 'DESC']],
        limit: 5,
        include: [
          {model: Student, as: 'student', include: [{model: User, as: 'user', attributes: ['id', 'name']}]},
          {model: Fee,     as: 'fee',     attributes: ['id', 'title', 'amount']},
        ],
      }),
    ]);

    // Total expected = sum of all fee amounts
    const totalExpected = (await Fee.sum('amount')) || 0;
    const totalCollected = allPayments || 0;
    const outstanding = totalExpected - totalCollected;

    return ApiResponse.success(res, {
      totalFees,
      overdueFees,
      totalExpected,
      totalCollected,
      outstanding: outstanding < 0 ? 0 : outstanding,
      collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
      recentPayments,
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN — Payment Management
// ─────────────────────────────────────────────────────────────────────────────

// POST /fees/:feeId/payments  — record a payment (admin)
exports.recordPayment = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.feeId);
    if (!fee) return ApiResponse.notFound(res, 'Fee not found');

    const {student_id, amount_paid, paid_date, payment_method, reference_no, remarks} = req.body;
    if (!student_id || !amount_paid || !paid_date) {
      return ApiResponse.error(res, 'student_id, amount_paid, paid_date are required', 422);
    }

    // Check existing payments for this student+fee
    const existingPaid = await Payment.sum('amount_paid', {where: {fee_id: fee.id, student_id}}) || 0;
    const remaining    = parseFloat(fee.amount) - existingPaid;
    const payAmt       = parseFloat(amount_paid);

    const status = payAmt >= remaining ? 'paid' : 'partial';

    const payment = await Payment.create({
      fee_id: fee.id,
      student_id,
      amount_paid: payAmt,
      paid_date,
      payment_method: payment_method || 'cash',
      reference_no,
      remarks,
      collected_by: req.user.id,
      status,
    });

    // Notify student and their parent (fire-and-forget)
    const studentRecord = await Student.findByPk(student_id, {attributes: ['user_id', 'parent_id']});
    const notifTitle = `Payment Received — ${fee.title}`;
    const notifBody  = `Rs. ${payAmt.toLocaleString()} received on ${paid_date}. Balance: Rs. ${Math.max(0, remaining - payAmt).toLocaleString()}`;
    if (studentRecord) {
      notifyUser({recipientId: studentRecord.user_id, senderId: req.user.id, title: notifTitle, body: notifBody, type: 'fee', data: {fee_id: fee.id, payment_id: payment.id}});
      if (studentRecord.parent_id) {
        const parentUser = await Parent.findByPk(studentRecord.parent_id, {attributes: ['user_id']});
        if (parentUser) notifyUser({recipientId: parentUser.user_id, senderId: req.user.id, title: notifTitle, body: notifBody, type: 'fee', data: {fee_id: fee.id}});
      }
    }

    return ApiResponse.created(res, {payment, remainingAfter: remaining - payAmt < 0 ? 0 : remaining - payAmt});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /fees/:feeId/payments  — list payments for a fee (admin)
exports.getFeePayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {fee_id: req.params.feeId},
      include: [
        {model: Student,  as: 'student',   include: [{model: User, as: 'user', attributes: ['id', 'name']}]},
        {model: User,     as: 'collector', attributes: ['id', 'name'], required: false},
      ],
      order: [['paid_date', 'DESC']],
    });
    return ApiResponse.success(res, {payments});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// GET /fees/student/:studentId  — fee ledger for one student (admin)
exports.getStudentFees = async (req, res) => {
  try {
    const {studentId} = req.params;
    const student = await Student.findByPk(studentId, {
      include: [{model: User, as: 'user', attributes: ['id', 'name']}],
    });
    if (!student) return ApiResponse.notFound(res, 'Student not found');

    const fees = await Fee.findAll({
      where: {
        [Op.or]: [
          {student_id: studentId},
          {class_id: student.class_id, student_id: null},
        ],
      },
      include: [
        {
          model: Payment, as: 'payments',
          where: {student_id: studentId},
          required: false,
        },
      ],
      order: [['due_date', 'ASC']],
    });

    const ledger = fees.map(fee => {
      const totalPaid = fee.payments.reduce((s, p) => s + parseFloat(p.amount_paid), 0);
      const balance   = parseFloat(fee.amount) - totalPaid;
      return {
        ...fee.toJSON(),
        totalPaid,
        balance: balance < 0 ? 0 : balance,
        paymentStatus: balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
      };
    });

    const totalDue       = ledger.reduce((s, f) => s + parseFloat(f.amount), 0);
    const totalPaid      = ledger.reduce((s, f) => s + f.totalPaid, 0);
    const totalOutstanding = ledger.reduce((s, f) => s + f.balance, 0);

    return ApiResponse.success(res, {
      student: {id: student.id, name: student.user?.name},
      ledger,
      summary: {totalDue, totalPaid, totalOutstanding},
    });
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT — own fees
// ─────────────────────────────────────────────────────────────────────────────

// GET /fees/my  — student views own fees
exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({where: {user_id: req.user.id}});
    if (!student) return ApiResponse.notFound(res, 'Student profile not found');

    const fees = await Fee.findAll({
      where: {
        [Op.or]: [
          {student_id: student.id},
          {class_id: student.class_id, student_id: null},
        ],
      },
      include: [
        {
          model: Payment, as: 'payments',
          where: {student_id: student.id},
          required: false,
        },
      ],
      order: [['due_date', 'ASC']],
    });

    const ledger = fees.map(fee => {
      const totalPaid = fee.payments.reduce((s, p) => s + parseFloat(p.amount_paid), 0);
      const balance   = parseFloat(fee.amount) - totalPaid;
      return {
        ...fee.toJSON(),
        totalPaid,
        balance: balance < 0 ? 0 : balance,
        paymentStatus: balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
      };
    });

    const summary = {
      totalDue:         ledger.reduce((s, f) => s + parseFloat(f.amount), 0),
      totalPaid:        ledger.reduce((s, f) => s + f.totalPaid, 0),
      totalOutstanding: ledger.reduce((s, f) => s + f.balance, 0),
      pendingCount:     ledger.filter(f => f.paymentStatus !== 'paid').length,
    };

    return ApiResponse.success(res, {ledger, summary});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PARENT — child fees
// ─────────────────────────────────────────────────────────────────────────────

// GET /fees/child/:studentId  — parent views a child's fees
exports.getChildFees = async (req, res) => {
  try {
    const parent  = await Parent.findOne({where: {user_id: req.user.id}});
    if (!parent) return ApiResponse.notFound(res, 'Parent profile not found');

    const student = await Student.findOne({
      where: {id: req.params.studentId, parent_id: parent.id},
      include: [{model: User, as: 'user', attributes: ['id', 'name']}],
    });
    if (!student) return ApiResponse.forbidden(res, 'Not your child');

    const fees = await Fee.findAll({
      where: {
        [Op.or]: [
          {student_id: student.id},
          {class_id: student.class_id, student_id: null},
        ],
      },
      include: [
        {
          model: Payment, as: 'payments',
          where: {student_id: student.id},
          required: false,
        },
      ],
      order: [['due_date', 'ASC']],
    });

    const ledger = fees.map(fee => {
      const totalPaid = fee.payments.reduce((s, p) => s + parseFloat(p.amount_paid), 0);
      const balance   = parseFloat(fee.amount) - totalPaid;
      return {
        ...fee.toJSON(),
        totalPaid,
        balance: balance < 0 ? 0 : balance,
        paymentStatus: balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
      };
    });

    const summary = {
      totalDue:         ledger.reduce((s, f) => s + parseFloat(f.amount), 0),
      totalPaid:        ledger.reduce((s, f) => s + f.totalPaid, 0),
      totalOutstanding: ledger.reduce((s, f) => s + f.balance, 0),
      pendingCount:     ledger.filter(f => f.paymentStatus !== 'paid').length,
    };

    return ApiResponse.success(res, {ledger, summary, childName: student.user?.name});
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
