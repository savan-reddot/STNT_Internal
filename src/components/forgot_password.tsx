import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { TextInput, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import { useForgot_passwordMutation } from '../redux/services';
import { showErrorToast } from '../utils/toastUtils';
import fontStyle from '../styles/fontStyle';
import UButton from './custombutton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScreenLoader from './loader';

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

  const [forgot_password, { isLoading }] = useForgot_passwordMutation();
  const [email, setEmail] = useState('');

  const submitEmail = async () => {
    if (email.trim() === '') {
      showErrorToast('Please enter your email.', 'Error !!');
      return;
    }
    const verificationResp = await forgot_password({
      email: email,
    });
    console.log('response : ', verificationResp.data);
    if (verificationResp?.data?.status) {
      const { message } = verificationResp?.data;
      onSuccess && onSuccess(message);
    } else {
      showErrorToast('Verification failed. Please try again.', 'Error !!');
      onDismiss && onDismiss();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      avoidKeyboard={true}
      onBackdropPress={() => {
        onDismiss && onDismiss();
      }}
      onDismiss={() => {
        onDismiss && onDismiss();
      }}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles(theme).contentContainer}>
        <ScreenLoader visible={isLoading} />
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Text style={[styles(theme).title, { flex: 1 }]}>
            Forgot Password
          </Text>
          <TouchableOpacity onPress={() => onDismiss()}>
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
          />
        </View>
        <UButton
          style={{ flex: 0 }}
          title={'Submit'}
          onPress={() => submitEmail()}
        />
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
