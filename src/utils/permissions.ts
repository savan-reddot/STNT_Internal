import { Platform, Alert, PermissionsAndroid } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

export const requestAppPermission = async (
  type: 'camera' | 'gallery' | 'document',
) => {
  if (Platform.OS === 'android') {
    if (type === 'camera') {
      const camera = await check(PERMISSIONS.ANDROID.CAMERA);
      if (camera === RESULTS.GRANTED) {
        return true;
      }
      const reqCamera = await request(PERMISSIONS.ANDROID.CAMERA);
      return reqCamera === RESULTS.GRANTED;
    } else if (type === 'gallery') {
      // No permission needed for Android Photo Picker
      return true;
    } else if (type === 'document') {
      // No permission needed - @react-native-documents/picker uses Storage Access Framework
      return true;
    }
  } else {
    // iOS permissions
    let permission;
    if (type === 'camera') permission = PERMISSIONS.IOS.CAMERA;
    else if (type === 'gallery') permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    else if (type === 'document') {
      // For document picker on iOS, we don't need specific permissions
      // The document picker handles its own access
      return true;
    }
    else return false;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
      Alert.alert(
        'Permission Required',
        'Please enable this permission in settings to proceed.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
      return false;
    }

    const reqResult = await request(permission);
    return reqResult === RESULTS.GRANTED;
  }

  return false;
};

export const requestCameraPermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });

  if (!permission) return false;

  const result = await request(permission);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'Camera permission is needed to take pictures.',
      [{ text: 'Go to Settings', onPress: () => openSettings() }],
    );
    return false;
  }
  return true;
};

export const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    // No permission needed for Android Photo Picker
    return true;
  }

  const permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
  const result = await request(permission);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'Gallery access is needed to select images.',
      [{ text: 'Go to Settings', onPress: () => openSettings() }],
    );
    return false;
  }
  return true;
};

export const requestStoragePermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.MEDIA_LIBRARY,
  });

  if (!permission) return false;

  const result = await request(permission);
  console.log('Storage Permission Result:', result);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'File access permission is needed to upload documents.',
      [{ text: 'Go to Settings', onPress: () => openSettings() }],
    );
    return false;
  }
  return true;
};
