import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Home from '../screens/home/home';
import Profile from '../screens/profile/profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Screens } from '../common/screens';
import { metrics } from '../utils/metrics';
import Policies from '../screens/policies/policies';
import { Font_Regular } from '../theme/fonts';
import PreferredMerchants from '../screens/preferred_merchants/preferred_merchants';
import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: string;

          switch (route.name) {
            case Screens.Home:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case Screens.PreferredMerchants:
              iconName = focused ? 'tag' : 'tag-outline';
              break;
            case Screens.Policies:
              iconName = focused ? 'shield-check' : 'shield-check-outline';
              break;
            case Screens.Profile:
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'alert-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.dark ? '#9CA3AF' : '#72849A',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          paddingVertical: metrics.doubleMargin,
          borderTopWidth: 0,
          height: metrics.screenHeight * 0.09,
          borderTopColor: theme.dark ? '#333' : '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: Font_Regular,
          fontWeight: '400',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name={Screens.Home} component={Home} />
      <Tab.Screen
        name={Screens.PreferredMerchants}
        component={PreferredMerchants}
        options={{ tabBarLabel: 'Deals' }}
      />
      <Tab.Screen
        name={Screens.Policies}
        component={Policies}
        options={{ tabBarLabel: 'Insurance' }}
      />
      <Tab.Screen name={Screens.Profile} component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTab;
