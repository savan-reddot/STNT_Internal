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
  type: 'camera' | 'gallery' | 'document' | 'location',
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
    } else if (type === 'location') {
      const location = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (location === RESULTS.GRANTED) {
        return true;
      }
      const reqLocation = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (reqLocation === RESULTS.BLOCKED) {
        showPermissionAlert('Please grant location permission to calculate Qibla direction.');
        return false;
      }
      return reqLocation === RESULTS.GRANTED;
    } else if (type === 'gallery') {
      // Android's native photo picker/SAF picker handles media selection out-of-process.
      // Since storage permissions are explicitly removed from AndroidManifest.xml,
      // checking/requesting them will always fail. Bypassing permission check is correct.
      return true;
    } else if (type === 'document') {
      // Document picker (SAF) handles file selection out-of-process and does not require permissions.
      return true;
    }
  } else {
    // iOS permissions
    let permission;
    if (type === 'camera') permission = PERMISSIONS.IOS.CAMERA;
    else if (type === 'gallery') permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    else if (type === 'location') permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
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
          : type === 'location'
          ? 'Please grant location permission to calculate Qibla direction.'
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
          : type === 'location'
          ? 'Please grant location permission to calculate Qibla direction.'
          : 'Please grant gallery permission to select images.';
      
      showPermissionAlert(permissionMessage);
      return false;
    }

    // If denied, return false (the handlers will show appropriate alerts)
    return false;
  }

  return false;
};