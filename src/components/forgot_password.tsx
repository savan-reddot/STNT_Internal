import React, {
  forwardRef,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import { TextInput, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  useForgot_passwordMutation,
  useLazyVerificationUserQuery,
} from '../redux/services';
import { getUser, setWebToken } from '../redux/reducer';
import { showErrorToast } from '../utils/toastUtils';
import fontStyle from '../styles/fontStyle';
import UButton from './custombutton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
      <KeyboardAwareScrollView
        contentContainerStyle={{
          justifyContent: 'flex-end',
          bottom: 0,
          position: 'absolute',
          width: '100%',
        }}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View style={styles(theme).contentContainer}>
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={[styles(theme).title, { flex: 1 }]}>
              Forgot Password
            </Text>
            <TouchableOpacity onPress={() => onDismiss()}>
              <Text
                style={[styles(theme).title, { color: 'red', fontSize: 16 }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>
              Email<Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter Email"
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={{ height: metrics.screenWidth * 0.13 }}
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
      </KeyboardAwareScrollView>
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

      marginBottom: -metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
      overflow: 'hidden',
      height: '35%',
    },
    child_view: {
      marginTop: metrics.baseMargin,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: metrics.baseMargin * 1.5,
    },
    contentContainer: {
      padding: metrics.doubleMargin * 2,
      paddingHorizontal: metrics.doubleMargin,
      backgroundColor: theme.colors.background,
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
