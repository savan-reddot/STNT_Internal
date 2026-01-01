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

import { darkTheme, lightTheme } from './src/theme/theme';
import { store } from './src/redux/store';
import MainStack from './src/navigation/main';
import { toastConfig } from './src/utils/toastConfig';
import { navigationRef } from './src/utils/navigationRef';

import { useAppSelector } from './src/redux/hooks';
import { getTheme } from './src/redux/reducer';

const AppContent = () => {
  const scheme = useColorScheme();
  const storedTheme = useAppSelector(getTheme);
  const insets = useSafeAreaInsets();

  const isDark = storedTheme ? storedTheme === 'dark' : scheme === 'dark';
  const activeTheme = isDark ? darkTheme : lightTheme;

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
      }}
    >
      <PaperProvider theme={activeTheme}>
        <NavigationContainer ref={navigationRef}>
          <MainStack />
          <Toast config={toastConfig} />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
