import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AppLayout from '../../components/safeareawrapper';
import { useTheme } from 'react-native-paper';

const WebViewScreen = ({ route, navigation }: any) => {
  const { url } = route.params;
  const theme = useTheme();

  // Fix for Android PDF preview issue
  const getDisplayUrl = () => {
    if (Platform.OS === 'android' && url.includes('.pdf')) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url,
      )}`;
    }
    return url;
  };

  return (
    <AppLayout title="" onBackPress={() => navigation.pop()}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <WebView
          source={{ uri: getDisplayUrl() }}
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </AppLayout>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
