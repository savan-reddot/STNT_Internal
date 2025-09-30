import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import React from 'react';
import Login from '../screens/login/login';
import Register from '../screens/register/register';
import Home from '../screens/home/home';
import Profile from '../screens/profile/profile';
import Claim from '../screens/claim/claim';
import Emergency from '../screens/emergency/emergency';
import { Screens } from '../common/screens';
import Splash from '../screens/splash';
import Onboard from '../screens/onboard';
import BottomTab from './bottomtab';
import EmergencyHelp from '../screens/emergency/emergency';
import TrustedHospitals from '../screens/trusted_hospitals/trusted_hospitals';
import ClaimRequest from '../screens/claim_request/claim_request';
import AddNewClaim from '../screens/claim_request/add_new_claim';
import Terms from '../screens/terms';
import ChangePassword from '../screens/change_password/change_password';
import PrivacyPolicy from '../screens/privacy_policy';
import WebViewScreen from '../screens/webview/webview';
import UserProfile from '../screens/user_profile/user_profile';
import Notification from '../screens/notification/notification';
import ClaimDetails from '../screens/claim/claim_details';
import DraftClaims from '../screens/claim/claim_draft';

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Screens.Splash} component={Splash} />
      <Stack.Screen name={Screens.Onboard} component={Onboard} />
      <Stack.Screen name={Screens.Login} component={Login} />
      <Stack.Screen name={Screens.Register} component={Register} />
      <Stack.Screen name={Screens.BottomTab} component={BottomTab} />
      <Stack.Screen name={Screens.Home} component={Home} />
      <Stack.Screen name={Screens.Profile} component={Profile} />
      <Stack.Screen name={Screens.Claim} component={Claim} />
      <Stack.Screen name={Screens.ClaimRequest} component={ClaimRequest} />
      <Stack.Screen name={Screens.AddNewClaim} component={AddNewClaim} />
      <Stack.Screen name={Screens.EmergencyHelp} component={EmergencyHelp} />
      <Stack.Screen name={Screens.Terms} component={Terms} />
      <Stack.Screen name={Screens.PrivacyPolicy} component={PrivacyPolicy} />
      <Stack.Screen name={Screens.ChangePassword} component={ChangePassword} />
      <Stack.Screen name={Screens.WebView} component={WebViewScreen} />
      <Stack.Screen name={Screens.UserDetails} component={UserProfile} />
      <Stack.Screen name={Screens.Notification} component={Notification} />
      <Stack.Screen name={Screens.ClaimDetails} component={ClaimDetails} />
      <Stack.Screen name={Screens.DraftClaims} component={DraftClaims} />
      <Stack.Screen
        name={Screens.TrustedHospitals}
        component={TrustedHospitals}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
