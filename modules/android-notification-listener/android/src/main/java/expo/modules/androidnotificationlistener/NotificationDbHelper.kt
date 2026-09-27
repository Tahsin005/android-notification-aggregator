package expo.modules.androidnotificationlistener

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.util.Log
import java.io.File

data class NotificationData(
  val notificationKey: String,
  val packageName: String,
  val appName: String,
  val title: String?,
  val text: String?,
  val bigText: String?,
  val subText: String?,
  val timestamp: Long,
  val category: String?,
  val groupKey: String?,
  val channelId: String?,
  val isOngoing: Boolean,
  val isClearable: Boolean,
  val isRead: Boolean = false,
  val removedAt: Long? = null,
  val createdAt: Long = System.currentTimeMillis()
)

object NotificationDbHelper {
  private const val TAG = "NotificationDbHelper"
  private const val DB_NAME = "notifications.db"
  private const val TABLE_NAME = "notifications"

  private var dbInstance: SQLiteDatabase? = null
  private val lock = Any()

  private fun getDatabase(context: Context): SQLiteDatabase? {
    synchronized(lock) {
      if (dbInstance != null && dbInstance!!.isOpen) {
        return dbInstance
      }
      return try {
        val sqliteDir = File(context.filesDir, "SQLite")
        if (!sqliteDir.exists()) {
          sqliteDir.mkdirs()
        }
        val dbFile = File(sqliteDir, DB_NAME)
        val db = SQLiteDatabase.openOrCreateDatabase(dbFile.path, null)
        db.rawQuery("PRAGMA journal_mode = WAL;", null).close()
        createTablesIfNotExist(db)
        dbInstance = db
        db
      } catch (e: Exception) {
        Log.e(TAG, "Error opening SQLite database: ${e.message}")
        null
      }
    }
  }

  private fun createTablesIfNotExist(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS $TABLE_NAME (
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
      """.trimIndent()
    )

    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON $TABLE_NAME (timestamp DESC);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_package ON $TABLE_NAME (package_name);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_key ON $TABLE_NAME (notification_key);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON $TABLE_NAME (is_read);")
  }

  fun insertOrUpdate(context: Context, data: NotificationData): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val now = System.currentTimeMillis()
      val sql = """
        INSERT INTO $TABLE_NAME (
          notification_key, package_name, app_name, title, text, big_text, sub_text,
          timestamp, category, group_key, channel_id, is_ongoing, is_clearable, is_read, removed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)
        ON CONFLICT(notification_key) DO UPDATE SET
          app_name = excluded.app_name,
          title = excluded.title,
          text = excluded.text,
          big_text = excluded.big_text,
          sub_text = excluded.sub_text,
          timestamp = excluded.timestamp,
          category = excluded.category,
          group_key = excluded.group_key,
          channel_id = excluded.channel_id,
          is_ongoing = excluded.is_ongoing,
          is_clearable = excluded.is_clearable,
          removed_at = NULL;
      """.trimIndent()

      val statement = db.compileStatement(sql)
      statement.bindString(1, data.notificationKey)
      statement.bindString(2, data.packageName)
      statement.bindString(3, data.appName)

      if (data.title != null) statement.bindString(4, data.title) else statement.bindNull(4)
      if (data.text != null) statement.bindString(5, data.text) else statement.bindNull(5)
      if (data.bigText != null) statement.bindString(6, data.bigText) else statement.bindNull(6)
      if (data.subText != null) statement.bindString(7, data.subText) else statement.bindNull(7)

      statement.bindLong(8, data.timestamp)

      if (data.category != null) statement.bindString(9, data.category) else statement.bindNull(9)
      if (data.groupKey != null) statement.bindString(10, data.groupKey) else statement.bindNull(10)
      if (data.channelId != null) statement.bindString(11, data.channelId) else statement.bindNull(11)

      statement.bindLong(12, if (data.isOngoing) 1L else 0L)
      statement.bindLong(13, if (data.isClearable) 1L else 0L)
      statement.bindLong(14, data.createdAt.takeIf { it > 0 } ?: now)

      statement.execute()
      true
    } catch (e: Exception) {
      Log.e(TAG, "Failed to insert or update notification: ${e.message}")
      false
    }
  }

  fun markRemoved(context: Context, notificationKey: String, removedAt: Long): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val values = ContentValues().apply {
        put("removed_at", removedAt)
      }
      db.update(TABLE_NAME, values, "notification_key = ?", arrayOf(notificationKey)) > 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to mark notification as removed: ${e.message}")
      false
    }
  }
}
