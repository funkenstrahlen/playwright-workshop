import { expect } from '@playwright/test';
import { test, User } from './database-fixtures';

test.describe('Database Reset Demo', () => {
  test('should start with initial test data', async ({ dbConnection }) => {
    // Überprüfe die initialen Testdaten
    const users = await dbConnection.all<User>(
      'SELECT * FROM users ORDER BY id',
    );

    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('John Doe');
    expect(users[0].email).toBe('john@example.com');
    expect(users[1].name).toBe('Jane Smith');
    expect(users[1].email).toBe('jane@example.com');

    console.log('📊 Initial data verified:', users);
  });

  test('should allow data modification during test', async ({
    dbConnection,
  }) => {
    // Füge einen neuen Benutzer hinzu
    await dbConnection.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      'Test User',
      'test@example.com',
    );

    // Überprüfe, dass der Benutzer hinzugefügt wurde
    const users = await dbConnection.all<User>(
      'SELECT * FROM users ORDER BY id',
    );
    expect(users).toHaveLength(3);

    const testUser = users.find((u) => u.email === 'test@example.com');
    expect(testUser).toBeDefined();
    expect(testUser?.name).toBe('Test User');

    console.log('➕ Added test user:', testUser);
  });

  test('should have reset state for next test', async ({ dbConnection }) => {
    // Da jeder Test seine eigene Datenbankverbindung bekommt (Worker-scoped),
    // sollten wir wieder bei den initialen Daten sein
    const users = await dbConnection.all<User>(
      'SELECT * FROM users ORDER BY id',
    );

    // Überprüfe, dass wir wieder nur die ursprünglichen 2 Benutzer haben
    expect(users).toHaveLength(2);
    expect(users[0].name).toBe('John Doe');
    expect(users[1].name).toBe('Jane Smith');

    // Der in Test 2 hinzugefügte Benutzer sollte NICHT mehr da sein
    const testUser = users.find((u) => u.email === 'test@example.com');
    expect(testUser).toBeUndefined();

    console.log('🔄 Database state reset verified - only initial data present');
  });

  test('should demonstrate data isolation between tests', async ({
    dbConnection,
  }) => {
    // Lösche einen ursprünglichen Benutzer
    await dbConnection.run(
      'DELETE FROM users WHERE email = ?',
      'john@example.com',
    );

    const users = await dbConnection.all<User>(
      'SELECT * FROM users ORDER BY id',
    );
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Jane Smith');

    console.log('🗑️ Deleted John Doe, remaining users:', users);
  });
});
