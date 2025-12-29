import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import Home from '../screens/home/home';
import Profile from '../screens/profile/profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Screens } from '../common/screens';
import { metrics } from '../utils/metrics';
import Policies from '../screens/policies/policies';
import { Font_Regular } from '../theme/fonts';
import VirtualCard from '../screens/virtual_card/virtual_card';

const Tab = createBottomTabNavigator();

const getScreenOptions = ({route}: {
  route: RouteProp<any, any>;
}): BottomTabNavigationOptions => ({
  tabBarIcon: ({ focused, color, size }: any) => {
    let iconName: string;

    switch (route.name) {
      case Screens.Home:
        iconName = focused ? 'home' : 'home-outline';
        break;
      case Screens.Certification:
        iconName = focused ? 'card-account-details' : 'card-account-details-outline';
        break;
      case Screens.Policies:
        iconName = focused ? 'file-document' : 'file-document-outline';
        break;
      case Screens.Profile:
        iconName = focused ? 'account' : 'account-outline';
        break;
      default:
        iconName = 'alert-circle-outline';
    }

    return <Icon name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: '#009688',
  tabBarInactiveTintColor: '#72849A',
  tabBarStyle: {
    backgroundColor: 'white',
    paddingVertical: metrics.doubleMargin,
    borderRadius: metrics.baseRadius,
    height: metrics.screenHeight * 0.09,
  },
  tabBarLabelStyle: {
    fontSize: 14,
    fontFamily: Font_Regular,
    fontWeight: '400',
  },
  headerShown: false,
});

const BottomTab = () => {
  return (
    <Tab.Navigator screenOptions={getScreenOptions as any}>
      <Tab.Screen name={Screens.Home} component={Home} />
      <Tab.Screen name={Screens.Certification} component={VirtualCard} />
      <Tab.Screen name={Screens.Policies} component={Policies} />
      <Tab.Screen name={Screens.Profile} component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTab;
