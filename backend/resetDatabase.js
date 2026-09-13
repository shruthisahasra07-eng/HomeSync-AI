/**
 * HomeSync AI - Clean Database Reset Utility
 * Clears all sample/fake records and initializes clean production-ready tables.
 */
const { pool, initDatabase, initDefaultBlocks, getAllRows } = require('./database');

async function resetDatabase() {
  console.log('🧹 Starting clean HomeSync database reset on PostgreSQL / Supabase...');

  await initDatabase();

  // Cleanly truncate all tables and reset sequence IDs in PostgreSQL
  await pool.query(`
    TRUNCATE TABLE ratings, notifications, schedules, assignments, maintenance_requests, workers, users, blocks RESTART IDENTITY CASCADE;
  `);

  // Initialize community apartment blocks
  await initDefaultBlocks();

  const blocks = await getAllRows(`SELECT * FROM blocks`);
  const userCount = (await getAllRows(`SELECT id FROM users`)).length;
  const reqCount = (await getAllRows(`SELECT id FROM maintenance_requests`)).length;
  const workerCount = (await getAllRows(`SELECT id FROM workers`)).length;

  console.log('\n✅ Database reset complete:');
  console.log(`- Users: ${userCount} (clean)`);
  console.log(`- Maintenance Requests: ${reqCount} (clean)`);
  console.log(`- Workers: ${workerCount} (clean)`);
  console.log(`- Community Blocks: ${blocks.length} initialized (${blocks.map(b => b.name).join(', ')})`);
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n🚀 Clean database is ready.');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Reset failed:', err);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
