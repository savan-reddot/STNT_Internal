import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import React from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme, Switch } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screens } from '../../common/screens';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { getUser, setTheme } from '../../redux/reducer';
import { Font_Bold } from '../../theme/fonts';

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
  const dispatch = useAppDispatch();

  const toggleTheme = (value: boolean) => {
    dispatch(setTheme(value ? 'dark' : 'light'));
  };

  const doLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate(Screens.Splash);
  };

  const getIconColorAndBg = (title: string) => {
    switch (title) {
      case 'Terms & Conditions':
        return {
          bg: '#E0F2FE',
          color: '#0288D1',
          icon: 'file-document-outline',
        };
      case 'Privacy Policy':
        return {
          bg: '#F3E5F5',
          color: '#7B1FA2',
          icon: 'shield-check-outline',
        };
      case 'Change Password':
        return { bg: '#FFF3E0', color: '#F57C00', icon: 'lock-outline' };
      default:
        return { bg: '#F5F5F5', color: '#616161', icon: 'circle-outline' };
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? If you confirm, you will be signed out from this app.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            doLogout();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handlePress = (item: any) => {
    if (item.title === 'Terms & Conditions') {
      navigation.navigate(Screens.WebView, {
        url: 'https://claims.stntinternational.com/web/terms-conditions',
      });
    } else if (item.title === 'Change Password') {
      navigation.navigate(Screens.ChangePassword);
    } else if (item.title === 'Privacy Policy') {
      navigation.navigate(Screens.WebView, {
        url: 'https://claims.stntinternational.com/web/privacy-policy',
      });
    }
  };

  return (
    <AppLayout title={'MY PROFILE'}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header Background */}
        {/* <View style={styles(theme).headerBackground} /> */}

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Profile Card */}
          <View style={styles(theme).profileCard}>
            <View style={styles(theme).avatarContainer}>
              {user?.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles(theme).avatar}
                />
              ) : (
                <View style={styles(theme).avatarPlaceholder}>
                  <Text style={styles(theme).avatarText}>
                    {user?.firstName
                      ? user.firstName.charAt(0).toUpperCase()
                      : 'U'}
                  </Text>
                </View>
              )}
              <View style={styles(theme).shieldBadge}>
                <Icon name="shield-check" size={12} color="#0F8A65" />
              </View>
            </View>

            <Text style={styles(theme).userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles(theme).userDetails}>
              MEMBER • {user?.id || 'N/A'}
            </Text>

            <TouchableOpacity
              style={styles(theme).editButton}
              onPress={() => navigation.navigate(Screens.UserDetails)}
            >
              <Text style={styles(theme).editButtonText}>EDIT DETAILS</Text>
            </TouchableOpacity>
          </View>

          {/* Dark Mode Toggle */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles(theme).sectionTitle}>PREFERENCES</Text>
            <View style={styles(theme).sectionContainer}>
              <View style={[styles(theme).listItem, { borderBottomWidth: 0 }]}>
                <View
                  style={[
                    styles(theme).iconBox,
                    { backgroundColor: theme.dark ? '#1E1B4B' : '#E0E7FF' },
                  ]}
                >
                  <Icon name="weather-sunny" size={20} color="#4F46E5" />
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles(theme).listItemText}>DARK MODE</Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#9CA3AF',
                      fontFamily: Font_Bold,
                      letterSpacing: 1,
                      marginTop: 2,
                    }}
                  >
                    {theme.dark ? 'ENABLED' : 'DISABLED'}
                  </Text>
                </View>
                <Switch
                  value={theme.dark}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Settings Lists */}
          <View style={{ marginTop: 20 }}>
            {data.map((section, index) => {
              // Filter out items handled elsewhere
              const filteredActions = section.actions.filter(
                action =>
                  action.title !== 'Profile Details' &&
                  action.title !== 'Log out',
              );

              if (filteredActions.length === 0) return null;

              return (
                <View key={index} style={{ marginBottom: 20 }}>
                  {section.title ? (
                    <Text style={styles(theme).sectionTitle}>
                      {section.title.toUpperCase()}
                    </Text>
                  ) : null}
                  <View style={styles(theme).sectionContainer}>
                    {filteredActions.map((item, idx) => {
                      const { bg, color, icon } = getIconColorAndBg(item.title);
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={styles(theme).listItem}
                          onPress={() => handlePress(item)}
                        >
                          <View
                            style={[
                              styles(theme).iconBox,
                              { backgroundColor: bg },
                            ]}
                          >
                            <Icon name={icon} size={20} color={color} />
                          </View>
                          <Text style={styles(theme).listItemText}>
                            {item.title}
                          </Text>
                          <Icon
                            name="chevron-right"
                            size={20}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Sign Out Button */}
        <View style={styles(theme).footer}>
          <TouchableOpacity
            style={styles(theme).signOutBtn}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={styles(theme).signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
          <Text style={styles(theme).versionText}>
            V{DeviceInfo.getVersion()} • ST&T GLOBAL SYSTEMS
          </Text>
        </View>
      </View>
    </AppLayout>
  );
};

export default Profile;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    headerBackground: {
      backgroundColor: '#004D40', // Dark green matching screenshot
      height: 120,
      width: '100%',
      position: 'absolute',
      top: 0,
    },
    profileCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: metrics.doubleMargin,
      marginTop: 20,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 24,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: '#0F8A65',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 32,
      color: '#fff',
      fontFamily: Font_Bold,
    },
    shieldBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 4,
      elevation: 2,
    },
    userName: {
      fontSize: 20,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 12,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      marginBottom: 20,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    editButton: {
      backgroundColor: theme.dark ? '#374151' : '#F9FAFB',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
    },
    editButtonText: {
      fontSize: 14,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    sectionTitle: {
      marginHorizontal: metrics.doubleMargin,
      marginBottom: 8,
      fontSize: 12,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      letterSpacing: 1.5,
      fontWeight: 'bold',
    },
    sectionContainer: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: metrics.doubleMargin,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 0,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    listItemText: {
      flex: 1,
      fontSize: 16,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: metrics.doubleMargin,
      paddingVertical: metrics.doubleMargin,
      alignItems: 'center',
    },
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.dark ? '#3B1E1E' : '#FEF2F2',
      borderRadius: 20,
      height: 56,
      width: '100%',
      marginBottom: 10,
      gap: 12,
    },
    signOutText: {
      color: '#EF4444',
      fontSize: 16,
      fontFamily: Font_Bold,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    versionText: {
      fontSize: 12,
      color: '#D1D5DB',
      fontFamily: Font_Bold,
      fontWeight: 'bold',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  });
