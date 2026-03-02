import { Text } from '../components/common';
import { Animated, Image, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { globalStyle } from '../utils/globalStyles';
import { useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../common/screens';
import { getUser, setToken, setUser, setUserDetails, setWebToken } from '../redux/reducer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }: any) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Start small

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 2000,
      useNativeDriver: true,
    }).start(async () => {
      // After animation, navigate to Login or Home
      try {
        const user = await AsyncStorage.getItem('@user');
        const user_details = await AsyncStorage.getItem('userdetails');
        const token = await AsyncStorage.getItem('@token');
        const webToken = await AsyncStorage.getItem('webtoken');

        if (token && user) {
          try {
            // Parse user data safely
            const parsedUser = JSON.parse(user);
            dispatch(setUser(parsedUser));
            dispatch(setToken(token));

            // Set user details if available
            if (user_details) {
              try {
                const parsedUserDetails = JSON.parse(user_details);
                dispatch(setUserDetails(parsedUserDetails));
              } catch (parseError) {
                console.warn('Failed to parse user details:', parseError);
                // Continue without user details
              }
            }

            // Set web token if available
            if (webToken) {
              dispatch(setWebToken(webToken));
            }

            navigation.reset({
              index: 0,
              routes: [{ name: Screens.BottomTab }],
            });
          } catch (parseError) {
            console.error('Splash - Error parsing user data:', parseError);
            // Clear corrupted data and go to onboard
            try {
              await AsyncStorage.multiRemove(['@token', 'webtoken', '@user', 'userdetails']);
            } catch (clearError) {
              console.error('Splash - Error clearing corrupted data:', clearError);
            }
            navigation.replace(Screens.Onboard);
          }
        } else {
          navigation.replace(Screens.Onboard);
        }
      } catch (error) {
        console.error('Splash - Error during token restoration:', error);
        // Clear potentially corrupted data and go to onboard
        try {
          await AsyncStorage.multiRemove(['@token', 'webtoken', '@user', 'userdetails']);
        } catch (clearError) {
          console.error('Splash - Error clearing corrupted data:', clearError);
        }
        navigation.replace(Screens.Onboard);
      }
    });
  }, [scaleAnim, navigation]);

  return (
    <View
      style={[
        globalStyle(theme).container,
        {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <Animated.Image
        source={require('../../assets/images/logo.png')}
        resizeMode="contain"
        style={{
          height: metrics.screenWidth * 0.6,
          width: metrics.screenWidth * 0.8,
          transform: [{ scale: scaleAnim }],
        }}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({});
