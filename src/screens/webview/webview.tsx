import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Share,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AppLayout from '../../components/safeareawrapper';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const WebViewScreen = ({ route, navigation }: any) => {
  const { url, title = '' } = route.params;
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this document: ${title}\n${url}`,
        url: url, // iOS only
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <AppLayout
      title={title}
      onBackPress={() => navigation.pop()}
      right={
        <TouchableOpacity onPress={handleShare} style={{ marginRight: 15 }}>
          <Icon name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      }
    >
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
