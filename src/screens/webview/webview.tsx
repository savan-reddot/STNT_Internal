import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AppLayout from '../../components/safeareawrapper';

const WebViewScreen = ({ route, navigation }: any) => {
  const { url } = route.params;

  return (
    <AppLayout title="" onBackPress={() => navigation.pop()}>
      <View style={styles.container}>
        <WebView
          source={{ uri: url }}
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
