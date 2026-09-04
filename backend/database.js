const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'homesync.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run SQL query with promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Helper to get single row
function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Helper to get all rows
function getAllRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Initialize tables
async function initDatabase() {
  await runQuery(`PRAGMA foreign_keys = ON;`);

  // Users table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('RESIDENT', 'ADMIN', 'WORKER')),
      block TEXT,
      flat_number TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Blocks table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      details TEXT,
      total_flats INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Workers table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      skills TEXT NOT NULL, -- JSON string array e.g. ["Plumbing", "Water Supply"]
      availability_status TEXT DEFAULT 'Available' CHECK(availability_status IN ('Available', 'Busy', 'Offline')),
      working_hours_start TEXT DEFAULT '09:00',
      working_hours_end TEXT DEFAULT '18:00',
      current_block TEXT DEFAULT 'Block A',
      rating REAL DEFAULT 4.8,
      active_jobs INTEGER DEFAULT 0,
      completed_jobs INTEGER DEFAULT 0,
      experience_years INTEGER DEFAULT 5,
      phone TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Maintenance Requests table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS maintenance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT UNIQUE NOT NULL,
      resident_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      photo_url TEXT,
      block TEXT NOT NULL,
      flat_number TEXT NOT NULL,
      category TEXT,
      subcategory TEXT,
      priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
      required_skill TEXT,
      estimated_duration INTEGER DEFAULT 45, -- in minutes
      ai_confidence INTEGER DEFAULT 90,
      ai_reason TEXT,
      status TEXT DEFAULT 'PENDING' CHECK(status IN (
        'PENDING', 'AI_ANALYZED', 'ASSIGNMENT_PENDING', 'ASSIGNED',
        'SCHEDULED', 'WORKER_ON_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REASSIGNED'
      )),
      preferred_date TEXT,
      preferred_time TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resident_id) REFERENCES users(id)
    )
  `);

  // Assignments table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      match_score INTEGER NOT NULL,
      score_breakdown TEXT NOT NULL, -- JSON string object
      assigned_by TEXT DEFAULT 'AI_RECOMMENDED',
      is_override INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    )
  `);

  // Schedules table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL UNIQUE,
      worker_id INTEGER NOT NULL,
      scheduled_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'SCHEDULED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    )
  `);

  // Notifications table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO',
      is_read INTEGER DEFAULT 0,
      request_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Ratings table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL UNIQUE,
      resident_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (resident_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    )
  `);

  await initDefaultBlocks();

  console.log('✅ SQLite Database schema initialized successfully.');
}

async function initDefaultBlocks() {
  const row = await getRow(`SELECT COUNT(*) as count FROM blocks`);
  if (!row || row.count === 0) {
    const defaultBlocks = [
      { name: 'Block A', details: 'North Wing - Towers 1 & 2', total_flats: 40 },
      { name: 'Block B', details: 'East Wing - Courtyard View', total_flats: 40 },
      { name: 'Block C', details: 'Central Wing - Garden Residences', total_flats: 48 },
      { name: 'Block D', details: 'West Wing - Sunset Boulevard', total_flats: 36 },
      { name: 'Block E', details: 'South Wing - Clubhouse Facing', total_flats: 36 },
      { name: 'Block F', details: 'Service & Executive Suites', total_flats: 24 }
    ];
    for (const b of defaultBlocks) {
      await runQuery(`INSERT OR IGNORE INTO blocks (name, details, total_flats) VALUES (?, ?, ?)`, [b.name, b.details, b.total_flats]);
    }
  }
}

module.exports = {
  db,
  runQuery,
  getRow,
  getAllRows,
  initDatabase,
  initDefaultBlocks
};
