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

// Enable foreign keys and WAL mode for reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema if not exists
export function initDatabase() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);
}

// Ensure database is initialized on import
initDatabase();

export default db;
