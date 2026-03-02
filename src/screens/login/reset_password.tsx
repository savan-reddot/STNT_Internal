/* eslint-disable react-native/no-inline-styles */
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import UButton from '../../components/custombutton';
import { useResetPasswordConfirmMutation } from '../../redux/services';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import { Screens } from '../../common/screens';
import ScreenLoader from '../../components/loader';
import { Text, TextInput } from '../../components/common';

const ResetPassword = ({ navigation, route }: any) => {
  const theme = useTheme();
  const [resetPasswordConfirm, { isLoading }] =
    useResetPasswordConfirmMutation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Params from deep link
  const { email } = route.params || {};

  const handleSubmit = async () => {
    if (!email) {
      showErrorToast('Invalid or missing email.', 'Error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showErrorToast('Please enter all fields.', 'Warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match.', 'Warning');
      return;
    }

    const resp = await resetPasswordConfirm({
      email,
      newPassword,
      confirmPassword,
    });
    // console.log('resp==>>', resp);
    if (resp?.data?.status) {
      showSuccessToast('Password reset successfully. Please login.', 'Success');
      navigation.reset({
        index: 0,
        routes: [{ name: Screens.Login }],
      });
    } else {
      const errorObj = resp?.error as any;
      //   console.log('errorObj==>>', errorObj);
      const errorMsg =
        resp?.data?.message ||
        errorObj?.data?.message ||
        'Failed to reset password.';
      showErrorToast(errorMsg, 'Error');
    }
  };

  return (
    <AppLayout
      title="Reset Password"
      onBackPress={() => navigation.navigate(Screens.Login)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            globalStyle(theme).container,
            { padding: metrics.doubleMargin },
          ]}
        >
          <ScreenLoader visible={isLoading} />

          <Text
            style={[
              fontStyle(theme).headingMedium,
              { marginBottom: metrics.baseMargin },
            ]}
          >
            Create New Password
          </Text>
          <Text
            style={[
              fontStyle(theme).titleSmall,
              {
                color: theme.dark ? '#D1D5DB' : '#4F4F4F',
                marginBottom: metrics.doubleMargin,
              },
            ]}
          >
            Please enter your new password below.
          </Text>

          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>New Password</Text>
            <TextInput
              mode="outlined"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={styles(theme).input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          </View>

          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>Confirm Password</Text>
            <TextInput
              mode="outlined"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={styles(theme).input}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
          </View>

          <UButton
            title="RESET PASSWORD"
            onPress={handleSubmit}
            style={{ flex: 0, marginTop: metrics.doubleMargin * 2 }}
          />
        </View>
      </TouchableWithoutFeedback>
    </AppLayout>
  );
};

export default ResetPassword;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    child_view: {
      marginTop: metrics.baseMargin * 1.5,
    },
    input: {
      height: metrics.screenWidth * 0.13,
      fontSize: 14,
      borderColor: theme.dark ? '#4B5563' : '#BDBDBD',
      backgroundColor: theme.colors.surface,
    },
  });
