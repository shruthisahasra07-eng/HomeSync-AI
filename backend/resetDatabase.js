/**
 * HomeSync AI - Clean Database Reset Utility
 * Clears all sample/fake records and initializes clean production-ready tables.
 */
const { runQuery, initDatabase, initDefaultBlocks, getAllRows } = require('./database');

async function resetDatabase() {
  console.log('🧹 Starting clean HomeSync database reset...');

  await initDatabase();

  // Disable foreign keys temporarily for clean wipe
  await runQuery(`PRAGMA foreign_keys = OFF;`);

  // Clear all data tables
  await runQuery(`DELETE FROM ratings;`);
  await runQuery(`DELETE FROM notifications;`);
  await runQuery(`DELETE FROM schedules;`);
  await runQuery(`DELETE FROM assignments;`);
  await runQuery(`DELETE FROM maintenance_requests;`);
  await runQuery(`DELETE FROM workers;`);
  await runQuery(`DELETE FROM users;`);
  await runQuery(`DELETE FROM blocks;`);

  // Reset sqlite autoincrement sequences
  await runQuery(`DELETE FROM sqlite_sequence WHERE name IN ('ratings', 'notifications', 'schedules', 'assignments', 'maintenance_requests', 'workers', 'users', 'blocks');`);

  await runQuery(`PRAGMA foreign_keys = ON;`);

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
