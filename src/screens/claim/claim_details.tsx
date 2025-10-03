import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import {
  useClaim_request_submitMutation,
  useLazyRequest_reviewQuery,
  useUpload_signatureMutation,
} from '../../redux/services';
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
import RNFS from 'react-native-fs';

const ClaimDetails = ({ route, navigation }: any) => {
  const theme = useTheme();
  const claimRequestId = route?.params?.claimRequestId || null;
  const isDraft = route?.params?.isDraft || false;
  const [request_review, { isLoading }] = useLazyRequest_reviewQuery();
  const [claim_request_submit, { isClaimSubmitLoading }] =
    useClaim_request_submitMutation();
  const [upload_signature, { isLoading: isSignatureUploading }] =
    useUpload_signatureMutation();
  const [user_review, setUser_Review] = useState<any>();
  const [isDeclare, setIsDeclare] = useState(false);
  const [isFinalDeclare, setIsFinalDeclare] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    if (claimRequestId) {
      getUser(claimRequestId);
    }
  }, [claimRequestId]);

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
      console.log('Claim Review Details');
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
                    color: '#616161',
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
        </View>
      );
    },
  );

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

    const base64Data = signature.replace(/^data:image\/png;base64,/, '');
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
    }
  };

  const isLoad = isLoading || isClaimSubmitLoading || isSignatureUploading;

  return (
    <AppLayout
      title="Claims"
      onBackPress={() => navigation.pop()}
      right={[
        <View>
          <Text></Text>
        </View>,
      ]}
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
              backgroundColor: '#F8F8F8',
            },
          ]}
        >
          <ScreenLoader visible={isLoading} />
          <View
            style={[
              [
                globalStyle(theme).container,
                {
                  backgroundColor: '#F8F8F8',
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
                      color: '#616161',
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
                      color: '#616161',
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
                      color: '#616161',
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
                      color: '#616161',
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
                      color: '#616161',
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
                      color: '#616161',
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
                  {user_review?.paymentDetails?.paymentOptions}
                </Text>
              </View>
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
              </View>
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
                      color={'#616161'}
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
                      color: '#616161',
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
                    color: '#616161',
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
                        color={'#616161'}
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
    label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    signBox: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
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
      borderColor: '#616161',
    },
  });
