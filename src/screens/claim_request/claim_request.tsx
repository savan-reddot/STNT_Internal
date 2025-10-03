import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppLayout from '../../components/safeareawrapper';
import { getRandomPastelColor, globalStyle } from '../../utils/globalStyles';
import { Checkbox, MD3Theme, TextInput, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import {
  useClaim_request_submitMutation,
  useLazyClaim_categoryQuery,
  useLazyCountriesQuery,
  useLazyRequest_reviewQuery,
  useLazySingapore_banksQuery,
  useLazyUserQuery,
  useSubmit_payment_details_editMutation,
  useSubmit_payment_detailsMutation,
  useUpload_signatureMutation,
} from '../../redux/services';
import { Dropdown } from 'react-native-element-dropdown';
import UButton from '../../components/custombutton';
import { Font_Regular } from '../../theme/fonts';
import { Screens } from '../../common/screens';
import Toast from 'react-native-simple-toast';
import { showErrorToast } from '../../utils/toastUtils';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SignatureModal from '../../components/signature_modal';
import RNFS from 'react-native-fs';
import ScreenLoader from '../../components/loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ClaimDetailsEdit from '../../components/claim_details_edit';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { set } from 'date-fns';

const steps = [
  {
    id: 1,
    title: 'Claim Details',
    percentage: 0,
    value: '0%',
  },
  {
    id: 2,
    title: 'Payment Details',
    percentage: 50,
    value: '50%',
  },
  {
    id: 3,
    title: 'Review Details',
    percentage: 100,
    value: '100%',
  },
];

const Relations = [
  {
    value: 'myself',
    label: 'Myself',
  },
  {
    value: 'mother',
    label: 'Mother',
  },
  {
    value: 'father',
    label: 'Father',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

const ClaimRequest = ({ navigation, route }: any) => {
  const theme = useTheme();
  const [current, setCurrent] = useState(0);
  const [request_review, { isLoading }] = useLazyRequest_reviewQuery();
  const [user_review, setUser_Review] = useState<any>();

  const handleNext = () => {
    // if (selectedCategory == null || selectedCountry == null) {
    //   Toast.show('Please select Claim Category & Country of loss', Toast.SHORT);
    //   return;
    // }

    // if (current == 0) {
    //   navigation.navigate(Screens.AddNewClaim, {
    //     onGoBack: () => {
    //       console.warn('onBack Call');
    //       handleNext();
    //     },
    //   });
    // } else {
    setCurrent(current + 1);
    // }
  };

  useEffect(() => {
    if (route.params?.isPaymentEdit && route.params?.claimRequestId > 0) {
      const getUser = async (claimRequestId: number) => {
        console.log('claimRequestId : ', claimRequestId);
        const response = await request_review({ id: claimRequestId });
        console.log('request_review --> ', response);
        if (response && response?.data?.status) {
          const { data } = response?.data;
          if (data) {
            setUser_Review(data);
            handleNext();
          }
        }
      };
      getUser(route.params?.claimRequestId);
    }
  }, [route.params?.isPaymentEdit]);

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const ClaimDetails = () => {
    const [request_review, { isLoading }] = useLazyRequest_reviewQuery();
    const [isDetailsVisible, setIsDetailsVisible] = useState<boolean>(false);
    const [editItem, setEditItem] = useState<any>(null);

    const getUser = async (claimRequestId: number) => {
      console.log('claimRequestId : ', claimRequestId);
      const response = await request_review({ id: claimRequestId });
      console.log('request_review --> ', response);
      if (response && response?.data?.status) {
        const { data } = response?.data;
        if (data) {
          setUser_Review(data);
          handleNext();
        }
      }
    };

    console.log('isDetailsVisible ---> ', isDetailsVisible);

    useEffect(() => {
      if (editItem) {
        setIsDetailsVisible(true);
      }
    }, [editItem]);

    return (
      <View
        style={[
          [
            globalStyle(theme).container,
            {
              paddingTop: metrics.doubleMargin,
              paddingBottom: 0,
            },
          ],
        ]}
      >
        <ScreenLoader visible={isLoading} />
        {route?.params?.isEditClaim ? (
          <View>
            {route?.params?.data &&
              route?.params?.data?.claimRequestDocs &&
              route?.params?.data?.claimRequestDocs?.map(
                (item: any, index: number) => {
                  return (
                    <TouchableOpacity
                      key={'ei' + index}
                      onPress={() => setEditItem(item)}
                    >
                      <View style={styles(theme).claim_edit_detail_item}>
                        <View style={styles(theme).claim_doc_item}>
                          <Image
                            source={require('../../../assets/images/file.png')}
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
                                marginTop: 0,
                                marginHorizontal: metrics.baseMargin,
                                width: metrics.screenWidth * 0.65,
                              },
                            ]}
                          >
                            {item?.claimCategory?.title}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                },
              )}
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image
              source={require('../../../assets/images/add_claim.png')}
              style={{
                height: metrics.screenWidth * 0.6,
                width: metrics.screenWidth * 0.6,
                marginTop: metrics.baseMargin * 6,
              }}
              resizeMode="contain"
            />
            <Text
              style={[
                fontStyle(theme).headingSmall,
                {
                  fontSize: metrics.moderateScale(16),
                  marginTop: metrics.baseMargin,
                },
              ]}
            >
              New Claim Request
            </Text>
            <Text
              style={[
                fontStyle(theme).headingSmall,
                {
                  fontSize: metrics.moderateScale(14),
                  fontWeight: '400',
                  color: '#72849A',
                  textAlign: 'center',
                  paddingHorizontal: metrics.doubleMargin,
                  fontFamily: Font_Regular,
                },
              ]}
            >
              Claim request can be initiated by selecting category of claim and
              uploading documents & pictures. User can add multiple claims for
              different categories from list.
            </Text>
          </View>
        )}
        {!route?.params?.isEditClaim && (
          <UButton
            title="Add New Claim"
            onPress={() => {
              navigation.navigate(Screens.AddNewClaim, {
                onGoBack: (data: any) => {
                  console.warn('onBack Call', data);
                  setTimeout(() => {
                    getUser(data?.claimRequestId);
                  }, 1000);
                },
              });
            }}
            style={{ alignSelf: 'flex-end', flex: 0, width: '100%' }}
          />
        )}
        {isDetailsVisible && (
          <ClaimDetailsEdit
            onDismiss={() => {
              setEditItem(null);
              setIsDetailsVisible(false);
            }}
            claimData={editItem}
            data={route?.params?.data}
            isDraft={route?.params?.isDraft || false}
            isVisible={isDetailsVisible}
          />
        )}
      </View>
    );
  };

  const PaymentDetails = React.memo(({ theme }: { theme: MD3Theme }) => {
    const [singapore_banks, { isLoading }] = useLazySingapore_banksQuery();
    const [submit_payment_details, { isLoading: isSubmitPayment }] =
      useSubmit_payment_detailsMutation();
    const [submit_payment_details_edit, { isLoading: isSubmitPaymentEdit }] =
      useSubmit_payment_details_editMutation();
    const [payee_name, setPayee_Name] = useState<string>('');
    const [payee_relationship, setPayee_Relationship] = useState<string>('');
    const [banks, setBanks] = useState<any[]>([]);
    const [selected_bank, setSelected_Bank] = useState<string>('');
    const [bank_account, setBank_Account] = useState<string>('');
    const [specified_relationship, setSpecified_Relationship] = useState<string>('');

    useEffect(() => {
      const init = async () => {
        const resp = await singapore_banks(0);
        if (resp && resp?.data && resp?.data?.status) {
          const { data } = resp?.data;
          if (data?.length > 0) {
            setBanks(
              data.map((bank: string) => {
                return { label: bank, value: bank };
              }),
            );

            if (route.params?.isPaymentEdit && user_review) {
              setPayee_Name(user_review?.paymentDetails?.payeeName ?? '');
              setPayee_Relationship(
                user_review?.paymentDetails?.payeeRelationship ?? '',
              );
              setSelected_Bank(user_review?.paymentDetails?.bankName ?? '');
              setBank_Account(
                user_review?.paymentDetails?.bankAccountNumber ?? '',
              );
            }
          }
        }
      };

      init();
    }, [singapore_banks]);

    const submit_payment = async () => {
      if (payee_name == '') {
        showErrorToast('Please enter Payee Name !!');
        return;
      }

      if (payee_relationship == '') {
        showErrorToast('Please select Relationship !!');
        return;
      }

      if (payee_relationship == 'other' && specified_relationship == '') {
        showErrorToast('Please enter specify relationship !!');
        return;
      }

      if (selected_bank == '') {
        showErrorToast('Please select Bank !!');
        return;
      }

      if (bank_account == '') {
        showErrorToast('Please enter Bank Account Number !!');
        return;
      }

      const request = {
        payeeName: payee_name,
        payeeNric: null,
        bankName: selected_bank,
        bankAccountNumber: bank_account,
        paymentOption: 'Bank',
        payNow: null,
        payeeRelationship: payee_relationship,
        claimRequestId: user_review?.id,
      };

      console.log('Request Payment : ', request);
      if (route.params?.isDraft) {
        const resp = await submit_payment_details(request);
        console.log('Response Payment : ', resp?.data);
        if (resp && resp?.data && resp?.data?.status) {
          navigation.pop(2);
        }
      } else if (route.params?.isPaymentEdit) {
        const resp = await submit_payment_details_edit({
          request,
          id: user_review?.paymentDetails?.id,
        });
        console.log('Response Payment : ', resp?.data);
        if (resp && resp?.data && resp?.data?.status) {
          navigation.pop(2);
        }
      } else {
        const resp = await submit_payment_details(request);
        console.log('Response Payment : ', resp?.data);
        if (resp && resp?.data && resp?.data?.status) {
          console.log('claimRequestId : ', user_review?.id);
          const response = await request_review({ id: user_review?.id });
          console.log('request_review --> ', response);
          if (response && response?.data?.status) {
            const { data } = response?.data;
            if (data) {
              setUser_Review(data);
              handleNext();
            }
          }
        }
      }
    };

    const handlePayeeName = useCallback(
      (val: string) => setPayee_Name(val),
      [],
    );
    const handleRelationship = useCallback(
      (item: any) => setPayee_Relationship(item.value),
      [],
    );
    const handleBankSelect = useCallback(
      (item: any) => setSelected_Bank(item.value),
      [],
    );
    const handleBankAccount = useCallback(
      (val: string) => setBank_Account(val),
      [],
    );
    const handleSpecifiedRelationship = useCallback(
      (val: string) => setSpecified_Relationship(val),
      [],
    );
    return (
      <KeyboardAvoidingView style={[[globalStyle(theme).container]]}>
        <ScrollView style={[[globalStyle(theme).container]]}>
          <View style={[[globalStyle(theme).container]]}>
            <ScreenLoader visible={isSubmitPayment} />
            <Text
              style={[
                fontStyle(theme).headingSmall,
                {
                  fontSize: metrics.moderateScale(14),
                  fontWeight: '400',
                  color: '#72849A',
                  fontFamily: Font_Regular,
                },
              ]}
            >
              Please enter your payment details for money transfer upon
              successful claim settlement
            </Text>

            <View style={{ marginTop: metrics.baseMargin }}>
              <Text style={[fontStyle(theme).headingSmall, { marginLeft: 0 }]}>
                Payee Name (as per bank account number)
                <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                label=""
                value={payee_name}
                placeholder={'Type here'}
                onChangeText={handlePayeeName}
                mode="outlined"
                outlineStyle={globalStyle(theme).textinput}
                style={{ height: metrics.screenWidth * 0.13 }}
              />
            </View>
            <View style={{ marginTop: metrics.baseMargin }}>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { marginLeft: 0, marginBottom: 0 },
                ]}
              >
                Payee Relationship<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                data={Relations}
                labelField="label"
                valueField="value"
                placeholder="Select Relationship"
                value={payee_relationship}
                onChange={handleRelationship}
              />
            </View>
            {payee_relationship == 'other' && <View style={{ marginTop: metrics.baseMargin }}>
              <Text style={[fontStyle(theme).headingSmall, { marginLeft: 0 }]}>
                Please specify relationship<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                label=""
                value={specified_relationship}
                placeholder={'Please enter specify relationship'}
                onChangeText={handleSpecifiedRelationship}
                mode="outlined"
                keyboardType="default"
                outlineStyle={globalStyle(theme).textinput}
                style={{ height: metrics.screenWidth * 0.13 }}
              />
            </View>}
            <View style={{ marginTop: metrics.baseMargin }}>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { marginLeft: 0, marginBottom: 0 },
                ]}
              >
                Bank Name<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                data={banks}
                labelField="label"
                valueField="value"
                placeholder="Select Bank"
                value={selected_bank}
                onChange={handleBankSelect}
              />
            </View>
            <View style={{ marginTop: metrics.baseMargin }}>
              <Text style={[fontStyle(theme).headingSmall, { marginLeft: 0 }]}>
                Bank Account<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                label=""
                value={bank_account}
                placeholder={'Enter Bank Account Number'}
                onChangeText={handleBankAccount}
                mode="outlined"
                keyboardType="number-pad"
                outlineStyle={globalStyle(theme).textinput}
                style={{ height: metrics.screenWidth * 0.13 }}
              />
            </View>

            <View style={{ flex: 1 }} />
            <UButton
              style={{ flex: 0, marginTop: metrics.doubleMargin * 2 }}
              title={route.params?.isPaymentEdit ? 'Update' : 'Next'}
              onPress={() => submit_payment()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  });

  const ClaimReviewDetails = React.memo(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <View style={{ paddingVertical: metrics.baseMargin }}>
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

  const ReviewDetails = React.memo(() => {
    const [claim_request_submit, { isLoading }] =
      useClaim_request_submitMutation();
    const [upload_signature, { isLoading: isSignatureUploading }] =
      useUpload_signatureMutation();
    const [isDeclare, setIsDeclare] = useState(false);
    const [isFinalDeclare, setIsFinalDeclare] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);
    const [scrollY, setScrollY] = useState(0);

    console.log('user_review -----> ', user_review);

    // restore scroll after state updates
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: scrollY, animated: false });
      }
    }, [scrollY]);

    const submit_signature = async () => {
      if (signature == null || signature == undefined) {
        showErrorToast('Please mark your signature first !!');
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
        handleNext();
      }
    };
    return (
      <ScrollView
        onScroll={e => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
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
                { fontSize: metrics.moderateScale(16) },
              ]}
            >
              Payment Details
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
              <TouchableOpacity onPress={() => setIsDeclare(!isDeclare)}>
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
              Important Notice: In accordance to the provisions of the Personal
              Data Protection Act 2012 (PDPA),the UOI's privacy notice shall
              form part of the terms and conditions of the policy. A copy of
              UOI's Privacy Notice can be found at{' '}
              <Text style={{ textDecorationLine: 'underline' }}>
                www.uoi.com.sg
              </Text>
            </Text>
          </View>

          <View style={styles(theme).sign_container}>
            <Text style={styles(theme).label}>Click below to sign*</Text>

            <TouchableOpacity
              style={styles(theme).signBox}
              onPress={() => setShowModal(true)}
            >
              {signature ? (
                <Image
                  source={{ uri: signature }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ color: '#888' }}>Tap to Sign</Text>
              )}
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
                undertake to render every assistance on my/our power in dealing
                with the matter.I hereby authorize any hospital physician, other
                person who has attended or examined me, to furnish to the
                Company, or its authorized representative, any and all
                information with respect to any illness or injury, medical
                history, consultation, prescriptions or treatment and copies of
                all hospital or medical records. A digital copy of this
                authorization shall be considered as effective and valid as the
                original.
              </Text>
            </View>
          </View>

          <View
            style={{
              margin: metrics.baseMargin * 1.5,
              marginHorizontal: metrics.doubleMargin,
            }}
          >
            <UButton
              title="Submit Claim"
              onPress={() => submit_signature()}
              style={{ flex: 0 }}
            />
          </View>
        </View>
      </ScrollView>
    );
  });

  const Success = () => {
    return (
      <View
        style={[
          globalStyle(theme).container,
          {
            backgroundColor: '#05544B',
            paddingBottom: metrics.doubleMargin,
          },
        ]}
      >
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ marginTop: metrics.doubleMargin }}>
            <Image
              source={require('../../../assets/images/success.png')}
              style={{
                height: metrics.screenWidth * 0.5,
                width: metrics.screenWidth * 0.5,
              }}
            />
          </View>

          <Text
            style={[
              fontStyle(theme).headingMedium,
              { color: '#fff', textAlign: 'center' },
            ]}
          >
            Your claim has been submitted successfully.
          </Text>

          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                color: '#fff',
                fontWeight: 'regular',
                textAlign: 'center',
                fontSize: 14,
                marginTop: metrics.doubleMargin,
                marginHorizontal: metrics.baseMargin,
              },
            ]}
          >
            We've received your claim and our team is currently reviewing the
            details. We'll be in touch with you shortly to guide you through the
            next steps.
          </Text>
        </View>

        <UButton
          title="Close"
          onPress={() => navigation.goBack()}
          textStyle={{ color: '#000', fontWeight: '400', fontSize: 16 }}
          style={{
            flex: 0,
            width: '90%',
            marginHorizontal: metrics.doubleMargin,
            marginTop: metrics.doubleMargin * 2,
            backgroundColor: '#fff',
          }}
        />
      </View>
    );
  };

  const renderStep = () => {
    switch (current) {
      // case 0:
      //   return <TravelDetails />;
      case 0:
        return <ClaimDetails />;
      // return <PaymentDetails theme={theme} />;
      case 1:
        return <PaymentDetails theme={theme} />;
      case 2:
        return <ReviewDetails />;
      case 3:
        return <Success />;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      title={current < 2 ? steps[current].title : ''}
      onBackPress={() => navigation.pop()}
      showHeader={current <= 2}
    >
      <View
        style={[
          globalStyle(theme).container,
          { padding: current <= 2 ? metrics.doubleMargin : 0 },
        ]}
      >
        {current <= 2 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={[fontStyle(theme).headingSmall, { marginTop: 0 }]}
              >{`Step ${current + 1}/3`}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[fontStyle(theme).headingSmall, { marginTop: 0 }]}>
                {steps[current].value}
              </Text>
            </View>
            <View style={styles(theme).progressBarContainer}>
              <View
                style={[
                  styles(theme).progressBar,
                  { width: `${steps[current].percentage}%` },
                ]}
              />
            </View>
          </>
        )}

        {renderStep()}

        {/* {!isNewClaim && (
          <View style={styles(theme).buttonRow}>
            {current > 0 && (
              <>
                <UButton
                  title="Back"
                  onPress={handleBack}
                  style={{ marginEnd: metrics.baseMargin }}
                />
                <UButton
                  title={current === 3 ? 'Submit' : 'Next'}
                  onPress={() => handleNext()}
                />
              </>
            )}
          </View>
        )} */}
      </View>
    </AppLayout>
  );
};

export default ClaimRequest;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    progressBarContainer: {
      height: 10,
      backgroundColor: '#F0F2F4',
      overflow: 'hidden',
      marginBottom: metrics.baseMargin,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#FFBB00',
    },
    buttonRow: {
      flexDirection: 'row',
      //   justifyContent: 'space-between',
      marginTop: 20,
    },
    travel_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.3,
      padding: metrics.baseMargin * 0.8,
      paddingHorizontal: metrics.baseMargin * 1.5,
      borderColor: '#616161',
    },
    claim_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.3,
      paddingTop: metrics.baseMargin * 2,
      padding: metrics.baseMargin * 0.8,
      paddingHorizontal: metrics.baseMargin * 1.5,
      borderColor: '#616161',
    },
    claim_edit_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0.3,
      borderRadius: metrics.baseRadius,
      padding: metrics.baseMargin * 2,
      borderColor: '#616161',
      marginBottom: metrics.baseMargin * 2,
    },
    claim_doc_item: {
      backgroundColor: getRandomPastelColor(),
      padding: metrics.doubleMargin,
      height: metrics.screenWidth * 0.15,
      width: metrics.screenWidth * 0.15,
      borderRadius: metrics.baseRadius * 0.5,
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
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
    claim_item_img: {
      height: metrics.screenWidth * 0.06,
      width: metrics.screenWidth * 0.06,
      resizeMode: 'contain',
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
  });
