/* eslint-disable react-native/no-inline-styles */
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
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
} from '../../redux/services';
import { useAppDispatch } from '../../redux/hooks';
import {
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

const Login = ({ navigation }: any) => {
  const theme = useTheme();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrPassport: __DEV__ ? 'savan@reddotinnovative.com' : '',
      password: __DEV__ ? '1234567' : '',
    },
  });
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [verificationUser] = useLazyVerificationUserQuery();
  const [passportById, { isLoading: isPassportNoLoading }] =
    usePassportByIdMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
              const timeA = a?.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
              const timeB = b?.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
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
            JSON.stringify({ ...user, latestUid: targetLatestUid, availableUids }),
          );
          dispatch(setToken(token));
          dispatch(setUser({ ...user, latestUid: targetLatestUid, availableUids }));
        } catch (storageError) {
          console.error('Error storing login data:', storageError);
          showErrorToast(
            'Error saving login data. Please try again.',
            'Error !!',
          );
          return;
        }

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

  const isLoad = isLoading;

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
            Log in to access your digital ePass and concierge services.
          </Text>

          <View style={[styles(theme).parent_view, { flex: 1 }]}>
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
                // style={{ flex: 0 }}
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

            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: metrics.doubleMargin,
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
  });
