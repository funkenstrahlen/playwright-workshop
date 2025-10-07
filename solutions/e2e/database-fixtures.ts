import { test as base } from '@playwright/test';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface DatabaseConnection {
  db: sqlite3.Database;
  run: (sql: string, ...params: unknown[]) => Promise<sqlite3.RunResult>;
  get: <T = unknown>(
    sql: string,
    ...params: unknown[]
  ) => Promise<T | undefined>;
  all: <T = unknown>(sql: string, ...params: unknown[]) => Promise<T[]>;
  close: () => Promise<void>;
}

async function createDatabaseConnection(): Promise<DatabaseConnection> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        reject(err);
        return;
      }

      const connection: DatabaseConnection = {
        db,
        run: promisify(db.run.bind(db)),
        get: promisify(db.get.bind(db)),
        all: promisify(db.all.bind(db)),
        close: promisify(db.close.bind(db)),
      };

      resolve(connection);
    });
  });
}

export const test = base.extend<object, { dbConnection: DatabaseConnection }>({
  // Worker-Fixture (einmal pro Worker-Prozess)
  dbConnection: [
    async ({}, use) => {
      // Setup: Einmal pro Worker - Erstelle In-Memory SQLite Datenbank
      const connection = await createDatabaseConnection();

      // Erstelle Tabelle und füge Testdaten hinzu
      await connection.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Füge initiale Testdaten hinzu
      await connection.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        'John Doe',
        'john@example.com',
      );
      await connection.run(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        'Jane Smith',
        'jane@example.com',
      );

      console.log('✅ Database initialized with test data');

      // Fixture bereitstellen
      await use(connection);

      // Teardown: Nach allen Tests im Worker
      await connection.close();
      console.log('🗂️ Database connection closed');
    },
    { scope: 'worker' },
  ],
});
