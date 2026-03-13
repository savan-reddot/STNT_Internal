import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';
import moment from 'moment-timezone';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === 1 || // AUTHORIZED
    authStatus === 2;   // PROVISIONAL

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  return enabled;
};

export const getFCMToken = async () => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
  return null;
};

export const onDisplayNotification = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  console.log('--- DISPLAYING NOTIFICATION ---');
  console.log('Title:', message.notification?.title || message.data?.title);

  // Display a notification
  await notifee.displayNotification({
    title: (message.notification?.title || message.data?.title || 'Notification') as string,
    body: (message.notification?.body || message.data?.body || '') as string,
    android: {
      channelId: 'default', // Using the channel created in initNotifications
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const testLocalNotification = async () => {
  console.log('--- TRIGGERING LOCAL TEST NOTIFICATION ---');
  await notifee.displayNotification({
    title: 'Local Test Notification',
    body: 'If you see this, Notifee is working correctly!',
    android: {
      channelId: 'default',
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const initNotifications = async () => {
  // Request permissions for both FCM and Notifee
  if (Platform.OS === 'ios') {
    await requestUserPermission();
  } else {
    // Request permission for Android 13+
    await notifee.requestPermission();
  }

  // Create a default channel for Android during initialization
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
    console.log('Notification channel created');
  }

  // Handle foreground messages
  const unsubscribe = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('--- FOREGROUND MESSAGE RECEIVED ---');
    console.log(JSON.stringify(remoteMessage, null, 2));
    await onDisplayNotification(remoteMessage);
  });

  // Handle notification click when app is in background but still in memory
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open from background state:', remoteMessage.notification);
  });

  // Check if app was opened by a notification when closed
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage.notification);
      }
    });

  return unsubscribe;
};

export const schedulePrayerNotifications = async (
  prayerTimes: any,
  locationTz: string,
  enableAlerts: boolean,
  enablePreAlerts: boolean,
  preMinutes: number
) => {
  try {
    // 1. Cancel existing prayer notifications
    const allNotifications = await notifee.getTriggerNotificationIds();
    const prayerNotificationIds = allNotifications.filter(id => id.startsWith('prayer_'));
    await notifee.cancelTriggerNotifications(prayerNotificationIds);

    if (!enableAlerts && !enablePreAlerts) {
      console.log('Prayer notifications disabled');
      return;
    }

    const prayerKeys = [
      { name: 'Fajr', label: 'Fajr' },
      { name: 'Dhuhr', label: 'Dhuhr' },
      { name: 'Asr', label: 'Asr' },
      { name: 'Maghrib', label: 'Maghrib' },
      { name: 'Isha', label: 'Isha' },
    ];

    for (const prayer of prayerKeys) {
      const prayerTimeStr = prayerTimes[prayer.name];
      if (!prayerTimeStr) continue;

      // Parse time
      const prayerMoment = moment.tz(prayerTimeStr, 'HH:mm', locationTz).local();
      
      // If time has passed today, schedule for tomorrow
      if (prayerMoment.isBefore(moment())) {
        prayerMoment.add(1, 'day');
      }

      // 1. Schedule MAIN Notification
      if (enableAlerts) {
        const trigger: any = {
          type: TriggerType.TIMESTAMP,
          timestamp: prayerMoment.valueOf(),
          repeatFrequency: RepeatFrequency.DAILY,
        };

        await notifee.createTriggerNotification(
          {
            id: `prayer_main_${prayer.name.toLowerCase()}`,
            title: `Time for ${prayer.label}`,
            body: `It's time for ${prayer.label}. Prepare yourself for prayer.`,
            android: {
              channelId: 'default',
              importance: AndroidImportance.HIGH,
              pressAction: { id: 'default' },
            },
            ios: {
              critical: true,
              sound: 'default',
            },
          },
          trigger
        );
      }

      // 2. Schedule PRE-PRAYER Notification
      if (enablePreAlerts && preMinutes > 0) {
        const preMoment = prayerMoment.clone().subtract(preMinutes, 'minutes');
        
        // Only schedule if the pre-time hasn't passed today
        if (preMoment.isAfter(moment())) {
          const preTrigger: any = {
            type: TriggerType.TIMESTAMP,
            timestamp: preMoment.valueOf(),
            repeatFrequency: RepeatFrequency.DAILY,
          };

          await notifee.createTriggerNotification(
            {
              id: `prayer_pre_${prayer.name.toLowerCase()}`,
              title: `${prayer.label} in ${preMinutes} mins`,
              body: `Reminder: ${prayer.label} is starting in ${preMinutes} minutes. Prepare yourself for prayer.`,
              android: {
                channelId: 'default',
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
              },
              ios: {
                sound: 'default',
              },
            },
            preTrigger
          );
        }
      }
    }

    console.log('--- PRAYER NOTIFICATIONS SCHEDULED ---');
  } catch (error) {
    console.error('Error scheduling prayer notifications:', error);
  }
};
