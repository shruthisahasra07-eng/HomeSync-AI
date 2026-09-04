const bcrypt = require('bcryptjs');
const { runQuery, getRow, getAllRows, initDatabase } = require('../database');

async function seed() {
  console.log('🌱 Starting HomeSync AI database seeding...');
  await initDatabase();

  // Clear existing tables
  await runQuery(`DELETE FROM ratings`);
  await runQuery(`DELETE FROM notifications`);
  await runQuery(`DELETE FROM schedules`);
  await runQuery(`DELETE FROM assignments`);
  await runQuery(`DELETE FROM maintenance_requests`);
  await runQuery(`DELETE FROM workers`);
  await runQuery(`DELETE FROM users`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Users
  const resResident = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
    VALUES ('resident@homesync.demo', ?, 'Ananya Sharma', 'RESIDENT', 'Block C', 'C-304', '+91 98765 43210')
  `, [passwordHash]);
  const residentId = resResident.lastID;

  const resAdmin = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
    VALUES ('admin@homesync.demo', ?, 'Vikram Rao (Association Head)', 'ADMIN', 'Block A', 'A-101', '+91 98765 00000')
  `, [passwordHash]);
  const adminId = resAdmin.lastID;

  // Additional Resident Users for realism
  const res2 = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
    VALUES ('rahul@homesync.demo', ?, 'Rahul Mehta', 'RESIDENT', 'Block B', 'B-202', '+91 98111 22233')
  `, [passwordHash]);

  const res3 = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
    VALUES ('sneha@homesync.demo', ?, 'Sneha Patel', 'RESIDENT', 'Block D', 'D-401', '+91 98222 33344')
  `, [passwordHash]);

  const res4 = await runQuery(`
    INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
    VALUES ('aravind@homesync.demo', ?, 'Aravind Swamy', 'RESIDENT', 'Block E', 'E-105', '+91 98333 44455')
  `, [passwordHash]);

  // 2. Create Workers & Worker User accounts
  const workersData = [
    {
      name: 'Ramesh Kumar',
      email: 'worker@homesync.demo',
      skills: JSON.stringify(['Plumbing', 'Water Supply']),
      availability: 'Available',
      workStart: '09:00',
      workEnd: '18:00',
      block: 'Block C',
      rating: 4.7,
      activeJobs: 0,
      completedJobs: 42,
      exp: 7,
      phone: '+91 98989 11111'
    },
    {
      name: 'Kumar Swamy',
      email: 'kumar@homesync.demo',
      skills: JSON.stringify(['Electrical', 'Appliance']),
      availability: 'Available',
      workStart: '09:00',
      workEnd: '18:00',
      block: 'Block A',
      rating: 4.5,
      activeJobs: 1,
      completedJobs: 38,
      exp: 5,
      phone: '+91 98989 22222'
    },
    {
      name: 'Suresh Varma',
      email: 'suresh@homesync.demo',
      skills: JSON.stringify(['Plumbing', 'Water Supply']),
      availability: 'Busy',
      workStart: '08:00',
      workEnd: '17:00',
      block: 'Block D',
      rating: 4.6,
      activeJobs: 2,
      completedJobs: 51,
      exp: 8,
      phone: '+91 98989 33333'
    },
    {
      name: 'Priya Sundaram',
      email: 'priya@homesync.demo',
      skills: JSON.stringify(['Cleaning']),
      availability: 'Available',
      workStart: '08:00',
      workEnd: '16:00',
      block: 'Block B',
      rating: 4.8,
      activeJobs: 0,
      completedJobs: 64,
      exp: 4,
      phone: '+91 98989 44444'
    },
    {
      name: 'Arun Carpenter',
      email: 'arun@homesync.demo',
      skills: JSON.stringify(['Carpentry']),
      availability: 'Available',
      workStart: '09:00',
      workEnd: '18:00',
      block: 'Block E',
      rating: 4.4,
      activeJobs: 0,
      completedJobs: 29,
      exp: 6,
      phone: '+91 98989 55555'
    },
    {
      name: 'Meena Electricals',
      email: 'meena@homesync.demo',
      skills: JSON.stringify(['Electrical']),
      availability: 'Available',
      workStart: '10:00',
      workEnd: '19:00',
      block: 'Block F',
      rating: 4.9,
      activeJobs: 1,
      completedJobs: 47,
      exp: 9,
      phone: '+91 98989 66666'
    }
  ];

  const workerMap = {};
  const workerUserMap = {};

  for (const w of workersData) {
    const userRes = await runQuery(`
      INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
      VALUES (?, ?, ?, 'WORKER', ?, 'Service Desk', ?)
    `, [w.email, passwordHash, w.name, w.block, w.phone]);

    const workerRes = await runQuery(`
      INSERT INTO workers (
        user_id, name, skills, availability_status, working_hours_start, working_hours_end,
        current_block, rating, active_jobs, completed_jobs, experience_years, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userRes.lastID, w.name, w.skills, w.availability, w.workStart, w.workEnd,
      w.block, w.rating, w.activeJobs, w.completedJobs, w.exp, w.phone
    ]);

    workerMap[w.name.split(' ')[0]] = workerRes.lastID;
    workerUserMap[w.name.split(' ')[0]] = userRes.lastID;
  }

  // 3. Create Seed Maintenance Requests
  const r1 = await runQuery(`
    INSERT INTO maintenance_requests (
      ticket_code, resident_id, description, block, flat_number, category, subcategory, priority,
      required_skill, estimated_duration, ai_confidence, ai_reason, status, preferred_date, preferred_time, notes
    ) VALUES (
      'MR-1042', ?, 'Main kitchen sink drain pipe is heavily clogged causing water overflow.',
      'Block C', 'C-304', 'Plumbing', 'Drain Blockage', 'HIGH', 'Plumbing', 45, 94,
      'Continuous drainage clog may result in sink overflow and floor water damage.', 'SCHEDULED',
      'Today', '10:00 AM', 'Please arrive near kitchen entrance.'
    )
  `, [residentId]);

  const r1Id = r1.lastID;
  // Assignment & Schedule for MR-1042
  await runQuery(`
    INSERT INTO assignments (request_id, worker_id, match_score, score_breakdown, assigned_by)
    VALUES (?, ?, 96, ?, 'AI_RECOMMENDED')
  `, [
    r1Id,
    workerMap['Ramesh'],
    JSON.stringify({ skillScore: 100, availScore: 100, distanceScore: 100, workloadScore: 100, performanceScore: 94 })
  ]);

  await runQuery(`
    INSERT INTO schedules (request_id, worker_id, scheduled_date, start_time, end_time, status)
    VALUES (?, ?, 'Today', '10:00 AM', '10:45 AM', 'SCHEDULED')
  `, [r1Id, workerMap['Ramesh']]);

  // Additional requests across Blocks A-F
  const sampleRequests = [
    {
      code: 'MR-1041', resId: res2.lastID, block: 'Block B', flat: 'B-202',
      desc: 'Master bedroom ceiling fan motor humming loudly and wobbling at high speed.',
      cat: 'Electrical', subcat: 'Fan Issue', prio: 'MEDIUM', skill: 'Electrical', dur: 30, conf: 91,
      reason: 'Mechanical bearing friction detected.', status: 'COMPLETED',
      worker: workerMap['Kumar'], date: 'Yesterday', start: '02:00 PM', end: '02:30 PM', rating: 5, feedback: 'Kumar fixed the wobble in 20 minutes! Excellent service.'
    },
    {
      code: 'MR-1040', resId: res3.lastID, block: 'Block D', flat: 'D-401',
      desc: 'Main entrance wooden door lock latch sticking and jammed.',
      cat: 'Carpentry', subcat: 'Door Problem', prio: 'HIGH', skill: 'Carpentry', dur: 45, conf: 93,
      reason: 'Security entry latch obstruction.', status: 'IN_PROGRESS',
      worker: workerMap['Arun'], date: 'Today', start: '11:00 AM', end: '11:45 AM'
    },
    {
      code: 'MR-1039', resId: res4.lastID, block: 'Block E', flat: 'E-105',
      desc: 'Geyser trip switch turning off immediately after powering on in bathroom.',
      cat: 'Appliance', subcat: 'Geyser Issue', prio: 'HIGH', skill: 'Electrical', dur: 60, conf: 95,
      reason: 'Heating element grounding issue detected.', status: 'ASSIGNED',
      worker: workerMap['Meena'], date: 'Today', start: '03:00 PM', end: '04:00 PM'
    },
    {
      code: 'MR-1038', resId: residentId, block: 'Block C', flat: 'C-304',
      desc: 'Corridor garbage bin clearing requested for block 3rd floor landing.',
      cat: 'Cleaning', subcat: 'Garbage Collection', prio: 'LOW', skill: 'Cleaning', dur: 20, conf: 96,
      reason: 'Sanitation routine cleanup.', status: 'COMPLETED',
      worker: workerMap['Priya'], date: '2 days ago', start: '09:00 AM', end: '09:20 AM', rating: 5, feedback: 'Cleaned spotless.'
    },
    {
      code: 'MR-1037', resId: res3.lastID, block: 'Block D', flat: 'D-401',
      desc: 'Bathroom wall tile crack and loose grout near shower fitting.',
      cat: 'Civil / Structural', subcat: 'Tile Damage', prio: 'MEDIUM', skill: 'Civil', dur: 45, conf: 89,
      reason: 'Tile grout moisture seepage.', status: 'PENDING', worker: null
    },
    {
      code: 'MR-1036', resId: res2.lastID, block: 'Block B', flat: 'B-202',
      desc: 'No water supply in overhead tank pipe line since morning.',
      cat: 'Water Supply', subcat: 'No Water', prio: 'HIGH', skill: 'Plumbing', dur: 60, conf: 97,
      reason: 'Critical water line inflow disruption.', status: 'SCHEDULED',
      worker: workerMap['Suresh'], date: 'Today', start: '01:00 PM', end: '02:00 PM'
    }
  ];

  for (const req of sampleRequests) {
    const r = await runQuery(`
      INSERT INTO maintenance_requests (
        ticket_code, resident_id, description, block, flat_number, category, subcategory, priority,
        required_skill, estimated_duration, ai_confidence, ai_reason, status, preferred_date, preferred_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.code, req.resId, req.desc, req.block, req.flat, req.cat, req.subcat, req.prio,
      req.skill, req.dur, req.conf, req.reason, req.status, req.date || 'Today', req.start || '10:00 AM'
    ]);
    const reqId = r.lastID;

    if (req.worker) {
      await runQuery(`
        INSERT INTO assignments (request_id, worker_id, match_score, score_breakdown, assigned_by)
        VALUES (?, ?, 92, ?, 'AI_RECOMMENDED')
      `, [reqId, req.worker, JSON.stringify({ skillScore: 100, availScore: 100, distanceScore: 80, workloadScore: 80, performanceScore: 90 })]);

      await runQuery(`
        INSERT INTO schedules (request_id, worker_id, scheduled_date, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [reqId, req.worker, req.date || 'Today', req.start || '10:00 AM', req.end || '10:45 AM', req.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED']);
    }

    if (req.rating) {
      await runQuery(`
        INSERT INTO ratings (request_id, resident_id, worker_id, rating, feedback)
        VALUES (?, ?, ?, ?, ?)
      `, [reqId, req.resId, req.worker, req.rating, req.feedback]);
    }
  }

  // 4. Initial Notifications
  await runQuery(`
    INSERT INTO notifications (user_id, title, message, type, request_id)
    VALUES (?, 'Maintenance Visit Scheduled', 'Your visit for Tap Leakage is scheduled today at 10:00 AM with Ramesh.', 'SUCCESS', ?)
  `, [residentId, r1Id]);

  await runQuery(`
    INSERT INTO notifications (user_id, title, message, type, request_id)
    VALUES (?, 'New Maintenance Job Assigned', 'Tap Leakage at Block C, Flat C-304 is scheduled for 10:00 AM.', 'INFO', ?)
  `, [workerUserMap['Ramesh'], r1Id]);

  await runQuery(`
    INSERT INTO notifications (user_id, title, message, type, request_id)
    VALUES (?, 'High Priority Complaint Received', 'MR-1042 (Plumbing - Tap Leakage) auto-analyzed with 96% match score.', 'WARNING', ?)
  `, [adminId, r1Id]);

  console.log('✅ HomeSync AI database seeded successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
});
