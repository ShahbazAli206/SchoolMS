/**
 * SchoolMS — Comprehensive Demo Data Seeder
 * Run: node seed.js
 *
 * Accounts:  password = School@123
 * Covers: Nursery, Prep, Class 1–10
 *         5 teachers, 4-5 students per class (~55 students), ~20 parents
 *         Subjects, class_teachers, materials (video + pdf), assignments,
 *         attendance, marks, fees, complaints, notifications
 */

const mysql2 = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB   = { host:'localhost', user:'root', password:'', database:'school_management_db' };
const HASH = bcrypt.hashSync('School@123', 10);

// ── Short free educational video clips (Google public test bucket, ~1-2 min) ──
const VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
];

async function seed() {
  const c = await mysql2.createConnection(DB);
  console.log('✔ Connected to MySQL');

  // ── Wipe all tables (FK-safe) ─────────────────────────────────────────────
  const wipe = [
    'complaints','marks','attendance','assignments','materials',
    'payments','fees','messages','conversation_participants','conversations',
    'notifications','otp_verifications','password_resets','sessions',
    'class_teachers','parent_student_mapping','parents','students','teachers',
    'subjects','classes','users',
  ];
  await c.query('SET FOREIGN_KEY_CHECKS=0');
  for (const t of wipe) {
    await c.query(`TRUNCATE TABLE ${t}`).catch(() => {}); // skip missing tables
  }
  await c.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('✔ Tables cleared');

  // ═══════════════════════════════════════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════════════════════════════════════
  const userRows = [
    // [name, email, phone, username, role]
    // ── Admin ──
    ['Sarah Ahmed',          'admin@schoolms.com',          '03001234500', 'admin',            'admin'],
    // ── Teachers ──
    ['Mr. Ali Hassan',       'ali.hassan@schoolms.com',     '03011110001', 'ali_teacher',      'teacher'],
    ['Ms. Ayesha Khan',      'ayesha.khan@schoolms.com',    '03011110002', 'ayesha_teacher',   'teacher'],
    ['Mr. Bilal Raza',       'bilal.raza@schoolms.com',     '03011110003', 'bilal_teacher',    'teacher'],
    ['Ms. Fatima Malik',     'fatima.malik@schoolms.com',   '03011110004', 'fatima_teacher',   'teacher'],
    ['Mr. Usman Tariq',      'usman.tariq@schoolms.com',    '03011110005', 'usman_teacher',    'teacher'],
    // ── Students (Nursery) ──
    ['Hania Mirza',          'hania@schoolms.com',          '03021110001', 'hania_s',          'student'],
    ['Zaid Rehman',          'zaid.n@schoolms.com',         '03021110002', 'zaid_n_s',         'student'],
    ['Alina Shah',           'alina.n@schoolms.com',        '03021110003', 'alina_n_s',        'student'],
    ['Bilal Asif',           'bilal.n@schoolms.com',        '03021110004', 'bilal_n_s',        'student'],
    // ── Students (Prep) ──
    ['Sara Noor',            'sara.p@schoolms.com',         '03021110005', 'sara_p_s',         'student'],
    ['Ahmed Iqbal',          'ahmed.p@schoolms.com',        '03021110006', 'ahmed_p_s',        'student'],
    ['Maryam Butt',          'maryam.p@schoolms.com',       '03021110007', 'maryam_p_s',       'student'],
    ['Faisal Khan',          'faisalkhan.prep@schoolms.com', '03021110008', 'faisal_p_s',       'student'],
    // ── Students (Class 1) ──
    ['Rania Yaseen',         'rania.c1@schoolms.com',       '03021110009', 'rania_c1_s',       'student'],
    ['Hamza Tariq',          'hamza.c1@schoolms.com',       '03021110010', 'hamza_c1_s',       'student'],
    ['Sana Baig',            'sana.c1@schoolms.com',        '03021110011', 'sana_c1_s',        'student'],
    ['Umar Farooq',          'umar.c1@schoolms.com',        '03021110012', 'umar_c1_s',        'student'],
    ['Nida Malik',           'nida.c1@schoolms.com',        '03021110013', 'nida_c1_s',        'student'],
    // ── Students (Class 2) ──
    ['Zara Hassan',          'zara.c2@schoolms.com',        '03021110014', 'zara_c2_s',        'student'],
    ['Ibrahim Ali',          'ibrahim.c2@schoolms.com',     '03021110015', 'ibrahim_c2_s',     'student'],
    ['Hira Sheikh',          'hira.c2@schoolms.com',        '03021110016', 'hira_c2_s',        'student'],
    ['Omer Khalid',          'omer.c2@schoolms.com',        '03021110017', 'omer_c2_s',        'student'],
    // ── Students (Class 3) ──
    ['Fatima Javed',         'fatima.c3@schoolms.com',      '03021110018', 'fatima_c3_s',      'student'],
    ['Hassan Mehmood',       'hassan.c3@schoolms.com',      '03021110019', 'hassan_c3_s',      'student'],
    ['Aisha Riaz',           'aisha.c3@schoolms.com',       '03021110020', 'aisha_c3_s',       'student'],
    ['Talha Nawaz',          'talha.c3@schoolms.com',       '03021110021', 'talha_c3_s',       'student'],
    ['Sadia Awan',           'sadia.c3@schoolms.com',       '03021110022', 'sadia_c3_s',       'student'],
    // ── Students (Class 4) ──
    ['Kamran Ahmed',         'kamran.c4@schoolms.com',      '03021110023', 'kamran_c4_s',      'student'],
    ['Laiba Siddiqui',       'laiba.c4@schoolms.com',       '03021110024', 'laiba_c4_s',       'student'],
    ['Asad Hussain',         'asad.c4@schoolms.com',        '03021110025', 'asad_c4_s',        'student'],
    ['Maham Iqbal',          'maham.c4@schoolms.com',       '03021110026', 'maham_c4_s',       'student'],
    // ── Students (Class 5) ──
    ['Daniyal Baig',         'daniyal.c5@schoolms.com',     '03021110027', 'daniyal_c5_s',     'student'],
    ['Areeba Malik',         'areeba.c5@schoolms.com',      '03021110028', 'areeba_c5_s',      'student'],
    ['Shahzaib Ahmed',       'shahzaib.c5@schoolms.com',    '03021110029', 'shahzaib_c5_s',    'student'],
    ['Iqra Tariq',           'iqra.c5@schoolms.com',        '03021110030', 'iqra_c5_s',        'student'],
    ['Waleed Khan',          'waleed.c5@schoolms.com',      '03021110031', 'waleed_c5_s',      'student'],
    // ── Students (Class 6) ──
    ['Rohail Zafar',         'rohail.c6@schoolms.com',      '03021110032', 'rohail_c6_s',      'student'],
    ['Aliya Chaudhry',       'aliya.c6@schoolms.com',       '03021110033', 'aliya_c6_s',       'student'],
    ['Junaid Mirza',         'junaid.c6@schoolms.com',      '03021110034', 'junaid_c6_s',      'student'],
    ['Mehwish Baig',         'mehwish.c6@schoolms.com',     '03021110035', 'mehwish_c6_s',     'student'],
    // ── Students (Class 7) ──
    ['Saad Nawaz',           'saad.c7@schoolms.com',        '03021110036', 'saad_c7_s',        'student'],
    ['Amna Rehman',          'amna.c7@schoolms.com',        '03021110037', 'amna_c7_s',        'student'],
    ['Bilal Shah',           'bilal.c7@schoolms.com',       '03021110038', 'bilal_c7_s',       'student'],
    ['Huma Malik',           'huma.c7@schoolms.com',        '03021110039', 'huma_c7_s',        'student'],
    ['Faran Sohail',         'faran.c7@schoolms.com',       '03021110040', 'faran_c7_s',       'student'],
    // ── Students (Class 8) ──
    ['Zain Aslam',           'zain.c8@schoolms.com',        '03021110041', 'zain_c8_s',        'student'],
    ['Sana Iqbal',           'sana.c8@schoolms.com',        '03021110042', 'sana_c8_s',        'student'],
    ['Omar Farhan',          'omar.c8@schoolms.com',        '03021110043', 'omar_c8_s',        'student'],
    ['Nida Arshad',          'nida.c8@schoolms.com',        '03021110044', 'nida_c8_s',        'student'],
    // ── Students (Class 9) ──
    ['Hamza Javed',          'hamza.c9@schoolms.com',       '03021110045', 'hamza_c9_s',       'student'],
    ['Fatima Butt',          'fatima.c9@schoolms.com',      '03021110046', 'fatima_c9_s',      'student'],
    ['Ali Raza',             'ali.c9@schoolms.com',         '03021110047', 'ali_c9_s',         'student'],
    ['Sara Akhtar',          'sara.c9@schoolms.com',        '03021110048', 'sara_c9_s',        'student'],
    ['Osama Qureshi',        'osama.c9@schoolms.com',       '03021110049', 'osama_c9_s',       'student'],
    // ── Students (Class 10) ──
    ['Maliha Chaudhry',      'maliha.c10@schoolms.com',     '03021110050', 'maliha_c10_s',     'student'],
    ['Danial Ahmed',         'danial.c10@schoolms.com',     '03021110051', 'danial_c10_s',     'student'],
    ['Zainab Hashmi',        'zainab.c10@schoolms.com',     '03021110052', 'zainab_c10_s',     'student'],
    ['Shahbaz Noor',         'shahbaz.c10@schoolms.com',    '03021110053', 'shahbaz_c10_s',    'student'],
    // ── Parents ──
    ['Mr. Tariq Mirza',      'tariq.p@schoolms.com',        '03031110001', 'tariq_parent',     'parent'],
    ['Mrs. Nadia Rehman',    'nadia.p@schoolms.com',        '03031110002', 'nadia_parent',     'parent'],
    ['Mr. Asif Shah',        'asif.p@schoolms.com',         '03031110003', 'asif_parent',      'parent'],
    ['Mrs. Kamila Ahmed',    'kamila.p@schoolms.com',       '03031110004', 'kamila_parent',    'parent'],
    ['Mr. Bilal Noor',       'bilal.p@schoolms.com',        '03031110005', 'bilal_parent',     'parent'],
    ['Mrs. Faiza Baig',      'faiza.p@schoolms.com',        '03031110006', 'faiza_parent',     'parent'],
    ['Mr. Hassan Malik',     'hassan.p@schoolms.com',       '03031110007', 'hassan_parent',    'parent'],
    ['Mrs. Saba Tariq',      'saba.p@schoolms.com',         '03031110008', 'saba_parent',      'parent'],
    ['Mr. Faisal Iqbal',     'faisal.p@schoolms.com',       '03031110009', 'faisal_parent',    'parent'],
    ['Mrs. Rukhsana Khan',   'rukhsana.p@schoolms.com',     '03031110010', 'rukhsana_parent',  'parent'],
    ['Mr. Imran Butt',       'imran.p@schoolms.com',        '03031110011', 'imran_parent',     'parent'],
    ['Mrs. Saima Javed',     'saima.p@schoolms.com',        '03031110012', 'saima_parent',     'parent'],
    ['Mr. Waseem Chaudhry',  'waseem.p@schoolms.com',       '03031110013', 'waseem_parent',    'parent'],
    ['Mrs. Hina Qureshi',    'hina.p@schoolms.com',         '03031110014', 'hina_parent',      'parent'],
  ];

  const uid = {};
  for (const [name, email, phone, username, role] of userRows) {
    const [r] = await c.query(
      `INSERT INTO users (name,email,phone,username,password,role,is_active) VALUES (?,?,?,?,?,?,1)`,
      [name, email, phone, username, HASH, role]
    );
    uid[username] = r.insertId;
  }
  console.log(`✔ Users inserted (${Object.keys(uid).length})`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  TEACHERS profiles
  // ═══════════════════════════════════════════════════════════════════════════
  const teacherProfiles = [
    { u:'ali_teacher',    qual:'M.Sc Mathematics',        spec:'Mathematics',           jd:'2018-04-01' },
    { u:'ayesha_teacher', qual:'M.Sc Physics',            spec:'Science & Physics',     jd:'2019-01-15' },
    { u:'bilal_teacher',  qual:'M.A English Literature',  spec:'English Language',      jd:'2020-08-01' },
    { u:'fatima_teacher', qual:'B.Sc Computer Science',   spec:'Computer Science',      jd:'2021-03-10' },
    { u:'usman_teacher',  qual:'M.A Pak Studies',         spec:'Social Studies & Urdu', jd:'2019-07-01' },
  ];
  const tid = {};
  for (const t of teacherProfiles) {
    const [r] = await c.query(
      `INSERT INTO teachers (user_id,qualification,specialization,joining_date) VALUES (?,?,?,?)`,
      [uid[t.u], t.qual, t.spec, t.jd]
    );
    tid[t.u] = r.insertId;
  }
  console.log('✔ Teacher profiles inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  CLASSES  (Nursery, Prep, Class 1-10)
  //  teacher_id in classes = users.id of the class teacher
  // ═══════════════════════════════════════════════════════════════════════════
  const classData = [
    { name:'Nursery',  section:'A', grade:'Nursery', teacher:'ali_teacher'    },
    { name:'Prep',     section:'A', grade:'Prep',    teacher:'ali_teacher'    },
    { name:'Class 1',  section:'A', grade:'Grade 1', teacher:'ali_teacher'    },
    { name:'Class 2',  section:'A', grade:'Grade 2', teacher:'ali_teacher'    },
    { name:'Class 3',  section:'A', grade:'Grade 3', teacher:'ayesha_teacher' },
    { name:'Class 4',  section:'A', grade:'Grade 4', teacher:'ayesha_teacher' },
    { name:'Class 5',  section:'A', grade:'Grade 5', teacher:'ayesha_teacher' },
    { name:'Class 6',  section:'A', grade:'Grade 6', teacher:'bilal_teacher'  },
    { name:'Class 7',  section:'A', grade:'Grade 7', teacher:'bilal_teacher'  },
    { name:'Class 8',  section:'A', grade:'Grade 8', teacher:'fatima_teacher' },
    { name:'Class 9',  section:'A', grade:'Grade 9', teacher:'fatima_teacher' },
    { name:'Class 10', section:'A', grade:'Grade 10',teacher:'usman_teacher'  },
  ];
  const cid = {};
  for (const cl of classData) {
    const [r] = await c.query(
      `INSERT INTO classes (name,section,teacher_id,academic_year) VALUES (?,?,?,?)`,
      [cl.name, cl.section, uid[cl.teacher], '2025-2026']
    );
    cid[cl.name] = r.insertId;
  }
  console.log('✔ Classes inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  SUBJECTS  (unique codes per class)
  //  teacher_id in subjects = users.id of the teaching teacher
  // ═══════════════════════════════════════════════════════════════════════════
  const subjectMatrix = [
    // [name, codeSuffix, className, teacherUsername]
    // Nursery
    ['English',         'ENG_NRS', 'Nursery',  'ali_teacher'],
    ['Mathematics',     'MTH_NRS', 'Nursery',  'ali_teacher'],
    ['General Knowledge','GK_NRS', 'Nursery',  'ali_teacher'],
    // Prep
    ['English',         'ENG_PRP', 'Prep',     'ali_teacher'],
    ['Mathematics',     'MTH_PRP', 'Prep',     'ali_teacher'],
    ['General Knowledge','GK_PRP', 'Prep',     'ali_teacher'],
    ['Urdu',            'URD_PRP', 'Prep',     'ali_teacher'],
    // Class 1
    ['English',         'ENG_C1',  'Class 1',  'ali_teacher'],
    ['Mathematics',     'MTH_C1',  'Class 1',  'ali_teacher'],
    ['Science',         'SCI_C1',  'Class 1',  'ali_teacher'],
    ['Urdu',            'URD_C1',  'Class 1',  'ali_teacher'],
    // Class 2
    ['English',         'ENG_C2',  'Class 2',  'ali_teacher'],
    ['Mathematics',     'MTH_C2',  'Class 2',  'ali_teacher'],
    ['Science',         'SCI_C2',  'Class 2',  'ali_teacher'],
    ['Urdu',            'URD_C2',  'Class 2',  'ali_teacher'],
    ['Islamiyat',       'ISL_C2',  'Class 2',  'ali_teacher'],
    // Class 3
    ['English',         'ENG_C3',  'Class 3',  'ayesha_teacher'],
    ['Mathematics',     'MTH_C3',  'Class 3',  'ayesha_teacher'],
    ['Science',         'SCI_C3',  'Class 3',  'ayesha_teacher'],
    ['Urdu',            'URD_C3',  'Class 3',  'ayesha_teacher'],
    ['Islamiyat',       'ISL_C3',  'Class 3',  'ayesha_teacher'],
    // Class 4
    ['English',         'ENG_C4',  'Class 4',  'ayesha_teacher'],
    ['Mathematics',     'MTH_C4',  'Class 4',  'ayesha_teacher'],
    ['Science',         'SCI_C4',  'Class 4',  'ayesha_teacher'],
    ['Urdu',            'URD_C4',  'Class 4',  'ayesha_teacher'],
    // Class 5
    ['English',         'ENG_C5',  'Class 5',  'ayesha_teacher'],
    ['Mathematics',     'MTH_C5',  'Class 5',  'ayesha_teacher'],
    ['Science',         'SCI_C5',  'Class 5',  'ayesha_teacher'],
    ['Social Studies',  'SS_C5',   'Class 5',  'ayesha_teacher'],
    ['Urdu',            'URD_C5',  'Class 5',  'ayesha_teacher'],
    // Class 6
    ['English',         'ENG_C6',  'Class 6',  'bilal_teacher'],
    ['Mathematics',     'MTH_C6',  'Class 6',  'bilal_teacher'],
    ['General Science', 'SCI_C6',  'Class 6',  'bilal_teacher'],
    ['Computer Science','CS_C6',   'Class 6',  'fatima_teacher'],
    ['Urdu',            'URD_C6',  'Class 6',  'usman_teacher'],
    // Class 7
    ['English',         'ENG_C7',  'Class 7',  'bilal_teacher'],
    ['Mathematics',     'MTH_C7',  'Class 7',  'bilal_teacher'],
    ['General Science', 'SCI_C7',  'Class 7',  'bilal_teacher'],
    ['Computer Science','CS_C7',   'Class 7',  'fatima_teacher'],
    ['Pakistan Studies','PKS_C7',  'Class 7',  'usman_teacher'],
    // Class 8
    ['English',         'ENG_C8',  'Class 8',  'bilal_teacher'],
    ['Mathematics',     'MTH_C8',  'Class 8',  'fatima_teacher'],
    ['Physics',         'PHY_C8',  'Class 8',  'ayesha_teacher'],
    ['Chemistry',       'CHE_C8',  'Class 8',  'ayesha_teacher'],
    ['Computer Science','CS_C8',   'Class 8',  'fatima_teacher'],
    ['Pakistan Studies','PKS_C8',  'Class 8',  'usman_teacher'],
    // Class 9
    ['English',         'ENG_C9',  'Class 9',  'bilal_teacher'],
    ['Mathematics',     'MTH_C9',  'Class 9',  'fatima_teacher'],
    ['Physics',         'PHY_C9',  'Class 9',  'ayesha_teacher'],
    ['Chemistry',       'CHE_C9',  'Class 9',  'ayesha_teacher'],
    ['Biology',         'BIO_C9',  'Class 9',  'ayesha_teacher'],
    ['Computer Science','CS_C9',   'Class 9',  'fatima_teacher'],
    // Class 10
    ['English',         'ENG_C10', 'Class 10', 'bilal_teacher'],
    ['Mathematics',     'MTH_C10', 'Class 10', 'usman_teacher'],
    ['Physics',         'PHY_C10', 'Class 10', 'ayesha_teacher'],
    ['Chemistry',       'CHE_C10', 'Class 10', 'ayesha_teacher'],
    ['Biology',         'BIO_C10', 'Class 10', 'ayesha_teacher'],
    ['Pakistan Studies','PKS_C10', 'Class 10', 'usman_teacher'],
  ];

  const sid = {};
  for (const [name, code, cls, teacher] of subjectMatrix) {
    const [r] = await c.query(
      `INSERT INTO subjects (name,code,class_id,teacher_id) VALUES (?,?,?,?)`,
      [name, code, cid[cls], uid[teacher]]
    );
    sid[code] = r.insertId;
  }
  console.log('✔ Subjects inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  CLASS_TEACHERS  (teacher ↔ class assignments)
  // ═══════════════════════════════════════════════════════════════════════════
  const ctAssignments = [
    // Class teacher role (one per class)
    { cls:'Nursery',  teacher:'ali_teacher',    role:'class_teacher' },
    { cls:'Prep',     teacher:'ali_teacher',    role:'class_teacher' },
    { cls:'Class 1',  teacher:'ali_teacher',    role:'class_teacher' },
    { cls:'Class 2',  teacher:'ali_teacher',    role:'class_teacher' },
    { cls:'Class 3',  teacher:'ayesha_teacher', role:'class_teacher' },
    { cls:'Class 4',  teacher:'ayesha_teacher', role:'class_teacher' },
    { cls:'Class 5',  teacher:'ayesha_teacher', role:'class_teacher' },
    { cls:'Class 6',  teacher:'bilal_teacher',  role:'class_teacher' },
    { cls:'Class 7',  teacher:'bilal_teacher',  role:'class_teacher' },
    { cls:'Class 8',  teacher:'fatima_teacher', role:'class_teacher' },
    { cls:'Class 9',  teacher:'fatima_teacher', role:'class_teacher' },
    { cls:'Class 10', teacher:'usman_teacher',  role:'class_teacher' },
    // Subject teacher roles (multi-class teachers)
    { cls:'Class 6',  teacher:'fatima_teacher', role:'subject_teacher' },
    { cls:'Class 7',  teacher:'fatima_teacher', role:'subject_teacher' },
    { cls:'Class 8',  teacher:'ayesha_teacher', role:'subject_teacher' },
    { cls:'Class 9',  teacher:'ayesha_teacher', role:'subject_teacher' },
    { cls:'Class 10', teacher:'ayesha_teacher', role:'subject_teacher' },
    { cls:'Class 6',  teacher:'usman_teacher',  role:'subject_teacher' },
    { cls:'Class 7',  teacher:'usman_teacher',  role:'subject_teacher' },
    { cls:'Class 8',  teacher:'bilal_teacher',  role:'subject_teacher' },
    { cls:'Class 9',  teacher:'bilal_teacher',  role:'subject_teacher' },
    { cls:'Class 10', teacher:'bilal_teacher',  role:'subject_teacher' },
    { cls:'Class 8',  teacher:'usman_teacher',  role:'subject_teacher' },
    { cls:'Class 9',  teacher:'usman_teacher',  role:'subject_teacher' },
    { cls:'Class 10', teacher:'fatima_teacher', role:'subject_teacher' },
  ];
  for (const a of ctAssignments) {
    await c.query(
      `INSERT IGNORE INTO class_teachers (class_id,teacher_id,role,is_active) VALUES (?,?,?,1)`,
      [cid[a.cls], uid[a.teacher], a.role]
    ).catch(() => {});
  }
  console.log('✔ Class-teacher assignments inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  PARENTS  profiles
  // ═══════════════════════════════════════════════════════════════════════════
  const parentProfiles = [
    { u:'tariq_parent',    occ:'Business',           addr:'House 5, Block A, Lahore' },
    { u:'nadia_parent',    occ:'Housewife',          addr:'House 12, DHA Phase 3, Lahore' },
    { u:'asif_parent',     occ:'Engineer',           addr:'Flat 7, Gulberg III, Lahore' },
    { u:'kamila_parent',   occ:'Teacher',            addr:'House 3, Johar Town, Lahore' },
    { u:'bilal_parent',    occ:'Doctor',             addr:'House 9, Model Town, Lahore' },
    { u:'faiza_parent',    occ:'Government Officer', addr:'House 22, Bahria Town, Lahore' },
    { u:'hassan_parent',   occ:'Businessman',        addr:'House 14, Garden Town, Lahore' },
    { u:'saba_parent',     occ:'Pharmacist',         addr:'Flat 2, Faisal Town, Lahore' },
    { u:'faisal_parent',   occ:'Lawyer',             addr:'House 8, Cavalry Ground, Lahore' },
    { u:'rukhsana_parent', occ:'Nurse',              addr:'House 11, Samnabad, Lahore' },
    { u:'imran_parent',    occ:'Accountant',         addr:'House 6, Iqbal Town, Lahore' },
    { u:'saima_parent',    occ:'Fashion Designer',   addr:'House 19, Cantt, Lahore' },
    { u:'waseem_parent',   occ:'Police Officer',     addr:'House 33, Gulshan-e-Ravi, Lahore' },
    { u:'hina_parent',     occ:'Dentist',            addr:'House 2, Wahdat Colony, Lahore' },
  ];
  const paid = {};
  for (const p of parentProfiles) {
    const [r] = await c.query(
      `INSERT INTO parents (user_id,occupation,address) VALUES (?,?,?)`,
      [uid[p.u], p.occ, p.addr]
    );
    paid[p.u] = r.insertId;
  }
  console.log('✔ Parent profiles inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  STUDENTS  (4-5 per class)
  //  parent_id in students = parents.id (profile id)
  // ═══════════════════════════════════════════════════════════════════════════
  let admNo = 1;
  const mkAdm = () => `ADM-2025-${String(admNo++).padStart(3,'0')}`;
  let rollNo = 1;
  const mkRoll = (cls) => `2025-${cls.replace(/\s/g,'').toUpperCase()}-${String(rollNo++).padStart(3,'0')}`;

  const studentData = [
    // [username, className, dob, parentUsername]
    // Nursery
    { u:'hania_s',       cls:'Nursery',  dob:'2020-03-12', par:'tariq_parent'    },
    { u:'zaid_n_s',      cls:'Nursery',  dob:'2020-06-22', par:'nadia_parent'    },
    { u:'alina_n_s',     cls:'Nursery',  dob:'2020-01-18', par:'asif_parent'     },
    { u:'bilal_n_s',     cls:'Nursery',  dob:'2019-11-05', par:'kamila_parent'   },
    // Prep
    { u:'sara_p_s',      cls:'Prep',     dob:'2019-04-14', par:'bilal_parent'    },
    { u:'ahmed_p_s',     cls:'Prep',     dob:'2019-08-30', par:'faiza_parent'    },
    { u:'maryam_p_s',    cls:'Prep',     dob:'2019-02-25', par:'hassan_parent'   },
    { u:'faisal_p_s',    cls:'Prep',     dob:'2019-12-10', par:'saba_parent'     },
    // Class 1
    { u:'rania_c1_s',    cls:'Class 1',  dob:'2018-05-20', par:'faisal_parent'   },
    { u:'hamza_c1_s',    cls:'Class 1',  dob:'2018-09-15', par:'rukhsana_parent' },
    { u:'sana_c1_s',     cls:'Class 1',  dob:'2018-03-08', par:'imran_parent'    },
    { u:'umar_c1_s',     cls:'Class 1',  dob:'2018-07-22', par:'saima_parent'    },
    { u:'nida_c1_s',     cls:'Class 1',  dob:'2018-11-30', par:'waseem_parent'   },
    // Class 2
    { u:'zara_c2_s',     cls:'Class 2',  dob:'2017-04-17', par:'hina_parent'     },
    { u:'ibrahim_c2_s',  cls:'Class 2',  dob:'2017-10-05', par:'tariq_parent'    },
    { u:'hira_c2_s',     cls:'Class 2',  dob:'2017-01-28', par:'nadia_parent'    },
    { u:'omer_c2_s',     cls:'Class 2',  dob:'2017-08-14', par:'asif_parent'     },
    // Class 3
    { u:'fatima_c3_s',   cls:'Class 3',  dob:'2016-06-11', par:'kamila_parent'   },
    { u:'hassan_c3_s',   cls:'Class 3',  dob:'2016-03-29', par:'bilal_parent'    },
    { u:'aisha_c3_s',    cls:'Class 3',  dob:'2016-09-02', par:'faiza_parent'    },
    { u:'talha_c3_s',    cls:'Class 3',  dob:'2016-12-19', par:'hassan_parent'   },
    { u:'sadia_c3_s',    cls:'Class 3',  dob:'2016-07-07', par:'saba_parent'     },
    // Class 4
    { u:'kamran_c4_s',   cls:'Class 4',  dob:'2015-02-23', par:'faisal_parent'   },
    { u:'laiba_c4_s',    cls:'Class 4',  dob:'2015-05-16', par:'rukhsana_parent' },
    { u:'asad_c4_s',     cls:'Class 4',  dob:'2015-10-31', par:'imran_parent'    },
    { u:'maham_c4_s',    cls:'Class 4',  dob:'2015-08-04', par:'saima_parent'    },
    // Class 5
    { u:'daniyal_c5_s',  cls:'Class 5',  dob:'2014-04-18', par:'waseem_parent'   },
    { u:'areeba_c5_s',   cls:'Class 5',  dob:'2014-11-09', par:'hina_parent'     },
    { u:'shahzaib_c5_s', cls:'Class 5',  dob:'2014-01-27', par:'tariq_parent'    },
    { u:'iqra_c5_s',     cls:'Class 5',  dob:'2014-07-13', par:'nadia_parent'    },
    { u:'waleed_c5_s',   cls:'Class 5',  dob:'2014-09-22', par:'asif_parent'     },
    // Class 6
    { u:'rohail_c6_s',   cls:'Class 6',  dob:'2013-03-06', par:'kamila_parent'   },
    { u:'aliya_c6_s',    cls:'Class 6',  dob:'2013-06-24', par:'bilal_parent'    },
    { u:'junaid_c6_s',   cls:'Class 6',  dob:'2013-10-15', par:'faiza_parent'    },
    { u:'mehwish_c6_s',  cls:'Class 6',  dob:'2013-12-01', par:'hassan_parent'   },
    // Class 7
    { u:'saad_c7_s',     cls:'Class 7',  dob:'2012-02-14', par:'saba_parent'     },
    { u:'amna_c7_s',     cls:'Class 7',  dob:'2012-05-30', par:'faisal_parent'   },
    { u:'bilal_c7_s',    cls:'Class 7',  dob:'2012-08-08', par:'rukhsana_parent' },
    { u:'huma_c7_s',     cls:'Class 7',  dob:'2012-11-20', par:'imran_parent'    },
    { u:'faran_c7_s',    cls:'Class 7',  dob:'2012-03-17', par:'saima_parent'    },
    // Class 8
    { u:'zain_c8_s',     cls:'Class 8',  dob:'2011-04-05', par:'waseem_parent'   },
    { u:'sana_c8_s',     cls:'Class 8',  dob:'2011-07-19', par:'hina_parent'     },
    { u:'omar_c8_s',     cls:'Class 8',  dob:'2011-01-25', par:'tariq_parent'    },
    { u:'nida_c8_s',     cls:'Class 8',  dob:'2011-09-11', par:'nadia_parent'    },
    // Class 9
    { u:'hamza_c9_s',    cls:'Class 9',  dob:'2010-06-03', par:'asif_parent'     },
    { u:'fatima_c9_s',   cls:'Class 9',  dob:'2010-03-21', par:'kamila_parent'   },
    { u:'ali_c9_s',      cls:'Class 9',  dob:'2010-10-08', par:'bilal_parent'    },
    { u:'sara_c9_s',     cls:'Class 9',  dob:'2010-12-14', par:'faiza_parent'    },
    { u:'osama_c9_s',    cls:'Class 9',  dob:'2010-08-26', par:'hassan_parent'   },
    // Class 10
    { u:'maliha_c10_s',  cls:'Class 10', dob:'2009-02-17', par:'saba_parent'     },
    { u:'danial_c10_s',  cls:'Class 10', dob:'2009-05-09', par:'faisal_parent'   },
    { u:'zainab_c10_s',  cls:'Class 10', dob:'2009-09-30', par:'rukhsana_parent' },
    { u:'shahbaz_c10_s', cls:'Class 10', dob:'2009-11-22', par:'imran_parent'    },
  ];

  const stid = {};
  for (const s of studentData) {
    const [r] = await c.query(
      `INSERT INTO students (user_id,class_id,roll_number,date_of_birth,address,parent_id) VALUES (?,?,?,?,?,?)`,
      [uid[s.u], cid[s.cls], mkRoll(s.cls), s.dob, 'Lahore, Pakistan', paid[s.par]]
    );
    stid[s.u] = r.insertId;

    // Also insert into parent_student_mapping (parent_id = users.id of parent)
    await c.query(
      `INSERT IGNORE INTO parent_student_mapping (parent_id,student_id) VALUES (?,?)`,
      [uid[s.par], stid[s.u]]
    ).catch(() => {});
  }
  console.log(`✔ Students inserted (${Object.keys(stid).length})`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  MATERIALS  (educational video tutorials per class group)
  // ═══════════════════════════════════════════════════════════════════════════
  const materialData = [
    // Nursery & Prep — Mr. Ali Hassan
    { title:'Learn Numbers 1-10 with Fun',    desc:'Interactive number learning for Nursery students with colorful examples.',
      url: VIDEOS[0], type:'video', teacher:'ali_teacher', cls:'Nursery', subj:'MTH_NRS' },
    { title:'Alphabet Song A to Z',            desc:'Learn the English alphabet with songs and pictures.',
      url: VIDEOS[1], type:'video', teacher:'ali_teacher', cls:'Prep', subj:'ENG_PRP' },
    // Class 1-2 — Mr. Ali Hassan
    { title:'Addition and Subtraction Basics', desc:'Basic addition and subtraction for Class 1 students.',
      url: VIDEOS[2], type:'video', teacher:'ali_teacher', cls:'Class 1', subj:'MTH_C1' },
    { title:'Introduction to Science - Living Things', desc:'What makes something alive? Basic science for beginners.',
      url: VIDEOS[3], type:'video', teacher:'ali_teacher', cls:'Class 2', subj:'SCI_C2' },
    // Class 3-5 — Ms. Ayesha Khan
    { title:'Solar System - Planets Explained',desc:'Learn about our solar system, planets, and stars.',
      url: VIDEOS[4], type:'video', teacher:'ayesha_teacher', cls:'Class 3', subj:'SCI_C3' },
    { title:'Multiplication Tables 1-10',      desc:'Master the multiplication tables with this step-by-step tutorial.',
      url: VIDEOS[5], type:'video', teacher:'ayesha_teacher', cls:'Class 4', subj:'MTH_C4' },
    { title:'Food Chain and Ecosystems',        desc:'Learn how energy flows through a food chain in nature.',
      url: VIDEOS[6], type:'video', teacher:'ayesha_teacher', cls:'Class 5', subj:'SCI_C5' },
    // Class 6-7 — Mr. Bilal Raza
    { title:'Essay Writing: How to Structure', desc:'Learn the 5-paragraph essay structure with examples.',
      url: VIDEOS[7], type:'video', teacher:'bilal_teacher', cls:'Class 6', subj:'ENG_C6' },
    { title:'Grammar: Tenses Made Simple',     desc:'Present, past and future tenses explained clearly for Class 7.',
      url: VIDEOS[0], type:'video', teacher:'bilal_teacher', cls:'Class 7', subj:'ENG_C7' },
    // Class 8 — Ms. Fatima Malik
    { title:'Computer Basics: Hardware & Software', desc:'Introduction to computer hardware components and software types.',
      url: VIDEOS[1], type:'video', teacher:'fatima_teacher', cls:'Class 8', subj:'CS_C8' },
    { title:'Introduction to Python Programming',   desc:'Beginner Python tutorial: variables, loops, and conditions.',
      url: VIDEOS[2], type:'video', teacher:'fatima_teacher', cls:'Class 9', subj:'CS_C9' },
    // Class 9-10 — Ms. Ayesha Khan (Physics)
    { title:'Newton\'s Laws of Motion',        desc:'All three Newton\'s laws explained with real-world examples.',
      url: VIDEOS[3], type:'video', teacher:'ayesha_teacher', cls:'Class 9', subj:'PHY_C9' },
    { title:'Chemical Bonding Explained',      desc:'Ionic and covalent bonds explained for Class 10 Chemistry.',
      url: VIDEOS[4], type:'video', teacher:'ayesha_teacher', cls:'Class 10', subj:'CHE_C10' },
    // Class 10 — Mr. Usman Tariq
    { title:'Pakistan Movement — Key Events',  desc:'Important events and leaders of the Pakistan Independence Movement.',
      url: VIDEOS[5], type:'video', teacher:'usman_teacher', cls:'Class 10', subj:'PKS_C10' },
    { title:'How to Write a Perfect Essay (Class 10)', desc:'Advanced essay writing techniques for board exam preparation.',
      url: VIDEOS[6], type:'video', teacher:'bilal_teacher', cls:'Class 10', subj:'ENG_C10' },
  ];

  for (const m of materialData) {
    await c.query(
      `INSERT INTO materials (title,description,file_url,file_type,file_size,teacher_id,class_id,subject_id) VALUES (?,?,?,?,?,?,?,?)`,
      [m.title, m.desc, m.url, m.type, 0, uid[m.teacher], cid[m.cls], sid[m.subj]]
    );
  }
  console.log('✔ Materials (videos) inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  ASSIGNMENTS  (2 per teacher per class for 4 key classes)
  // ═══════════════════════════════════════════════════════════════════════════
  const today = new Date();
  const future = (days) => { const d = new Date(today); d.setDate(d.getDate()+days); return d.toISOString().split('T')[0]; };
  const past   = (days) => { const d = new Date(today); d.setDate(d.getDate()-days); return d.toISOString().split('T')[0]; };

  const assignData = [
    { teacher:'ali_teacher',    cls:'Class 2', subj:'MTH_C2',  title:'Chapter 3 Exercise — Addition',    desc:'Complete Exercise 3.1 to 3.5 from textbook. Show all working.', due: future(5) },
    { teacher:'ali_teacher',    cls:'Class 2', subj:'ENG_C2',  title:'Write 10 Sentences',                desc:'Write 10 sentences using the new vocabulary words from Unit 4.', due: future(7) },
    { teacher:'ayesha_teacher', cls:'Class 5', subj:'SCI_C5',  title:'Food Chain Diagram',                desc:'Draw and label a complete food chain with at least 5 organisms.', due: future(4) },
    { teacher:'ayesha_teacher', cls:'Class 5', subj:'MTH_C5',  title:'Fractions Practice',               desc:'Solve all problems from Chapter 5, Fractions. Write steps clearly.', due: future(6) },
    { teacher:'bilal_teacher',  cls:'Class 7', subj:'ENG_C7',  title:'Essay: My Role Model',             desc:'Write a 300-word essay about your role model and why they inspire you.', due: future(8) },
    { teacher:'bilal_teacher',  cls:'Class 7', subj:'ENG_C7',  title:'Grammar Worksheet — Tenses',       desc:'Complete the tense worksheet pages 45-50 in your grammar book.', due: future(3) },
    { teacher:'fatima_teacher', cls:'Class 9', subj:'CS_C9',   title:'Python: Print Patterns',           desc:'Write Python programs to print 5 different star patterns using loops.', due: future(10) },
    { teacher:'fatima_teacher', cls:'Class 9', subj:'MTH_C9',  title:'Algebra — Quadratic Equations',    desc:'Solve all quadratic equations from Chapter 7. Show factorization steps.', due: future(5) },
    { teacher:'ayesha_teacher', cls:'Class 10',subj:'PHY_C10', title:'Numericals: Newton\'s Laws',       desc:'Solve numerical problems 1-15 from Chapter 4 on Newton\'s Laws.', due: future(7) },
    { teacher:'usman_teacher',  cls:'Class 10',subj:'PKS_C10', title:'Essay: Quaid-e-Azam',              desc:'Write a 500-word essay on the leadership qualities of Quaid-e-Azam.', due: future(9) },
  ];
  for (const a of assignData) {
    await c.query(
      `INSERT INTO assignments (title,description,teacher_id,class_id,subject_id,due_date) VALUES (?,?,?,?,?,?)`,
      [a.title, a.desc, uid[a.teacher], cid[a.cls], sid[a.subj], a.due]
    );
  }
  console.log('✔ Assignments inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  ATTENDANCE  (last 7 school days for Class 9 and Class 10 students)
  // ═══════════════════════════════════════════════════════════════════════════
  const attStudents = [
    { u:'hamza_c9_s',   cls:'Class 9',  teacher:'fatima_teacher', p:[1,1,1,0,1,1,1] },
    { u:'fatima_c9_s',  cls:'Class 9',  teacher:'fatima_teacher', p:[1,1,1,1,1,1,1] },
    { u:'ali_c9_s',     cls:'Class 9',  teacher:'fatima_teacher', p:[0,1,1,1,1,0,1] },
    { u:'sara_c9_s',    cls:'Class 9',  teacher:'fatima_teacher', p:[1,0,1,1,1,1,1] },
    { u:'osama_c9_s',   cls:'Class 9',  teacher:'fatima_teacher', p:[1,1,0,1,1,1,1] },
    { u:'maliha_c10_s', cls:'Class 10', teacher:'usman_teacher',  p:[1,1,1,1,0,1,1] },
    { u:'danial_c10_s', cls:'Class 10', teacher:'usman_teacher',  p:[1,1,1,1,1,1,1] },
    { u:'zainab_c10_s', cls:'Class 10', teacher:'usman_teacher',  p:[1,1,1,0,1,1,1] },
    { u:'shahbaz_c10_s',cls:'Class 10', teacher:'usman_teacher',  p:[0,1,1,1,1,1,1] },
  ];
  for (let d = 6; d >= 0; d--) {
    const dt = new Date(today); dt.setDate(dt.getDate() - d);
    const dateStr = dt.toISOString().split('T')[0];
    for (const a of attStudents) {
      await c.query(
        `INSERT IGNORE INTO attendance (student_id,class_id,teacher_id,date,status) VALUES (?,?,?,?,?)`,
        [stid[a.u], cid[a.cls], uid[a.teacher], dateStr, a.p[6-d] ? 'present' : 'absent']
      );
    }
  }
  console.log('✔ Attendance inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  MARKS  (mid-term for Class 9 students)
  //  columns: marks (not marks_obtained), max_marks (not total_marks)
  // ═══════════════════════════════════════════════════════════════════════════
  const marksData = [
    { st:'hamza_c9_s',   subj:'MTH_C9', teacher:'fatima_teacher', marks:78, max:100, exam:'midterm', date: past(20) },
    { st:'hamza_c9_s',   subj:'PHY_C9', teacher:'ayesha_teacher', marks:82, max:100, exam:'midterm', date: past(20) },
    { st:'hamza_c9_s',   subj:'ENG_C9', teacher:'bilal_teacher',  marks:88, max:100, exam:'midterm', date: past(20) },
    { st:'fatima_c9_s',  subj:'MTH_C9', teacher:'fatima_teacher', marks:92, max:100, exam:'midterm', date: past(20) },
    { st:'fatima_c9_s',  subj:'PHY_C9', teacher:'ayesha_teacher', marks:85, max:100, exam:'midterm', date: past(20) },
    { st:'fatima_c9_s',  subj:'ENG_C9', teacher:'bilal_teacher',  marks:94, max:100, exam:'midterm', date: past(20) },
    { st:'ali_c9_s',     subj:'MTH_C9', teacher:'fatima_teacher', marks:65, max:100, exam:'midterm', date: past(20) },
    { st:'ali_c9_s',     subj:'PHY_C9', teacher:'ayesha_teacher', marks:70, max:100, exam:'midterm', date: past(20) },
    { st:'ali_c9_s',     subj:'ENG_C9', teacher:'bilal_teacher',  marks:72, max:100, exam:'midterm', date: past(20) },
    { st:'sara_c9_s',    subj:'MTH_C9', teacher:'fatima_teacher', marks:89, max:100, exam:'midterm', date: past(20) },
    { st:'sara_c9_s',    subj:'PHY_C9', teacher:'ayesha_teacher', marks:91, max:100, exam:'midterm', date: past(20) },
    { st:'sara_c9_s',    subj:'ENG_C9', teacher:'bilal_teacher',  marks:88, max:100, exam:'midterm', date: past(20) },
    { st:'osama_c9_s',   subj:'MTH_C9', teacher:'fatima_teacher', marks:74, max:100, exam:'midterm', date: past(20) },
    { st:'osama_c9_s',   subj:'PHY_C9', teacher:'ayesha_teacher', marks:68, max:100, exam:'midterm', date: past(20) },
    { st:'osama_c9_s',   subj:'ENG_C9', teacher:'bilal_teacher',  marks:80, max:100, exam:'midterm', date: past(20) },
    // Class 10
    { st:'maliha_c10_s', subj:'PHY_C10',teacher:'ayesha_teacher', marks:86, max:100, exam:'midterm', date: past(20) },
    { st:'danial_c10_s', subj:'MTH_C10',teacher:'usman_teacher',  marks:78, max:100, exam:'midterm', date: past(20) },
    { st:'zainab_c10_s', subj:'ENG_C10',teacher:'bilal_teacher',  marks:93, max:100, exam:'midterm', date: past(20) },
    { st:'shahbaz_c10_s',subj:'CHE_C10',teacher:'ayesha_teacher', marks:71, max:100, exam:'midterm', date: past(20) },
  ];
  for (const m of marksData) {
    await c.query(
      `INSERT INTO marks (student_id,subject_id,teacher_id,exam_type,marks_obtained,total_marks) VALUES (?,?,?,?,?,?)`,
      [stid[m.st], sid[m.subj], uid[m.teacher], m.exam, m.marks, m.max]
    );
  }
  console.log('✔ Marks inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  FEES  (monthly tuition for each class)
  // ═══════════════════════════════════════════════════════════════════════════
  const feeAmounts = {
    'Nursery':  2500, 'Prep': 2500,
    'Class 1':  3000, 'Class 2': 3000, 'Class 3': 3500,
    'Class 4':  3500, 'Class 5': 3500,
    'Class 6':  4000, 'Class 7': 4000,
    'Class 8':  4500, 'Class 9': 4500, 'Class 10': 5000,
  };
  const fid = {};
  for (const [cls, amount] of Object.entries(feeAmounts)) {
    const [r] = await c.query(
      `INSERT INTO fees (title,fee_type,amount,due_date,class_id,academic_year,month,is_recurring) VALUES (?,?,?,?,?,?,?,1)`,
      [`Tuition Fee — May 2026 (${cls})`, 'tuition', amount, '2026-05-25', cid[cls], '2025-2026', 'May']
    );
    fid[cls] = r.insertId;
  }
  // Exam fee for Class 9 and 10
  const [ef9] = await c.query(
    `INSERT INTO fees (title,fee_type,amount,due_date,class_id,academic_year,month) VALUES (?,?,?,?,?,?,?)`,
    ['Annual Exam Fee (Class 9)', 'exam', 2000, '2026-05-20', cid['Class 9'], '2025-2026', 'May']
  );
  const [ef10] = await c.query(
    `INSERT INTO fees (title,fee_type,amount,due_date,class_id,academic_year,month) VALUES (?,?,?,?,?,?,?)`,
    ['Annual Exam Fee (Class 10)', 'exam', 2500, '2026-05-20', cid['Class 10'], '2025-2026', 'May']
  );

  // Sample payments
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [fid['Class 9'], stid['hamza_c9_s'],  4500, '2026-05-05', 'cash',   'paid', uid['admin']]);
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [fid['Class 9'], stid['fatima_c9_s'], 4500, '2026-05-06', 'online', 'paid', uid['admin']]);
  await c.query(`INSERT INTO payments (fee_id,student_id,amount_paid,paid_date,payment_method,status,collected_by) VALUES (?,?,?,?,?,?,?)`,
    [fid['Class 10'],stid['maliha_c10_s'],5000, '2026-05-04', 'cash',   'paid', uid['admin']]);
  console.log('✔ Fees & Payments inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  COMPLAINTS
  // ═══════════════════════════════════════════════════════════════════════════
  await c.query(
    `INSERT INTO complaints (submitter_id,parent_id,student_id,complaint_type,title,description,status,admin_reply) VALUES (?,?,?,?,?,?,?,?)`,
    [uid['asif_parent'], uid['asif_parent'], stid['hamza_c9_s'],
     'parent_to_school', 'School Bus Arriving Late',
     'The school bus has been arriving 20 minutes late every day for the past two weeks. My son is missing the first period.',
     'in_review', 'We have contacted the transport department. Issue will be resolved by next Monday.']
  );
  await c.query(
    `INSERT INTO complaints (submitter_id,parent_id,student_id,complaint_type,title,description,status) VALUES (?,?,?,?,?,?,?)`,
    [uid['nadia_parent'], uid['nadia_parent'], stid['zara_c2_s'],
     'parent_to_school', 'Heavy Bag Weight Issue',
     'My daughter Zara is carrying a very heavy bag every day. I request the school to allow students to leave some books in class.',
     'pending']
  );
  await c.query(
    `INSERT INTO complaints (submitter_id,parent_id,student_id,complaint_type,title,description,status,admin_reply) VALUES (?,?,?,?,?,?,?,?)`,
    [uid['kamila_parent'], uid['kamila_parent'], stid['fatima_c9_s'],
     'parent_to_school', 'Request for Extra Physics Help',
     'Fatima is struggling with Physics. Could the school arrange extra coaching sessions for Class 9?',
     'resolved', 'Extra Physics coaching has been arranged every Wednesday from 2-3 PM. Fatima has been enrolled.']
  );
  console.log('✔ Complaints inserted');

  // ═══════════════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS  (broadcast to all users)
  // ═══════════════════════════════════════════════════════════════════════════
  const allUserIds = Object.values(uid);
  const notifs = [
    { title:'Mid Term Results Published',    body:'Mid-term results for Classes 9 and 10 are now available in the marks section.', type:'marks' },
    { title:'Parent-Teacher Meeting',        body:'Annual PTM scheduled for May 20, 2026 at 10:00 AM. All parents are requested to attend.', type:'announcement' },
    { title:'Summer Holiday Announcement',   body:'School will remain closed May 27 – June 15 for summer vacations. Classes resume June 16.', type:'announcement' },
    { title:'Fee Submission Reminder',       body:'Last date to submit May fees is May 25. Late fee of Rs.200 will be charged after the deadline.', type:'fee' },
    { title:'Annual Science Fair 2026',      body:'Annual Science Fair on June 5, 2026. Students are encouraged to participate. Register by May 20.', type:'general' },
    { title:'New Study Materials Available', body:'Teachers have uploaded new video tutorials. Check the Materials section in your portal.', type:'general' },
  ];
  for (const n of notifs) {
    for (const rId of allUserIds) {
      await c.query(
        `INSERT INTO notifications (recipient_id,sender_id,title,body,type,is_read) VALUES (?,?,?,?,?,0)`,
        [rId, uid['admin'], n.title, n.body, n.type]
      );
    }
  }
  console.log('✔ Notifications inserted');

  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   ✅  All demo data seeded successfully!             ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Login credentials (all accounts):                  ║');
  console.log('║    Password:  School@123                             ║');
  console.log('║    Admin:     admin@schoolms.com                     ║');
  console.log('║    Teacher 1: ali.hassan@schoolms.com                ║');
  console.log('║    Teacher 2: ayesha.khan@schoolms.com               ║');
  console.log('║    Teacher 3: bilal.raza@schoolms.com                ║');
  console.log('║    Teacher 4: fatima.malik@schoolms.com              ║');
  console.log('║    Teacher 5: usman.tariq@schoolms.com               ║');
  console.log('║    Student:   hamza.c9@schoolms.com                  ║');
  console.log('║    Parent:    asif.p@schoolms.com                    ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await c.end();
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
