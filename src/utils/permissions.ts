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
  let permission;

  if (Platform.OS === 'android') {
    const camera = await check(PERMISSIONS.ANDROID.CAMERA);
    const image = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    const video = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

    if (
      camera == RESULTS.GRANTED &&
      image === RESULTS.GRANTED &&
      video === RESULTS.GRANTED
    ) {
      return true;
    }

    // If not granted, request all 3
    const [reqCamera, reqImage, reqVideo] = await Promise.all([
      request(PERMISSIONS.ANDROID.CAMERA),
      request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES),
      request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO),
    ]);

    return (
      reqCamera === RESULTS.GRANTED &&
      reqImage === RESULTS.GRANTED &&
      reqVideo === RESULTS.GRANTED
    );
  } else {
    if (type === 'camera') permission = PERMISSIONS.IOS.CAMERA;
    else if (type === 'gallery') permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    else if (type === 'document')
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
  }

  const result = await check(permission);

  if (result === RESULTS.GRANTED) return true;

  if (result === RESULTS.BLOCKED || result === RESULTS.DENIED) {
    Alert.alert(
      'Permission Required',
      'Please enable this permission in settings to proceed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ],
    );
    return false;
  }

  const reqResult = await request(permission).then(status => {
    return status;
  });
  // return reqResult === RESULTS.GRANTED;
};

export const requestCameraPermission = async () => {
  const permission = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  });

  const result = await request(permission);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'Camera permission is needed to take pictures.',
      [{ text: 'Go to Settings', onPress: openSettings }],
    );
    return false;
  }
  return true;
};

export const requestGalleryPermission = async () => {
  const permission = Platform.select({
    android:
      Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  });

  const result = await request(permission);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'Gallery access is needed to select images.',
      [{ text: 'Go to Settings', onPress: openSettings }],
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

  const result = await request(permission);
  console.log('Storage Permission Result:', result);
  if (result !== RESULTS.GRANTED) {
    Alert.alert(
      'Permission Required',
      'File access permission is needed to upload documents.',
      [{ text: 'Go to Settings', onPress: openSettings }],
    );
    return false;
  }
  return true;
};
