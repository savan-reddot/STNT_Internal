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