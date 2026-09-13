const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { runQuery, getRow, getAllRows, initDatabase } = require('./database');
const { analyzeMaintenanceRequest } = require('./services/aiService');
const { rankEligibleWorkers } = require('./services/assignmentService');
const { calculateFeasibleSlots } = require('./services/schedulingEngine');
const { createNotification, notifyAdmins } = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'homesync_secret_key_2026';

app.use(cors());
app.use(express.json());

// Serve Static Frontend Production Assets
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await getRow(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let workerProfile = null;
    if (user.role === 'WORKER') {
      workerProfile = await getRow(`SELECT * FROM workers WHERE user_id = ?`, [user.id]);
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      block: user.block,
      flat_number: user.flat_number,
      workerId: workerProfile ? workerProfile.id : null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        block: user.block,
        flat_number: user.flat_number,
        phone: user.phone,
        workerId: workerProfile ? workerProfile.id : null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resident Self-Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, block, flat_number } = req.body;

    if (!name || !email || !password || !block || !flat_number) {
      return res.status(400).json({ error: 'Full name, email, password, apartment block, and flat number are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await getRow(`SELECT id FROM users WHERE email = ?`, [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await runQuery(`
      INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
      VALUES (?, ?, ?, 'RESIDENT', ?, ?, ?)
    `, [cleanEmail, passwordHash, name.trim(), block.trim(), flat_number.trim(), phone ? phone.trim() : null]);

    const newUserId = result.lastID;

    // Send Welcome Notification
    await createNotification(
      newUserId,
      'Welcome to HomeSync AI',
      `Your resident account for ${block}, Flat ${flat_number} is active. You can now report and track maintenance requests.`,
      'SUCCESS'
    );

    const payload = {
      id: newUserId,
      email: cleanEmail,
      name: name.trim(),
      role: 'RESIDENT',
      block: block.trim(),
      flat_number: flat_number.trim(),
      workerId: null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUserId,
        email: cleanEmail,
        name: name.trim(),
        role: 'RESIDENT',
        block: block.trim(),
        flat_number: flat_number.trim(),
        phone: phone ? phone.trim() : null,
        workerId: null
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Check whether an Administrator account exists
app.get('/api/auth/setup-status', async (req, res) => {
  try {
    const admin = await getRow(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    res.json({ hasAdmin: !!admin });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify system setup status' });
  }
});

// First-Time Administrator Setup
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const existingAdmin = await getRow(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    if (existingAdmin) {
      return res.status(403).json({ error: 'Administrator account has already been initialized.' });
    }

    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Administrator name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await runQuery(`
      INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
      VALUES (?, ?, ?, 'ADMIN', 'Administration', 'Office-01', ?)
    `, [cleanEmail, passwordHash, name.trim(), phone ? phone.trim() : null]);

    const adminId = result.lastID;

    await createNotification(
      adminId,
      'System Initialized',
      'Administrator account configured successfully. Welcome to the HomeSync AI control room.',
      'SUCCESS'
    );

    const payload = {
      id: adminId,
      email: cleanEmail,
      name: name.trim(),
      role: 'ADMIN',
      block: 'Administration',
      flat_number: 'Office-01',
      workerId: null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: adminId,
        email: cleanEmail,
        name: name.trim(),
        role: 'ADMIN',
        block: 'Administration',
        flat_number: 'Office-01',
        phone: phone ? phone.trim() : null,
        workerId: null
      }
    });
  } catch (err) {
    console.error('Admin setup error:', err);
    res.status(500).json({ error: 'Failed to setup administrator account' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getRow(`SELECT id, email, name, role, block, flat_number, phone FROM users WHERE id = ?`, [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let workerId = null;
    if (user.role === 'WORKER') {
      const worker = await getRow(`SELECT id FROM workers WHERE user_id = ?`, [user.id]);
      if (worker) workerId = worker.id;
    }

    res.json({ ...user, workerId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// -------------------------------------------------------------
// APARTMENT BLOCKS MANAGEMENT ROUTES
// -------------------------------------------------------------

app.get('/api/blocks', async (req, res) => {
  try {
    const blocks = await getAllRows(`SELECT * FROM blocks ORDER BY name ASC`);
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch apartment blocks' });
  }
});

app.post('/api/blocks', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const { name, details, total_flats } = req.body;
    if (!name) return res.status(400).json({ error: 'Block name is required' });

    const existing = await getRow(`SELECT id FROM blocks WHERE name = ?`, [name.trim()]);
    if (existing) return res.status(409).json({ error: 'A block with this name already exists' });

    const result = await runQuery(`
      INSERT INTO blocks (name, details, total_flats) VALUES (?, ?, ?)
    `, [name.trim(), details ? details.trim() : '', Number(total_flats) || 0]);

    const newBlock = await getRow(`SELECT * FROM blocks WHERE id = ?`, [result.lastID]);
    res.status(201).json(newBlock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create block' });
  }
});

app.put('/api/blocks/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const { name, details, total_flats } = req.body;
    await runQuery(`
      UPDATE blocks SET name = ?, details = ?, total_flats = ? WHERE id = ?
    `, [name.trim(), details ? details.trim() : '', Number(total_flats) || 0, req.params.id]);

    const updated = await getRow(`SELECT * FROM blocks WHERE id = ?`, [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update block' });
  }
});

app.delete('/api/blocks/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    await runQuery(`DELETE FROM blocks WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Block removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete block' });
  }
});

// -------------------------------------------------------------
// AI & MAINTENANCE REQUEST ROUTES
// -------------------------------------------------------------

app.post('/api/requests/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    const aiAnalysis = await analyzeMaintenanceRequest(description);
    res.json(aiAnalysis);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/requests/create', authenticateToken, async (req, res) => {
  try {
    const { description, block, flat_number, preferred_date, preferred_time, notes, photo_url } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const reqBlock = (block || req.user.block || '').trim();
    const reqFlat = (flat_number || req.user.flat_number || '').trim();

    if (!reqBlock || !reqFlat) {
      return res.status(400).json({ error: 'Apartment block and flat number are required.' });
    }

    const aiAnalysis = await analyzeMaintenanceRequest(description.trim());

    const countRow = await getRow(`SELECT COUNT(*) as cnt FROM maintenance_requests`);
    const ticketCode = `MR-${1001 + (countRow ? countRow.cnt : 0)}`;

    const allWorkers = await getAllRows(`SELECT * FROM workers`);
    const rankingResult = rankEligibleWorkers(allWorkers, aiAnalysis.requiredSkill, reqBlock);
    const recommendedWorker = rankingResult.recommendedWorker;

    let scheduleRecommendation = null;
    let initialStatus = 'AI_ANALYZED';

    const reqResult = await runQuery(`
      INSERT INTO maintenance_requests (
        ticket_code, resident_id, description, photo_url, block, flat_number,
        category, subcategory, priority, required_skill, estimated_duration,
        ai_confidence, ai_reason, status, preferred_date, preferred_time, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketCode, req.user.id, description.trim(), photo_url || null, reqBlock, reqFlat,
      aiAnalysis.category, aiAnalysis.subcategory, aiAnalysis.priority,
      aiAnalysis.requiredSkill, aiAnalysis.estimatedDuration, aiAnalysis.confidence,
      aiAnalysis.reason, initialStatus, preferred_date || 'Today', preferred_time || '10:00 AM', notes || null
    ]);

    const requestId = reqResult.lastID;

    if (recommendedWorker) {
      const targetWorker = allWorkers.find(w => w.id === recommendedWorker.workerId);
      if (targetWorker) {
        const existingSchedules = await getAllRows(
          `SELECT start_time, end_time FROM schedules WHERE worker_id = ? AND status != 'CANCELLED'`,
          [recommendedWorker.workerId]
        );

        scheduleRecommendation = calculateFeasibleSlots(
          targetWorker,
          existingSchedules,
          aiAnalysis.estimatedDuration,
          preferred_time || '10:00'
        );

        await runQuery(`
          INSERT INTO assignments (request_id, worker_id, match_score, score_breakdown, assigned_by)
          VALUES (?, ?, ?, ?, 'AI_RECOMMENDED')
        `, [
          requestId,
          recommendedWorker.workerId,
          recommendedWorker.matchScore,
          JSON.stringify(recommendedWorker.scoreBreakdown)
        ]);

        if (scheduleRecommendation && scheduleRecommendation.recommendedSlot) {
          const slot = scheduleRecommendation.recommendedSlot;
          await runQuery(`
            INSERT INTO schedules (request_id, worker_id, scheduled_date, start_time, end_time, status)
            VALUES (?, ?, ?, ?, ?, 'SCHEDULED')
          `, [
            requestId,
            recommendedWorker.workerId,
            preferred_date || 'Today',
            slot.startTimeFormatted,
            slot.endTimeFormatted
          ]);

          initialStatus = 'SCHEDULED';
          await runQuery(`UPDATE maintenance_requests SET status = 'SCHEDULED' WHERE id = ?`, [requestId]);
        }
      }
    }

    // Resident notification
    await createNotification(
      req.user.id,
      'Maintenance Request Received',
      `Your request ${ticketCode} for ${aiAnalysis.subcategory} has been received and analyzed by HomeSync AI.`,
      'SUCCESS',
      requestId
    );

    // Admin notification
    await notifyAdmins(
      `New ${aiAnalysis.priority} Priority Complaint (${ticketCode})`,
      `${aiAnalysis.category} complaint from ${reqBlock}, ${reqFlat}.${recommendedWorker ? ` Recommended: ${recommendedWorker.workerName} (${recommendedWorker.matchScore}% Match).` : ' Awaiting worker assignment.'}`,
      aiAnalysis.priority === 'HIGH' ? 'WARNING' : 'INFO',
      requestId
    );

    // Worker notification if assigned
    if (recommendedWorker) {
      const workerUser = await getRow(`SELECT user_id FROM workers WHERE id = ?`, [recommendedWorker.workerId]);
      if (workerUser && workerUser.user_id) {
        await createNotification(
          workerUser.user_id,
          'New Job Recommended',
          `New job ${ticketCode} (${aiAnalysis.subcategory}) at ${reqBlock}, ${reqFlat} assigned.`,
          'INFO',
          requestId
        );
      }
    }

    res.status(201).json({
      success: true,
      request: {
        id: requestId,
        ticket_code: ticketCode,
        description: description.trim(),
        block: reqBlock,
        flat_number: reqFlat,
        status: initialStatus
      },
      aiAnalysis,
      ranking: rankingResult,
      scheduleRecommendation
    });
  } catch (err) {
    console.error('Request creation error:', err);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { status, category, priority, block, search } = req.query;

    let sql = `
      SELECT mr.*, u.name as resident_name, u.phone as resident_phone,
             w.name as worker_name, w.id as worker_id,
             sch.start_time, sch.end_time, sch.scheduled_date,
             ass.match_score
      FROM maintenance_requests mr
      JOIN users u ON mr.resident_id = u.id
      LEFT JOIN assignments ass ON mr.id = ass.request_id
      LEFT JOIN workers w ON ass.worker_id = w.id
      LEFT JOIN schedules sch ON mr.id = sch.request_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'RESIDENT') {
      sql += ` AND mr.resident_id = ?`;
      params.push(req.user.id);
    } else if (req.user.role === 'WORKER') {
      const worker = await getRow(`SELECT id FROM workers WHERE user_id = ?`, [req.user.id]);
      if (worker) {
        sql += ` AND ass.worker_id = ?`;
        params.push(worker.id);
      } else {
        return res.json([]);
      }
    }

    if (status) {
      sql += ` AND mr.status = ?`;
      params.push(status);
    }
    if (category) {
      sql += ` AND mr.category = ?`;
      params.push(category);
    }
    if (priority) {
      sql += ` AND mr.priority = ?`;
      params.push(priority);
    }
    if (block) {
      sql += ` AND mr.block = ?`;
      params.push(block);
    }
    if (search) {
      sql += ` AND (mr.ticket_code LIKE ? OR mr.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY mr.created_at DESC`;

    const requests = await getAllRows(sql, params);
    res.json(requests);
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

app.get('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await getRow(`
      SELECT mr.*, u.name as resident_name, u.phone as resident_phone, u.email as resident_email
      FROM maintenance_requests mr
      JOIN users u ON mr.resident_id = u.id
      WHERE mr.id = ?
    `, [requestId]);

    if (!request) return res.status(404).json({ error: 'Maintenance request not found' });

    const assignment = await getRow(`
      SELECT ass.*, w.name as worker_name, w.rating as worker_rating, w.skills as worker_skills,
             w.current_block as worker_block, w.active_jobs as worker_active_jobs, w.phone as worker_phone
      FROM assignments ass
      JOIN workers w ON ass.worker_id = w.id
      WHERE ass.request_id = ?
      ORDER BY ass.id DESC LIMIT 1
    `, [requestId]);

    const schedule = await getRow(`
      SELECT * FROM schedules WHERE request_id = ?
    `, [requestId]);

    const rating = await getRow(`
      SELECT * FROM ratings WHERE request_id = ?
    `, [requestId]);

    const allWorkers = await getAllRows(`SELECT * FROM workers`);
    const workerRanking = rankEligibleWorkers(allWorkers, request.required_skill || 'Plumbing', request.block);

    let scheduleSlots = null;
    const targetWorker = assignment 
      ? allWorkers.find(w => w.id === assignment.worker_id)
      : (workerRanking?.recommendedWorker ? allWorkers.find(w => w.id === workerRanking.recommendedWorker.workerId) : null);

    if (targetWorker) {
      const existingSchedules = await getAllRows(
        `SELECT start_time, end_time FROM schedules WHERE worker_id = ? AND request_id != ? AND status != 'CANCELLED'`,
        [targetWorker.id, requestId]
      );
      scheduleSlots = calculateFeasibleSlots(targetWorker, existingSchedules, request.estimated_duration, request.preferred_time);
    }

    res.json({
      request,
      assignment: assignment ? {
        ...assignment,
        score_breakdown: JSON.parse(assignment.score_breakdown || '{}')
      } : null,
      schedule,
      rating,
      workerRanking,
      scheduleSlots
    });
  } catch (err) {
    console.error('Fetch request detail error:', err);
    res.status(500).json({ error: 'Failed to fetch request details' });
  }
});

app.post('/api/requests/:id/approve-assignment', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { workerId, date, startTime, endTime, isOverride } = req.body;

    const request = await getRow(`SELECT * FROM maintenance_requests WHERE id = ?`, [requestId]);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const targetWorkerId = workerId;
    const targetDate = date || 'Today';
    const targetStart = startTime || '10:00 AM';
    const targetEnd = endTime || '10:45 AM';

    const worker = await getRow(`SELECT * FROM workers WHERE id = ?`, [targetWorkerId]);
    if (!worker) return res.status(400).json({ error: 'Worker not found' });

    const allWorkers = await getAllRows(`SELECT * FROM workers`);
    const ranking = rankEligibleWorkers(allWorkers, request.required_skill, request.block);
    const workerMatch = ranking.rankedWorkers.find(w => w.workerId === targetWorkerId) || { matchScore: 90, scoreBreakdown: {} };

    await runQuery(`DELETE FROM assignments WHERE request_id = ?`, [requestId]);
    await runQuery(`
      INSERT INTO assignments (request_id, worker_id, match_score, score_breakdown, assigned_by, is_override)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      requestId,
      targetWorkerId,
      workerMatch.matchScore,
      JSON.stringify(workerMatch.scoreBreakdown),
      isOverride ? 'ADMIN_OVERRIDE' : 'AI_APPROVED',
      isOverride ? 1 : 0
    ]);

    await runQuery(`DELETE FROM schedules WHERE request_id = ?`, [requestId]);
    await runQuery(`
      INSERT INTO schedules (request_id, worker_id, scheduled_date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'SCHEDULED')
    `, [requestId, targetWorkerId, targetDate, targetStart, targetEnd]);

    await runQuery(`UPDATE maintenance_requests SET status = 'SCHEDULED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [requestId]);

    await createNotification(
      request.resident_id,
      'Maintenance Visit Confirmed',
      `Your request ${request.ticket_code} is confirmed with ${worker.name} for ${targetDate} at ${targetStart}.`,
      'SUCCESS',
      requestId
    );

    await createNotification(
      worker.user_id,
      'Job Schedule Confirmed',
      `Job ${request.ticket_code} at ${request.block}, ${request.flat_number} scheduled for ${targetStart}.`,
      'INFO',
      requestId
    );

    res.json({ success: true, message: 'Worker assignment & schedule approved successfully' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Failed to approve assignment' });
  }
});

app.put('/api/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status, notes } = req.body;

    const request = await getRow(`SELECT * FROM maintenance_requests WHERE id = ?`, [requestId]);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await runQuery(
      `UPDATE maintenance_requests SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, notes || null, requestId]
    );

    if (status === 'COMPLETED') {
      const assignment = await getRow(`SELECT worker_id FROM assignments WHERE request_id = ?`, [requestId]);
      if (assignment) {
        await runQuery(
          `UPDATE workers SET completed_jobs = completed_jobs + 1, active_jobs = CASE WHEN active_jobs > 0 THEN active_jobs - 1 ELSE 0 END, availability_status = 'Available' WHERE id = ?`,
          [assignment.worker_id]
        );
      }
      await runQuery(`UPDATE schedules SET status = 'COMPLETED' WHERE request_id = ?`, [requestId]);

      await createNotification(
        request.resident_id,
        'Maintenance Work Completed',
        `Your request ${request.ticket_code} has been marked completed by the worker. Please provide your rating!`,
        'SUCCESS',
        requestId
      );
    } else if (status === 'IN_PROGRESS') {
      const assignment = await getRow(`SELECT worker_id FROM assignments WHERE request_id = ?`, [requestId]);
      if (assignment) {
        await runQuery(`UPDATE workers SET availability_status = 'Busy' WHERE id = ?`, [assignment.worker_id]);
      }
      await createNotification(
        request.resident_id,
        'Work In Progress',
        `Worker has started repair work for request ${request.ticket_code}.`,
        'INFO',
        requestId
      );
    } else if (status === 'WORKER_ON_WAY') {
      await createNotification(
        request.resident_id,
        'Worker On The Way',
        `Worker is en route to ${request.block}, ${request.flat_number}.`,
        'INFO',
        requestId
      );
    }

    res.json({ success: true, status });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

app.post('/api/requests/:id/rate', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const assignment = await getRow(`SELECT worker_id FROM assignments WHERE request_id = ?`, [requestId]);
    if (!assignment) return res.status(400).json({ error: 'No worker assigned to this request' });

    await runQuery(`
      INSERT INTO ratings (request_id, resident_id, worker_id, rating, feedback)
      VALUES (?, ?, ?, ?, ?)
    `, [requestId, req.user.id, assignment.worker_id, rating, feedback || '']);

    const avgRow = await getRow(`SELECT AVG(rating) as avg_rating FROM ratings WHERE worker_id = ?`, [assignment.worker_id]);
    if (avgRow && avgRow.avg_rating) {
      const newRating = Math.round(avgRow.avg_rating * 10) / 10;
      await runQuery(`UPDATE workers SET rating = ? WHERE id = ?`, [newRating, assignment.worker_id]);
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// -------------------------------------------------------------
// WORKERS & NOTIFICATIONS & ANALYTICS
// -------------------------------------------------------------

app.get('/api/workers', authenticateToken, async (req, res) => {
  try {
    const workers = await getAllRows(`
      SELECT w.*, u.email, u.phone as user_phone
      FROM workers w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.rating DESC
    `);
    const parsed = workers.map(w => ({
      ...w,
      skills: JSON.parse(w.skills || '[]')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

app.post('/api/workers', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const {
      name,
      email,
      password,
      skills,
      availability_status,
      working_hours_start,
      working_hours_end,
      current_block,
      phone,
      experience_years
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Worker name and email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await getRow(`SELECT id FROM users WHERE email = ?`, [cleanEmail]);
    if (existingUser) {
      return res.status(409).json({ error: 'A user account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    // Create user account for worker login
    const userRes = await runQuery(`
      INSERT INTO users (email, password_hash, name, role, block, flat_number, phone)
      VALUES (?, ?, ?, 'WORKER', ?, 'Service Desk', ?)
    `, [cleanEmail, passwordHash, name.trim(), current_block || 'Block A', phone || null]);

    const parsedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['General Maintenance']);

    const workerRes = await runQuery(`
      INSERT INTO workers (
        user_id, name, skills, availability_status, working_hours_start, working_hours_end,
        current_block, rating, active_jobs, completed_jobs, experience_years, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 0, 0, ?, ?)
    `, [
      userRes.lastID,
      name.trim(),
      JSON.stringify(parsedSkills),
      availability_status || 'Available',
      working_hours_start || '09:00',
      working_hours_end || '18:00',
      current_block || 'Block A',
      Number(experience_years) || 3,
      phone || null
    ]);

    const createdWorker = await getRow(`SELECT * FROM workers WHERE id = ?`, [workerRes.lastID]);
    res.status(201).json({
      ...createdWorker,
      skills: parsedSkills,
      email: cleanEmail
    });
  } catch (err) {
    console.error('Create worker error:', err);
    res.status(500).json({ error: 'Failed to create worker' });
  }
});

app.put('/api/workers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const workerId = req.params.id;
    const {
      name,
      skills,
      availability_status,
      working_hours_start,
      working_hours_end,
      current_block,
      phone,
      experience_years,
      rating
    } = req.body;

    const worker = await getRow(`SELECT * FROM workers WHERE id = ?`, [workerId]);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const parsedSkills = Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : JSON.parse(worker.skills || '[]'));

    await runQuery(`
      UPDATE workers SET
        name = ?,
        skills = ?,
        availability_status = ?,
        working_hours_start = ?,
        working_hours_end = ?,
        current_block = ?,
        phone = ?,
        experience_years = ?,
        rating = ?
      WHERE id = ?
    `, [
      name ? name.trim() : worker.name,
      JSON.stringify(parsedSkills),
      availability_status || worker.availability_status,
      working_hours_start || worker.working_hours_start,
      working_hours_end || worker.working_hours_end,
      current_block || worker.current_block,
      phone !== undefined ? phone : worker.phone,
      experience_years !== undefined ? Number(experience_years) : worker.experience_years,
      rating !== undefined ? Number(rating) : worker.rating,
      workerId
    ]);

    if (worker.user_id && name) {
      await runQuery(`UPDATE users SET name = ?, phone = ? WHERE id = ?`, [name.trim(), phone || null, worker.user_id]);
    }

    const updated = await getRow(`SELECT * FROM workers WHERE id = ?`, [workerId]);
    res.json({
      ...updated,
      skills: parsedSkills
    });
  } catch (err) {
    console.error('Update worker error:', err);
    res.status(500).json({ error: 'Failed to update worker' });
  }
});

app.delete('/api/workers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });

    const workerId = req.params.id;
    const worker = await getRow(`SELECT * FROM workers WHERE id = ?`, [workerId]);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Check if worker has active assignments
    const activeAssignment = await getRow(
      `SELECT id FROM assignments ass JOIN maintenance_requests mr ON ass.request_id = mr.id WHERE ass.worker_id = ? AND mr.status IN ('ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'WORKER_ON_WAY') LIMIT 1`,
      [workerId]
    );

    if (activeAssignment) {
      // Set to Offline instead of hard deleting to preserve foreign keys
      await runQuery(`UPDATE workers SET availability_status = 'Offline' WHERE id = ?`, [workerId]);
      return res.json({ success: true, message: 'Worker marked Offline due to active assignments.' });
    }

    await runQuery(`DELETE FROM workers WHERE id = ?`, [workerId]);
    if (worker.user_id) {
      await runQuery(`DELETE FROM users WHERE id = ?`, [worker.user_id]);
    }

    res.json({ success: true, message: 'Worker removed successfully.' });
  } catch (err) {
    console.error('Delete worker error:', err);
    res.status(500).json({ error: 'Failed to remove worker' });
  }
});

app.put('/api/workers/:id/status', authenticateToken, async (req, res) => {
  try {
    const { availability_status } = req.body;
    await runQuery(`UPDATE workers SET availability_status = ? WHERE id = ?`, [availability_status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update worker status' });
  }
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await getAllRows(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await runQuery(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const totalRequests = (await getRow(`SELECT COUNT(*) as count FROM maintenance_requests`)).count;
    const pendingRequests = (await getRow(`SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN ('PENDING', 'AI_ANALYZED', 'ASSIGNMENT_PENDING')`)).count;
    const inProgressRequests = (await getRow(`SELECT COUNT(*) as count FROM maintenance_requests WHERE status IN ('ASSIGNED', 'SCHEDULED', 'WORKER_ON_WAY', 'IN_PROGRESS')`)).count;
    const completedRequests = (await getRow(`SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'COMPLETED'`)).count;
    const availableWorkers = (await getRow(`SELECT COUNT(*) as count FROM workers WHERE availability_status = 'Available'`)).count;
    const totalWorkers = (await getRow(`SELECT COUNT(*) as count FROM workers`)).count;
    const totalResidents = (await getRow(`SELECT COUNT(*) as count FROM users WHERE role = 'RESIDENT'`)).count;

    const byCategory = await getAllRows(`
      SELECT category, COUNT(*) as count FROM maintenance_requests GROUP BY category
    `);

    const byBlock = await getAllRows(`
      SELECT block, COUNT(*) as count FROM maintenance_requests GROUP BY block ORDER BY block ASC
    `);

    const byPriority = await getAllRows(`
      SELECT priority, COUNT(*) as count FROM maintenance_requests GROUP BY priority
    `);

    const workerUtilization = await getAllRows(`
      SELECT name, active_jobs, completed_jobs, rating FROM workers ORDER BY completed_jobs DESC
    `);

    const avgRatingRow = await getRow(`SELECT AVG(rating) as avg_rating FROM ratings`);
    const satisfactionScore = avgRatingRow && avgRatingRow.avg_rating ? Number(avgRatingRow.avg_rating.toFixed(1)) : 0;

    const assignedCount = (await getRow(`SELECT COUNT(*) as count FROM assignments`)).count;
    const aiMatchSuccessRate = totalRequests > 0 ? Math.round((assignedCount / totalRequests) * 100) : 0;
    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

    // Real average resolution time calculation in minutes
    let avgResolutionTimeMinutes = 0;
    const completedRows = await getAllRows(`SELECT created_at, updated_at FROM maintenance_requests WHERE status = 'COMPLETED'`);
    if (completedRows.length > 0) {
      const totalMinutes = completedRows.reduce((acc, row) => {
        const diff = Math.max(10, Math.round((new Date(row.updated_at).getTime() - new Date(row.created_at).getTime()) / 60000));
        return acc + diff;
      }, 0);
      avgResolutionTimeMinutes = Math.round(totalMinutes / completedRows.length);
    }

    res.json({
      summary: {
        totalRequests,
        pendingRequests,
        inProgressRequests,
        completedRequests,
        availableWorkers,
        totalWorkers,
        totalResidents,
        avgResolutionTimeMinutes,
        aiMatchSuccessRate,
        completionRate,
        satisfactionScore
      },
      byCategory,
      byBlock,
      byPriority,
      workerUtilization
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Single-page App Fallback Route
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
  next();
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 HomeSync AI Full-Stack Server running at http://localhost:${PORT}`);
  });
  setInterval(() => {}, 1000);
}).catch(err => {
  console.error('Failed to start server:', err);
});
