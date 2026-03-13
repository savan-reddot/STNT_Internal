import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

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
