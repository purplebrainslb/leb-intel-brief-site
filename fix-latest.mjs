import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const mysql2 = require('mysql2/promise');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error('DATABASE_URL not set'); process.exit(1); }

async function run() {
  const conn = await mysql2.createConnection(dbUrl);
  
  // Check current state
  const [rows] = await conn.query('SELECT id, date, isLatest FROM briefs ORDER BY id DESC');
  console.log('Current briefs:');
  for (const r of rows) {
    console.log(`  id=${r.id}, date="${r.date}", isLatest=${r.isLatest}`);
  }
  
  // Fix: set all to 0, then set 90001 to 1
  await conn.execute('UPDATE briefs SET isLatest = 0');
  await conn.execute('UPDATE briefs SET isLatest = 1 WHERE id = 90001');
  console.log('\nFixed: set id=90001 as latest');
  
  // Verify
  const [rows2] = await conn.query('SELECT id, date, isLatest FROM briefs ORDER BY id DESC');
  console.log('\nAfter fix:');
  for (const r of rows2) {
    console.log(`  id=${r.id}, date="${r.date}", isLatest=${r.isLatest}`);
  }
  
  await conn.end();
}
run().catch(err => { console.error(err); process.exit(1); });
