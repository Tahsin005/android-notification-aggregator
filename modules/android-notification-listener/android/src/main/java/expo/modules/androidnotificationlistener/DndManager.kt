package expo.modules.androidnotificationlistener

import android.content.Context
import android.util.Log

object DndManager {
  private const val TAG = "DndManager"
  private const val PREFS_NAME = "aggregator_dnd_prefs"
  private const val KEY_DND_ENABLED = "dnd_enabled"
  private const val KEY_DND_MODE = "dnd_mode" // "all" | "selected"
  private const val KEY_DND_BLOCKED_PACKAGES = "dnd_blocked_packages"

  fun isDndEnabled(context: Context): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getBoolean(KEY_DND_ENABLED, false)
  }

  fun setDndEnabled(context: Context, enabled: Boolean): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putBoolean(KEY_DND_ENABLED, enabled).apply()
    Log.d(TAG, "DND enabled set to: $enabled")
    return true
  }

  fun getDndMode(context: Context): String {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_DND_MODE, "all") ?: "all"
  }

  fun setDndMode(context: Context, mode: String): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_DND_MODE, mode).apply()
    Log.d(TAG, "DND mode set to: $mode")
    return true
  }

  fun getBlockedPackages(context: Context): List<String> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val set = prefs.getStringSet(KEY_DND_BLOCKED_PACKAGES, emptySet()) ?: emptySet()
    return set.toList()
  }

  fun setBlockedPackages(context: Context, packages: List<String>): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putStringSet(KEY_DND_BLOCKED_PACKAGES, packages.toSet()).apply()
    Log.d(TAG, "DND blocked packages updated: ${packages.size} apps")
    return true
  }

  fun toggleBlockedPackage(context: Context, packageName: String): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val current = prefs.getStringSet(KEY_DND_BLOCKED_PACKAGES, emptySet())?.toMutableSet() ?: mutableSetOf()
    val isNowBlocked = if (current.contains(packageName)) {
      current.remove(packageName)
      false
    } else {
      current.add(packageName)
      true
    }
    prefs.edit().putStringSet(KEY_DND_BLOCKED_PACKAGES, current).apply()
    Log.d(TAG, "Toggled DND for $packageName -> blocked=$isNowBlocked")
    return isNowBlocked
  }

  fun shouldIntercept(context: Context, packageName: String): Boolean {
    if (!isDndEnabled(context)) return false
    val mode = getDndMode(context)
    return if (mode == "all") {
      true
    } else {
      val blocked = getBlockedPackages(context)
      blocked.contains(packageName)
    }
  }
}
