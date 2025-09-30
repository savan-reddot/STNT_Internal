import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import { MD3Theme, TextInput, useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  getUser,
  getUserDetails,
  setUser,
  setWebToken,
} from '../../redux/reducer';
import fontStyle from '../../styles/fontStyle';
import UButton from '../../components/custombutton';
import {
  useLazyGet_profileQuery,
  useLazyVerificationUserQuery,
  usePassportByIdMutation,
  useUpdate_profileMutation,
  useUpload_profile_pictureMutation,
} from '../../redux/services';
import { showErrorToast } from '../../utils/toastUtils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScreenLoader from '../../components/loader';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screens } from '../../common/screens';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestAppPermission } from '../../utils/permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Modal from 'react-native-modal';
import { keepLocalCopy, pick, types } from '@react-native-documents/picker';
import { Font_Medium } from '../../theme/fonts';

const UserProfile = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const dispatch = useAppDispatch();
  const [verificationUser, { isLoading: isVerificationLoading }] =
    useLazyVerificationUserQuery();
  const [get_profile, { isLoading: isProfileLoading }] =
    useLazyGet_profileQuery();
  const [passportById, { isLoading: isPassportNoLoading }] =
    usePassportByIdMutation();
  const [update_profile, { isLoading }] = useUpdate_profileMutation();
  const [upload_profile_picture, { isLoading: isUploadProfileLoading }] =
    useUpload_profile_pictureMutation();
  const user_details = useAppSelector(getUserDetails);
  const [user_info, setUserInfo] = useState();
  const [isSelectionVisible, setIsSelectionVisible] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      console.log('user details on focus : ', user);
      setUserInfo({ ...user, gender: user_details?.gender });

      return () => {
        console.log('Screen is unfocused ❌');
      };
    }, [user]),
  );

  const save_profile = async () => {
    if (user_info?.firstName === '') {
      showErrorToast('Opps !! Please enter First Name.');
      return;
    }

    if (user_info?.lastName === '') {
      showErrorToast('Opps !! Please enter Last Name.');
      return;
    }

    if (user_info?.email === '') {
      showErrorToast('Opps !! Please enter Email ID.');
      return;
    }

    if (user_info?.passportNo === '') {
      showErrorToast('Opps !! Please enter Passport No.');
      return;
    }
    console.log('user_info to update : ', user_info);
    const request: any = {
      firstName: user_info?.firstName,
      lastName: user_info?.lastName,
      email: user_info?.email,
      passportNo: user_info?.passportNo,
    };

    const resp = await update_profile(request);
    console.log('resp update profile : ', resp);
    if (resp && resp?.data && resp?.data?.status) {
      if (user?.passportNo == null || user?.passportNo == '') {
        getProfile();
      } else {
        const passportResp = await passportById({ uidNo: user?.latestUid });
        console.log(
          'passportById Response : ',
          JSON.stringify(passportResp?.data),
        );
        if (passportResp?.data?.status) {
          const { data } = passportResp?.data;
          if (data && data?.passportNo) {
            console.log('Passport No : ', data?.passportNo);
            verifyUser({
              user: resp?.data?.data?.user,
              latestUid: user?.latestUid,
              availableUids: resp?.data?.data?.availableUids,
            });
          }
        } else {
          dispatch(setUser(resp?.data?.data?.user));
          navigation.goBack();
        }
      }
    } else {
      showErrorToast('Policy Not Found !!', 'Error !!');
      dispatch(setUser(resp?.data?.data?.user));
      navigation.goBack();
    }
  };

  const getProfile = async () => {
    const resp = await get_profile(0);
    console.log('get profile resp : ', resp);
    if (resp && resp?.data && resp?.data?.status) {
      dispatch(
        setUser({
          ...resp?.data?.data?.user,
          latestUid: user?.latestUid,
          availableUids: resp?.data?.data?.availableUids,
        }),
      );
      const passportResp = await passportById({ uidNo: user?.latestUid });
      console.log(
        'passportById Response : ',
        JSON.stringify(passportResp?.data),
      );
      if (passportResp?.data?.status) {
        const { data } = passportResp?.data;
        if (data && data?.passportNo) {
          console.log('Passport No : ', data?.passportNo);
          verifyUser({
            user: resp?.data?.data?.user,
            latestUid: user?.latestUid,
            availableUids: resp?.data?.data?.availableUids,
          });
        }
      }
    }
  };

  const verifyUser = async (data: any) => {
    const verificationResp = await verificationUser({
      name: data?.user?.firstName + ' ' + data?.user?.lastName,
      passportNo: data?.user?.passportNo,
      uidNo: data?.latestUid,
    });

    if (verificationResp?.data?.success) {
      const { token } = verificationResp?.data;
      await AsyncStorage.setItem('webtoken', token);
      dispatch(setWebToken(token));
      navigation.replace(Screens.BottomTab);
    } else {
      navigation.goBack();
    }
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestAppPermission('camera');
    if (!hasPermission) return;

    const result = await launchCamera({ mediaType: 'photo' });
    if (result.assets?.[0]) {
      const image = result.assets[0];
      upload_picture({
        uri: image.uri,
        name: image.fileName || 'Captured Image',
        type: image.type,
        id: Date.now().toString(),
      });
      setIsSelectionVisible(false);
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestAppPermission('gallery');
    console.log(hasPermission);
    if (!hasPermission) return;

    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets?.[0]) {
      const image = result.assets[0];

      upload_picture({
        uri: image.uri,
        name: image.fileName || 'Selected Image',
        type: image.type,
        id: Date.now().toString(),
      });
      setIsSelectionVisible(false);
    }
  };

  const handleAddDocument = async () => {
    const hasPermission = await requestAppPermission('document');
    console.log('Storage Permission:', hasPermission);
    if (!hasPermission) return;

    try {
      const files = await pick({
        type: [types.pdf, types.images], // accepts PDFs and images
        allowMultiple: false, // or true for multiple selection
      });
      const [file] = files; // destructure single file

      // Optionally copy to local app storage
      const [local] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name || '' }],
        destination: 'documentDirectory',
      });

      upload_picture({
        uri: local?.uri ?? file.uri,
        name: file.name,
        type: file.type,
        size: file.size,
        id: Date.now().toString(),
      });

      setIsSelectionVisible(false);
      // now local.uri points to a local stored file
    } catch (err) {
      console.warn('Picker error', err);
    }
  };

  const upload_picture = async (file: any) => {
    const formData = new FormData();
    formData.append('file', {
      uri: 'file://' + file?.uri,
      type: file?.type,
      name: file?.name,
    });
    console.log('req_sign ------> ', formData);
    const resp = await upload_profile_picture(formData);
    console.log('res sign ------> ', resp?.data);
    if (resp && resp?.data && resp?.data?.status) {
      const { profile_picture_url } = resp?.data?.data;
      if (profile_picture_url) {
        const request: any = {
          profile_picture: profile_picture_url,
        };

        const resp_update = await update_profile(request);
        console.log('resp update profile : ', resp_update);
        if (resp_update && resp_update?.data && resp_update?.data?.status) {
          getProfile();
        }
      }
    }
  };

  const remove_profile = async () => {
    setIsSelectionVisible(false);
    const request: any = {
      profile_picture: '',
    };

    const resp_update = await update_profile(request);
    console.log('resp update profile : ', resp_update);
    if (resp_update && resp_update?.data && resp_update?.data?.status) {
      getProfile();
    }
  };

  const doLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate(Screens.Splash);
  };

  const isLoad =
    isLoading ||
    isProfileLoading ||
    isVerificationLoading ||
    isPassportNoLoading;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles(theme).keyboard_container}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
    >
      <AppLayout title="Edit Profile" onBackPress={() => navigation.goBack()}>
        <ScreenLoader visible={isLoad} />
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
            style={[
              globalStyle(theme).container,
              { padding: metrics.doubleMargin },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: metrics.baseMargin,
                  marginTop: metrics.doubleMargin,
                }}
              >
                <TouchableOpacity onPress={() => setIsSelectionVisible(true)}>
                  {user && user?.profile_picture ? (
                    <ImageBackground
                      source={{ uri: user?.profile_picture }}
                      imageStyle={{
                        borderRadius: metrics.screenWidth * 0.4,
                        shadowOffset: { width: 1, height: 1 },
                        shadowOpacity: 0.5,
                        shadowRadius: metrics.baseRadius,
                      }}
                      style={{
                        height: metrics.screenWidth * 0.2,
                        width: metrics.screenWidth * 0.2,
                      }}
                    >
                      <Icon
                        name="mode-edit"
                        size={18}
                        style={{
                          backgroundColor: theme.colors.primary,
                          padding: metrics.smallMargin,
                          borderRadius: 20,
                          alignSelf: 'flex-end',
                          left: metrics.smallMargin,
                          bottom: metrics.smallMargin,
                        }}
                        color={'#fff'}
                      />
                    </ImageBackground>
                  ) : (
                    <View
                      style={{
                        borderWidth: 1.7,
                        borderStyle: 'dashed',
                        backgroundColor: '#8C8C8C33',
                        borderColor: theme.colors.onBackground,
                        height: metrics.screenWidth * 0.2,
                        width: metrics.screenWidth * 0.2,
                        borderRadius: metrics.screenWidth * 0.4,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        name="add"
                        size={metrics.screenWidth * 0.07}
                        color={theme.colors.onBackground}
                      />
                    </View>
                  )}
                </TouchableOpacity>
                {user && !user?.profile_picture && (
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        marginTop: metrics.baseMargin * 2,
                        fontWeight: '500',
                      },
                    ]}
                  >
                    {'Add Picture'}
                  </Text>
                )}
              </View>
              <View style={{ marginTop: metrics.baseMargin }}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { color: '#72849A', fontWeight: 'regular' },
                  ]}
                >
                  First Name*
                </Text>
                <TextInput
                  mode="flat"
                  placeholder="First Name"
                  value={user_info?.firstName}
                  style={styles(theme).textinput}
                  onChangeText={txt =>
                    setUserInfo({ ...user_info, firstName: txt })
                  }
                />
              </View>
              <View style={{ marginTop: metrics.baseMargin }}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { color: '#72849A', fontWeight: 'regular' },
                  ]}
                >
                  Last Name*
                </Text>
                <TextInput
                  mode="flat"
                  placeholder="Last Name"
                  value={user_info?.lastName}
                  style={styles(theme).textinput}
                  onChangeText={txt =>
                    setUserInfo({ ...user_info, lastName: txt })
                  }
                />
              </View>
              <View style={{ marginTop: metrics.baseMargin }}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { color: '#72849A', fontWeight: 'regular' },
                  ]}
                >
                  Email ID*
                </Text>
                <TextInput
                  mode="flat"
                  placeholder="Email"
                  value={user_info?.email}
                  style={styles(theme).textinput}
                  onChangeText={txt =>
                    setUserInfo({ ...user_info, email: txt })
                  }
                />
              </View>
              <View style={{ marginTop: metrics.baseMargin }}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { color: '#72849A', fontWeight: 'regular' },
                  ]}
                >
                  Passport No*
                </Text>
                <TextInput
                  mode="flat"
                  placeholder="Passport Number"
                  value={user_info?.passportNo}
                  style={styles(theme).textinput}
                  onChangeText={txt =>
                    setUserInfo({ ...user_info, passportNo: txt })
                  }
                />
              </View>
              {/* <View style={{ marginTop: metrics.baseMargin }}>
            <Text
              style={[
                fontStyle(theme).headingSmall,
                { color: '#72849A', fontWeight: 'regular' },
              ]}
            >
              Gender*
            </Text>
            <TouchableOpacity>
              <
            </TouchableOpacity>
          </View> */}

              <View style={{ flex: 1 }} />
              <UButton
                style={{ flex: 0 }}
                onPress={() => save_profile()}
                title={'Save'}
              />
              <UButton
                style={{ flex: 0, backgroundColor: 'red' }}
                onPress={() => {
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
                }}
                title={'Delete Account'}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {isSelectionVisible && (
          <Modal
            isVisible={isSelectionVisible}
            onBackdropPress={() => setIsSelectionVisible(false)}
            style={styles(theme).modal}
          >
            <View style={styles(theme).innerModal}>
              <TouchableOpacity
                style={[
                  styles(theme).optionButton,
                  { paddingTop: metrics.baseMargin * 2 },
                ]}
                onPress={() => handleCameraCapture()}
              >
                <Text style={styles(theme).optionText}>Take a picture</Text>
              </TouchableOpacity>

              <View style={styles(theme).seprator} />

              <TouchableOpacity
                style={styles(theme).optionButton}
                onPress={() => handleImagePicker()}
              >
                <Text style={styles(theme).optionText}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>

              <View style={styles(theme).seprator} />

              <TouchableOpacity
                style={styles(theme).optionButton}
                onPress={() => handleAddDocument()}
              >
                <Text style={styles(theme).optionText}>Upload File</Text>
              </TouchableOpacity>
              {user?.profile_picture && (
                <>
                  <View style={styles(theme).seprator} />
                  <TouchableOpacity
                    style={styles(theme).optionButton}
                    onPress={() => remove_profile()}
                  >
                    <Text style={[styles(theme).optionText, { color: 'red' }]}>
                      Remove Profile
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles(theme).innerModal,
                {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderRadius: metrics.baseRadius,
                  padding: metrics.baseMargin * 1.5,
                  marginTop: 0,
                  alignItems: 'center',
                },
              ]}
              onPress={() => setIsSelectionVisible(false)}
            >
              <Text style={[styles(theme).optionText, { fontWeight: '500' }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Modal>
        )}
      </AppLayout>
    </KeyboardAwareScrollView>
  );
};

export default UserProfile;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    textinput: {
      height: metrics.screenHeight * 0.055,
      // marginTop: metrics.baseMargin,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 0.3,
      borderColor: theme.colors.outline,
    },
    keyboard_container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modal: {
      justifyContent: 'flex-end',
      // margin: 0,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    innerModal: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: metrics.baseRadius,
      margin: metrics.baseMargin,
    },
    optionButton: {
      padding: metrics.baseMargin * 2,
      alignSelf: 'center',
    },
    optionText: {
      fontSize: metrics.moderateScale(16),
      fontFamily: Font_Medium,
      marginHorizontal: metrics.baseMargin,
    },
    seprator: {
      width: '100%',
      height: 0.7,
      backgroundColor: 'rgb(190,190,190)',
      marginTop: metrics.baseMargin,
    },
  });
