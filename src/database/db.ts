import Database from '@tauri-apps/plugin-sql';
import { migrations } from './migrations.ts';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await Database.load('sqlite:oxyelit.db');

  // roda cada statement da migration separadamente
  const statements = migrations
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await db.execute(statement + ';');
  }

  return db;
}