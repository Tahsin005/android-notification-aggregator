package expo.modules.androidnotificationlistener

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteDatabaseCorruptException
import android.util.Log
import java.io.File
import java.util.Calendar

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
  val interceptedInDnd: Boolean = false,
  val removedAt: Long? = null,
  val createdAt: Long = System.currentTimeMillis()
)

object NotificationDbHelper {
  private const val TAG = "NotificationDbHelper"
  private const val DB_NAME = "notifications.db"
  private const val TABLE_NOTIFICATIONS = "notifications"
  private const val TABLE_SETTINGS = "app_settings"

  private var dbInstance: SQLiteDatabase? = null
  private val lock = Any()

  private fun getDatabase(context: Context): SQLiteDatabase? {
    synchronized(lock) {
      if (dbInstance != null && dbInstance!!.isOpen) {
        return dbInstance
      }
      return openOrRepairDatabase(context)
    }
  }

  private fun openOrRepairDatabase(context: Context): SQLiteDatabase? {
    val sqliteDir = File(context.filesDir, "SQLite")
    if (!sqliteDir.exists()) {
      sqliteDir.mkdirs()
    }
    val dbFile = File(sqliteDir, DB_NAME)

    // Attempt 1: Open existing database and verify integrity
    try {
      if (dbFile.exists()) {
        val db = SQLiteDatabase.openOrCreateDatabase(dbFile.path, null)
        if (isDatabaseHealthy(db)) {
          configureAndInit(db)
          dbInstance = db
          return db
        } else {
          Log.w(TAG, "Database failed health check (corrupted). Deleting and recovering fresh database...")
          try { db.close() } catch (_: Exception) {}
          wipeDatabaseFiles(sqliteDir)
        }
      }
    } catch (e: SQLiteDatabaseCorruptException) {
      Log.e(TAG, "Caught SQLiteDatabaseCorruptException. Wiping corrupt DB files...", e)
      wipeDatabaseFiles(sqliteDir)
    } catch (e: Exception) {
      Log.e(TAG, "Error opening existing SQLite database: ${e.message}. Wiping and re-initializing...", e)
      wipeDatabaseFiles(sqliteDir)
    }

    // Attempt 2: Create a fresh healthy database
    return try {
      val db = SQLiteDatabase.openOrCreateDatabase(dbFile.path, null)
      configureAndInit(db)
      dbInstance = db
      Log.i(TAG, "Successfully initialized clean SQLite database")
      db
    } catch (e: Exception) {
      Log.e(TAG, "Critical error opening SQLite database: ${e.message}", e)
      null
    }
  }

  private fun isDatabaseHealthy(db: SQLiteDatabase): Boolean {
    return try {
      db.rawQuery("PRAGMA quick_check(1);", null).use { cursor ->
        if (cursor.moveToFirst()) {
          val result = cursor.getString(0)
          result.equals("ok", ignoreCase = true)
        } else {
          false
        }
      }
    } catch (e: Exception) {
      Log.w(TAG, "PRAGMA quick_check failed: ${e.message}")
      false
    }
  }

  private fun wipeDatabaseFiles(sqliteDir: File) {
    try {
      File(sqliteDir, DB_NAME).delete()
      File(sqliteDir, "$DB_NAME-wal").delete()
      File(sqliteDir, "$DB_NAME-shm").delete()
      File(sqliteDir, "$DB_NAME-journal").delete()
      Log.i(TAG, "Wiped corrupt database files from ${sqliteDir.path}")
    } catch (e: Exception) {
      Log.e(TAG, "Failed wiping DB files: ${e.message}")
    }
  }

  private fun configureAndInit(db: SQLiteDatabase) {
    try {
      db.enableWriteAheadLogging()
      db.execSQL("PRAGMA busy_timeout = 5000;")
      db.execSQL("PRAGMA synchronous = NORMAL;")
    } catch (e: Exception) {
      Log.w(TAG, "Could not set WAL or PRAGMAs: ${e.message}")
    }
    createTablesIfNotExist(db)
  }

  private fun createTablesIfNotExist(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS $TABLE_NOTIFICATIONS (
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
        intercepted_in_dnd INTEGER DEFAULT 0,
        removed_at INTEGER,
        created_at INTEGER NOT NULL
      );
      """.trimIndent()
    )

    db.execSQL(
      """
      CREATE TABLE IF NOT EXISTS $TABLE_SETTINGS (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      """.trimIndent()
    )

    try {
      db.execSQL("ALTER TABLE $TABLE_NOTIFICATIONS ADD COLUMN intercepted_in_dnd INTEGER DEFAULT 0;")
    } catch (_: Exception) {}

    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON $TABLE_NOTIFICATIONS (timestamp DESC);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_package ON $TABLE_NOTIFICATIONS (package_name);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_key ON $TABLE_NOTIFICATIONS (notification_key);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON $TABLE_NOTIFICATIONS (is_read);")
    db.execSQL("CREATE INDEX IF NOT EXISTS idx_notifications_dnd ON $TABLE_NOTIFICATIONS (intercepted_in_dnd);")
  }

  fun insertOrUpdate(context: Context, data: NotificationData): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val now = System.currentTimeMillis()
      val sql = """
        INSERT INTO $TABLE_NOTIFICATIONS (
          notification_key, package_name, app_name, title, text, big_text, sub_text,
          timestamp, category, group_key, channel_id, is_ongoing, is_clearable, is_read, intercepted_in_dnd, removed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?)
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
          intercepted_in_dnd = CASE WHEN excluded.intercepted_in_dnd = 1 THEN 1 ELSE $TABLE_NOTIFICATIONS.intercepted_in_dnd END,
          removed_at = NULL;
      """.trimIndent()

      val statement = db.compileStatement(sql)
      try {
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
        statement.bindLong(14, if (data.interceptedInDnd) 1L else 0L)
        statement.bindLong(15, data.createdAt.takeIf { it > 0 } ?: now)

        statement.execute()
        true
      } finally {
        statement.close()
      }
    } catch (e: Exception) {
      Log.e(TAG, "Failed to insert or update notification: ${e.message}", e)
      false
    }
  }

  fun insertNotificationFromMap(context: Context, map: Map<String, Any?>): Boolean {
    val key = map["notification_key"] as? String ?: return false
    val packageName = map["package_name"] as? String ?: return false
    val appName = map["app_name"] as? String ?: packageName
    val title = map["title"] as? String
    val text = map["text"] as? String
    val bigText = map["big_text"] as? String
    val subText = map["sub_text"] as? String
    val timestamp = (map["timestamp"] as? Number)?.toLong() ?: System.currentTimeMillis()
    val category = map["category"] as? String
    val groupKey = map["group_key"] as? String
    val channelId = map["channel_id"] as? String
    val isOngoing = ((map["is_ongoing"] as? Number)?.toInt() ?: 0) == 1
    val isClearable = ((map["is_clearable"] as? Number)?.toInt() ?: 1) == 1
    val isRead = ((map["is_read"] as? Number)?.toInt() ?: 0) == 1
    val interceptedInDnd = ((map["intercepted_in_dnd"] as? Number)?.toInt() ?: 0) == 1
    val removedAt = (map["removed_at"] as? Number)?.toLong()
    val createdAt = (map["created_at"] as? Number)?.toLong() ?: System.currentTimeMillis()

    val data = NotificationData(
      notificationKey = key,
      packageName = packageName,
      appName = appName,
      title = title,
      text = text,
      bigText = bigText,
      subText = subText,
      timestamp = timestamp,
      category = category,
      groupKey = groupKey,
      channelId = channelId,
      isOngoing = isOngoing,
      isClearable = isClearable,
      isRead = isRead,
      interceptedInDnd = interceptedInDnd,
      removedAt = removedAt,
      createdAt = createdAt
    )
    return insertOrUpdate(context, data)
  }

  fun getNotifications(
    context: Context,
    limit: Int,
    offset: Int,
    filter: String?,
    packageName: String?,
    search: String?
  ): List<Map<String, Any?>> {
    val db = getDatabase(context) ?: return emptyList()
    val conditions = mutableListOf<String>()
    val args = mutableListOf<String>()

    val nowCal = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    val startOfToday = nowCal.timeInMillis
    val startOfYesterday = startOfToday - 86400000L

    when (filter) {
      "unread" -> conditions.add("is_read = 0")
      "dnd" -> conditions.add("intercepted_in_dnd = 1")
      "today" -> {
        conditions.add("timestamp >= ?")
        args.add(startOfToday.toString())
      }
      "yesterday" -> {
        conditions.add("timestamp >= ? AND timestamp < ?")
        args.add(startOfYesterday.toString())
        args.add(startOfToday.toString())
      }
    }

    if (!packageName.isNullOrBlank()) {
      conditions.add("package_name = ?")
      args.add(packageName)
    }

    if (!search.isNullOrBlank()) {
      val term = "%${search.trim()}%"
      conditions.add("(app_name LIKE ? OR title LIKE ? OR text LIKE ? OR big_text LIKE ?)")
      args.add(term)
      args.add(term)
      args.add(term)
      args.add(term)
    }

    val whereClause = if (conditions.isNotEmpty()) "WHERE ${conditions.joinToString(" AND ")}" else ""
    val sql = "SELECT * FROM $TABLE_NOTIFICATIONS $whereClause ORDER BY timestamp DESC LIMIT ? OFFSET ?;"
    args.add(limit.toString())
    args.add(offset.toString())

    val result = mutableListOf<Map<String, Any?>>()
    try {
      db.rawQuery(sql, args.toTypedArray()).use { cursor ->
        val idCol = cursor.getColumnIndex("id")
        val keyCol = cursor.getColumnIndex("notification_key")
        val pkgCol = cursor.getColumnIndex("package_name")
        val appCol = cursor.getColumnIndex("app_name")
        val titleCol = cursor.getColumnIndex("title")
        val textCol = cursor.getColumnIndex("text")
        val bigTextCol = cursor.getColumnIndex("big_text")
        val subTextCol = cursor.getColumnIndex("sub_text")
        val timeCol = cursor.getColumnIndex("timestamp")
        val catCol = cursor.getColumnIndex("category")
        val groupCol = cursor.getColumnIndex("group_key")
        val channelCol = cursor.getColumnIndex("channel_id")
        val ongoingCol = cursor.getColumnIndex("is_ongoing")
        val clearableCol = cursor.getColumnIndex("is_clearable")
        val readCol = cursor.getColumnIndex("is_read")
        val dndCol = cursor.getColumnIndex("intercepted_in_dnd")
        val removedCol = cursor.getColumnIndex("removed_at")
        val createdCol = cursor.getColumnIndex("created_at")

        while (cursor.moveToNext()) {
          val row = mutableMapOf<String, Any?>()
          if (idCol >= 0) row["id"] = cursor.getLong(idCol)
          if (keyCol >= 0) row["notification_key"] = cursor.getString(keyCol)
          if (pkgCol >= 0) row["package_name"] = cursor.getString(pkgCol)
          if (appCol >= 0) row["app_name"] = cursor.getString(appCol)
          if (titleCol >= 0) row["title"] = if (cursor.isNull(titleCol)) null else cursor.getString(titleCol)
          if (textCol >= 0) row["text"] = if (cursor.isNull(textCol)) null else cursor.getString(textCol)
          if (bigTextCol >= 0) row["big_text"] = if (cursor.isNull(bigTextCol)) null else cursor.getString(bigTextCol)
          if (subTextCol >= 0) row["sub_text"] = if (cursor.isNull(subTextCol)) null else cursor.getString(subTextCol)
          if (timeCol >= 0) row["timestamp"] = cursor.getLong(timeCol)
          if (catCol >= 0) row["category"] = if (cursor.isNull(catCol)) null else cursor.getString(catCol)
          if (groupCol >= 0) row["group_key"] = if (cursor.isNull(groupCol)) null else cursor.getString(groupCol)
          if (channelCol >= 0) row["channel_id"] = if (cursor.isNull(channelCol)) null else cursor.getString(channelCol)
          if (ongoingCol >= 0) row["is_ongoing"] = cursor.getInt(ongoingCol)
          if (clearableCol >= 0) row["is_clearable"] = cursor.getInt(clearableCol)
          if (readCol >= 0) row["is_read"] = cursor.getInt(readCol)
          if (dndCol >= 0) row["intercepted_in_dnd"] = cursor.getInt(dndCol)
          if (removedCol >= 0) row["removed_at"] = if (cursor.isNull(removedCol)) null else cursor.getLong(removedCol)
          if (createdCol >= 0) row["created_at"] = cursor.getLong(createdCol)

          result.add(row)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error querying notifications: ${e.message}", e)
    }
    return result
  }

  fun getAppsSummary(context: Context): List<Map<String, Any?>> {
    val db = getDatabase(context) ?: return emptyList()
    val sql = """
      SELECT
        package_name,
        app_name,
        COUNT(*) as count,
        MAX(timestamp) as latest_timestamp
      FROM $TABLE_NOTIFICATIONS
      GROUP BY package_name, app_name
      ORDER BY count DESC;
    """.trimIndent()

    val result = mutableListOf<Map<String, Any?>>()
    try {
      db.rawQuery(sql, null).use { cursor ->
        while (cursor.moveToNext()) {
          result.add(
            mapOf(
              "package_name" to cursor.getString(0),
              "app_name" to cursor.getString(1),
              "count" to cursor.getInt(2),
              "latest_timestamp" to cursor.getLong(3)
            )
          )
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error querying apps summary: ${e.message}", e)
    }
    return result
  }

  fun getUnreadCount(context: Context): Int {
    val db = getDatabase(context) ?: return 0
    val sql = "SELECT COUNT(*) FROM $TABLE_NOTIFICATIONS WHERE is_read = 0;"
    try {
      db.rawQuery(sql, null).use { cursor ->
        if (cursor.moveToFirst()) {
          return cursor.getInt(0)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error getting unread count: ${e.message}", e)
    }
    return 0
  }

  fun getNotificationStats(context: Context): Map<String, Int> {
    val db = getDatabase(context) ?: return mapOf(
      "totalCount" to 0,
      "unreadCount" to 0,
      "todayCount" to 0,
      "appsCount" to 0
    )

    var total = 0
    var unread = 0
    var today = 0
    var apps = 0

    val nowCal = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    val startOfToday = nowCal.timeInMillis

    try {
      db.rawQuery("SELECT COUNT(*) FROM $TABLE_NOTIFICATIONS;", null).use { cursor ->
        if (cursor.moveToFirst()) total = cursor.getInt(0)
      }
      db.rawQuery("SELECT COUNT(*) FROM $TABLE_NOTIFICATIONS WHERE is_read = 0;", null).use { cursor ->
        if (cursor.moveToFirst()) unread = cursor.getInt(0)
      }
      db.rawQuery("SELECT COUNT(*) FROM $TABLE_NOTIFICATIONS WHERE timestamp >= ?;", arrayOf(startOfToday.toString())).use { cursor ->
        if (cursor.moveToFirst()) today = cursor.getInt(0)
      }
      db.rawQuery("SELECT COUNT(DISTINCT package_name) FROM $TABLE_NOTIFICATIONS;", null).use { cursor ->
        if (cursor.moveToFirst()) apps = cursor.getInt(0)
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error getting stats: ${e.message}", e)
    }

    return mapOf(
      "totalCount" to total,
      "unreadCount" to unread,
      "todayCount" to today,
      "appsCount" to apps
    )
  }

  fun getSetting(context: Context, key: String, defaultValue: String): String {
    val db = getDatabase(context) ?: return defaultValue
    try {
      db.rawQuery("SELECT value FROM $TABLE_SETTINGS WHERE key = ? LIMIT 1;", arrayOf(key)).use { cursor ->
        if (cursor.moveToFirst()) {
          return cursor.getString(0)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error reading setting $key: ${e.message}", e)
    }
    return defaultValue
  }

  fun setSetting(context: Context, key: String, value: String): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val cv = ContentValues().apply {
        put("key", key)
        put("value", value)
      }
      db.insertWithOnConflict(TABLE_SETTINGS, null, cv, SQLiteDatabase.CONFLICT_REPLACE) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Error saving setting $key: ${e.message}", e)
      false
    }
  }

  fun deleteExpiredNotifications(context: Context, retentionPeriod: String): Int {
    if (retentionPeriod == "forever") return 0
    val db = getDatabase(context) ?: return 0
    val days = if (retentionPeriod == "7_days") 7 else 30
    val cutoff = System.currentTimeMillis() - (days * 24L * 60L * 60L * 1000L)
    return try {
      db.delete(TABLE_NOTIFICATIONS, "timestamp < ?", arrayOf(cutoff.toString()))
    } catch (e: Exception) {
      Log.e(TAG, "Error deleting expired notifications: ${e.message}", e)
      0
    }
  }

  fun markRemoved(context: Context, notificationKey: String, removedAt: Long): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val values = ContentValues().apply {
        put("removed_at", removedAt)
      }
      db.update(TABLE_NOTIFICATIONS, values, "notification_key = ?", arrayOf(notificationKey)) > 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to mark notification as removed: ${e.message}")
      false
    }
  }

  fun markAsRead(context: Context, notificationKey: String): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val values = ContentValues().apply {
        put("is_read", 1)
      }
      db.update(TABLE_NOTIFICATIONS, values, "notification_key = ?", arrayOf(notificationKey)) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to mark notification as read: ${e.message}")
      false
    }
  }

  fun markAsUnread(context: Context, notificationKey: String): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val values = ContentValues().apply {
        put("is_read", 0)
      }
      db.update(TABLE_NOTIFICATIONS, values, "notification_key = ?", arrayOf(notificationKey)) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to mark notification as unread: ${e.message}")
      false
    }
  }

  fun markAllAsRead(context: Context): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      val values = ContentValues().apply {
        put("is_read", 1)
      }
      db.update(TABLE_NOTIFICATIONS, values, "is_read = 0", null) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to mark all notifications as read: ${e.message}")
      false
    }
  }

  fun deleteNotification(context: Context, notificationKey: String): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      db.delete(TABLE_NOTIFICATIONS, "notification_key = ?", arrayOf(notificationKey)) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to delete notification: ${e.message}")
      false
    }
  }

  fun clearAllNotifications(context: Context): Boolean {
    val db = getDatabase(context) ?: return false
    return try {
      db.delete(TABLE_NOTIFICATIONS, null, null) >= 0
    } catch (e: Exception) {
      Log.e(TAG, "Failed to clear all notifications: ${e.message}")
      false
    }
  }

  fun getAnalyticsData(context: Context, sinceTimestamp: Long): Map<String, Any?> {
    val db = getDatabase(context) ?: return mapOf(
      "totalCount" to 0,
      "unreadCount" to 0,
      "dndCount" to 0,
      "appsCount" to 0,
      "topApps" to emptyList<Map<String, Any?>>(),
      "hourly" to (0..23).map { mapOf("hour" to it, "count" to 0) },
      "dayOfWeek" to (0..6).map { mapOf("day" to it, "count" to 0) }
    )

    var totalCount = 0
    var unreadCount = 0
    var dndCount = 0
    var appsCount = 0
    val topApps = mutableListOf<Map<String, Any?>>()
    val hourlyCounts = IntArray(24) { 0 }
    val dayCounts = IntArray(7) { 0 }

    val safeSince = if (sinceTimestamp > 0) sinceTimestamp.toString() else "0"

    try {
      // 1. Overall counts
      val summarySql = """
        SELECT 
          COUNT(*),
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END),
          SUM(CASE WHEN intercepted_in_dnd = 1 THEN 1 ELSE 0 END),
          COUNT(DISTINCT package_name)
        FROM $TABLE_NOTIFICATIONS
        WHERE timestamp >= ?;
      """.trimIndent()

      db.rawQuery(summarySql, arrayOf(safeSince)).use { cursor ->
        if (cursor.moveToFirst()) {
          totalCount = cursor.getInt(0)
          unreadCount = cursor.getInt(1)
          dndCount = cursor.getInt(2)
          appsCount = cursor.getInt(3)
        }
      }

      // 2. Top Apps
      val appsSql = """
        SELECT
          package_name,
          app_name,
          COUNT(*) as count,
          MAX(timestamp) as latest_timestamp
        FROM $TABLE_NOTIFICATIONS
        WHERE timestamp >= ?
        GROUP BY package_name, app_name
        ORDER BY count DESC
        LIMIT 15;
      """.trimIndent()

      db.rawQuery(appsSql, arrayOf(safeSince)).use { cursor ->
        while (cursor.moveToNext()) {
          topApps.add(
            mapOf(
              "package_name" to cursor.getString(0),
              "app_name" to cursor.getString(1),
              "count" to cursor.getInt(2),
              "latest_timestamp" to cursor.getLong(3)
            )
          )
        }
      }

      // 3. Hourly Distribution (0..23)
      val hourlySql = """
        SELECT 
          CAST(strftime('%H', timestamp / 1000, 'unixepoch', 'localtime') AS INTEGER) as h,
          COUNT(*) as cnt
        FROM $TABLE_NOTIFICATIONS
        WHERE timestamp >= ?
        GROUP BY h;
      """.trimIndent()

      db.rawQuery(hourlySql, arrayOf(safeSince)).use { cursor ->
        while (cursor.moveToNext()) {
          val h = cursor.getInt(0)
          val cnt = cursor.getInt(1)
          if (h in 0..23) {
            hourlyCounts[h] = cnt
          }
        }
      }

      // 4. Day of Week Distribution (0=Sun, 1=Mon, ..., 6=Sat)
      val daySql = """
        SELECT 
          CAST(strftime('%w', timestamp / 1000, 'unixepoch', 'localtime') AS INTEGER) as d,
          COUNT(*) as cnt
        FROM $TABLE_NOTIFICATIONS
        WHERE timestamp >= ?
        GROUP BY d;
      """.trimIndent()

      db.rawQuery(daySql, arrayOf(safeSince)).use { cursor ->
        while (cursor.moveToNext()) {
          val d = cursor.getInt(0)
          val cnt = cursor.getInt(1)
          if (d in 0..6) {
            dayCounts[d] = cnt
          }
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error calculating analytics data: ${e.message}", e)
    }

    return mapOf(
      "totalCount" to totalCount,
      "unreadCount" to unreadCount,
      "dndCount" to dndCount,
      "appsCount" to appsCount,
      "topApps" to topApps,
      "hourly" to hourlyCounts.mapIndexed { hour, count -> mapOf("hour" to hour, "count" to count) },
      "dayOfWeek" to dayCounts.mapIndexed { day, count -> mapOf("day" to day, "count" to count) }
    )
  }
}
