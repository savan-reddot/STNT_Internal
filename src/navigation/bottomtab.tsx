import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import Home from '../screens/home/home';
import Profile from '../screens/profile/profile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Screens } from '../common/screens';
import { metrics } from '../utils/metrics';
import Certification from '../screens/certification/certification';
import Policies from '../screens/policies/policies';
import { Image } from 'react-native';
import { Font_Medium, Font_Regular } from '../theme/fonts';
import VirtualCard from '../screens/virtual_card/virtual_card';

const Tab = createBottomTabNavigator();

const getScreenOptions = ({
  route,
  theme,
}: {
  theme: MD3Theme;
  route: RouteProp;
}): BottomTabNavigationOptions => ({
  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName: string;

    switch (route.name) {
      case Screens.Home:
        iconName = focused
          ? require('../../assets/images/home_focused.png')
          : require('../../assets/images/home.png');
        break;
      case Screens.Certification:
        iconName = focused
          ? require('../../assets/images/certification_focused.png')
          : require('../../assets/images/certification.png');
        break;
      case Screens.Policies:
        iconName = focused
          ? require('../../assets/images/policies_focused.png')
          : require('../../assets/images/policies.png');
        break;
      case Screens.Profile:
        iconName = focused
          ? require('../../assets/images/profile_focused.png')
          : require('../../assets/images/profile.png');
        break;
      default:
        iconName = 'alert';
    }

    return (
      <Image
        source={iconName}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    );
  },
  tabBarActiveTintColor: '#009688',
  tabBarInactiveTintColor: '#72849A',
  tabBarStyle: {
    backgroundColor: 'white',
    paddingVertical: metrics.doubleMargin,
    borderRadius: metrics.baseRadius,
    // marginTop: metrics.baseMargin,
    height: metrics.screenHeight * 0.09,
    // marginHorizontal: metrics.baseMargin,
    // height: metrics.screenHeight * 0.08,
  },
  tabBarLabelStyle: {
    fontSize: 14,
    fontFamily: Font_Regular,
    fontWeight: '400',
  },
  headerShown: false,
});

const BottomTab = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator screenOptions={getScreenOptions}>
      <Tab.Screen name={Screens.Home} component={Home} />
      <Tab.Screen name={Screens.Certification} component={VirtualCard} />
      <Tab.Screen name={Screens.Policies} component={Policies} />
      <Tab.Screen name={Screens.Profile} component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTab;
