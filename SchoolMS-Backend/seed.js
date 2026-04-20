/**
 * SchoolMS — Full Demo Data Seeder
 * Run: node seed.js
 * All accounts use password: School@123
 */
const mysql2 = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB   = { host:'localhost', user:'root', password:'', database:'school_management_db' };
const HASH = bcrypt.hashSync('School@123', 10);

async function seed() {
  const c = await mysql2.createConnection(DB);
  console.log('Connected');

  const wipe = [
    'complaints','marks','attendance','assignments','materials',
    'payments','fees','messages','conversation_participants','conversations',
    'notifications','otp_verifications','password_resets','sessions',
    'parent_student_mapping','parents','students','teachers',
    'subjects','classes','users',
  ];
  await c.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of wipe) await c.query(`TRUNCATE TABLE ${t}`);
  await c.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('Tables cleared');

  // ── USERS ──────────────────────────────────────────────────────────────────
  const userRows = [
    ['Sarah Ahmed',          'admin@schoolms.com',         '03001234567', 'admin',           'admin'],
    ['Mr. Ali Hassan',       'ali.hassan@schoolms.com',    '03011111001', 'ali_teacher',     'teacher'],
    ['Ms. Ayesha Khan',      'ayesha.khan@schoolms.com',   '03011111002', 'ayesha_teacher',  'teacher'],
    ['Mr. Bilal Raza',       'bilal.raza@schoolms.com',    '03011111003', 'bilal_teacher',   'teacher'],
    ['Zain Malik',           'zain@schoolms.com',          '03021111001', 'zain_student',    'student'],
    ['Sara Iqbal',           'sara@schoolms.com',          '03021111002', 'sara_student',    'student'],
    ['Omar Sheikh',          'omar@schoolms.com',          '03021111003', 'omar_student',    'student'],
    ['Fatima Butt',          'fatima@schoolms.com',        '03021111004', 'fatima_student',  'student'],
    ['Hamza Javed',          'hamza@schoolms.com',         '03021111005', 'hamza_student',   'student'],
    ['Mr. Tariq Malik',      'tariq@schoolms.com',         '03031111001', 'tariq_parent',    'parent'],
    ['Mrs. Nadia Iqbal',     'nadia@schoolms.com',         '03031111002', 'nadia_parent',    'parent'],
    ['Mr. Kamran Sheikh',    'kamran@schoolms.com',        '03031111003', 'kamran_parent',   'parent'],
  ];
  const uid = {};
  for (const [name, email, phone, username, role] of userRows) {
    const [r] = await c.query(
      `INSERT INTO users (name,email,phone,username,password,role,is_active) VALUES (?,?,?,?,?,?,1)`,
      [name, email, phone, username, HASH, role]
    );
    uid[username] = r.insertId;
  }
  console.log('Users OK');

  // ── CLASSES ────────────────────────────────────────────────────────────────
  const clsData = [
    { name:'Class 9',  section:'A', year:'2025-2026' },
    { name:'Class 9',  section:'B', year:'2025-2026' },
    { name:'Class 10', section:'A', year:'2025-2026' },
  ];
  const cid = {};
  for (const cl of clsData) {
    const [r] = await c.query(
      `INSERT INTO classes (name,section,academic_year) VALUES (?,?,?)`,
      [cl.name, cl.section, cl.year]
    );
    cid[`${cl.name}-${cl.section}`] = r.insertId;
  }

  // ── TEACHERS ───────────────────────────────────────────────────────────────
  const teacherData = [
    { u:'ali_teacher',    qual:'M.Sc Mathematics', spec:'Mathematics' },
    { u:'ayesha_teacher', qual:'M.Sc Physics',     spec:'Physics' },
    { u:'bilal_teacher',  qual:'M.A English',      spec:'English Language' },
  ];
  const tid = {};
  for (const t of teacherData) {
    const [r] = await c.query(
      `INSERT INTO teachers (user_id,qualification,specialization,joining_date) VALUES (?,?,?,'2020-01-10')`,
      [uid[t.u], t.qual, t.spec]
    );
    tid[t.u] = r.insertId;
  }

  // Update class teacher_id
  await c.query(`UPDATE classes SET teacher_id=? WHERE id=?`, [tid['ali_teacher'],    cid['Class 9-A']]);
  await c.query(`UPDATE classes SET teacher_id=? WHERE id=?`, [tid['ayesha_teacher'], cid['Class 9-B']]);
  await c.query(`UPDATE classes SET teacher_id=? WHERE id=?`, [tid['bilal_teacher'],  cid['Class 10-A']]);

  // ── SUBJECTS ───────────────────────────────────────────────────────────────
  const subjData = [
    { name:'Mathematics',      code:'MATH', class:'Class 9-A',  teacher:'ali_teacher' },
    { name:'Physics',          code:'PHY',  class:'Class 9-B',  teacher:'ayesha_teacher' },
    { name:'English',          code:'ENG',  class:'Class 10-A', teacher:'bilal_teacher' },
    { name:'Computer Science', code:'CS',   class:'Class 9-A',  teacher:'ali_teacher' },
    { name:'Biology',          code:'BIO',  class:'Class 9-B',  teacher:'ayesha_teacher' },
  ];
  const sid = {};
  for (const s of subjData) {
    const [r] = await c.query(
      `INSERT INTO subjects (name,code,class_id,teacher_id) VALUES (?,?,?,?)`,
      [s.name, s.code, cid[s.class], tid[s.teacher]]
    );
    sid[s.name] = r.insertId;
  }
  console.log('Subjects OK');

  // ── STUDENTS ───────────────────────────────────────────────────────────────
  const studentData = [
    { u:'zain_student',   roll:'2024001', adm:'ADM-001', class:'Class 9-A',  dob:'2009-03-15', gender:'male',   addr:'House 5, Block A, Lahore' },
    { u:'sara_student',   roll:'2024002', adm:'ADM-002', class:'Class 9-A',  dob:'2009-07-22', gender:'female', addr:'House 12, DHA Phase 3, Lahore' },
    { u:'omar_student',   roll:'2024003', adm:'ADM-003', class:'Class 9-B',  dob:'2008-11-10', gender:'male',   addr:'Flat 7, Gulberg III, Lahore' },
    { u:'fatima_student', roll:'2024004', adm:'ADM-004', class:'Class 9-B',  dob:'2009-01-30', gender:'female', addr:'House 3, Johar Town, Lahore' },
    { u:'hamza_student',  roll:'2024005', adm:'ADM-005', class:'Class 10-A', dob:'2008-06-18', gender:'male',   addr:'House 9, Model Town, Lahore' },
  ];
  const stid = {};
  for (const s of studentData) {
    const [r] = await c.query(
      `INSERT INTO students (user_id,class_id,roll_number,admission_no,date_of_birth,gender,address) VALUES (?,?,?,?,?,?,?)`,
      [uid[s.u], cid[s.class], s.roll, s.adm, s.dob, s.gender, s.addr]
    );
    stid[s.u] = r.insertId;
  }

  // ── PARENTS ────────────────────────────────────────────────────────────────
  const parentData = [
    { u:'tariq_parent',  occ:'Business',  addr:'House 5, Block A, Lahore',       kids:['zain_student','sara_student'] },
    { u:'nadia_parent',  occ:'Doctor',    addr:'Flat 7, Gulberg III, Lahore',     kids:['omar_student','fatima_student'] },
    { u:'kamran_parent', occ:'Engineer',  addr:'House 9, Model Town, Lahore',     kids:['hamza_student'] },
  ];
  const paid = {};
  for (const p of parentData) {
    const [r] = await c.query(
      `INSERT INTO parents (user_id,occupation,address) VALUES (?,?,?)`,
      [uid[p.u], p.occ, p.addr]
    );
    paid[p.u] = r.insertId;
    for (const k of p.kids) {
      await c.query(
        `INSERT INTO parent_student_mapping (parent_id,student_id) VALUES (?,?)`,
        [paid[p.u], stid[k]]
      );
    }
  }
  console.log('Profiles OK');

  // ── ASSIGNMENTS ────────────────────────────────────────────────────────────
  const assignData = [
    { teacher:'ali_teacher',    subj:'Mathematics', class:'Class 9-A',  title:'Algebra Practice Set 1',    desc:'Solve problems from Chapter 3, Exercise 3.1-3.5. Show complete working.', due:'2026-04-25' },
    { teacher:'ali_teacher',    subj:'Mathematics', class:'Class 9-A',  title:'Geometry Worksheet',        desc:'Complete worksheet on triangles and quadrilaterals. Diagrams are required.', due:'2026-04-28' },
    { teacher:'ayesha_teacher', subj:'Physics',     class:'Class 9-B',  title:'Laws of Motion Problems',   desc:'Solve numerical problems from Chapter 4. Write all formulas before solving.', due:'2026-04-26' },
    { teacher:'bilal_teacher',  subj:'English',     class:'Class 10-A', title:'Essay: My Future Goals',    desc:'Write a 500-word essay on your future career goals and how you plan to achieve them.', due:'2026-04-30' },
    { teacher:'bilal_teacher',  subj:'English',     class:'Class 10-A', title:'Grammar Exercise — Tenses', desc:'Complete all tense exercises in grammar workbook pages 45-52.', due:'2026-05-02' },
  ];
  for (const a of assignData) {
    await c.query(
      `INSERT INTO assignments (title,description,teacher_id,class_id,subject_id,due_date) VALUES (?,?,?,?,?,?)`,
      [a.title, a.desc, tid[a.teacher], cid[a.class], sid[a.subj], a.due]
    );
  }

  // ── ATTENDANCE (last 7 school days) ───────────────────────────────────────
  const attPatterns = [
    { st:'zain_student',   cl:'Class 9-A',  p:[1,1,1,0,1,1,1] },
    { st:'sara_student',   cl:'Class 9-A',  p:[1,1,0,1,1,1,1] },
    { st:'omar_student',   cl:'Class 9-B',  p:[1,0,1,1,1,0,1] },
    { st:'fatima_student', cl:'Class 9-B',  p:[1,1,1,1,1,1,1] },
    { st:'hamza_student',  cl:'Class 10-A', p:[0,1,1,1,1,1,1] },
  ];
  const today = new Date();
  for (let d=6; d>=0; d--) {
    const dt = new Date(today); dt.setDate(dt.getDate()-d);
    const dateStr = dt.toISOString().split('T')[0];
    for (const a of attPatterns) {
      await c.query(
        `INSERT INTO attendance (student_id,class_id,teacher_id,date,status) VALUES (?,?,?,?,?)`,
        [stid[a.st], cid[a.cl], tid['ali_teacher'], dateStr, a.p[6-d]?'present':'absent']
      );
    }
  }

  // ── MARKS ──────────────────────────────────────────────────────────────────
  const marksData = [
    { st:'zain_student',   subj:'Mathematics', exam:'midterm', obt:78, total:100 },
    { st:'zain_student',   subj:'Physics',     exam:'midterm', obt:82, total:100 },
    { st:'zain_student',   subj:'English',     exam:'midterm', obt:88, total:100 },
    { st:'sara_student',   subj:'Mathematics', exam:'midterm', obt:92, total:100 },
    { st:'sara_student',   subj:'Physics',     exam:'midterm', obt:85, total:100 },
    { st:'sara_student',   subj:'English',     exam:'midterm', obt:90, total:100 },
    { st:'omar_student',   subj:'Mathematics', exam:'midterm', obt:65, total:100 },
    { st:'omar_student',   subj:'Physics',     exam:'midterm', obt:70, total:100 },
    { st:'omar_student',   subj:'English',     exam:'midterm', obt:72, total:100 },
    { st:'fatima_student', subj:'Mathematics', exam:'midterm', obt:95, total:100 },
    { st:'fatima_student', subj:'Physics',     exam:'midterm', obt:91, total:100 },
    { st:'fatima_student', subj:'English',     exam:'midterm', obt:88, total:100 },
    { st:'hamza_student',  subj:'Mathematics', exam:'midterm', obt:74, total:100 },
    { st:'hamza_student',  subj:'Physics',     exam:'midterm', obt:68, total:100 },
    { st:'hamza_student',  subj:'English',     exam:'midterm', obt:80, total:100 },
  ];
  for (const m of marksData) {
    await c.query(
      `INSERT INTO marks (student_id,subject_id,teacher_id,exam_type,marks_obtained,total_marks) VALUES (?,?,?,?,?,?)`,
      [stid[m.st], sid[m.subj], tid['ali_teacher'], m.exam, m.obt, m.total]
    );
  }

  // ── FEES & PAYMENTS ────────────────────────────────────────────────────────
  const feeRows = [
    { title:'Tuition Fee — April 2026', type:'tuition', amount:5000, due:'2026-04-15', cl:'Class 9-A', year:'2025-2026', month:'April' },
    { title:'Exam Fee — Mid Term',      type:'exam',    amount:1500, due:'2026-04-20', cl:'Class 9-A', year:'2025-2026', month:'April' },
    { title:'Tuition Fee — April 2026', type:'tuition', amount:5000, due:'2026-04-15', cl:'Class 9-B', year:'2025-2026', month:'April' },
    { title:'Tuition Fee — April 2026', type:'tuition', amount:5000, due:'2026-04-15', cl:'Class 10-A',year:'2025-2026', month:'April' },
  ];
  const fid = [];
  for (const f of feeRows) {
    const [r] = await c.query(
      `INSERT INTO fees (title,fee_type,amount,due_date,class_id,academic_year,month,is_recurring) VALUES (?,?,?,?,?,?,?,1)`,
      [f.title, f.type, f.amount, f.due, cid[f.cl], f.year, f.month]
    );
    fid.push({ id:r.insertId, class:f.cl, type:f.type });
  }
  // Zain (9-A) paid tuition + exam; Sara (9-A) only paid tuition; Fatima (9-B) paid; Hamza (10-A) pending
  const paidFee = fid.find(f=>f.class==='Class 9-A'&&f.type==='tuition');
  const examFee = fid.find(f=>f.class==='Class 9-A'&&f.type==='exam');
  const fee9B   = fid.find(f=>f.class==='Class 9-B');
  const fee10A  = fid.find(f=>f.class==='Class 10-A');
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [paidFee.id, stid['zain_student'], 5000,'2026-04-10','cash','paid', uid['admin']]);
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [examFee.id, stid['zain_student'], 1500,'2026-04-10','cash','paid', uid['admin']]);
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [paidFee.id, stid['sara_student'], 5000,'2026-04-11','online','paid', uid['admin']]);
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [fee9B.id,   stid['fatima_student'],5000,'2026-04-12','cash','paid', uid['admin']]);

  // ── COMPLAINTS ─────────────────────────────────────────────────────────────
  await c.query(
    `INSERT INTO complaints (parent_id,student_id,title,description,status,admin_reply) VALUES (?,?,?,?,?,?)`,
    [paid['tariq_parent'], stid['zain_student'],
     'School Bus Arriving Late',
     'The school bus regularly arrives 15-20 minutes late in the morning, causing my child to miss the first period. This has been happening for the past 2 weeks and is affecting his studies.',
     'in_review',
     'We have noted the issue and are coordinating with the transport department. Expect resolution by end of this week.']
  );
  await c.query(
    `INSERT INTO complaints (parent_id,student_id,title,description,status,admin_reply) VALUES (?,?,?,?,?,?)`,
    [paid['nadia_parent'], stid['omar_student'],
     'Excessive Homework Load',
     'My child is getting 4-5 hours of homework daily across all subjects. This is severely affecting his sleep and health. I request a more balanced homework approach.',
     'pending', null]
  );
  await c.query(
    `INSERT INTO complaints (parent_id,student_id,title,description,status,admin_reply) VALUES (?,?,?,?,?,?)`,
    [paid['kamran_parent'], stid['hamza_student'],
     'Request for Extra Physics Coaching',
     'My son Hamza is struggling with Physics concepts. Can the school arrange extra help sessions or study groups for students who need additional academic support?',
     'resolved',
     'Extra Physics coaching has been arranged every Tuesday and Thursday from 2-3 PM. Please ask Hamza to attend starting next week. We are happy to support our students.']
  );

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  const allUserIds = Object.values(uid);
  const notifs = [
    { title:'Mid Term Results Published',    body:'Mid-term results for Class 9 and 10 are now available. Check the marks section.',             type:'marks' },
    { title:'Parent-Teacher Meeting',        body:'Annual PTM scheduled for April 30, 2026 at 10:00 AM. All parents are requested to attend.',   type:'announcement' },
    { title:'Eid Holiday Announcement',      body:'School will remain closed April 28 – May 5 for Eid holidays. Classes resume May 6.',           type:'announcement' },
    { title:'Fee Submission Reminder',       body:'Last date to submit April fees is April 25. Late fee of Rs.200 applies after deadline.',       type:'fee' },
    { title:'Science Fair 2026',             body:'Annual Science Fair on May 15, 2026. All students are encouraged to participate.',             type:'general' },
  ];
  for (const n of notifs) {
    for (const rId of allUserIds) {
      await c.query(
        `INSERT INTO notifications (recipient_id,sender_id,title,body,type,is_read) VALUES (?,?,?,?,?,0)`,
        [rId, uid['admin'], n.title, n.body, n.type]
      );
    }
  }

  // ── CONVERSATIONS & MESSAGES ───────────────────────────────────────────────
  const [cv1] = await c.query(
    `INSERT INTO conversations (type,name,created_by) VALUES ('direct',NULL,?)`, [uid['tariq_parent']]
  );
  await c.query(`INSERT INTO conversation_participants (conversation_id,user_id) VALUES (?,?),(?,?)`,
    [cv1.insertId, uid['tariq_parent'], cv1.insertId, uid['ali_teacher']]);
  for (const [sender, body] of [
    [uid['tariq_parent'], 'Assalam-o-Alaikum Sir, how is Zain performing in Mathematics?'],
    [uid['ali_teacher'],  'Walaikum Assalam! Zain scored 78/100 in mid terms. Consistent practice will help him improve further.'],
    [uid['tariq_parent'], 'JazakAllah khair. We will encourage him to study harder.'],
  ]) {
    await c.query(`INSERT INTO messages (conversation_id,sender_id,body,type) VALUES (?,?,?,'text')`,
      [cv1.insertId, sender, body]);
  }

  console.log('\n✅ All demo data seeded successfully!\n');
  await c.end();
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
