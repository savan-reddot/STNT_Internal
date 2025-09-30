import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { globalStyle } from '../utils/globalStyles';
import { useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../common/screens';
import { getUser, setToken, setUser, setUserDetails } from '../redux/reducer';
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
      const user = await AsyncStorage.getItem('@user');
      const user_details = await AsyncStorage.getItem('userdetails');
      const token = await AsyncStorage.getItem('@token');
      if (token && user) {
        dispatch(setUser(JSON.parse(user)));
        dispatch(setUserDetails(JSON.parse(user_details)));
        dispatch(setToken(token));
        navigation.replace(Screens.BottomTab);
      } else {
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
