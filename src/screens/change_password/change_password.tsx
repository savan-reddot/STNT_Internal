import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { MD3Theme, TextInput, useTheme } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import UButton from '../../components/custombutton';
import { useReset_passwordMutation } from '../../redux/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from '../../redux/reducer';
import { showErrorToast } from '../../utils/toastUtils';
import { Screens } from '../../common/screens';

const ChangePassword = ({ navigation }: any) => {
  const theme = useTheme();
  const { control, handleSubmit } = useForm();
  const [reset_password, { isLoading }] = useReset_passwordMutation();
  const user = useAppSelector(getUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const doLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate(Screens.Splash);
  };

  const SubmitReset = async () => {
    if (oldPassword == '') {
      showErrorToast('Opps !! Please enter Old Password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast(
        'Opps !! Confirm Password must be same with New Password.',
      );
      return;
    }
    console.log('user --------> ', user);
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      const request = {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      };
      console.log('request change password : ', request);
      const resp = await reset_password(request);
      console.log('resp change password : ', resp);
      if (resp && resp?.data && resp?.data?.status) {
        doLogout();
      } else {
        showErrorToast(
          'Opps !! Something went wrong. Please ̧try after sometime.',
        );
      }
    }
  };

  return (
    <AppLayout title="Change Password" onBackPress={() => navigation.goBack()}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={[
            globalStyle(theme).container,
            { padding: metrics.doubleMargin },
          ]}
        >
          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>Old Password</Text>
            <TextInput
              mode="outlined"
              onChangeText={setOldPassword}
              value={oldPassword}
              placeholder="Enter your old password"
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={{ height: metrics.screenWidth * 0.13 }}
            />
          </View>
          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>New Password</Text>
            <TextInput
              mode="outlined"
              onChangeText={setNewPassword}
              value={newPassword}
              placeholder="Enter your new password"
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={{ height: metrics.screenWidth * 0.13 }}
            />
          </View>
          <View style={styles(theme).child_view}>
            <Text style={fontStyle(theme).headingSmall}>Old Password</Text>
            <TextInput
              mode="outlined"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              placeholder="Confirm password"
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              style={{ height: metrics.screenWidth * 0.13 }}
            />
          </View>

          <UButton
            title="Save"
            onPress={() => SubmitReset()}
            style={{ flex: 0, marginTop: metrics.doubleMargin * 2 }}
          />
        </View>
      </TouchableWithoutFeedback>
    </AppLayout>
  );
};

export default ChangePassword;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    child_view: {
      marginTop: metrics.baseMargin * 1.5,
    },
  });
