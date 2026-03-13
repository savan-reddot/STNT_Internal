/**
 * @format
 */
import 'react-native-reanimated'; // top of the file
import { Appearance, AppRegistry, LogBox, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';
import { onDisplayNotification } from './src/utils/notificationUtils';

Appearance.setColorScheme('light');
LogBox.ignoreAllLogs(true);

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // On iOS, the system automatically displays the notification if title/body exists.
  // We only need to manually display via Notifee on Android.
  if (Platform.OS === 'android') {
    await onDisplayNotification(remoteMessage);
  }
});

AppRegistry.registerComponent(appName, () => App);
