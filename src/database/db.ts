import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync('notifications.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_key TEXT UNIQUE NOT NULL,
        package_name TEXT NOT NULL,
        app_name TEXT NOT NULL,
        title TEXT,
        text TEXT,
        big_text TEXT,
        sub_text TEXT,
        timestamp INTEGER NOT NULL,
        category TEXT,
        group_key TEXT,
        channel_id TEXT,
        is_ongoing INTEGER DEFAULT 0,
        is_clearable INTEGER DEFAULT 1,
        is_read INTEGER DEFAULT 0,
        removed_at INTEGER,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications (timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_package ON notifications (package_name);
      CREATE INDEX IF NOT EXISTS idx_notifications_key ON notifications (notification_key);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

    dbInstance = db;
    return db;
  })();

  return initPromise;
}
