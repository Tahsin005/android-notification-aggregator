const { withAndroidManifest } = require('@expo/config-plugins');

const withNotificationListener = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (!mainApplication) {
      return config;
    }

    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const serviceName = 'expo.modules.androidnotificationlistener.NotificationAggregatorService';
    const existingService = mainApplication.service.find(
      (s) => s.$ && s.$['android:name'] === serviceName
    );

    if (!existingService) {
      mainApplication.service.push({
        $: {
          'android:name': serviceName,
          'android:label': 'Notification Aggregator Service',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withNotificationListener;
