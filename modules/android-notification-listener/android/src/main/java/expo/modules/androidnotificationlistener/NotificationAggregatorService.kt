package expo.modules.androidnotificationlistener

import android.app.Notification
import android.content.Context
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class NotificationAggregatorService : NotificationListenerService() {

  companion object {
    private const val TAG = "NotificationAggregator"
    var instance: NotificationAggregatorService? = null
      private set

    fun extractNotificationData(context: Context, sbn: StatusBarNotification): NotificationData? {
      return try {
        val packageName = sbn.packageName ?: return null
        // Skip self-notifications
        if (packageName == context.packageName) {
          return null
        }

        val pm = context.packageManager
        val appName = try {
          val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            pm.getApplicationInfo(packageName, android.content.pm.PackageManager.ApplicationInfoFlags.of(0))
          } else {
            @Suppress("DEPRECATION")
            pm.getApplicationInfo(packageName, 0)
          }
          pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
          packageName
        }

        val notification = sbn.notification ?: return null
        val extras = notification.extras

        val title = extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim()
        val text = extras?.getCharSequence(Notification.EXTRA_TEXT)?.toString()?.trim()
        val bigText = extras?.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()?.trim()
        val subText = extras?.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()?.trim()

        val postTime = sbn.postTime
        val notificationWhen = notification.`when`
        val timestamp = if (notificationWhen > 0) notificationWhen else postTime

        val category = notification.category
        val groupKey = notification.group
        val channelId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) notification.channelId else null
        val isOngoing = sbn.isOngoing
        val isClearable = sbn.isClearable

        val key = sbn.key ?: "${packageName}_${sbn.id}_${timestamp}"

        NotificationData(
          notificationKey = key,
          packageName = packageName,
          appName = appName,
          title = if (!title.isNullOrEmpty()) title else null,
          text = if (!text.isNullOrEmpty()) text else (if (!bigText.isNullOrEmpty()) bigText else null),
          bigText = if (!bigText.isNullOrEmpty()) bigText else null,
          subText = if (!subText.isNullOrEmpty()) subText else null,
          timestamp = timestamp,
          category = category,
          groupKey = groupKey,
          channelId = channelId,
          isOngoing = isOngoing,
          isClearable = isClearable,
          isRead = false,
          removedAt = null,
          createdAt = System.currentTimeMillis()
        )
      } catch (e: Exception) {
        Log.e(TAG, "Failed to extract notification data: ${e.message}")
        null
      }
    }
  }

  override fun onListenerConnected() {
    super.onListenerConnected()
    instance = this
    Log.d(TAG, "Notification listener connected")
  }

  override fun onListenerDisconnected() {
    super.onListenerDisconnected()
    if (instance == this) {
      instance = null
    }
    Log.d(TAG, "Notification listener disconnected")
  }

  override fun onDestroy() {
    super.onDestroy()
    if (instance == this) {
      instance = null
    }
  }

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    if (sbn == null) return
    try {
      val data = extractNotificationData(this, sbn) ?: return

      // Ignore completely empty notifications if both title and text are missing
      if (data.title == null && data.text == null && data.bigText == null) {
        return
      }

      // Check Do Not Disturb interception policy
      val packageName = data.packageName
      val shouldIntercept = DndManager.shouldIntercept(this, packageName)
      val canCancel = sbn.isClearable && !sbn.isOngoing

      val dataToSave = if (shouldIntercept && canCancel) {
        data.copy(interceptedInDnd = true)
      } else {
        data
      }

      // 1. Write immediately to local SQLite database (works even when React Native is closed)
      NotificationDbHelper.insertOrUpdate(this, dataToSave)

      // 2. Dismiss from system notification tray if DND applies
      if (shouldIntercept && canCancel) {
        try {
          cancelNotification(sbn.key)
          Log.i(TAG, "DND intercepted & dismissed notification ${sbn.key} from $packageName")
        } catch (e: Exception) {
          Log.w(TAG, "Could not cancel notification for DND: ${e.message}")
        }
      }

      // 3. Emit event to active React Native UI if connected
      NotificationListenerModule.notifyNotificationPosted(dataToSave)
    } catch (e: Exception) {
      Log.e(TAG, "Error handling posted notification: ${e.message}")
    }
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification?) {
    if (sbn == null) return
    try {
      val key = sbn.key ?: return
      val removedAt = System.currentTimeMillis()

      // 1. Update status in local SQLite database
      NotificationDbHelper.markRemoved(this, key, removedAt)

      // 2. Emit event to active React Native UI
      NotificationListenerModule.notifyNotificationRemoved(key, removedAt)
    } catch (e: Exception) {
      Log.e(TAG, "Error handling removed notification: ${e.message}")
    }
  }
}
