import { v4 as uuidv4 } from 'uuid';
import { getDb, Client, Transaction, ClientWithStats } from './db';

// Client operations
export function createClient(name: string, email: string): Client {
  const db = getDb();
  const id = uuidv4();
  const shareable_uuid = uuidv4();
  
  const stmt = db.prepare(
    'INSERT INTO clients (id, name, email, shareable_uuid) VALUES (?, ?, ?, ?)'
  );
  stmt.run(id, name, email, shareable_uuid);
  
  return { id, name, email, shareable_uuid, created_at: new Date().toISOString() };
}

export function getClients(): ClientWithStats[] {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, 
      COUNT(t.id) as total_transactions,
      SUM(CASE WHEN t.status = 'uncategorized' THEN 1 ELSE 0 END) as uncategorized_count,
      SUM(CASE WHEN t.status = 'categorized' THEN 1 ELSE 0 END) as categorized_count
    FROM clients c
    LEFT JOIN transactions t ON c.id = t.client_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all() as ClientWithStats[];
}

export function getClient(id: string): Client | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
}

export function getClientByUuid(uuid: string): Client | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM clients WHERE shareable_uuid = ?').get(uuid) as Client | undefined;
}

export function deleteClient(id: string): boolean {
  const db = getDb();
  // Delete transactions first
  db.prepare('DELETE FROM transactions WHERE client_id = ?').run(id);
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  return result.changes > 0;
}

// Transaction operations
export function createTransaction(
  clientId: string,
  date: string,
  description: string,
  amount: number
): Transaction {
  const db = getDb();
  const id = uuidv4();
  
  const stmt = db.prepare(
    'INSERT INTO transactions (id, client_id, date, description, amount) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(id, clientId, date, description, amount);
  
  return {
    id, client_id: clientId, date, description, amount,
    category: null, status: 'uncategorized', categorized_at: null,
  };
}

export function getTransactionsByClient(clientId: string): Transaction[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM transactions WHERE client_id = ? ORDER BY date DESC'
  ).all(clientId) as Transaction[];
}

export function getUncategorizedByClient(clientId: string): Transaction[] {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM transactions WHERE client_id = ? AND status = 'uncategorized' ORDER BY date DESC"
  ).all(clientId) as Transaction[];
}

export function categorizeTransaction(
  transactionId: string,
  category: string,
  status: 'categorized' | 'skipped' = 'categorized'
): Transaction | undefined {
  const db = getDb();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(
    'UPDATE transactions SET category = ?, status = ?, categorized_at = ? WHERE id = ?'
  );
  stmt.run(category, status, now, transactionId);
  
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId) as Transaction | undefined;
}

export function bulkImportTransactions(
  clientId: string,
  transactions: { date: string; description: string; amount: number }[]
): number {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO transactions (id, client_id, date, description, amount) VALUES (?, ?, ?, ?, ?)'
  );
  
  let count = 0;
  const insertMany = db.transaction((rows: typeof transactions) => {
    for (const row of rows) {
      stmt.run(uuidv4(), clientId, row.date, row.description, row.amount);
      count++;
    }
  });
  
  insertMany(transactions);
  return count;
}

export function getClientStats(clientId: string) {
  const db = getDb();
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'categorized' THEN 1 ELSE 0 END) as categorized,
      SUM(CASE WHEN status = 'uncategorized' THEN 1 ELSE 0 END) as uncategorized,
      SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
      ROUND(SUM(CASE WHEN status = 'categorized' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as progress_pct
    FROM transactions WHERE client_id = ?
  `).get(clientId) as any;
  return stats;
}