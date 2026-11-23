import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('file:', '').trim()
  : path.resolve(__dirname, '../../dev.db');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys, WAL mode, and busy timeout for concurrent safety
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

// Initialize schema if not exists
export function initDatabase() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);
}

// Ensure database is initialized on import
initDatabase();

/**
 * Execute a unit of work inside an atomic SQLite IMMEDIATE transaction.
 * Prevents race conditions and dirty reads during concurrent operations.
 */
export function runInTransaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // rollback error ignored if transaction was already closed
    }
    throw err;
  }
}

export default db;
