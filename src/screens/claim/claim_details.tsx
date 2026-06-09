import { Text, TextInput } from '../../components/common';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import {
  useClaim_request_submitMutation,
  useLazyRequest_reviewQuery,
  useUpload_signatureMutation,
  useDelete_draftMutation,
  useLazyGet_addressQuery,
  useCreate_addressMutation,
  useUpdate_addressMutation,
} from '../../redux/services';
import Modal from 'react-native-modal';
import { Screens } from '../../common/screens';
import fontStyle from '../../styles/fontStyle';
import { metrics } from '../../utils/metrics';
import { getRandomPastelColor, globalStyle } from '../../utils/globalStyles';
import ScreenLoader from '../../components/loader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppLayout from '../../components/safeareawrapper';
import UButton from '../../components/custombutton';
import SignatureModal from '../../components/signature_modal';
import moment from 'moment';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../utils/toastConfig';
import RNFS from 'react-native-fs';
import { Font_Medium } from '../../theme/fonts';
import { useFocusEffect } from '@react-navigation/native';

const ClaimDetails = ({ route, navigation }: any) => {
  const theme = useTheme();
  const claimRequestId = route?.params?.claimRequestId || null;
  const isDraft = route?.params?.isDraft || false;
  const [request_review, { isLoading }] = useLazyRequest_reviewQuery();
  const [claim_request_submit, { isClaimSubmitLoading }] =
    useClaim_request_submitMutation();
  const [upload_signature, { isLoading: isSignatureUploading }] =
    useUpload_signatureMutation();
  const [delete_draft, { isLoading: isDeleting }] = useDelete_draftMutation();
  const [get_address, { isLoading: isAddressChecking }] = useLazyGet_addressQuery();
  const [create_address, { isLoading: isAddressCreating }] = useCreate_addressMutation();
  const [update_address, { isLoading: isAddressUpdating }] = useUpdate_addressMutation();

  const [user_review, setUser_Review] = useState<any>();
  const [isDeclare, setIsDeclare] = useState(false);
  const [isFinalDeclare, setIsFinalDeclare] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressPhone, setAddressPhone] = useState('');
  const [addressEmail, setAddressEmail] = useState('');
  const [addressData, setAddressData] = useState<any>(null);

  function isDateString(val: any) {
    return (
      typeof val === 'string' && !isNaN(Date.parse(val)) // valid date
    );
  }

  useFocusEffect(
    useCallback(() => {
      if (claimRequestId) {
        getUser(claimRequestId);
      }
      return () => {};
    }, [claimRequestId]),
  );

  const getUser = async (claimRequestId: number) => {
    console.log('claimRequestId : ', claimRequestId);
    const response = await request_review({ id: claimRequestId });
    console.log('Response -----> ', response.data);
    if (response && response?.data?.status) {
      const { data } = response?.data;
      if (data) {
        setUser_Review(data);
        setIsDeclare(data?.isDeclaration);
        setIsFinalDeclare(data?.isConsent);
        setSignature(data?.signature_url);
      }
    }
  };

  const ClaimReviewDetails = React.memo(
    ({ item, index }: { item: any; index: number }) => {
      const claimFormData = item?.claimCategory?.claimForm
        ? JSON.parse(item?.claimCategory?.claimForm?.claimFormData)
        : null;

      return (
        <View
          key={'crd' + index}
          style={{ paddingVertical: metrics.baseMargin }}
        >
          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                fontSize: 16,
                fontWeight: '500',
                color: theme.colors.onBackground,
                marginHorizontal: metrics.baseMargin,
              },
            ]}
          >
            {`Claim ${index + 1}`}
          </Text>

          <View style={styles(theme).claim_detail_item}>
            <View
              style={{
                backgroundColor: '#D99BB4',
                padding: metrics.doubleMargin,
                height: metrics.screenWidth * 0.15,
                width: metrics.screenWidth * 0.15,
                borderRadius: metrics.baseRadius,
                alignSelf: 'flex-start',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('../../../assets/images/flag.png')}
                style={styles(theme).claim_item_img}
              />
            </View>
            <View style={{ marginLeft: metrics.baseMargin }}>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    fontSize: 14,
                    fontWeight: '400',
                    color: (theme.colors as any).onSurfaceVariant || '#616161',
                    marginTop: 0,
                  },
                ]}
              >
                Country where loss occurred
              </Text>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    fontSize: 14,
                    fontWeight: '500',
                    color: theme.colors.onBackground,
                    marginTop: 0,
                  },
                ]}
              >
                {item?.claimCategory?.claimCategorylossCountry}
              </Text>
            </View>
          </View>

          {item?.files &&
            item?.files?.length > 0 &&
            item?.files?.map((doc, index) => {
              return (
                <View
                  style={[
                    styles(theme).claim_detail_item,
                    {
                      borderBottomWidth:
                        index == item?.files?.length - 1 ? 0 : 0.3,
                    },
                  ]}
                  key={index}
                >
                  <Image
                    source={{ uri: doc?.path }}
                    style={{
                      height: metrics.screenWidth * 0.15,
                      width: metrics.screenWidth * 0.15,
                      borderRadius: metrics.baseRadius,
                    }}
                  />
                  <View style={{ marginLeft: metrics.baseMargin, flex: 1 }}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: theme.colors.onBackground,
                          paddingEnd: metrics.baseMargin,
                          marginTop: 0,
                        },
                      ]}
                    >
                      {doc?.fieldname}
                    </Text>
                  </View>
                </View>
              );
            })}

          {claimFormData && (
            <View>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    fontSize: 18,
                    fontWeight: '800',
                    color: theme.colors.onBackground,
                    marginHorizontal: metrics.baseMargin,
                  },
                ]}
              >
                Claim Information
              </Text>

              {Object.entries(claimFormData).map(([label, value]) => {
                let displayValue;
                if (isDateString(value)) {
                  displayValue = moment(value, 'DD-MM-YYYY').format(
                    'DD-MM-YYYY',
                  );
                } else if (typeof value === 'object' && 'status' in value) {
                  displayValue =
                    value.status && value.status === true ? 'Yes' : 'No';
                } else if (typeof value === 'object') {
                  displayValue = Object.entries(value)
                    .map(([k, v]) => `${v}`)
                    .join('  ');
                } else {
                  displayValue = String(value);
                }
                return (
                  <View key={label} style={styles(theme).row}>
                    <Text style={styles(theme).label}>{label}</Text>
                    <Text style={styles(theme).value}>{displayValue}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    },
  );

  const proceed_signature_submission = async () => {
    try {
      const base64Data = signature!.replace(/^data:image\/png;base64,/, '');
      const path = `${RNFS.DocumentDirectoryPath}/signature.png`;
      await RNFS.writeFile(path, base64Data, 'base64');

      const formData = new FormData();
      formData.append('file', {
        uri: 'file://' + path,
        type: 'image/png',
        name: 'signature.png',
      });
      console.log('req_sign ------> ', formData);
      const resp_sign = await upload_signature(formData);
      console.log('resp_sign ------> ', resp_sign);
      if (resp_sign && resp_sign?.data && resp_sign?.data?.status) {
        const { data } = resp_sign?.data;
        if (data && data?.signature_url != '') {
          submit_claim_request(data?.signature_url);
        }
      }
    } catch (err: any) {
      console.error('Signature upload error:', err);
      showErrorToast('Failed to upload signature. Please try again.');
    }
  };

  const submit_signature = async () => {
    if (signature == null || signature == undefined) {
      showErrorToast('Please mark your signature first !!');
      return;
    }

    if (!isDeclare) {
      showErrorToast('Please accept declaration !!');
      return;
    }

    if (!isFinalDeclare) {
      showErrorToast('Please accept consent !!');
      return;
    }

    try {
      const response = await get_address(null).unwrap();
      console.log('GET address response : ', response);
      if (response && response.status) {
        const data = response.data;
        if (data && data.phoneNumber && data.emailAddress) {
          await proceed_signature_submission();
        } else {
          setAddressData(data);
          setAddressPhone(data?.phoneNumber || '');
          setAddressEmail(data?.emailAddress || '');
          setIsAddressModalVisible(true);
        }
      } else {
        showErrorToast('Failed to check address details. Please try again.');
      }
    } catch (err: any) {
      console.error('Error fetching address:', err);
      showErrorToast('An error occurred while checking address details.');
    }
  };

  const handleAddressSubmit = async () => {
    if (addressPhone.trim() === '') {
      showErrorToast('Please enter your phone number.', 'Error !!');
      return;
    }

    if (addressEmail.trim() === '') {
      showErrorToast('Please enter your email address.', 'Error !!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addressEmail.trim())) {
      showErrorToast('Please enter a valid email address.', 'Error !!');
      return;
    }

    const requestBody = {
      phoneNumber: addressPhone.trim(),
      emailAddress: addressEmail.trim(),
    };

    try {
      let response;
      if (addressData === null) {
        response = await create_address(requestBody).unwrap();
        console.log('POST address response : ', response);
      } else {
        response = await update_address(requestBody).unwrap();
        console.log('PUT address response : ', response);
      }

      if (response && (response.success || response.status)) {
        showSuccessToast(response.message || 'Address saved successfully');
        setIsAddressModalVisible(false);
        await proceed_signature_submission();
      } else {
        const errorMessage = response?.message || 'Failed to save address details.';
        showErrorToast(errorMessage, 'Error !!');
      }
    } catch (err: any) {
      console.error('Save address error:', err);
      const errMessage =
        err?.data?.message || err?.message || 'An error occurred while saving address.';
      showErrorToast(errMessage, 'Error !!');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Claim',
      'Are you sure you want to delete this claim?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const resp = await delete_draft(claimRequestId);
            // console.log('resp_delete ------> ', resp);
            if (resp && resp?.data && resp?.data?.status) {
              showSuccessToast(
                resp?.data?.message || 'Claim deleted successfully',
              );
              navigation.pop();
            } else {
              showErrorToast(resp?.data?.message || 'Failed to delete claim');
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const submit_claim_request = async (signature_url: string) => {
    const request = {
      claimRequestId: user_review?.id,
      isDeclaration: isDeclare,
      isConsent: isFinalDeclare,
      declarationUserName: 'NA',
      declarationIpAddress: '152.58.37.132',
      submittedClaimTrackIds: user_review?.claimRequestIds,
      isFilledByAdmin: 0,
      signature_url: signature_url,
    };
    console.log('req_submit ------> ', request);
    const resp = await claim_request_submit(request);
    console.log('resp ------> ', resp);
    if (resp && resp?.data && resp?.data?.status) {
      showSuccessToast('Claim submitted successfully !!');
      navigation.pop(2);
    } else if (resp && resp?.error) {
      const errorData = 'data' in resp.error ? resp.error.data : null;
      const errorMessage =
        errorData && typeof errorData === 'object' && 'message' in errorData
          ? (errorData as any).message
          : 'Failed to submit claim';
      showErrorToast(errorMessage, 'Error !!');
    }
  };

  const isLoad =
    isLoading ||
    isClaimSubmitLoading ||
    isSignatureUploading ||
    isDeleting ||
    isAddressChecking ||
    isAddressCreating ||
    isAddressUpdating;

  return (
    <AppLayout
      title="Claims"
      onBackPress={() => navigation.pop()}
      right={[
        <View>
          {isDraft && (
            <TouchableOpacity onPress={handleDelete}>
              <Icon
                name="delete"
                size={24}
                color={'#fff'}
                style={{ marginRight: metrics.baseMargin }}
              />
            </TouchableOpacity>
          )}
        </View>,
      ]}
      titleExtraStyle={{ marginLeft: isDraft ? 40 : 0 }}
    >
      <View
        style={[
          [
            globalStyle(theme).container,
            {
              padding: metrics.doubleMargin,
            },
          ],
        ]}
      >
        <ScreenLoader visible={isLoad} />
        {/* <View style={{ flex: 1 }}>
          {user_review?.claimRequestDocs &&
            user_review?.claimRequestDocs?.length > 0 &&
            user_review?.claimRequestDocs?.map((item, index) => (
              <ClaimReviewDetails item={item} index={index} />
            ))}
        </View> */}
        <ScrollView
          style={[
            globalStyle(theme).container,
            {
              marginHorizontal: -metrics.doubleMargin,
              backgroundColor: theme.colors.background,
            },
          ]}
        >
          <ScreenLoader visible={isLoading} />
          <View
            style={[
              [
                globalStyle(theme).container,
                {
                  backgroundColor: theme.colors.background,
                },
              ],
            ]}
          >
            <View style={styles(theme).section}>
              <Image
                source={require('../../../assets/images/airplane.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16) },
                ]}
              >
                Travel Details
              </Text>
            </View>

            <View style={styles(theme).section_child}>
              <View style={styles(theme).travel_detail_item}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  Insurance Policy Package
                </Text>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,
                    },
                  ]}
                >
                  {user_review?.travelDetails?.insurancePolicyPackage}
                </Text>
              </View>
              <View style={styles(theme).travel_detail_item}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  UID Number
                </Text>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,
                    },
                  ]}
                >
                  {user_review?.travelDetails?.uidNo}
                </Text>
              </View>
              <View style={styles(theme).travel_detail_item}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  Traveler Agent
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,
                      flex: 1,
                      textAlign: 'right',
                    },
                  ]}
                >
                  {user_review?.travelDetails?.travelAgency}
                </Text>
              </View>
              <View style={styles(theme).travel_detail_item}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  Departure date from Singapore
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,

                      textAlign: 'right',
                    },
                  ]}
                >
                  {moment(user_review?.travelDetails?.departureDate).format(
                    'DD MMM YYYY',
                  )}
                </Text>
              </View>
              <View
                style={[
                  styles(theme).travel_detail_item,
                  { borderBottomWidth: 0 },
                ]}
              >
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  Return date to Singapore
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,
                      flex: 1,
                      textAlign: 'right',
                    },
                  ]}
                >
                  {moment(user_review?.travelDetails?.returnDate).format(
                    'DD MMM YYYY',
                  )}
                </Text>
              </View>
            </View>

            <View style={[styles(theme).section]}>
              <Image
                source={require('../../../assets/images/airplane.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16) },
                ]}
              >
                Claim Details
              </Text>
            </View>

            <View style={styles(theme).section_child}>
              {user_review?.claimRequestDocs &&
                user_review?.claimRequestDocs?.length > 0 &&
                user_review?.claimRequestDocs?.map((item, index) => (
                  <ClaimReviewDetails item={item} index={index} />
                ))}
            </View>

            <View style={[styles(theme).section]}>
              <Image
                source={require('../../../assets/images/airplane.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16), flex: 1 },
                ]}
              >
                Payment Details
              </Text>
              {user_review?.status == 'new' && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(Screens.ClaimRequest, {
                      isPaymentEdit: true,
                      claimRequestId: user_review?.id,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin * 2,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
              {isDraft && (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(Screens.ClaimRequest, {
                      isPaymentEdit: true,
                      isDraft: isDraft || false,
                      claimRequestId: user_review?.id,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin * 2,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles(theme).section_child}>
              <View style={styles(theme).travel_detail_item}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                    },
                  ]}
                >
                  Payment Option
                </Text>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '500',
                      color: theme.colors.onBackground,
                    },
                  ]}
                >
                  {user_review?.paymentDetails?.paymentOptions ==
                  'Paynow Linked Account'
                    ? 'PayNow'
                    : user_review?.paymentDetails?.paymentOptions}
                </Text>
              </View>

              {user_review?.paymentDetails?.paymentOptions ==
              'Paynow Linked Account' ? (
                <>
                  <View style={styles(theme).travel_detail_item}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      PayNow Username
                    </Text>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.payNowUsername}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles(theme).travel_detail_item,
                      { borderBottomWidth: 0 },
                    ]}
                  >
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      PayNow NRIC/FIN
                    </Text>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.payNow}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles(theme).travel_detail_item}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      Payee Name
                    </Text>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.payeeName}
                    </Text>
                  </View>
                  {/* <View style={styles(theme).travel_detail_item}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      Payee Relationship
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,
                          flex: 1,
                          textAlign: 'right',
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.payeeRelationship}
                    </Text>
                  </View> */}
                  <View style={styles(theme).travel_detail_item}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      Bank Name
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,

                          textAlign: 'right',
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.bankName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles(theme).travel_detail_item,
                      { borderBottomWidth: 0 },
                    ]}
                  >
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '400',
                          color: '#616161',
                          flex: 1,
                        },
                      ]}
                    >
                      Bank Account Number
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        fontStyle(theme).headingSmall,
                        {
                          fontSize: 14,
                          fontWeight: '500',
                          color: theme.colors.onBackground,
                          flex: 1,
                          textAlign: 'right',
                        },
                      ]}
                    >
                      {user_review?.paymentDetails?.bankAccountNumber}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={[styles(theme).section]}>
              <Image
                source={require('../../../assets/images/signature.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16) },
                ]}
              >
                Declaration
              </Text>
            </View>

            <View style={{ backgroundColor: theme.colors.background }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: metrics.baseMargin * 2,
                  marginTop: metrics.doubleMargin * 1.5,
                }}
              >
                <TouchableOpacity
                  onPress={() => isDraft && setIsDeclare(!isDeclare)}
                >
                  {!isDeclare ? (
                    <Icon
                      name="check-box-outline-blank"
                      size={24}
                      color={
                        (theme.colors as any).onSurfaceVariant || '#616161'
                      }
                    />
                  ) : (
                    <Icon
                      name="check-box"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color:
                        (theme.colors as any).onSurfaceVariant || '#616161',
                      flex: 1,
                      marginLeft: metrics.baseMargin * 1.5,
                    },
                  ]}
                >
                  I declare that all information's are true
                </Text>
              </View>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    fontSize: 14,
                    fontWeight: '400',
                    color: (theme.colors as any).onSurfaceVariant || '#616161',
                    flex: 1,
                    marginTop: metrics.baseMargin,
                    marginLeft: metrics.baseMargin * 2,
                    marginEnd: metrics.baseMargin,
                    lineHeight: 19.3,
                  },
                ]}
              >
                Important Notice: In accordance to the provisions of the
                Personal Data Protection Act 2012 (PDPA),the UOI's privacy
                notice shall form part of the terms and conditions of the
                policy. A copy of UOI's Privacy Notice can be found at{' '}
                <Text style={{ textDecorationLine: 'underline' }}>
                  www.uoi.com.sg
                </Text>
              </Text>
            </View>

            <View style={styles(theme).sign_container}>
              <TouchableOpacity
                style={styles(theme).signBox}
                onPress={() => isDraft && setShowModal(true)}
              >
                {signature ? (
                  <Image
                    source={{ uri: signature }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                ) : isDraft ? (
                  <Text style={{ color: '#888' }}>Tap to Sign</Text>
                ) : null}
              </TouchableOpacity>

              <SignatureModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onOK={sig => setSignature(sig)}
              />

              <Modal
                isVisible={isAddressModalVisible}
                avoidKeyboard={true}
                onBackdropPress={() => setIsAddressModalVisible(false)}
                onDismiss={() => setIsAddressModalVisible(false)}
                style={styles(theme).modal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.3}
              >
                <View style={styles(theme).contentContainer}>
                  <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={[styles(theme).modalTitle, { flex: 1 }]}>
                      Complete Address Info
                    </Text>
                    <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                      <Text
                        style={[
                          styles(theme).modalTitle,
                          { color: theme.colors.error, fontSize: 16 },
                        ]}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles(theme).modal_child_view}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        { color: theme.colors.onSurface, fontSize: 14 },
                      ]}
                    >
                      Phone Number<Text style={{ color: theme.colors.error }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter Phone Number"
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
                      onChangeText={setAddressPhone}
                      value={addressPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles(theme).modal_child_view}>
                    <Text
                      style={[
                        fontStyle(theme).headingSmall,
                        { color: theme.colors.onSurface, fontSize: 14 },
                      ]}
                    >
                      Email Address<Text style={{ color: theme.colors.error }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter Email Address"
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
                      onChangeText={setAddressEmail}
                      value={addressEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <UButton
                    style={{ flex: 0, marginTop: 15 }}
                    title="Submit"
                    onPress={() => handleAddressSubmit()}
                  />
                  <Toast config={toastConfig} />
                </View>
              </Modal>
            </View>

            <View style={{ backgroundColor: theme.colors.background }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: metrics.baseMargin * 2,
                  marginTop: metrics.doubleMargin,
                  backgroundColor: theme.colors.background,
                }}
              >
                <View style={{ alignSelf: 'flex-start' }}>
                  <TouchableOpacity
                    style={{ alignSelf: 'flex-start' }}
                    onPress={() => setIsFinalDeclare(!isFinalDeclare)}
                  >
                    {!isFinalDeclare ? (
                      <Icon
                        name="check-box-outline-blank"
                        size={24}
                        color={
                          (theme.colors as any).onSurfaceVariant || '#616161'
                        }
                      />
                    ) : (
                      <Icon
                        name="check-box"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '400',
                      color: '#616161',
                      flex: 1,
                      marginHorizontal: metrics.baseMargin,
                      marginTop: 0,
                      lineHeight: 19.3,
                    },
                  ]}
                >
                  I/We declare that the information given in this claim form is
                  true and correct to the best of my knowledge and belief.I/We
                  undertake to render every assistance on my/our power in
                  dealing with the matter.I hereby authorize any hospital
                  physician, other person who has attended or examined me, to
                  furnish to the Company, or its authorized representative, any
                  and all information with respect to any illness or injury,
                  medical history, consultation, prescriptions or treatment and
                  copies of all hospital or medical records. A digital copy of
                  this authorization shall be considered as effective and valid
                  as the original.
                </Text>
              </View>
            </View>

            <View
              style={{
                margin: metrics.baseMargin * 1.5,
                marginHorizontal: metrics.doubleMargin,
              }}
            >
              {user_review?.status == 'new' && (
                <UButton
                  title="Edit Claim"
                  onPress={() => {
                    navigation.navigate(Screens.ClaimRequest, {
                      isEditClaim: true,
                      data: user_review,
                    });
                  }}
                  style={{ flex: 0 }}
                />
              )}
              {isDraft && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}
                >
                  <UButton
                    title="Edit Details"
                    onPress={() => {
                      navigation.navigate(Screens.ClaimRequest, {
                        isEditClaim: true,
                        isDraft: isDraft,
                        data: user_review,
                      });
                    }}
                    style={{
                      flex: 0,
                      width: '40%',
                      backgroundColor: theme.colors.background,
                      borderWidth: 2,
                      borderColor: theme.colors.primary,
                    }}
                    textStyle={{ color: theme.colors.primary }}
                  />
                  <UButton
                    title="Submit Claim"
                    onPress={() => submit_signature()}
                    style={{
                      flex: 0,
                      width: '50%',
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};

export default ClaimDetails;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    claim_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.3,
      paddingTop: metrics.baseMargin * 2,
      padding: metrics.baseMargin * 0.8,
      paddingHorizontal: metrics.baseMargin * 1.5,
      borderColor: '#616161',
    },
    claim_item_img: {
      height: metrics.screenWidth * 0.05,
      width: metrics.screenWidth * 0.05,
    },
    section: {
      flexDirection: 'row',
      paddingLeft: metrics.doubleMargin,
      marginTop: metrics.baseMargin,
      paddingBottom: metrics.baseMargin,
      alignItems: 'center',
    },
    section_img: {
      height: metrics.screenWidth * 0.07,
      width: metrics.screenWidth * 0.07,
      marginEnd: metrics.baseMargin * 2,
    },
    section_child: {
      paddingVertical: metrics.baseMargin,
      paddingBottom: metrics.doubleMargin,
      backgroundColor: theme.colors.background,
    },
    sign_container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: metrics.baseMargin,
      paddingHorizontal: metrics.doubleMargin,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    label: { flex: 1, fontSize: 16, fontWeight: '600', marginBottom: 0 },
    value: {
      flex: 1,
      fontSize: 14,
      color: '#000',
      textAlign: 'right',
      fontFamily: Font_Medium,
      fontWeight: 'medium',
    },
    signBox: {
      borderWidth: 1,
      borderColor: theme.dark ? '#444' : '#ccc',
      borderRadius: 8,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    keyboard_container: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
    },
    travel_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.3,
      padding: metrics.baseMargin * 0.8,
      paddingHorizontal: metrics.baseMargin * 1.5,
      borderColor: theme.dark ? '#444' : '#616161',
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modal_child_view: {
      marginTop: metrics.baseMargin,
    },
    modalTitle: {
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
  });
