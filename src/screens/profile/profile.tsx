/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screens } from '../../common/screens';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import fontStyle from '../../styles/fontStyle';

const data = [
  {
    title: '',
    actions: [
      {
        title: 'Profile Details',
        icon: require('../../../assets/images/user.png'),
      },
    ],
  },
  {
    title: 'Help and Support',
    actions: [
      {
        title: 'Terms & Conditions',
        icon: require('../../../assets/images/terms.png'),
      },
      {
        title: 'Privacy Policy',
        icon: require('../../../assets/images/privacy_policy.png'),
      },
    ],
  },
  {
    title: 'Settings',
    actions: [
      {
        title: 'Change Password',
        icon: require('../../../assets/images/lock.png'),
      },
      {
        title: 'Log out',
        icon: require('../../../assets/images/logout.png'),
      },
    ],
  },
];

const Profile = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const doLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate(Screens.Splash);
  };

  return (
    <AppLayout title={''}>
      <View style={[globalStyle(theme).container]}>
        <View style={styles(theme).profile_parent}>
          <View style={styles(theme).profile_image}>
            <Image
              source={
                user?.profile_picture
                  ? { uri: user?.profile_picture }
                  : require('../../../assets/images/account-circle-line.png')
              }
              style={{
                height: user?.profile_picture
                  ? metrics.screenWidth * 0.2
                  : metrics.screenWidth * 0.1,
                width: user?.profile_picture
                  ? metrics.screenWidth * 0.2
                  : metrics.screenWidth * 0.1,
                borderRadius: metrics.screenWidth * 0.5,
                borderWidth: user?.profile_picture ? 2 : 0,
                borderColor: '#fff',
              }}
            />
          </View>
          <Text
            style={[fontStyle(theme).headingMedium, styles(theme).user_name]}
          >{`Hi, ${user?.firstName}`}</Text>
        </View>

        <View style={{ padding: metrics.doubleMargin }}>
          {data.map((section, index) => {
            return (
              <View style={{ marginLeft: metrics.baseMargin }} key={index}>
                {section.title && (
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      styles(theme).section_title,
                    ]}
                  >
                    {section.title}
                  </Text>
                )}
                <View style={styles(theme).section_child}>
                  {section.actions.map((item, index) => {
                    return (
                      <TouchableOpacity
                        key={'pi' + index}
                        onPress={() => {
                          if (item.title === 'Log out') {
                            doLogout();
                          } else if (item.title === 'Terms & Conditions') {
                            navigation.navigate(Screens.WebView, {
                              url: 'https://claims.stntinternational.com/web/terms-conditions',
                            });
                          } else if (item.title === 'Change Password') {
                            navigation.navigate(Screens.ChangePassword);
                          } else if (item.title === 'Privacy Policy') {
                            navigation.navigate(Screens.WebView, {
                              url: 'https://claims.stntinternational.com/web/privacy-policy',
                            });
                          } else if (item.title === 'Profile Details') {
                            navigation.navigate(Screens.UserDetails);
                          } else if (item.title === 'Delete Account') {
                            Alert.alert(
                              'Delete Account',
                              'Are you sure you want to delete ? If you confirm, you will be logged out form this app, and if there is no activity for 14 days your account will be automatically deleted but if you login again your delete request will be cancelled automatically.',
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: async () => {
                                    // Perform account deletion logic here
                                    doLogout();
                                  },
                                },
                              ],
                              { cancelable: true },
                            );
                          }
                        }}
                      >
                        <View style={styles(theme).section_item_image}>
                          <Image
                            source={item.icon}
                            style={[
                              styles(theme).section_item_image_icon,
                              {
                                tintColor:
                                  item.title === 'Delete Account' ||
                                  item.title === 'Log out'
                                    ? 'red'
                                    : theme.colors.onBackground,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              fontStyle(theme).headingSmall,
                              styles(theme).item_title,
                              {
                                color:
                                  item.title === 'Log out' ||
                                  item.title === 'Delete Account'
                                    ? 'red'
                                    : theme.colors.onBackground,
                              },
                            ]}
                          >
                            {item.title}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* <UButton
          title="Logout"
          onPress={() => doLogout()}
          style={{ flex: 0 }}
        /> */}
      </View>
    </AppLayout>
  );
};

export default Profile;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    profile_parent: {
      backgroundColor: theme.colors.primary,
      height: metrics.screenHeight * 0.15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profile_image: {
      width: metrics.screenWidth * 0.2,
      height: metrics.screenWidth * 0.2,
      borderRadius: metrics.screenWidth * 0.5,
      backgroundColor: '#8C8C8C',
      alignItems: 'center',
      justifyContent: 'center',
    },
    user_name: { marginVertical: metrics.doubleMargin, color: '#fff' },
    section_title: { fontSize: 14, fontWeight: '700' },
    section_child: {
      margin: metrics.baseMargin,
      marginLeft: 0,
      marginTop: 0,
    },
    section_item_image: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: metrics.baseMargin,
    },
    section_item_image_icon: {
      height: metrics.screenWidth * 0.06,
      width: metrics.screenWidth * 0.06,
      resizeMode: 'contain',
    },
    item_title: {
      fontWeight: 'regular',
      fontSize: 16,
      marginLeft: metrics.doubleMargin,
    },
  });
