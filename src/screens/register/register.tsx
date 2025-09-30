import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { globalStyle } from '../../utils/globalStyles';
import { MD3Theme, TextInput, useTheme } from 'react-native-paper';
import AppLayout from '../../components/safeareawrapper';
import fontStyle from '../../styles/fontStyle';
import { metrics } from '../../utils/metrics';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import {
  useLazyVerificationUserQuery,
  usePassportByIdMutation,
  useRegisterMutation,
} from '../../redux/services';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScreenLoader from '../../components/loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../redux/hooks';
import {
  setToken,
  setUser,
  setUserDetails,
  setWebToken,
} from '../../redux/reducer';
import { is } from 'date-fns/locale';
import { showErrorToast } from '../../utils/toastUtils';

const Register = ({ navigation }: any) => {
  const theme = useTheme();
  const { control, handleSubmit } = useForm();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [verificationUser, { isLoading: isVerificationLoading }] =
    useLazyVerificationUserQuery();
  const [passportById, { isLoading: isPassportNoLoading }] =
    usePassportByIdMutation();
  const [showPassword, setShowPassword] = useState(false);

  const onRegister = async (data: any) => {
    if (data?.password !== data?.confirmpassword) {
      showErrorToast(
        'Password and Confirm Password does not matched',
        'Error !!',
      );
      return;
    }

    console.log('onsubmit ----> ', data);
    const resp = await register(data);
    console.log('on response ----> ', resp);
    if (resp?.data && resp?.data?.status) {
      const { user, token, latestUid, availableUids } = resp?.data?.data;
      console.log('User : ', JSON.stringify(user));
      console.log('Token : ', JSON.stringify(token));
      await AsyncStorage.setItem('@token', token);
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      dispatch(setToken(token));
      dispatch(
        setUser({ ...user, latestUid, availableUids: availableUids || [] }),
      );

      // if (user?.passportNo == null || user?.passportNo == '') {
      //   navigation.replace(Screens.BottomTab);
      //   return;
      // }

      const passportResp = await passportById({ uidNo: latestUid });
      console.log(
        'passportById Response : ',
        JSON.stringify(passportResp?.data),
      );
      if (passportResp?.data?.status) {
        const { data } = passportResp?.data;
        if (data && data?.passportNo) {
          console.log('Passport No : ', data?.passportNo);
          verifyUser({ user, latestUid, passportNo: data?.passportNo });
        }
      } else {
        showErrorToast('Passport Not Found !!', 'Error !!');
        navigation.replace(Screens.BottomTab);
      }
    }
  };

  const verifyUser = async (data: any) => {
    const verificationResp = await verificationUser({
      name: data?.user?.firstName + ' ' + data?.user?.lastName,
      passportNo: data?.passportNo,
      uidNo: data?.latestUid,
    });

    if (verificationResp?.data?.success) {
      const { user, token } = verificationResp?.data;

      await AsyncStorage.setItem('webtoken', token);
      await AsyncStorage.setItem('userdetails', JSON.stringify(user));
      dispatch(setUserDetails(user));
      dispatch(setWebToken(token));

      navigation.replace(Screens.BottomTab);
    }
  };

  const isLoad = isLoading || isVerificationLoading;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles(theme).keyboard_container}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
    >
      <AppLayout title="">
        {/* <KeyboardAvoidingView
        style={globalStyle(theme).container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      > */}

        <ScreenLoader visible={isLoad} />
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            style={[
              globalStyle(theme).container,
              { padding: metrics.doubleMargin },
            ]}
          >
            <Text style={fontStyle(theme).headingMedium}>Register</Text>
            <Text style={[fontStyle(theme).titleSmall, { color: '#4F4F4F' }]}>
              Register now to manage your umrah insurance and travel documents.
            </Text>

            <View style={[styles(theme).parent_view]}>
              <Controller
                key={'firstName'}
                control={control}
                name={'firstName'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles(theme).child_view}>
                    <Text style={fontStyle(theme).headingSmall}>
                      First Name<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter your first name"
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              <Controller
                key={'lastName'}
                control={control}
                name={'lastName'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles(theme).child_view}>
                    <Text style={fontStyle(theme).headingSmall}>
                      Last Name<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter your last name"
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              <Controller
                key={'email'}
                control={control}
                name={'email'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles(theme).child_view}>
                    <Text style={fontStyle(theme).headingSmall}>
                      Email<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter your email address"
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      onChangeText={onChange}
                      value={value}
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
                    <Text style={fontStyle(theme).headingSmall}>
                      Password<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Create password"
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
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
              <Controller
                key={'confirmpassword'}
                control={control}
                name={'confirmpassword'}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles(theme).child_view}>
                    <Text style={fontStyle(theme).headingSmall}>
                      Confirm Password<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Confirm password"
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      value={value}
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
            </View>
            <View style={{ flex: 1 }} />

            <View style={styles(theme).child_view}>
              <UButton
                title={'Register'}
                style={{ flex: 0 }}
                onPress={handleSubmit(onRegister)}
              />
            </View>
            <View
              style={[
                styles(theme).child_view,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[fontStyle(theme).headingSmall]}>
                  Already have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate(Screens.Login)}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        color: theme.colors.accent,
                        textDecorationLine: 'underline',
                        marginLeft: metrics.baseMargin,
                      },
                    ]}
                  >
                    Sign In?
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: metrics.doubleMargin,
                  // width: '100%',
                }}
              >
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      textAlign: 'center',
                      color: 'grey',
                      // alignItems: 'center',
                      marginEnd: metrics.baseMargin,
                      fontSize: 14,
                      margin: 0,
                    },
                  ]}
                >
                  {' '}
                  By Signing in you agree to our
                  <TouchableWithoutFeedback
                    onPress={() =>
                      navigation.navigate(Screens.WebView, {
                        url: 'https://claims.stntinternational.com/web/terms-conditions',
                      })
                    }
                  >
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          color: theme.colors.primary,
                          marginHorizontal: metrics.baseMargin,
                          fontSize: 14,
                        },
                      ]}
                    >
                      {' ' + 'Terms & Conditions'}
                    </Text>
                  </TouchableWithoutFeedback>{' '}
                  and
                  <TouchableWithoutFeedback
                    onPress={() =>
                      navigation.navigate(Screens.WebView, {
                        url: 'https://claims.stntinternational.com/web/privacy-policy',
                      })
                    }
                  >
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          color: theme.colors.primary,
                          fontSize: 14,
                          marginHorizontal: metrics.baseMargin,
                        },
                      ]}
                    >
                      {' ' + 'Privacy Policy'}
                    </Text>
                  </TouchableWithoutFeedback>
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* </KeyboardAvoidingView> */}
      </AppLayout>
    </KeyboardAwareScrollView>
  );
};

export default Register;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    parent_view: {
      marginVertical: metrics.baseMargin,
    },
    child_view: {
      marginTop: metrics.baseMargin,
    },
    keyboard_container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
