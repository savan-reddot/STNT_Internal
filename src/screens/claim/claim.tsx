import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import {
  useLazyGet_claimsQuery,
  useLazyUser_metaQuery,
} from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import { showErrorToast } from '../../utils/toastUtils';
import UIDSelection from '../../components/uid_selection';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import moment from 'moment-timezone';
import { ca } from 'react-native-paper-dates';
import { useFocusEffect } from '@react-navigation/native';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
    case 'new':
      return {
        backgroundColor: '#E4ECEC',
        bordercolor: '#CBD5D6',
        color: '#545969',
        status: 'Submitted',
      };
    case 'declined':
    case 'rejected':
      return {
        backgroundColor: '#FFD6D6',
        bordercolor: '#FFA3A3',
        color: '#D0021B',
        status: 'Declined',
      };
    case 'terminated':
      return {
        backgroundColor: '#E3F2FD',
        bordercolor: '#BBDEFB',
        color: '#1976D2',
        status: 'Closed',
      };
    case 'approved':
    case 'completed':
      return {
        backgroundColor: '#CEF6BB',
        bordercolor: '#B4E1A2',
        color: '#05690D',
        status: 'Approved',
      };
    case 'wip':
    case 'pending':
      return {
        backgroundColor: '#FFF9C4',
        bordercolor: '#FFF176',
        color: '#F57F17',
        status: 'Pending',
      };
    default:
      return {
        backgroundColor: '#E2E2E2',
        bordercolor: '#BDBDBD',
        color: '#4F4F4F',
        status: 'N/A',
      };
  }
};

const Claim = ({ navigation }: any) => {
  const theme = useTheme();
  const bottomSheetRef = useRef(null);
  const user = useAppSelector(getUser);
  const [user_meta, { isLoading: isMetaLoading }] = useLazyUser_metaQuery();
  const [get_claims, { isLoading }] = useLazyGet_claimsQuery();
  const [selectedCat, setSelectedCat] = useState('all');
  const [claims, setClaims] = useState<any[]>();
  const [visible, setVisible] = useState(false);

  const categories = [
    {
      title: 'All Claims',
      value: 'all',
      onSelect: () => setSelectedCat('all'),
    },
    {
      title: 'Submitted',
      value: 'submitted',
      onSelect: () => setSelectedCat('submitted'),
    },
    {
      title: 'Pending',
      value: 'wip',
      onSelect: () => setSelectedCat('wip'),
    },
    {
      title: 'Completed',
      value: 'completed',
      onSelect: () => setSelectedCat('completed'),
    },
    // {
    //   title: 'Terminated',
    //   value: 'terminated',
    //   onSelect: () => setSelectedCat('terminated'),
    // },
    // {
    //   title: 'Closed',
    //   value: 'closed',
    //   onSelect: () => setSelectedCat('closed'),
    // },
  ];

  const getClaims = async (category: string) => {
    const resp = await get_claims({ category });
    console.log('resp?.data?.data -----> ', resp?.data?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { claims, totalClaims, completedClaims, rejectedClaims } =
        resp?.data?.data;
      if (claims?.length > 0) {
        setClaims(claims);
      } else {
        setClaims([]);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      getClaims(selectedCat);
      return () => {
        console.log('Screen is unfocused ❌');
      };
    }, [selectedCat]),
  );

  const list_data = useMemo(() => claims, [claims]);

  return (
    <BottomSheetModalProvider>
      <AppLayout
        title="Claims"
        right={[
          <View
            style={{
              marginEnd: metrics.baseMargin,
              marginTop: metrics.baseMargin,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate(Screens.DraftClaims)}
            >
              <Text style={[fontStyle(theme).headingSmall, { color: '#fff' }]}>
                Draft
              </Text>
            </TouchableOpacity>
          </View>,
        ]}
        onBackPress={() => navigation.pop()}
      >
        <View
          style={[
            globalStyle(theme).container,
            { padding: metrics.doubleMargin },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
            }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories?.map((cat, index) => {
                const isSelected = selectedCat == cat?.value;
                return (
                  <TouchableOpacity onPress={() => setSelectedCat(cat?.value)} key={index}>
                    <View
                      style={{
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : '#ECECED',
                        margin: metrics.baseMargin,
                        marginLeft: 0,
                        paddingHorizontal: metrics.baseMargin * 1.5,
                        borderRadius: metrics.baseRadius * 2,
                        height: 'auto',
                      }}
                    >
                      <Text
                        style={[
                          fontStyle(theme).headingSmall,
                          {
                            fontWeight: isSelected ? '700' : '400',
                            color: isSelected ? '#fff' : theme.colors.backdrop,
                            fontSize: 13,
                          },
                        ]}
                      >
                        {cat?.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* <View
          style={{
            marginTop: metrics.baseMargin,
            paddingBottom: metrics.doubleMargin * 7,
            flex: 1,
          }}
        > */}
          {list_data && list_data?.length > 0 ? (
            <ScrollView
              style={{ flexGrow: 1, marginBottom: metrics.doubleMargin * 4 }}
              showsVerticalScrollIndicator={false}
            >
              {list_data?.map((item, index) => {
                // const status = categories.find(cat => cat.value == item.status);

                return (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      navigation.navigate(Screens.ClaimDetails, {
                        claimRequestId: item?.id,
                      });
                    }}
                    key={index}
                  >
                    <View key={'cl' + index} style={styles(theme).list_parent}>
                      <View
                        style={[
                          styles(theme).list_child,
                          { backgroundColor: getRandomPastelColor() },
                        ]}
                      >
                        <Icon
                          name="insert-drive-file"
                          size={metrics.moderateScale(24)}
                          color={'#fff'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
                          ]}
                        >
                          {item?.traveller?.name}
                        </Text>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            { fontSize: 14, fontWeight: '600' },
                          ]}
                        >
                          {item?.claimTypes.map((ct: any) => ct.title).join(', ')}
                        </Text>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              color: '#72849A',
                            },
                          ]}
                        >
                          {item?.uidNo}
                        </Text>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              color: '#72849A',
                            },
                          ]}
                        >
                          {moment(item?.submittedDate).tz('Asia/Singapore').format(
                            'DD-MM-YYYY hh:mm A',
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: getStatusColor(item.status)
                            .backgroundColor,
                          paddingVertical: 0,
                          paddingHorizontal: metrics.smallMargin,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: getStatusColor(item.status).bordercolor,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text
                          style={[
                            fontStyle(theme).headingSmall,
                            {
                              color: getStatusColor(item.status).color,
                              fontSize: 11,
                            },
                          ]}
                        >
                          {getStatusColor(item.status).status}
                        </Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                );
              })}
            </ScrollView>
          ) : (
            <NoDataFound
              title="No Claims Found"
              description={
                'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
              }
            />
          )}
          {/* </View> */}
          <UButton
            title={'New Claim'}
            onPress={() => {
              if (user?.passportNo == null || user?.passportNo == '') {
                Alert.alert(
                  'Error !!',
                  'Please update Passport Number in Profile Settings first. If updated and still not able to see? contact us via (enquiry@stntinternational.com)',
                );
                return;
              } else if (user?.availableUids.length == 0) {
                Alert.alert(
                  'Error !!',
                  'We could not found any attached policy with your account. Please contact on (enquiry@stntinternational.com)',
                );
                return;
              } else {
                setVisible(true);
              }
              //
            }}
            style={{
              position: 'absolute',
              bottom: metrics.baseMargin * 2,
              alignSelf: 'center',
              width: '100%',
            }}
          />
        </View>
        <UIDSelection
          isVisible={visible}
          onDismiss={() => setVisible(false)}
          onSuccess={() => {
            setVisible(false);
            navigation.navigate(Screens.ClaimRequest);
          }}
        />
      </AppLayout>
    </BottomSheetModalProvider>
  );
};

export default Claim;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    list_parent: {
      padding: metrics.baseMargin,
      paddingVertical: metrics.baseMargin * 2,
      borderRadius: 16,
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: '#F6F6F6',
      backgroundColor: theme.colors.background,
      margin: metrics.baseMargin,
      marginHorizontal: 0,
    },
    list_child: {
      marginHorizontal: metrics.baseMargin,
      // marginEnd: metrics.baseMargin ,
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenWidth * 0.17,
      width: metrics.screenWidth * 0.17,
      borderRadius: metrics.baseRadius / 2,
    },
  });
