# Notification Aggregator 🔕📲

A private, local-first Android notification manager, archive, interactive analytics hub, and biometric quiet vault built with React Native, Expo SDK 57, and native Android Kotlin services.

Notification Aggregator captures, categorizes, and securely archives all your device notifications directly on-device so you never lose an important message, 2FA code, or notification alert—even if it was dismissed or deleted from the Android system shade.

---

## ✨ Features (v2.0.0)

- **📥 Background Notification Capture**: Runs continuously as an Android `NotificationListenerService` to capture notifications in real-time, even when the React Native app is closed or killed.
- **🔐 Biometric App Lock & Vault Protection**:
  - Secure your sensitive notification history, chat previews, and OTPs with on-device **Fingerprint**, **Face Recognition**, or **Iris** authentication.
  - Fail-safe fallback to device PIN/Pattern/Password.
  - Configurable **Auto-Lock Timeouts**: *Immediately*, *After 1 minute*, or *After 5 minutes*.
  - Full-screen obsidian lock shield with instant haptic feedback.
- **📊 Interactive Analytics & Insights Dashboard**:
  - **24-Hour Hourly Histogram**: Real-time distribution showing notification volume throughout the day with interactive touch tooltips and peak hour detection.
  - **Top Apps Volume Ranking**: Ranked list of source apps with proportional percentage bars and 1-tap navigation to filter Archive by that app.
  - **Quiet Vault Peace Index**: Visual ratio of intercepted vs. allowed notifications with estimated uninterrupted focus minutes saved.
  - **7-Day Day-of-Week Trend**: Compare weekday vs. weekend notification load.
  - **Time Range Selector**: View analytics across *Today (24h)*, *7 Days*, *30 Days*, or *All Time*.
- **🌙 Quiet Vault (Do Not Disturb Interception)**: Silence distracting apps on your terms. When enabled, notifications from selected apps (or all clearable apps) are automatically dismissed from your status bar and vaulted quietly in the app.
- **⚡ Single-Engine Native SQLite Architecture**: High-performance native SQLite database with automatic self-healing and recovery—guaranteeing zero concurrency corruption and instant queries across thousands of records.
- **🔍 Powerful Filtering & Instant Search**:
  - Filter by **All**, **Unread**, **DND Vault**, **Today**, and **Yesterday**.
  - Group and browse notifications by application with notification counts.
  - Live full-text search across app titles, sender names, and notification bodies.
- **🧊 Liquid Glass Aesthetic**: Crafted with Apple-inspired Liquid Glass design principles:
  - Ultra-dark palette (`#060709` deep obsidian).
  - Floating 4-tab dock navigation (`Archive`, `Apps`, `Stats`, `Settings`) with frosted glass translucency and micro-animations.
  - Solar gold ambient glow with subtle radial light effects.
  - High-density information hierarchy without clutter.
- **🔒 100% On-Device Privacy**: Your notifications never leave your device. Zero external network requests, zero telemetry, zero analytics, and zero cloud synchronization.
- **⏱️ Configurable Data Retention**: Built-in automated retention policies (7 days, 30 days, or Forever) to prevent storage bloat.
- **🚀 Seamless App Launching**: Tap any notification card or app group to open the originating application directly.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: [Expo SDK 57](https://expo.dev) / React Native 0.86 with New Architecture & React Compiler.
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based navigation with floating tab dock and modals).
- **Security**: [`expo-local-authentication`](https://docs.expo.dev/versions/latest/sdk/local-authentication/) for biometric hardware queries and OS-level authentication prompts.
- **Native Android Module**:
  - `NotificationAggregatorService.kt`: Native `NotificationListenerService` capturing status bar events.
  - `NotificationDbHelper.kt`: Native SQLite engine with connection synchronization, WAL mode, analytics aggregations, and auto-repair.
  - `DndManager.kt`: Shared preferences manager for quiet vault interception policies.
  - `NotificationListenerModule.kt`: Expo Kotlin Module bridge exposing events and asynchronous query methods to JavaScript.
- **State & Reactivity**: Centralized custom EventEmitter for cross-tab mutations, optimistic UI updates, and real-time badge counts.
- **Animations**: `react-native-reanimated` with spring physics and worklets.

---

## 🛡️ Permissions & Security

| Permission | Purpose |
| :--- | :--- |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Required by Android OS to capture and dismiss status bar notifications. |
| `QUERY_ALL_PACKAGES` | Resolves app names and launches target apps when notifications are tapped. |
| `USE_BIOMETRIC` & `USE_FINGERPRINT` | Authenticates device owner before viewing vaulted notification history. |
| `INTERNET` | Excluded from network usage; all operations and SQLite databases are strictly local. |

---

## 📦 Building & Running

```bash
# Install dependencies
bun install

# Start local Expo development server
bunx expo start

# Typecheck and Lint
bunx tsc --noEmit
bunx expo lint

# Build Standalone Release APK locally
cd android && ./gradlew assembleRelease
```

---

## 📄 License

MIT License. Designed and developed with care.
