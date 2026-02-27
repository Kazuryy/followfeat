#!/usr/bin/env node
// Custom SQLite migration runner using Node.js built-in node:sqlite (Node 22+).
// Replaces `prisma migrate deploy` so the runner stage doesn't need @prisma/engines.
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rawUrl = process.env.DATABASE_URL ?? "";
const dbPath = rawUrl.replace(/^file:/, "");
if (!dbPath) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

// Ensure Prisma-compatible migrations table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  TEXT NOT NULL PRIMARY KEY,
    "checksum"            TEXT NOT NULL,
    "finished_at"         DATETIME,
    "migration_name"      TEXT NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      DATETIME,
    "started_at"          DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  );
`);

// Collect applied migration names
const applied = new Set(
  db
    .prepare(
      'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL'
    )
    .all()
    .map((r) => r.migration_name)
);

const migrationsDir = join(__dirname, "..", "prisma", "migrations");
if (!existsSync(migrationsDir)) {
  console.log("No migrations directory found, skipping.");
  db.close();
  process.exit(0);
}

const dirs = readdirSync(migrationsDir)
  .filter((d) => statSync(join(migrationsDir, d)).isDirectory())
  .sort();

let applied_count = 0;
for (const dir of dirs) {
  if (applied.has(dir)) continue;

  const sqlFile = join(migrationsDir, dir, "migration.sql");
  if (!existsSync(sqlFile)) continue;

  const sql = readFileSync(sqlFile, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  const id = randomUUID();

  try {
    db.exec(sql);
    db
      .prepare(
        `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
         VALUES (?, ?, datetime('now'), ?, 1)`
      )
      .run(id, checksum, dir);
    console.log(`  ✓ ${dir}`);
    applied_count++;
  } catch (err) {
    console.error(`  ✗ ${dir}: ${err.message}`);
    db.close();
    process.exit(1);
  }
}

if (applied_count === 0) {
  console.log("Database already up to date.");
} else {
  console.log(`Applied ${applied_count} migration(s).`);
}

db.close();
