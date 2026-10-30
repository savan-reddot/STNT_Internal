/* eslint-disable react-native/no-inline-styles */
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { globalStyle } from '../../utils/globalStyles';
import { MD3Theme, useTheme } from 'react-native-paper';
import AppLayout from '../../components/safeareawrapper';
import fontStyle from '../../styles/fontStyle';
import { metrics } from '../../utils/metrics';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import {
  useLazyVerificationUserQuery,
  useLoginUserMutation,
  usePassportByIdMutation,
  useStaffLoginMutation,
} from '../../redux/services';
import { useAppDispatch } from '../../redux/hooks';
import {
  setStaffToken,
  setStaffUser,
  setToken,
  setUser,
  setUserDetails,
  setWebToken,
} from '../../redux/reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLoader from '../../components/loader';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import ForgotPassword from '../../components/forgot_password';
import { Text, TextInput } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFCMToken } from '../../utils/notificationUtils';
import { registerDevice } from '../../redux/agoraApi';
import { Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';

const Login = ({ navigation }: any) => {
  const theme = useTheme();
  const route = useRoute<any>();
  const [activePortal, setActivePortal] = useState<'pilgrim' | 'staff'>(
    route.params?.portal === 'staff' ? 'staff' : 'pilgrim',
  );

  useEffect(() => {
    if (route.params?.portal) {
      setActivePortal(route.params.portal);
    }
  }, [route.params?.portal]);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrPassport: __DEV__ ? 'savan@reddotinnovative.com' : '',
      password: __DEV__ ? '1234567' : '',
    },
  });

  const {
    control: staffControl,
    handleSubmit: handleStaffSubmit,
    setValue: setStaffValue,
  } = useForm({
    defaultValues: {
      username: __DEV__ ? 'leader.demo' : '',
      password: __DEV__ ? 'Stnt@2026' : '',
    },
  });

  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [staffLogin, { isLoading: isStaffLoading }] = useStaffLoginMutation();
  const [verificationUser] = useLazyVerificationUserQuery();
  const [passportById, { isLoading: isPassportNoLoading }] =
    usePassportByIdMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const onStaffLogin = async (data: any) => {
    console.log('staffLogin data==>>', data);
    try {
      const resp = await staffLogin({
        username: data.username?.trim(),
        password: data.password,
      });
      console.log('staffLogin resp==>>', resp);

      if (resp?.error) {
        const errorData = 'data' in resp.error ? resp.error.data : null;
        let errorMessage = 'Staff login failed. Please try again.';
        if (errorData && typeof errorData === 'object') {
          errorMessage =
            (errorData as any).message ||
            (errorData as any).error ||
            errorMessage;
        }
        showErrorToast(errorMessage, 'Login Error');
        return;
      }

      if (resp?.data?.status) {
        const { token, staff } = resp?.data?.data || {};
        if (token && staff) {
          await AsyncStorage.setItem('@staff_token', token);
          await AsyncStorage.setItem('@staff_user', JSON.stringify(staff));
          await AsyncStorage.setItem('@user_type', 'staff');

          dispatch(setStaffToken(token));
          dispatch(setStaffUser(staff));

          // Register device for Agora push notifications in the background
          getFCMToken().then(fcmToken => {
            if (fcmToken) {
              registerDevice({
                fcmToken,
                deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
              }).catch(err =>
                console.warn('[staff login] registerDevice failed:', err?.message),
              );
            }
          });

          showSuccessToast(
            resp?.data?.message || `Welcome, ${staff.name || 'Staff'}!`,
            'Success',
          );

          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: Screens.StaffHome }],
            });
          }, 300);
        } else {
          showErrorToast('Invalid staff data received from server.', 'Error !!');
        }
      } else {
        showErrorToast(resp?.data?.message || 'Login failed', 'Error !!');
      }
    } catch (error: any) {
      console.log('Staff login error:', error);
      showErrorToast(
        error?.message || 'Staff login failed. Please try again.',
        'Error !!',
      );
    }
  };

  const onLogin = async (data: any) => {
    console.log('loginUser data==>>', data);
    try {
      const resp = await loginUser(data);
      console.log('resp==>>', resp);
      if (resp?.error) {
        const errorData = 'data' in resp.error ? resp.error.data : null;
        const errorMessage =
          errorData && typeof errorData === 'object' && 'message' in errorData
            ? (errorData as any).message
            : 'Login failed';
        showErrorToast(errorMessage, 'Error !!');
        return;
      }

      if (resp?.data?.status) {
        const { user, token, latestUid, availableUids } = resp?.data?.data;

        // Filter availableUids matching user's passportNo
        let selectedUidObj: any = null;
        if (
          Array.isArray(availableUids) &&
          availableUids.length > 0 &&
          user?.passportNo
        ) {
          const userPassport = user.passportNo.trim().toLowerCase();
          const matchedUids = availableUids.filter(
            (item: any) =>
              item?.passportNo?.trim()?.toLowerCase() === userPassport,
          );

          if (matchedUids.length === 1) {
            selectedUidObj = matchedUids[0];
          } else if (matchedUids.length > 1) {
            selectedUidObj = matchedUids.slice().sort((a: any, b: any) => {
              const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            })[0];
          }
        }

        const targetLatestUid = selectedUidObj?.formatted || latestUid;

        // Store basic user data first
        try {
          await AsyncStorage.setItem('@token', token);
          await AsyncStorage.setItem(
            '@user',
            JSON.stringify({
              ...user,
              latestUid: targetLatestUid,
              availableUids,
            }),
          );
          dispatch(setToken(token));
          dispatch(
            setUser({ ...user, latestUid: targetLatestUid, availableUids }),
          );
        } catch (storageError) {
          console.error('Error storing login data:', storageError);
          showErrorToast(
            'Error saving login data. Please try again.',
            'Error !!',
          );
          return;
        }

        // Register device for Agora push notifications in the background
        getFCMToken().then(fcmToken => {
          console.log('fcmToken==>>', fcmToken);
          if (fcmToken) {
            registerDevice({
              fcmToken,
              deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
            }).catch(err =>
              console.warn('[login] registerDevice failed:', err?.message),
            );
          }
        });

        // Continue with additional verification in background
        try {
          const passportResp = await passportById({ uidNo: targetLatestUid });
          console.log('passportResp==>>', passportResp);
          if (passportResp?.data?.status) {
            const { data } = passportResp?.data;
            if (data && data?.passportNo) {
              const verificationResp = await verificationUser({
                name:
                  selectedUidObj?.name ||
                  `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                passportNo: selectedUidObj?.passportNo || data?.passportNo,
                uidNo: selectedUidObj?.formatted || targetLatestUid,
              });
              console.log('verificationResp==>>', verificationResp);
              if (verificationResp?.data?.success) {
                const { user: verificationUserData, token: webToken } =
                  verificationResp?.data;

                // Store additional verification data
                try {
                  await AsyncStorage.setItem('webtoken', webToken);
                  await AsyncStorage.setItem(
                    'userdetails',
                    JSON.stringify(verificationUserData),
                  );
                  dispatch(setUserDetails(verificationUserData));
                  dispatch(setWebToken(webToken));
                } catch (verificationStorageError) {
                  console.error(
                    'Error storing verification data:',
                    verificationStorageError,
                  );
                }
              } else {
                showErrorToast(
                  verificationResp?.data?.message || 'Verification failed',
                  'Warning',
                );
              }
            } else {
              showErrorToast('Passport Not Found !!', 'Warning');
            }
          } else {
            showErrorToast('Passport Not Found !!', 'Warning');
          }
        } catch (verificationError) {
          console.log('Verification process error:', verificationError);
          // Don't show error toast for background verification failures
          // User is already logged in and can use the app
        }

        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: Screens.BottomTab }],
        // });
        setTimeout(() => {
          navigation.navigate(Screens.BottomTab);
        }, 500);
      } else {
        showErrorToast(resp?.data?.message, 'Error !!');
      }
    } catch (error) {
      console.log('Login error:', error);
      showErrorToast('Login failed. Please try again.', 'Error !!');
    }
  };

  const isLoad = isLoading || isStaffLoading || isPassportNoLoading;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[
        styles(theme).keyboard_avoid,
        { backgroundColor: theme.colors.background },
      ]}
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <AppLayout title="">
        <ScreenLoader visible={isLoad} />
        <View
          style={[
            globalStyle(theme).container,
            { padding: metrics.doubleMargin },
          ]}
        >
          <Text style={fontStyle(theme).headingMedium}>WELCOME BACK</Text>
          <Text
            style={[
              fontStyle(theme).titleSmall,
              { color: theme.dark ? '#D1D5DB' : '#4F4F4F' },
            ]}
          >
            {activePortal === 'pilgrim'
              ? 'Log in to access your digital ePass and concierge services.'
              : 'Log in to access the Staff Command Portal and operations team.'}
          </Text>

          {/* Portal Switcher */}
          <View style={styles(theme).portalToggleContainer}>
            <TouchableOpacity
              style={[
                styles(theme).portalTab,
                activePortal === 'pilgrim' && styles(theme).portalTabActive,
              ]}
              onPress={() => setActivePortal('pilgrim')}
              activeOpacity={0.8}
            >
              <Icon
                name="person-outline"
                size={18}
                color={
                  activePortal === 'pilgrim'
                    ? '#FFFFFF'
                    : theme.dark
                    ? '#9CA3AF'
                    : '#4B5563'
                }
              />
              <Text
                style={[
                  styles(theme).portalTabText,
                  activePortal === 'pilgrim'
                    ? styles(theme).portalTabTextActive
                    : { color: theme.dark ? '#D1D5DB' : '#374151' },
                ]}
              >
                Pilgrim Portal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles(theme).portalTab,
                activePortal === 'staff' && styles(theme).portalTabActive,
              ]}
              onPress={() => setActivePortal('staff')}
              activeOpacity={0.8}
            >
              <Icon
                name="shield-outline"
                size={18}
                color={
                  activePortal === 'staff'
                    ? '#F59E0B'
                    : theme.dark
                    ? '#9CA3AF'
                    : '#4B5563'
                }
              />
              <Text
                style={[
                  styles(theme).portalTabText,
                  activePortal === 'staff'
                    ? styles(theme).portalTabTextActive
                    : { color: theme.dark ? '#D1D5DB' : '#374151' },
                ]}
              >
                Staff Portal
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles(theme).parent_view, { flex: 1 }]}>
            {activePortal === 'pilgrim' ? (
              <>
                <Controller
                  key={'emailOrPassport'}
                  control={control}
                  name={'emailOrPassport'}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles(theme).child_view}>
                      <Text style={fontStyle(theme).headingSmall}>
                        Email or passport number
                      </Text>
                      <TextInput
                        mode="outlined"
                        onChangeText={onChange}
                        value={value}
                        placeholder="Enter your email or passport number"
                        outlineStyle={{ borderRadius: metrics.baseRadius }}
                        style={{
                          height: metrics.screenWidth * 0.13,
                          borderColor: theme.dark ? '#4B5563' : '#BDBDBD',
                          fontSize: 14,
                          backgroundColor: theme.colors.surface,
                        }}
                        keyboardType="email-address"
                      />
                    </View>
                  )}
                />

                <Controller
                  key={'password'}
                  control={control}
                  name={'password'}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles(theme).child_view}>
                      <Text style={fontStyle(theme).headingSmall}>Password</Text>
                      <TextInput
                        mode="outlined"
                        placeholder="Enter password"
                        value={value}
                        onChangeText={onChange}
                        outlineStyle={{ borderRadius: metrics.baseRadius }}
                        style={{
                          height: metrics.screenWidth * 0.13,
                          fontSize: 14,
                          borderColor: theme.dark ? '#4B5563' : '#BDBDBD',
                          backgroundColor: theme.colors.surface,
                        }}
                        secureTextEntry={!showPassword}
                        right={
                          <TextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        }
                      />
                    </View>
                  )}
                />

                <View style={styles(theme).child_view}>
                  <UButton
                    title={'LOGIN'}
                    onPress={handleSubmit(onLogin)}
                  />
                </View>

                <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
                  <View
                    style={[
                      styles(theme).child_view,
                      {
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: metrics.doubleMargin,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          color: theme.colors.primary,
                          textDecorationLine: 'underline',
                        },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Controller
                  key={'staffUsername'}
                  control={staffControl}
                  name={'username'}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles(theme).child_view}>
                      <Text style={fontStyle(theme).headingSmall}>
                        Staff Username
                      </Text>
                      <TextInput
                        mode="outlined"
                        onChangeText={onChange}
                        value={value}
                        placeholder="Enter staff username"
                        outlineStyle={{ borderRadius: metrics.baseRadius }}
                        style={{
                          height: metrics.screenWidth * 0.13,
                          borderColor: theme.dark ? '#4B5563' : '#BDBDBD',
                          fontSize: 14,
                          backgroundColor: theme.colors.surface,
                        }}
                        autoCapitalize="none"
                      />
                    </View>
                  )}
                />

                <Controller
                  key={'staffPassword'}
                  control={staffControl}
                  name={'password'}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles(theme).child_view}>
                      <Text style={fontStyle(theme).headingSmall}>Password</Text>
                      <TextInput
                        mode="outlined"
                        placeholder="Enter password"
                        value={value}
                        onChangeText={onChange}
                        outlineStyle={{ borderRadius: metrics.baseRadius }}
                        style={{
                          height: metrics.screenWidth * 0.13,
                          fontSize: 14,
                          borderColor: theme.dark ? '#4B5563' : '#BDBDBD',
                          backgroundColor: theme.colors.surface,
                        }}
                        secureTextEntry={!showStaffPassword}
                        right={
                          <TextInput.Icon
                            icon={showStaffPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowStaffPassword(!showStaffPassword)}
                          />
                        }
                      />
                    </View>
                  )}
                />

                {/* Quick Demo Accounts Selection */}
                <View style={styles(theme).demoAccountsRow}>
                  <Text style={styles(theme).demoAccountsLabel}>Demo Accounts:</Text>
                  <View style={styles(theme).demoChipsContainer}>
                    {[
                      { user: 'leader.demo', label: 'Leader' },
                      { user: 'mutawif.demo', label: 'Mutawif' },
                      { user: 'coordinator.demo', label: 'Coordinator' },
                    ].map(item => (
                      <TouchableOpacity
                        key={item.user}
                        style={styles(theme).demoChip}
                        onPress={() => {
                          setStaffValue('username', item.user);
                          setStaffValue('password', 'Stnt@2026');
                        }}
                      >
                        <Text style={styles(theme).demoChipText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles(theme).child_view}>
                  <UButton
                    title={'STAFF LOGIN'}
                    onPress={handleStaffSubmit(onStaffLogin)}
                  />
                </View>

                <View
                  style={[
                    styles(theme).child_view,
                    {
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: metrics.baseMargin,
                    },
                  ]}
                >
                  <Text
                    style={[
                      fontStyle(theme).bodySmall,
                      {
                        color: theme.dark ? '#9CA3AF' : '#6B7280',
                        textAlign: 'center',
                      },
                    ]}
                  >
                    Authorized for Leader, Mutawif, and Coordinator roles.
                  </Text>
                </View>
              </>
            )}
          </View>
          <View
            style={[
              styles(theme).child_view,
              {
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: metrics.doubleMargin,
              },
            ]}
          >
            {activePortal === 'pilgrim' && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[fontStyle(theme).headingSmall]}>
                  Don’t have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate(Screens.Register)}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        color: theme.colors.primary,
                        textDecorationLine: 'underline',
                        marginLeft: metrics.baseMargin,
                      },
                    ]}
                  >
                    Register?
                  </Text>
                </Pressable>
              </View>
            )}

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: metrics.doubleMargin,
                marginTop: activePortal === 'staff' ? 0 : metrics.baseMargin,
              }}
            >
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    textAlign: 'center',
                    color: theme.dark ? '#9CA3AF' : 'grey',
                    marginEnd: metrics.baseMargin,
                    fontSize: 14,
                    margin: 0,
                  },
                ]}
              >
                By Signing in you agree to our
                <Text
                  onPress={() =>
                    navigation.navigate(Screens.WebView, {
                      url: 'https://claims.stntinternational.com/web/terms-conditions',
                    })
                  }
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      color: theme.colors.primary,
                      fontSize: 14,
                      marginHorizontal: metrics.baseMargin / 2,
                    },
                  ]}
                >
                  {' Terms & Conditions '}
                </Text>
                and
                <Text
                  onPress={() =>
                    navigation.navigate(Screens.WebView, {
                      url: 'https://claims.stntinternational.com/web/privacy-policy',
                    })
                  }
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      color: theme.colors.primary,
                      fontSize: 14,
                      marginHorizontal: metrics.baseMargin / 2,
                    },
                  ]}
                >
                  {' Privacy Policy'}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <ForgotPassword
          isVisible={showForgotPassword}
          onDismiss={() => setShowForgotPassword(false)}
          onSuccess={(message: string) => {
            showSuccessToast(message, 'Success');
            setShowForgotPassword(false);
          }}
        />
      </AppLayout>
    </KeyboardAwareScrollView>
  );
};

export default Login;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    parent_view: {
      marginVertical: metrics.baseMargin,
      marginTop: metrics.doubleMargin,
    },
    child_view: {
      marginTop: metrics.baseMargin * 1.5,
    },
    keyboard_avoid: {
      flexGrow: 1,
    },
    portalToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.dark ? '#1F2937' : '#F1F5F9',
      borderRadius: 28,
      padding: 4,
      marginTop: metrics.baseMargin * 1.5,
      marginBottom: metrics.baseMargin,
      borderWidth: 1,
      borderColor: theme.dark ? '#374151' : '#E2E8F0',
    },
    portalTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 24,
    },
    portalTabActive: {
      backgroundColor: '#0F8A65',
    },
    portalTabText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
    },
    portalTabTextActive: {
      color: '#FFFFFF',
    },
    demoAccountsRow: {
      marginTop: metrics.baseMargin * 1.5,
      padding: 10,
      backgroundColor: theme.dark ? '#1F2937' : '#F8FAFC',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.dark ? '#374151' : '#E2E8F0',
    },
    demoAccountsLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.dark ? '#9CA3AF' : '#64748B',
      marginBottom: 6,
    },
    demoChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    demoChip: {
      backgroundColor: theme.dark ? '#374151' : '#E2E8F0',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    demoChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.dark ? '#E2E8F0' : '#334155',
      textTransform: 'capitalize',
    },
  });
