/**
 * One-time seed script: inserts today's Lebanon intelligence brief into the DB.
 * Run with: node seed-brief.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load env vars
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const mysql2 = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const payload = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'brief_june4_2026.json'), 'utf-8'));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seed() {
  const conn = await mysql2.createConnection(dbUrl);
  console.log('[seed] Connected to database');

  try {
    // Clear the current latest flag
    await conn.execute('UPDATE briefs SET isLatest = 0 WHERE isLatest = 1');

    // Insert the new brief
    const [briefResult] = await conn.execute(
      'INSERT INTO briefs (date, location, lastUpdated, isLatest, createdAt) VALUES (?, ?, ?, 1, NOW())',
      [payload.date, payload.location || 'Beirut, Lebanon', payload.lastUpdated]
    );
    const briefId = briefResult.insertId;
    console.log(`[seed] Inserted brief id=${briefId}`);

    // Insert key judgments
    for (let i = 0; i < payload.keyJudgments.length; i++) {
      const j = payload.keyJudgments[i];
      await conn.execute(
        'INSERT INTO key_judgments (briefId, sortOrder, title, description, severity, region) VALUES (?, ?, ?, ?, ?, ?)',
        [briefId, i, j.title, j.description, j.severity, j.region]
      );
    }
    console.log(`[seed] Inserted ${payload.keyJudgments.length} key judgments`);

    // Insert sections and items
    for (let si = 0; si < payload.sections.length; si++) {
      const section = payload.sections[si];
      const [secResult] = await conn.execute(
        'INSERT INTO brief_sections (briefId, sectionKey, title, subtitle, sortOrder) VALUES (?, ?, ?, ?, ?)',
        [briefId, section.sectionKey, section.title, section.subtitle || null, si]
      );
      const sectionId = secResult.insertId;

      for (let ii = 0; ii < section.items.length; ii++) {
        const item = section.items[ii];
        await conn.execute(
          'INSERT INTO section_items (sectionId, sortOrder, heading, content, source, severity) VALUES (?, ?, ?, ?, ?, ?)',
          [sectionId, ii, item.heading, item.content, item.source, item.severity || null]
        );
      }
      console.log(`[seed] Inserted section "${section.sectionKey}" with ${section.items.length} items`);
    }

    // Insert outlook items
    for (let i = 0; i < payload.outlook30Days.length; i++) {
      const o = payload.outlook30Days[i];
      await conn.execute(
        'INSERT INTO outlook_items (briefId, sortOrder, category, assessment, description) VALUES (?, ?, ?, ?, ?)',
        [briefId, i, o.category, o.assessment, o.description]
      );
    }
    console.log(`[seed] Inserted ${payload.outlook30Days.length} outlook items`);

    console.log('[seed] ✅ Brief seeded successfully!');
  } finally {
    await conn.end();
  }
}

seed().catch(err => {
  console.error('[seed] ❌ Error:', err.message);
  process.exit(1);
});
