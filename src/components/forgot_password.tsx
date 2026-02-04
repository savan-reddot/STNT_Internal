import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { TextInput, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../utils/toastConfig';
import {
  useForgot_passwordMutation,
  useVerify_otpMutation,
} from '../redux/services';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';
import fontStyle from '../styles/fontStyle';
import UButton from './custombutton';
import ScreenLoader from './loader';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../common/screens';

interface ForgotPasswordProps {
  isVisible: boolean;
  onDismiss: () => void;
  onSuccess: (message: string) => void;
}

const ForgotPassword = ({
  isVisible,
  onDismiss,
  onSuccess,
}: ForgotPasswordProps) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [forgot_password, { isLoading: isForgotLoading }] =
    useForgot_passwordMutation();
  const [verify_otp, { isLoading: isVerifyLoading }] = useVerify_otpMutation();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSubmit = async () => {
    if (!isOtpSent) {
      // Step 1: Send Email
      if (email.trim() === '') {
        showErrorToast('Please enter your email.', 'Error !!');
        return;
      }
      const response = await forgot_password({
        email: email,
      });
      console.log('forgot_password response : ', response);
      if (response?.data?.status) {
        setIsOtpSent(true);
        showSuccessToast(
          response?.data?.message || 'OTP sent successfully',
          'Success',
        );
      } else {
        showErrorToast(
          response?.error?.data?.errorMessage ||
            'Verification failed. Please try again.',
          'Error !!',
        );
      }
    } else {
      // Step 2: Verify OTP
      if (otp.trim() === '') {
        showErrorToast('Please enter the OTP.', 'Error !!');
        return;
      }

      const response = await verify_otp({
        email: email,
        otp: otp,
      });
      console.log('verify otp response : ', response);

      if (response?.data?.status) {
        showSuccessToast(
          response?.data?.message || 'OTP verified successfully.',
          'Success',
        );
        onDismiss();
        navigation.navigate(Screens.ResetPassword, { email: email });
      } else {
        console.log('verify otp error : ', response?.error?.data?.message);
        showErrorToast(
          response?.error?.data?.message || 'Invalid OTP. Please try again.',
          'Error !!',
        );
      }
    }
  };

  const handleClose = () => {
    setIsOtpSent(false);
    setEmail('');
    setOtp('');
    onDismiss && onDismiss();
  };

  return (
    <Modal
      isVisible={isVisible}
      avoidKeyboard={true}
      onBackdropPress={handleClose}
      onDismiss={handleClose}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles(theme).contentContainer}>
        <ScreenLoader visible={isForgotLoading || isVerifyLoading} />
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Text style={[styles(theme).title, { flex: 1 }]}>
            Forgot Password
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Text
              style={[
                styles(theme).title,
                { color: theme.colors.error, fontSize: 16 },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles(theme).child_view}>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              { color: theme.colors.onSurface },
            ]}
          >
            Email<Text style={{ color: theme.colors.error }}>*</Text>
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Enter Email"
            outlineStyle={{ borderRadius: metrics.baseRadius }}
            placeholderTextColor={(theme.colors as any).placeholder || '#999'}
            style={{
              height: metrics.screenWidth * 0.13,
              backgroundColor: theme.colors.surface,
            }}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                text: theme.colors.onSurface,
                placeholder: (theme.colors as any).placeholder,
              },
            }}
            textColor={theme.colors.onSurface}
            onChangeText={setEmail}
            value={email}
            editable={!isOtpSent}
          />
        </View>

        {isOtpSent && (
          <View style={styles(theme).child_view}>
            <Text
              style={[
                fontStyle(theme).headingSmall,
                { color: theme.colors.onSurface },
              ]}
            >
              OTP<Text style={{ color: theme.colors.error }}>*</Text>
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter OTP"
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              placeholderTextColor={(theme.colors as any).placeholder || '#999'}
              style={{
                height: metrics.screenWidth * 0.13,
                backgroundColor: theme.colors.surface,
              }}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  onSurface: theme.colors.onSurface,
                  text: theme.colors.onSurface,
                  placeholder: (theme.colors as any).placeholder,
                },
              }}
              textColor={theme.colors.onSurface}
              onChangeText={setOtp}
              value={otp}
              keyboardType="number-pad"
            />
          </View>
        )}

        <UButton
          style={{ flex: 0, marginTop: 15 }}
          title={isOtpSent ? 'Verify' : 'Submit'}
          onPress={() => handleSubmit()}
        />
        <Toast config={toastConfig} />
      </View>
    </Modal>
  );
};

export default ForgotPassword;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: '35%',
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    child_view: {
      marginTop: metrics.baseMargin,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: metrics.baseMargin * 1.5,
      color: theme.colors.onSurface,
    },
    contentContainer: {
      padding: metrics.doubleMargin * 2,
      paddingHorizontal: metrics.doubleMargin,
      backgroundColor: theme.colors.surface,
      borderRadius: metrics.baseRadius,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },

    dropdown: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    placeholderStyle: {
      fontSize: 14,
      color: '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: '#000',
    },
  });
