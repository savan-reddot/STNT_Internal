import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import AppLayout from '../../components/safeareawrapper';

const WebViewScreen = ({ route, navigation }: any) => {
  const { url } = route.params;

  // Fix for Android PDF preview issue
  const getDisplayUrl = () => {
    if (Platform.OS === 'android' && url.includes('.pdf')) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  return (
    <AppLayout title="" onBackPress={() => navigation.pop()}>
      <View style={styles.container}>
        <WebView
          source={{ uri: getDisplayUrl() }}
          style={styles.container}
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
