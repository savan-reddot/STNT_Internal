import { Platform, Alert, PermissionsAndroid } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

/**
 * Helper function to show permission alert with option to open settings
 */
const showPermissionAlert = (message: string) => {
  Alert.alert(
    'Permission Required',
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => openSettings() },
    ],
  );
};

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
      if (reqCamera === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant camera permission to take pictures.');
        return false;
      }
      return reqCamera === RESULTS.GRANTED;
    } else if (type === 'gallery') {
      // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
      // For Android 12 and below, use READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version;
      let permission;
      
      if (androidVersion >= 33) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }

      if (result === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant gallery permission to select images.');
        return false;
      }

      const reqResult = await request(permission);
      if (reqResult === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant gallery permission to select images.');
        return false;
      }
      return reqResult === RESULTS.GRANTED;
    } else if (type === 'document') {
      // For Android 13+ (API 33+), use READ_MEDIA_IMAGES for images
      // For Android 10-12, use READ_EXTERNAL_STORAGE
      // For Android 9 and below, use READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version;
      let permission;
      
      if (androidVersion >= 33) {
        // Android 13+ uses granular media permissions
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else if (androidVersion >= 29) {
        // Android 10-12 uses scoped storage, but we still need READ_EXTERNAL_STORAGE for some cases
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      } else {
        // Android 9 and below
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }

      if (result === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant file access permission to upload documents.');
        return false;
      }

      const reqResult = await request(permission);
      if (reqResult === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant file access permission to upload documents.');
        return false;
      }
      return reqResult === RESULTS.GRANTED;
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

    // If already granted, return true
    if (result === RESULTS.GRANTED) return true;

    // If blocked (user denied and selected "Don't Ask Again"), show alert to go to settings
    if (result === RESULTS.BLOCKED) {
      const permissionMessage = 
        type === 'camera' 
          ? 'Please grant camera permission to take pictures.'
          : 'Please grant gallery permission to select images.';
      
      showPermissionAlert(permissionMessage);
      return false;
    }

    // If denied (first time) or unavailable, request permission
    // This will show the native iOS permission dialog
    const reqResult = await request(permission);
    
    if (reqResult === RESULTS.GRANTED) {
      return true;
    }
    
    // If blocked after request, show alert to go to settings
    if (reqResult === RESULTS.BLOCKED) {
      const permissionMessage = 
        type === 'camera' 
          ? 'Please grant camera permission to take pictures.'
          : 'Please grant gallery permission to select images.';
      
      showPermissionAlert(permissionMessage);
      return false;
    }

    // If denied, return false (the handlers will show appropriate alerts)
    return false;
  }

  return false;
};