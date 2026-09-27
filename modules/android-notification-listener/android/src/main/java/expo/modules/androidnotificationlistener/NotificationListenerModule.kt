package expo.modules.androidnotificationlistener

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationListenerModule : Module() {

  companion object {
    private const val TAG = "NotificationModule"
    var activeModule: NotificationListenerModule? = null
      private set

    fun notifyNotificationPosted(data: NotificationData) {
      val module = activeModule ?: return
      try {
        val map = mapOf(
          "notificationKey" to data.notificationKey,
          "packageName" to data.packageName,
          "appName" to data.appName,
          "title" to data.title,
          "text" to data.text,
          "bigText" to data.bigText,
          "subText" to data.subText,
          "timestamp" to data.timestamp,
          "category" to data.category,
          "groupKey" to data.groupKey,
          "channelId" to data.channelId,
          "isOngoing" to data.isOngoing,
          "isClearable" to data.isClearable,
          "isRead" to data.isRead,
          "removedAt" to data.removedAt,
          "createdAt" to data.createdAt
        )
        module.sendEvent("onNotificationPosted", map)
      } catch (e: Exception) {
        Log.e(TAG, "Error emitting onNotificationPosted: ${e.message}")
      }
    }

    fun notifyNotificationRemoved(key: String, removedAt: Long) {
      val module = activeModule ?: return
      try {
        val map = mapOf(
          "notificationKey" to key,
          "removedAt" to removedAt
        )
        module.sendEvent("onNotificationRemoved", map)
      } catch (e: Exception) {
        Log.e(TAG, "Error emitting onNotificationRemoved: ${e.message}")
      }
    }
  }

  private val context: Context
    get() = appContext.reactContext ?: appContext.currentActivity ?: throw IllegalStateException("Android Context is null")

  override fun definition() = ModuleDefinition {
    Name("NotificationListener")

    Events("onNotificationPosted", "onNotificationRemoved")

    OnCreate {
      activeModule = this@NotificationListenerModule
    }

    OnDestroy {
      if (activeModule == this@NotificationListenerModule) {
        activeModule = null
      }
    }

    AsyncFunction("isPermissionGranted") {
      try {
        val ctx = context
        val packageName = ctx.packageName

        val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(ctx)
        if (enabledPackages.contains(packageName)) {
          return@AsyncFunction true
        }

        val flat = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
        if (!TextUtils.isEmpty(flat)) {
          val names = flat.split(":").toTypedArray()
          for (name in names) {
            val cn = ComponentName.unflattenFromString(name)
            if (cn != null && TextUtils.equals(packageName, cn.packageName)) {
              return@AsyncFunction true
            }
          }
        }
        false
      } catch (e: Exception) {
        Log.e(TAG, "Error checking permission: ${e.message}")
        false
      }
    }

    AsyncFunction("openNotificationAccessSettings") {
      try {
        val ctx = context
        val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          try {
            Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS).apply {
              val componentName = ComponentName(ctx, NotificationAggregatorService::class.java)
              putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, componentName.flattenToString())
              addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
          } catch (e: Exception) {
            Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
              addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
          }
        } else {
          Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          }
        }

        ctx.startActivity(intent)
        true
      } catch (e: Exception) {
        Log.e(TAG, "Error opening settings: ${e.message}")
        try {
          val fallback = Intent(Settings.ACTION_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          }
          context.startActivity(fallback)
          true
        } catch (e2: Exception) {
          false
        }
      }
    }

    AsyncFunction("getActiveNotifications") {
      val result = mutableListOf<Map<String, Any?>>()
      try {
        val service = NotificationAggregatorService.instance
        if (service != null) {
          val sbns = service.activeNotifications ?: emptyArray()
          for (sbn in sbns) {
            val data = NotificationAggregatorService.extractNotificationData(service, sbn)
            if (data != null && (data.title != null || data.text != null || data.bigText != null)) {
              NotificationDbHelper.insertOrUpdate(service, data)
              result.add(
                mapOf(
                  "notificationKey" to data.notificationKey,
                  "packageName" to data.packageName,
                  "appName" to data.appName,
                  "title" to data.title,
                  "text" to data.text,
                  "bigText" to data.bigText,
                  "subText" to data.subText,
                  "timestamp" to data.timestamp,
                  "category" to data.category,
                  "groupKey" to data.groupKey,
                  "channelId" to data.channelId,
                  "isOngoing" to data.isOngoing,
                  "isClearable" to data.isClearable,
                  "isRead" to data.isRead,
                  "removedAt" to data.removedAt,
                  "createdAt" to data.createdAt
                )
              )
            }
          }
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error getting active notifications: ${e.message}")
      }
      result
    }

    AsyncFunction("openApp") { packageName: String ->
      try {
        val ctx = context
        val pm = ctx.packageManager

        // 1. Try standard getLaunchIntentForPackage
        val launchIntent = pm.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
          launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
          ctx.startActivity(launchIntent)
          return@AsyncFunction true
        }

        // 2. Query for Intent.ACTION_MAIN with CATEGORY_LAUNCHER
        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
          addCategory(Intent.CATEGORY_LAUNCHER)
          `package` = packageName
        }
        val resolveInfos = pm.queryIntentActivities(mainIntent, 0)
        if (resolveInfos.isNotEmpty()) {
          val activity = resolveInfos[0].activityInfo
          val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
            component = ComponentName(activity.packageName, activity.name)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
          }
          ctx.startActivity(intent)
          return@AsyncFunction true
        }

        // 3. Try Leanback launcher intent (Android TV / alternative launcher)
        val leanbackIntent = pm.getLeanbackLaunchIntentForPackage(packageName)
        if (leanbackIntent != null) {
          leanbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
          ctx.startActivity(leanbackIntent)
          return@AsyncFunction true
        }

        false
      } catch (e: Exception) {
        Log.e(TAG, "Failed to open app $packageName: ${e.message}")
        false
      }
    }

    AsyncFunction("markAsRead") { notificationKey: String ->
      NotificationDbHelper.markAsRead(context, notificationKey)
    }

    AsyncFunction("markAsUnread") { notificationKey: String ->
      NotificationDbHelper.markAsUnread(context, notificationKey)
    }

    AsyncFunction("markAllAsRead") {
      NotificationDbHelper.markAllAsRead(context)
    }

    AsyncFunction("deleteNotification") { notificationKey: String ->
      NotificationDbHelper.deleteNotification(context, notificationKey)
    }

    AsyncFunction("clearAllNotifications") {
      NotificationDbHelper.clearAllNotifications(context)
    }
  }
}
