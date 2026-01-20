import { Linking, AppState, Platform } from 'react-native';
import { Screens } from '../common/screens';
import { useRef } from 'react';

export const useDeepLink = () => {
  // Keep track of the last processed URL to avoid duplicates on AppState changes
  const lastProcessedUrl = useRef<string | null>(null);

  const linking = {
    prefixes: ['stnt://'],
    config: {
      screens: {
        [Screens.ResetPassword]: 'reset-password',
      },
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log(`🚀 [${Platform.OS}] Deep Link Initial URL:`, url);
        lastProcessedUrl.current = url;
      }
      return url;
    },
    subscribe(listener: (url: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => {
        console.log(`✅ [${Platform.OS}] Linking received URL:`, url);
        lastProcessedUrl.current = url;
        listener(url);
      };
      
      const linkingSubscription = Linking.addEventListener('url', onReceiveURL);
      
      // Listen to AppState changes to handle foregrounding (mainly for Android edge cases)
      const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'active') {
          const url = await Linking.getInitialURL();
          if (url && url !== lastProcessedUrl.current) {
             console.log(`⚡ [${Platform.OS}] AppState active, checking Initial URL (New):`, url);
             lastProcessedUrl.current = url;
             listener(url);
          } else if (url) {
             console.log(`⚠️ [${Platform.OS}] AppState active, ignoring duplicate URL:`, url);
          }
        }
      });

      return () => {
        linkingSubscription.remove();
        appStateSubscription.remove();
      };
    },
  };

  return linking;
};
