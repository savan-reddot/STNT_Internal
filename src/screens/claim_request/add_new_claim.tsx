import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MD3Theme, TextInput, useTheme } from 'react-native-paper';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import UploadDocuments from './upload_documents';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAppDispatch } from '../../redux/hooks';
import {
  useClaim_form_submit_final_editMutation,
  useClaim_form_submit_finalMutation,
  useClaim_request_putMutation,
  useClaim_requestMutation,
  useDelete_docMutation,
  useLazyClaim_categories_documentsQuery,
  useLazyClaim_categoryQuery,
  useLazyClaim_form_submitQuery,
  useLazyCountriesQuery,
  useSave_draftMutation,
} from '../../redux/services';
import Toast from 'react-native-simple-toast';
import { Dropdown } from 'react-native-element-dropdown';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import { useForm } from 'react-hook-form';
import DynamicForm from '../../components/dynamicForm';
import DynamicFormNew from '../../components/dynamicFormNew';
import ScreenLoader from '../../components/loader';
import { useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { set } from 'date-fns';

interface DocType {
  id: number;
  title: string;
  isRequired: boolean;
  isDone: boolean;
  files?: any[];
}

const DocTypeList: DocType[] = [
  {
    id: 1,
    title: 'Copy of Certificate of Insurance',
    isRequired: true,
    isDone: false,
    files: [],
  },
  {
    id: 2,
    title:
      'Tour Operators Confirmation of booking invoices, Airline ticket counterfoil(s)/ Booking Pass(es)',
    isRequired: true,
    isDone: false,
    files: [],
  },
  {
    id: 3,
    title:
      'Medical Report and/or Hospital Discharge Summary showing nature and/or diagnosis of injury/ sickness',
    isRequired: true,
    isDone: false,
    files: [],
  },
  {
    id: 4,
    title:
      'Copies of your other insurance policy and proof of receiving compensation, if any',
    isRequired: true,
    isDone: false,
    files: [],
  },
  {
    id: 5,
    title: 'Copy of actual travel itinerary of Trip',
    isRequired: true,
    isDone: false,
    files: [],
  },
];

interface single_claim {
  selectedCountry: number;
  selectedCategory: number;
  docList: any;
}

const AddNewClaim = ({ navigation }: any) => {
  const theme = useTheme();
  const route = useRoute();
  const isFormEdit = route?.params?.isFormEdit;
  const isEdit = route?.params?.isEditClaim;
  const isDraft = route?.params?.isDraft || false;
  const review_data = route?.params?.data || null;
  const [editClaim, setEditClaim] = useState<any>(route?.params?.item || null);
  const formRef = useRef(null);
  const [countries] = useLazyCountriesQuery();
  const [claim_category] = useLazyClaim_categoryQuery();
  const [claim_request, { isLoading }] = useClaim_requestMutation();
  const [delete_doc, { isDeleteDocLoading }] = useDelete_docMutation();
  const [claim_request_put, { isLoading: isEditLoading }] =
    useClaim_request_putMutation();
  const [claim_categories_documents, { isLoading: isDocumentListLoading }] =
    useLazyClaim_categories_documentsQuery();
  const [save_draft, { isLoading: isDraftLoading }] = useSave_draftMutation();
  const [claim_form_submit, { isLoading: isFormLoading }] =
    useLazyClaim_form_submitQuery();
  const [claim_form_submit_final, { isLoading: isFinalFormLoading }] =
    useClaim_form_submit_finalMutation();
  const [claim_form_submit_final_edit, { isLoading: isFinalEditFormLoading }] =
    useClaim_form_submit_final_editMutation();
  const [isClaimForm, setIsClaimForm] = useState(false);
  const [saveFormAsDraft, setSaveFormAsDraft] = useState(false);
  const detailsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  const [isTab, setIsTab] = useState(false);
  const [visible, setVisible] = useState(false);
  const [claim_success, setClaim_Success] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [claim_form, setClaim_Form] = useState<any>(null);
  const [form_index, setForm_Index] = useState<number>(0);
  const [details, setDetails] = useState<DocType>();
  const [country_list, setCountry_List] = useState([]);
  const [category_list, setCategory_List] = useState([]);
  const methods = useForm();

  const initClaim: single_claim = {
    selectedCountry: 0,
    selectedCategory: 0,
    docList: null,
  };

  const [claim_list, setClaim_List] = useState<FormData[]>([]);
  const [claim_skeleton, setClaim_Skeleton] = useState<single_claim>(initClaim);

  console.log('claim item ---------> ', editClaim);

  useEffect(() => {
    if (
      isEdit &&
      editClaim &&
      country_list.length > 0 &&
      category_list.length > 0
    ) {
      const country: any = list.find(
        (e: any) =>
          e.label == editClaim?.claimCategory?.claimCategorylossCountry,
      );
      setIsTab(true);
      setClaim_Skeleton({
        ...claim_skeleton,
        selectedCountry: country.value,
        selectedCategory: editClaim?.claimCategory?.id,
      });
      // Optionally load claim_form if you support direct form editing
      if (isFormEdit) {
        const loadForm = async () => {
          const form_resp = await claim_form_submit({
            id: editClaim?.claimCategory?.id,
          });
          console.log('claim_form_submit response : ', form_resp?.data);

          if (form_resp?.data?.status) {
            const { data: formData } = form_resp?.data;
            formData?.length > 0 && setClaim_Form(formData);
            setIsClaimForm(true);
          }
        };
        loadForm();
      }
    }
  }, [isEdit, editClaim, category_list, country_list]);

  useEffect(() => {
    const init = async () => {
      const resp = await countries(0);
      console.log('Response : ', JSON.stringify(resp?.data));
      if (resp?.data) {
        const { countries } = resp?.data;
        if (countries?.length > 0) {
          setCountry_List(
            countries?.map((ele: string, index: number) => {
              return { label: ele, value: ele };
            }),
          );
        }
      }

      const resp_category = await claim_category(0);
      console.log('Response Cat : ', resp_category?.data);
      if (resp_category?.data) {
        const { claimCategories } = resp_category?.data;
        if (claimCategories?.length > 0) {
          setCategory_List(
            claimCategories?.map((ele: any, index: number) => {
              return { label: ele?.title, value: ele?.id };
            }),
          );
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    details && setVisible(true);
  }, [details]);

  const isLoad =
    isLoading ||
    isFormLoading ||
    isDraftLoading ||
    isDocumentListLoading ||
    isEditLoading;

  const list = useMemo(() => country_list, [country_list]);
  const list_category = useMemo(() => category_list, [category_list]);

  useEffect(() => {
    if (isTab && !isFormEdit) {
      getClaim_Documents();
    }
  }, [isTab]);

  useEffect(() => {
    if (claim_list && claim_list.length > 0) {
      setClaim_Skeleton(initClaim);
      setIsTab(false);
    }
  }, [claim_list]);

  const getClaim_Documents = async () => {
    try {
      ``;
      const country: any = list.find(
        (e: any) => e.value == claim_skeleton.selectedCountry,
      );
      const doc_resp = await claim_categories_documents({
        id: claim_skeleton.selectedCategory,
        country: country.label,
      });
      if (doc_resp?.data?.status) {
        const { claimCategoryData } = doc_resp?.data;
        if (
          claimCategoryData &&
          claimCategoryData?.claimDocuments &&
          claimCategoryData?.claimDocuments?.length > 0
        ) {
          setClaim_Skeleton({
            ...claim_skeleton,
            docList: claimCategoryData?.claimDocuments?.map(doc => {
              return {
                id: doc?.id,
                title: doc?.title,
                isRequired: doc?.isMandatory,
                isDone: false,
                files: [],
                oldfiles:
                  (editClaim &&
                    editClaim.files?.filter(
                      (e: any) => e.fieldname == doc?.title,
                    )) ||
                  [],
                isEdit: isEdit,
              };
            }),
          });
          // setDocList(
          //   claimCategoryData?.claimDocuments?.map(doc => {
          //     return {
          //       id: doc?.id,
          //       title: doc?.title,
          //       isRequired: doc?.isMandatory,
          //       isDone: false,
          //       files: [],
          //     };
          //   }),
          // );
        }
      }
    } catch (error) {
      console.log('Documents Error : ', error);
    }
  };

  const submitClaim_Request = async (claims: any, isDraft: boolean) => {
    try {
      if (claims && claims.length > 0) {
        const responses = await Promise.all(
          claims.map(async (request: any) => {
            console.log('Form Data : ', request);
            if (isEdit) {
              const resp = await claim_request_put(request);
              console.log('Edit Response : ', JSON.stringify(resp));
              console.log('Edit Response Data : ', JSON.stringify(resp?.data));
              const { status } = resp?.data;
              if (status) {
                navigation.pop(3);
              }
            } else {
              const resp = await claim_request(request);
              console.log('Response : ', JSON.stringify(resp));
              console.log('Response Data : ', JSON.stringify(resp?.data));
              const { status } = resp?.data;
              if (status) {
                const { data } = resp?.data;
                if (data) {
                  return data;
                }
              }
            }
          }),
        );

        console.log('responses : ', responses);
        console.log(
          'ids -----------> ',
          responses.map(item => item.id),
        );

        if (!isEdit) {
          const save_draft_resp = await save_draft({
            claimReqId: responses.map(item => item.id),
            lossCountry: responses[0].claimCategorylossCountry,
            mode: 'next',
            mainClaimReqId: null,
          });

          if (save_draft_resp?.data?.status) {
            // setClaim_Success(data);
            if (isDraft) {
              navigation.pop(2);
              return;
            }
            setDraft(save_draft_resp?.data?.data);
          }
          console.log(
            'claim_form_submit request : ',
            save_draft_resp?.data?.claimCategoryIds.join(','),
          );
          const form_resp = await claim_form_submit({
            id: save_draft_resp?.data?.claimCategoryIds.join(','),
          });
          console.log('claim_form_submit response : ', form_resp?.data);

          if (form_resp?.data?.status) {
            const { data: formData } = form_resp?.data;
            formData?.length > 0 && setClaim_Form(formData);
            setIsClaimForm(true);
          }
        }
      }
      // for (const doc of claim_skeleton.docList) {
      //   if (Array.isArray(doc?.files) && doc.files.length == 0) {
      //     // Toast.showWithGravity(
      //     //   `Please upload documents for ${doc.title}`,
      //     //   Toast.LONG,
      //     //   Toast.BOTTOM,
      //     // );
      //     showErrorToast(`Please upload documents for ${doc.title}`);
      //     return;
      //   }
      // }

      // const formData = new FormData();
      // formData.append('claimCategoryId', claim_skeleton.selectedCategory);
      // formData.append('claimCategorylossCountry', country.label);
      // formData.append('mode', 'next');
      // claim_skeleton.docList.forEach((doc: any) => {
      //   if (doc.files?.length > 0) {
      //     doc?.files.forEach((file: any) => {
      //       formData.append(doc.title, file);
      //     });
      //   }
      // });
      // console.log('Form Data : ', formData);
      // const resp = await claim_request(formData);
      // console.log('Response : ', JSON.stringify(resp?.data));
      // const { status, message } = resp?.data;
      // if (status) {
      //   const { data } = resp?.data;
      //   showSuccessToast(message);
      //   const save_draft_resp = await save_draft({
      //     claimReqId: [data?.id],
      //     lossCountry: country.label,
      //     mode: 'next',
      //     mainClaimReqId: null,
      //   });
      //   if (save_draft_resp?.data?.status) {
      //     setClaim_Success(data);
      //     setDraft(save_draft_resp?.data?.data);
      //     const form_resp = await claim_form_submit({
      //       id: claim_skeleton.selectedCategory,
      //     });
      //     console.log('Form : ', form_resp?.data);
      //     console.log(
      //       'params?.claimCategoryId : ',
      //       claim_skeleton.selectedCategory,
      //     );
      //     if (form_resp?.data?.status) {
      //       const { data: formData } = form_resp?.data;
      //       formData?.length > 0 && setClaim_Form(formData[0]);
      //       setIsClaimForm(true);
      //     }
      //   }
      // } else {
      //   showErrorToast(message);
      // }
    } catch (error) {
      console.log('error : ', error);
    }
  };

  const submit_claim_form = async (request: any) => {
    if (isDraft) {
      if (
        editClaim?.claimCategory?.claimForm &&
        editClaim?.claimCategory?.claimForm?.id
      ) {
        const claim_request = {
          claimRequestId: review_data?.id,
          claimCategoryId: claim_skeleton.selectedCategory,
          claimForm: request,
        };
        console.log('submit claim : ', claim_request);
        const final_resp = await claim_form_submit_final_edit({
          request: claim_request,
          id: editClaim?.claimCategory?.claimForm?.id,
        });
        if (final_resp?.data?.status) {
          console.log('Success : ', final_resp?.data);
          if (claim_form && claim_form.length - 1 > form_index) {
            setForm_Index(form_index + 1);
          } else {
            showSuccessToast(final_resp?.data?.message);
            navigation.pop(3);
          }
        } else {
          console.log('Fail : ', final_resp?.data);
        }
      } else {
        const claim_request = {
          claimRequestId: review_data?.id,
          claimCategoryId: claim_skeleton.selectedCategory,
          claimForm: request,
        };
        console.log('submit claim : ', claim_request);
        const final_resp = await claim_form_submit_final(claim_request);
        if (final_resp?.data?.status) {
          console.log('Success : ', final_resp?.data);
          if (claim_form && claim_form.length - 1 > form_index) {
            setForm_Index(form_index + 1);
          } else {
            showSuccessToast(final_resp?.data?.message);
            if (saveFormAsDraft) {
              setSaveFormAsDraft(false);
              navigation.pop(2);
            } else {
              if (route?.params?.onGoBack) {
                route?.params?.onGoBack(final_resp?.data?.data);
              }
              navigation.goBack();
            }
          }
        } else {
          console.log('Fail : ', final_resp?.data);
        }
      }
    } else {
      if (isEdit) {
        const claim_request = {
          claimRequestId: editClaim?.claimRequestId,
          claimCategoryId: claim_skeleton.selectedCategory,
          claimForm: request,
        };
        console.log('submit claim : ', claim_request);
        const final_resp = await claim_form_submit_final_edit({
          request: claim_request,
          id: editClaim?.claimCategory?.claimForm?.id,
        });
        if (final_resp?.data?.status) {
          console.log('Success : ', final_resp?.data);
          if (claim_form && claim_form.length - 1 > form_index) {
            setForm_Index(form_index + 1);
          } else {
            showSuccessToast(final_resp?.data?.message);
            navigation.pop(3);
          }
        } else {
          console.log('Fail : ', final_resp?.data);
        }
      } else {
        if (draft) {
          const claim_request = {
            claimRequestId: draft?.id,
            claimCategoryId: claim_skeleton.selectedCategory,
            claimForm: request,
          };
          console.log('submit claim : ', claim_request);
          const final_resp = await claim_form_submit_final(claim_request);
          if (final_resp?.data?.status) {
            console.log('Success : ', final_resp?.data);
            if (claim_form && claim_form.length - 1 > form_index) {
              setForm_Index(form_index + 1);
            } else {
              showSuccessToast(final_resp?.data?.message);
              if (saveFormAsDraft) {
                setSaveFormAsDraft(false);
                navigation.pop(2);
              } else {
                if (route?.params?.onGoBack) {
                  route?.params?.onGoBack(final_resp?.data?.data);
                }
                navigation.goBack();
              }
            }
          } else {
            console.log('Fail : ', final_resp?.data);
          }
        }
      }
    }
  };

  const delete_document = async (file: any) => {
    try {
      if (isEdit && editClaim) {
        const request = {
          claimRequestId: editClaim?.claimRequestId,
          fieldName: file?.fieldname,
          documentId: file?.id.toString(),
        };
        const resp = await delete_doc(request);
        console.log('Response Delete ------> ', resp?.data);
        if (resp?.data?.status) {
          showSuccessToast(resp?.data?.message);
          setClaim_Skeleton({
            ...claim_skeleton,
            docList: claim_skeleton.docList.map((doc: any) => {
              return {
                ...doc,
                oldfiles: doc?.oldfiles?.filter((e: any) => e.id != file.id),
              };
            }),
          });
        }
      }
    } catch (error) {
      console.log('delete doc error : ', error);
    }
  };

  useEffect(() => {
    if (saveFormAsDraft && formRef?.current) {
      formRef.current?.submit();
    }
  }, [saveFormAsDraft]);

  const onBackPressHandle = async (request = null) => {
    if (!isEdit && isTab) {
      Alert.alert(
        'Are you sure, you want to exit ?',
        'Your data will be lost. Are you want to save claim as Draft ?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => navigation.pop(),
          },
          {
            text: 'Yes',
            onPress: async () => {
              if (isClaimForm) {
                setSaveFormAsDraft(true);
              } else {
                const existClaims = [...claim_list];
                const country: any = list.find(
                  (e: any) => e.value == claim_skeleton.selectedCountry,
                );

                const hasAtLeastOneFile = claim_skeleton.docList.some(
                  doc => doc.files && doc.files.length > 0,
                );

                if (!hasAtLeastOneFile) {
                  showErrorToast(
                    'Please upload at least one document to save as draft',
                  );
                  return;
                }

                const formData = new FormData();
                formData.append(
                  'claimCategoryId',
                  claim_skeleton.selectedCategory,
                );
                formData.append('claimCategorylossCountry', country.label);

                formData.append('mode', 'next');

                claim_skeleton.docList.forEach((doc: any) => {
                  if (doc.files?.length > 0) {
                    doc?.files.forEach((file: any) => {
                      formData.append(doc.title, file);
                    });
                  }
                });

                // const request: single_claim = {
                //   selectedCategory: claim_skeleton.selectedCategory,
                //   selectedCountry: country.label,
                //   docList: formData,
                // };
                existClaims.push(formData);
                submitClaim_Request(existClaims, true);
              }
            },
          },
        ],
      );
    } else {
      navigation.pop();
    }
  };

  return (
    <>
      <ScreenLoader visible={isLoad} />
      <AppLayout
        title={isEdit ? 'Edit Claim' : 'New Claim Request'}
        onBackPress={() => onBackPressHandle()}
      >
        {/* <View style={[globalStyle(theme).container]}>
          <DynamicFormNew />
        </View> */}
        {!isTab ? (
          <View
            style={[
              [globalStyle(theme).container, { padding: metrics.doubleMargin }],
            ]}
          >
            <Text style={[fontStyle(theme).headingSmall, { marginLeft: 0 }]}>
              Place where loss occured
            </Text>
            <Dropdown
              style={globalStyle(theme).dropdown}
              data={list}
              labelField="label"
              valueField="value"
              placeholder="Select"
              value={claim_skeleton.selectedCountry}
              onChange={item => {
                setClaim_Skeleton({
                  ...claim_skeleton,
                  selectedCountry: item.value,
                });
              }}
            />

            <Text style={[fontStyle(theme).headingSmall, { marginLeft: 0 }]}>
              Claim Category
            </Text>
            <Dropdown
              style={globalStyle(theme).dropdown}
              data={list_category}
              labelField="label"
              valueField="value"
              placeholder="Select"
              value={claim_skeleton.selectedCategory}
              onChange={item => {
                setClaim_Skeleton({
                  ...claim_skeleton,
                  selectedCategory: item.value,
                });
              }}
            />
            <View style={{ flexGrow: 1 }} />

            <UButton
              title={'Next'}
              style={{ flex: 0 }}
              onPress={() => {
                if (
                  claim_skeleton.selectedCategory == 0 ||
                  claim_skeleton.selectedCountry == 0
                ) {
                  Toast.showWithGravity(
                    'Please select claim category and country of loss',
                    Toast.SHORT,
                    Toast.BOTTOM,
                  );
                  return;
                } else setIsTab(true);
                console.log('params : ', route?.params);
                // if (route?.params?.onGoBack) {
                //   route?.params?.onGoBack();
                // }

                // navigation.goBack();
              }}
            />
          </View>
        ) : (
          <View style={[globalStyle(theme).container]}>
            <View style={styles(theme).tabbar}>
              <TouchableOpacity
                disabled={claim_success != null && isClaimForm}
                style={{
                  flex: 1,
                  opacity: claim_success != null && isClaimForm ? 0.5 : 1,
                }}
                onPress={() => setIsClaimForm(false)}
              >
                <View style={styles(theme).tab}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        padding: metrics.baseMargin,
                        color: isClaimForm ? '#000' : theme.colors.primary,
                        fontSize: metrics.moderateScale(15),
                        fontWeight: isClaimForm ? '400' : '700',
                      },
                    ]}
                  >
                    Upload Documents
                  </Text>
                  <View
                    style={{
                      height: isClaimForm ? 1 : 2,
                      width: '100%',
                      backgroundColor: isClaimForm
                        ? '#E3E0E0'
                        : theme.colors.primary,
                    }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  for (const doc of claim_skeleton.docList) {
                    if (Array.isArray(doc?.files) && doc.files.length == 0) {
                      showErrorToast(
                        `Please upload documents for ${doc.title}`,
                      );
                      return;
                    }
                  }
                  setIsClaimForm(true);
                }}
              >
                <View style={styles(theme).tab}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        padding: metrics.baseMargin,
                        color: !isClaimForm ? '#000' : theme.colors.primary,
                        fontSize: metrics.moderateScale(15),
                        fontWeight: !isClaimForm ? '400' : '700',
                      },
                    ]}
                  >
                    Claim Form
                  </Text>
                  <View
                    style={{
                      height: !isClaimForm ? 1 : 2,
                      width: '100%',
                      backgroundColor: isClaimForm
                        ? theme.colors.primary
                        : '#E3E0E0',
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
            {!isClaimForm ? (
              <ScrollView
                style={{
                  flex: 1,
                  paddingHorizontal: metrics.doubleMargin,
                  paddingTop: metrics.baseMargin,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flex: 1 }}>
                  {claim_skeleton.docList &&
                    claim_skeleton.docList.length > 0 &&
                    claim_skeleton.docList.map((doc, index) => (
                      <View
                        style={{
                          borderWidth: 2,
                          borderColor: '#F6F6F6',
                          margin: metrics.baseMargin,
                          marginHorizontal: 0,
                          borderRadius: metrics.baseRadius,
                        }}
                        key={'doc1' + index}
                      >
                        <TouchableOpacity onPress={() => setDetails(doc)}>
                          <View
                            key={'doc' + index}
                            style={styles(theme).list_parent}
                          >
                            <View style={[styles(theme).list_child]}>
                              <Icon
                                name="insert-drive-file"
                                size={metrics.moderateScale(24)}
                                color={'#fff'}
                              />
                            </View>
                            <View
                              style={{
                                flex: 1,
                                marginHorizontal: metrics.baseMargin,
                              }}
                            >
                              <Text
                                style={[
                                  fontStyle(theme).headingMedium,
                                  { fontSize: 14, fontWeight: '600' },
                                ]}
                              >
                                {doc.title}
                                {doc?.isRequired && (
                                  <Text style={{ color: 'red' }}>*</Text>
                                )}
                              </Text>
                            </View>
                            {doc.files?.length || 0 > 0 ? (
                              <Ionicons
                                name="checkmark-circle"
                                size={metrics.moderateScale(24)}
                                color={theme.colors.primary}
                                style={{ alignSelf: 'center' }}
                              />
                            ) : (
                              <Ionicons
                                name="arrow-forward"
                                size={metrics.moderateScale(24)}
                                color={'#999999'}
                                style={{
                                  padding: metrics.baseMargin,
                                  backgroundColor: '#F6F6F6',
                                  borderRadius: 50,
                                  alignSelf: 'center',
                                  marginLeft: metrics.baseMargin,
                                }}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                        {isEdit &&
                          doc?.oldfiles?.length > 0 &&
                          doc?.oldfiles.map((file: any, idx: number) => (
                            <View
                              style={{
                                margin: metrics.baseMargin * 1.5,
                                marginTop: 0,
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              key={'oldfile' + idx}
                            >
                              <Image
                                source={{
                                  uri: file?.path
                                    ? file?.path
                                    : file?.uri
                                    ? file?.uri
                                    : '',
                                }}
                                style={{
                                  height: metrics.screenWidth * 0.11,
                                  width: metrics.screenWidth * 0.11,
                                  borderRadius: metrics.baseRadius,
                                }}
                              />
                              <Text
                                style={[
                                  fontStyle(theme).headingSmall,
                                  {
                                    color: 'blue',
                                    fontWeight: 'regular',
                                    fontSize: 13,
                                    flex: 1,
                                    marginHorizontal: metrics.baseMargin,
                                  },
                                ]}
                              >
                                {file?.originalname
                                  ? file?.originalname
                                  : file?.name
                                  ? file?.name
                                  : '-'}
                              </Text>
                              <TouchableOpacity
                                onPress={() => delete_document(file)}
                              >
                                <Icon
                                  name="delete-outline"
                                  color={'red'}
                                  size={20}
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                      </View>
                    ))}
                </View>

                {!isDocumentListLoading && (
                  <>
                    {!isEdit && (
                      <UButton
                        title={'Add more claims'}
                        style={{
                          flex: 0,
                          width: '100%',
                          borderColor: theme.colors.primary,
                          borderWidth: 2,
                          backgroundColor: '#fff',
                        }}
                        textStyle={{ color: theme.colors.primary }}
                        onPress={() => {
                          const country: any = list.find(
                            (e: any) =>
                              e.value == claim_skeleton.selectedCountry,
                          );
                          for (const doc of claim_skeleton.docList) {
                            if (
                              Array.isArray(doc?.files) &&
                              doc.files.length == 0
                            ) {
                              showErrorToast(
                                `Please upload documents for ${doc.title}`,
                              );
                              return;
                            }
                          }

                          const formData = new FormData();
                          formData.append(
                            'claimCategoryId',
                            claim_skeleton.selectedCategory,
                          );
                          formData.append(
                            'claimCategorylossCountry',
                            country.label,
                          );
                          formData.append('mode', 'next');
                          claim_skeleton.docList.forEach((doc: any) => {
                            if (doc.files?.length > 0) {
                              doc?.files.forEach((file: any) => {
                                formData.append(doc.title, file);
                              });
                            }
                          });

                          // const request: single_claim = {
                          //   selectedCategory: claim_skeleton.selectedCategory,
                          //   selectedCountry: country.label,
                          //   docList: formData,
                          // };
                          setClaim_List(prev => [...prev, formData]);
                        }}
                      />
                    )}

                    {!isEdit && (
                      <UButton
                        title="Save as draft"
                        onPress={() => {
                          const existClaims = [...claim_list];
                          const country: any = list.find(
                            (e: any) =>
                              e.value == claim_skeleton.selectedCountry,
                          );

                          console.log('isEdit ', isEdit);

                          for (const doc of claim_skeleton.docList) {
                            if (
                              Array.isArray(doc?.files) &&
                              doc.files.length == 0
                            ) {
                              showErrorToast(
                                `Please upload documents for ${doc.title}`,
                              );
                              return;
                            }
                          }

                          const formData = new FormData();
                          formData.append(
                            'claimCategoryId',
                            claim_skeleton.selectedCategory,
                          );
                          formData.append(
                            'claimCategorylossCountry',
                            country.label,
                          );
                          if (isEdit) {
                            formData.append(
                              'claimRequestId',
                              editClaim?.claimRequestId,
                            );
                            formData.append(
                              'claimTrackId',
                              editClaim?.claimRequestId,
                            );
                          }
                          !isEdit && formData.append('mode', 'next');
                          console.log(
                            'claim docs ----> ',
                            claim_skeleton.docList,
                          );
                          claim_skeleton.docList.forEach((doc: any) => {
                            if (doc.files?.length > 0) {
                              doc?.files.forEach((file: any) => {
                                formData.append(doc.title, file);
                              });
                            }
                          });

                          // const request: single_claim = {
                          //   selectedCategory: claim_skeleton.selectedCategory,
                          //   selectedCountry: country.label,
                          //   docList: formData,
                          // };
                          existClaims.push(formData);
                          submitClaim_Request(existClaims, true);
                        }}
                        textStyle={{ color: theme.colors.primary }}
                        style={{
                          flex: 0,
                          width: '100%',
                          marginTop: metrics.doubleMargin * 3,
                          borderColor: theme.colors.primary,
                          borderWidth: 2,
                          backgroundColor: '#fff',
                        }}
                      />
                    )}

                    <UButton
                      title={isEdit ? 'Update' : 'Next'}
                      onPress={() => {
                        const existClaims = [...claim_list];
                        const country: any = list.find(
                          (e: any) => e.value == claim_skeleton.selectedCountry,
                        );
                        for (const doc of claim_skeleton.docList) {
                          if (
                            Array.isArray(doc?.files) &&
                            doc.files.length == 0 &&
                            !isEdit
                          ) {
                            showErrorToast(
                              `Please upload documents for ${doc.title}`,
                            );
                            return;
                          }
                        }

                        const formData = new FormData();

                        formData.append(
                          'claimCategoryId',
                          claim_skeleton.selectedCategory,
                        );
                        if (isEdit) {
                          formData.append('lossCountry', country.label);
                        } else {
                          formData.append(
                            'claimCategorylossCountry',
                            country.label,
                          );
                        }
                        if (isEdit) {
                          formData.append(
                            'claimRequestId',
                            editClaim?.claimRequestId,
                          );
                          formData.append(
                            'claimTrackId',
                            editClaim?.claimRequestId,
                          );
                        }
                        formData.append('mode', 'next');
                        console.log(
                          'claim docs ----> ',
                          claim_skeleton.docList,
                        );
                        claim_skeleton.docList.forEach((doc: any) => {
                          if (doc.files?.length > 0) {
                            doc?.files.forEach((file: any) => {
                              !file?.uri.includes('https://') &&
                                formData.append(doc.title, file);
                            });
                          }
                        });

                        // const request: single_claim = {
                        //   selectedCategory: claim_skeleton.selectedCategory,
                        //   selectedCountry: country.label,
                        //   docList: formData,
                        // };
                        existClaims.push(formData);
                        submitClaim_Request(existClaims, false);
                      }}
                      style={{
                        alignSelf: 'flex-end',
                        flex: 0,
                        width: '100%',
                        marginTop: metrics.baseMargin,
                      }}
                    />
                  </>
                )}
              </ScrollView>
            ) : (
              <ScrollView
                style={{
                  paddingTop: 0,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ flex: 1, padding: metrics.doubleMargin }}>
                  {claim_form && claim_form?.length > 0 && (
                    <DynamicFormNew
                      ref={formRef}
                      claim_form={claim_form}
                      form_index={form_index}
                      structure={claim_form[form_index]?.dataStructure}
                      onSave={(request: any) => submit_claim_form(request)}
                      isEdit={isEdit}
                      editClaim={editClaim?.claimCategory}
                    />
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </AppLayout>
      <UploadDocuments
        isVisible={visible}
        details={details}
        onDismiss={() => {
          setVisible(false);
          setDetails(undefined);
        }}
        onSave={docs => {
          setClaim_Skeleton({
            ...claim_skeleton,
            docList: claim_skeleton.docList.map(doc => {
              if (doc.id === details?.id) {
                return {
                  ...doc,
                  isDone: true,
                  files: docs,
                  oldfiles: [...doc?.oldfiles, ...docs],
                };
              }
              return doc;
            }),
          });
          // setDocList(prev =>
          //   prev.map(doc => {
          //     if (doc.id === details?.id) {
          //       return { ...doc, isDone: true, files: docs };
          //     }
          //     return doc;
          //   }),
          // );
          setVisible(false);
          setDetails(undefined);
        }}
      />
    </>
  );
};

export default AddNewClaim;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    tabbar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    list_parent: {
      padding: metrics.baseMargin,
      paddingVertical: metrics.baseMargin * 2,

      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      alignItems: 'center',
    },
    list_child: {
      marginHorizontal: metrics.baseMargin,
      // marginEnd: metrics.baseMargin ,
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenWidth * 0.13,
      width: metrics.screenWidth * 0.13,
      borderRadius: metrics.baseRadius / 2,
      backgroundColor: '#9ABFDC',
    },
    list_item: {
      marginHorizontal: metrics.baseMargin,
      // marginEnd: metrics.baseMargin ,
      alignItems: 'center',
      justifyContent: 'center',
      width: metrics.screenWidth * 0.13,
      borderRadius: metrics.baseRadius / 2,
      backgroundColor: '#9ABFDC',
    },
  });
