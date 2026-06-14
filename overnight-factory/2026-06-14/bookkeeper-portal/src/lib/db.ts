import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'bookkeeper.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      shareable_uuid TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'uncategorized',
      categorized_at TEXT,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_clients_uuid ON clients(shareable_uuid);
  `);
}

export interface Client {
  id: string;
  name: string;
  email: string;
  shareable_uuid: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  status: 'uncategorized' | 'categorized' | 'skipped';
  categorized_at: string | null;
}

export interface ClientWithStats extends Client {
  total_transactions: number;
  uncategorized_count: number;
  categorized_count: number;
}