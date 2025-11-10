import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { Platform, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { darkTheme, lightTheme } from './src/theme/theme';
import { store } from './src/redux/store';
import MainStack from './src/navigation/main';
import { toastConfig } from './src/utils/toastConfig';
import { navigationRef } from './src/utils/navigationRef';

const AppContent = () => {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }}>
      <PaperProvider theme={scheme === 'dark' ? darkTheme : lightTheme}>
        <Provider store={store}>
          <NavigationContainer ref={navigationRef}>
            <MainStack />
            <Toast config={toastConfig} />
          </NavigationContainer>
        </Provider>
      </PaperProvider>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
};

export default App;
