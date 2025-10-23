import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { View, Text, useColorScheme, Platform } from 'react-native';
import React, { useEffect } from 'react';
import { darkTheme, lightTheme } from './src/theme/theme';
import { store } from './src/redux/store';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/main';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toastConfig';
import { requestAppPermission } from './src/utils/permissions';
import { PERMISSIONS, request } from 'react-native-permissions';
import { navigationRef } from './src/utils/navigationRef';

const App = () => {
  const scheme = useColorScheme();

  useEffect(() => {
    const init = async () => {
      if (Platform.OS == 'ios') {
        const cam = await request(PERMISSIONS.IOS.CAMERA);
        const photos = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        const document = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        console.log('Camera:', cam, 'Photos:', photos);
      } else {
        // Only request camera permission for Android
        // Gallery access uses Android Photo Picker (no permission needed)
        const cam = await request(PERMISSIONS.ANDROID.CAMERA);
        console.log('Camera:', cam);
      }
    };

    init();
  }, []);

  return (
    <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <MainStack />
          <Toast config={toastConfig} />
        </NavigationContainer>
      </Provider>
    </PaperProvider>
  );
};

export default App;
