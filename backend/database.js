const { Pool, types } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
// Load .env from backend directory first, then root directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Parse BIGINT (type id 20) as numbers
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));
// Parse NUMERIC / DECIMAL (type id 1700) as floats
types.setTypeParser(1700, (val) => (val === null ? null : parseFloat(val)));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL: DATABASE_URL environment variable is not set.');
  console.error('Please configure DATABASE_URL in your .env file.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper to convert SQLite '?' style placeholders to PostgreSQL '$1, $2...'
function convertPlaceholders(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Helper function to run SQL query with promise (handles INSERT lastID and changes)
async function runQuery(sql, params = []) {
  let pgSql = convertPlaceholders(sql.trim());
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  const hasReturning = /RETURNING/i.test(pgSql);

  // If it's an INSERT without RETURNING, append RETURNING id for lastID retrieval
  if (isInsert && !hasReturning) {
    pgSql += ' RETURNING id';
  }

  const result = await pool.query(pgSql, params);
  const lastID = (result.rows && result.rows.length > 0 && result.rows[0].id !== undefined)
    ? result.rows[0].id
    : null;

  return {
    lastID,
    changes: result.rowCount || 0,
    rowCount: result.rowCount || 0,
    rows: result.rows || []
  };
}

// Helper to get single row
async function getRow(sql, params = []) {
  const pgSql = convertPlaceholders(sql.trim());
  const result = await pool.query(pgSql, params);
  return result.rows[0] || null;
}

// Helper to get all rows
async function getAllRows(sql, params = []) {
  const pgSql = convertPlaceholders(sql.trim());
  const result = await pool.query(pgSql, params);
  return result.rows || [];
}

// Initialize PostgreSQL tables and schemas
async function initDatabase() {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK(role IN ('RESIDENT', 'ADMIN', 'WORKER')),
      block TEXT,
      flat_number TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Blocks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocks (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      details TEXT,
      total_flats INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Workers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      skills TEXT NOT NULL, -- JSON string array e.g. ["Plumbing", "Water Supply"]
      availability_status VARCHAR(20) DEFAULT 'Available' CHECK(availability_status IN ('Available', 'Busy', 'Offline')),
      working_hours_start TEXT DEFAULT '09:00',
      working_hours_end TEXT DEFAULT '18:00',
      current_block TEXT DEFAULT 'Block A',
      rating REAL DEFAULT 4.8,
      active_jobs INTEGER DEFAULT 0,
      completed_jobs INTEGER DEFAULT 0,
      experience_years INTEGER DEFAULT 5,
      phone TEXT
    );
  `);

  // Maintenance Requests table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id SERIAL PRIMARY KEY,
      ticket_code TEXT UNIQUE NOT NULL,
      resident_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      photo_url TEXT,
      block TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      category TEXT,
      subcategory TEXT,
      priority VARCHAR(20) CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
      required_skill TEXT,
      estimated_duration INTEGER DEFAULT 45, -- in minutes
      ai_confidence INTEGER DEFAULT 90,
      ai_reason TEXT,
      status VARCHAR(30) DEFAULT 'PENDING' CHECK(status IN (
        'PENDING', 'AI_ANALYZED', 'ASSIGNMENT_PENDING', 'ASSIGNED',
        'SCHEDULED', 'WORKER_ON_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REASSIGNED'
      )),
      preferred_date TEXT,
      preferred_time TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Assignments table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      match_score INTEGER NOT NULL,
      score_breakdown TEXT NOT NULL, -- JSON string object
      assigned_by TEXT DEFAULT 'AI_RECOMMENDED',
      is_override INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Schedules table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL UNIQUE REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      scheduled_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status VARCHAR(30) DEFAULT 'SCHEDULED',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Notifications table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'INFO',
      is_read INTEGER DEFAULT 0,
      request_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ratings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      request_id INTEGER NOT NULL UNIQUE REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      resident_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      feedback TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Indexes for performance
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
    CREATE INDEX IF NOT EXISTS idx_mr_resident_id ON maintenance_requests(resident_id);
    CREATE INDEX IF NOT EXISTS idx_mr_status ON maintenance_requests(status);
    CREATE INDEX IF NOT EXISTS idx_mr_ticket_code ON maintenance_requests(ticket_code);
    CREATE INDEX IF NOT EXISTS idx_assignments_request_id ON assignments(request_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_worker_id ON assignments(worker_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_request_id ON schedules(request_id);
    CREATE INDEX IF NOT EXISTS idx_schedules_worker_id ON schedules(worker_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_worker_id ON ratings(worker_id);
  `);

  await initDefaultBlocks();

  console.log('✅ PostgreSQL / Supabase Database schema initialized successfully.');
}

async function initDefaultBlocks() {
  const row = await getRow(`SELECT COUNT(*) as count FROM blocks`);
  if (!row || Number(row.count) === 0) {
    const defaultBlocks = [
      { name: 'Block A', details: 'North Wing - Towers 1 & 2', total_flats: 40 },
      { name: 'Block B', details: 'East Wing - Courtyard View', total_flats: 40 },
      { name: 'Block C', details: 'Central Wing - Garden Residences', total_flats: 48 },
      { name: 'Block D', details: 'West Wing - Sunset Boulevard', total_flats: 36 },
      { name: 'Block E', details: 'South Wing - Clubhouse Facing', total_flats: 36 },
      { name: 'Block F', details: 'Service & Executive Suites', total_flats: 24 }
    ];
    for (const b of defaultBlocks) {
      await pool.query(
        `INSERT INTO blocks (name, details, total_flats) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [b.name, b.details, b.total_flats]
      );
    }
  }
}

module.exports = {
  db: pool,
  pool,
  runQuery,
  getRow,
  getAllRows,
  initDatabase,
  initDefaultBlocks
};
