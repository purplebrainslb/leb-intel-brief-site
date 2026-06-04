# Lebanon Intel Brief - TODO

- [x] Initial Lebanon Daily Intelligence Brief UI (static briefing data, tabbed sections, severity indicators)
- [x] Upgrade to web-db-user template (tRPC + Manus Auth + Database)
- [x] Resolve merge conflicts from upgrade (Home.tsx, vite.config.ts)
- [x] Run db:push to sync user schema to database
- [x] Verify server starts correctly and all tests pass
- [x] Database schema for briefings (briefs, key_judgments, brief_sections, section_items, outlook_items)
- [x] DB helpers and tRPC procedures to read latest brief
- [x] POST /api/scheduled/update-brief endpoint for agent cron to push new briefs
- [x] Frontend wired to read from DB (with fallback to static data if no DB brief exists)
- [ ] Update "War intelligence brief" schedule (from original task or Management UI) to add Step B: POST to /api/scheduled/update-brief
- [x] Today's brief (June 4 2026) seeded directly into DB via seed-brief.mjs
- [ ] Update "War intelligence brief" schedule to add Step B: POST to /api/scheduled/update-brief (manual step in original task)
