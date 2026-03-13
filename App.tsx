import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { Platform, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { PersistGate } from 'redux-persist/integration/react';
import { darkTheme, lightTheme } from './src/theme/theme';
import { store, persistor } from './src/redux/store';
import MainStack from './src/navigation/main';
import { toastConfig } from './src/utils/toastConfig';
import { navigationRef } from './src/utils/navigationRef';

import { useAppSelector } from './src/redux/hooks';
import { getTheme } from './src/redux/reducer';
import { useDeepLink } from './src/hooks/useDeepLink';
import { initNotifications } from './src/utils/notificationUtils';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const AppContent = () => {
  const scheme = useColorScheme();
  const storedTheme = useAppSelector(getTheme);
  const insets = useSafeAreaInsets();

  const isDark = storedTheme ? storedTheme === 'dark' : scheme === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;
  const linking = useDeepLink();

  React.useEffect(() => {
    let unsubscribe: any;
    const setup = async () => {
      unsubscribe = await initNotifications();
    };
    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
      }}
    >
      <PaperProvider theme={activeTheme}>
        <BottomSheetModalProvider>
          <NavigationContainer
            ref={navigationRef}
            linking={linking} // Use the linking object returned by the hook
          >
            <MainStack />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </PaperProvider>
    </View>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
