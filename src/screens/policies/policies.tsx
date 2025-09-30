/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { useTheme } from 'react-native-paper';
import { getRandomPastelColor, globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLazyGet_policyQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { useFocusEffect } from '@react-navigation/native';
import PolicyDetails from '../../components/policy_details';
import { set } from 'date-fns';
import moment from 'moment';

const data = [
  {
    id: 1,
    title: 'Umrah EMA Basic',
    category: 'active',
    type: 'S-STT-S1004-5921',
    filled_on: '01/03/2024',
    color: getRandomPastelColor(),
  },
  {
    id: 2,
    title: 'Umrah EMA Basic',
    category: 'active',
    type: 'S-STT-8680-6950',
    filled_on: '03/03/2024',
    color: getRandomPastelColor(),
  },
  {
    id: 3,
    title: 'Umrah EMA Basic',
    category: 'expired',
    type: 'S-STT-8990-6950',
    filled_on: '03/03/2024',
    color: getRandomPastelColor(),
  },
];

const Policies = ({ route }: any) => {
  const theme = useTheme();
  const { type } = route.params || {};
  const [get_policy, { isLoading }] = useLazyGet_policyQuery();
  const [policiesData, setPoliciesData] = useState<any>(null);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState<boolean>(false);

  const categories = [
    {
      title: 'All Policy',
      value: 'all',
      onSelect: () => setSelectedCat('all'),
    },
    {
      title: 'Active',
      value: 'active',
      onSelect: () => setSelectedCat('active'),
    },
    {
      title: 'Expired',
      value: 'expired',
      onSelect: () => setSelectedCat('expired'),
    },
  ];

  useEffect(() => {
    if (type) {
      setSelectedCat(type);
    }
  }, [type]);

  useEffect(() => {
    if (selectedPolicy) {
      console.log('selected policy', selectedPolicy);
      setIsDetailsVisible(true);
    }
  }, [selectedPolicy]);

  // useFocusEffect(
  //   useCallback(() => {
  //     getPolicies(selectedCat);̧

  //     return () => {
  //       console.log('Screen is unfocused ❌');
  //       // Cleanup tasks go here
  //       // e.g., stop timers, unsubscribe listeners
  //     };
  //   }, [selectedCat]),
  // );

  useEffect(() => {
    getPolicies(selectedCat);
  }, [selectedCat]);

  const getPolicies = async (category: string) => {
    const resp = await get_policy({ category });
    console.log('resp?.data?.data -----> ', resp?.data?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { policies } = resp?.data?.data;
      if (resp?.data?.status) {
        setPoliciesData(resp?.data?.data);
      } else {
        setPoliciesData(null);
      }
    }
  };

  return (
    <AppLayout title="My Policy">
      <View
        style={[
          globalStyle(theme).container,
          { padding: metrics.doubleMargin },
        ]}
      >
        <ScreenLoader visible={isLoading} />
        <View style={{ flexDirection: 'row' }}>
          {categories?.map((cat, index) => {
            const isSelected = selectedCat == cat?.value;
            return (
              <TouchableOpacity onPress={() => cat?.onSelect()}>
                <View
                  style={{
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : '#ECECED',
                    margin: metrics.baseMargin,
                    marginLeft: 0,
                    paddingHorizontal: metrics.baseMargin * 1.5,
                    borderRadius: metrics.baseRadius * 2,
                  }}
                >
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontWeight: isSelected ? '700' : '400',
                        color: isSelected ? '#fff' : theme.colors.backdrop,
                      },
                    ]}
                  >
                    {`${cat?.title} (${
                      cat?.value == 'all'
                        ? policiesData && policiesData?.totalPolicies
                        : cat?.value == 'active'
                        ? policiesData && policiesData?.activePolicies
                        : cat?.value == 'expired'
                        ? policiesData && policiesData?.expiredPolicies
                        : 0
                    })`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ marginTop: metrics.baseMargin }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {policiesData &&
            policiesData?.policies &&
            policiesData?.policies?.length > 0 ? (
              policiesData?.policies?.map((item: any, index: number) => {
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedPolicy(item)}
                    key={index}
                  >
                    <View key={'cl' + index} style={styles(theme).list_parent}>
                      <View
                        style={{
                          marginHorizontal: metrics.baseMargin,
                          // marginEnd: metrics.baseMargin ,
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: metrics.screenWidth * 0.17,
                          width: metrics.screenWidth * 0.15,
                          backgroundColor: getRandomPastelColor(),
                          borderRadius: metrics.baseRadius,
                        }}
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
                            {
                              fontSize: 15,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {item?.traveller?.name}
                        </Text>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              marginTop: metrics.smallMargin,
                            },
                          ]}
                        >
                          {item?.traveller?.policyType.charAt(0).toUpperCase() +
                            item?.traveller?.policyType.slice(1) +
                            '  -  ' +
                            item?.policyNumber}
                        </Text>
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              marginTop: metrics.smallMargin,
                            },
                          ]}
                        >
                          {'Claims : '}
                          <Text
                            style={[
                              fontStyle(theme).headingMedium,
                              {
                                fontSize: 14,
                                fontWeight: '700',
                                marginTop: metrics.smallMargin,
                              },
                            ]}
                          >
                            {item?.claimsCount}
                          </Text>
                        </Text>
                        {/* {item?.isExpired && ( */}
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            {
                              fontSize: 14,
                              fontWeight: '400',
                              color: '#FF3B30',
                              marginTop: metrics.smallMargin,
                            },
                          ]}
                        >
                          {'Expire On : ' +
                            moment(item?.endDate, 'YYYY-MM-DD').format(
                              'DD-MM-YYYY',
                            )}
                        </Text>
                        {/* )} */}
                      </View>
                      {item.status && !item.isExpired && (
                        <View
                          style={{
                            backgroundColor: '#CEF6BB',
                            paddingVertical: 0,
                            paddingHorizontal: metrics.baseMargin,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: '#B4E1A2',
                            alignSelf: 'flex-start',
                            marginTop: metrics.smallMargin,
                          }}
                        >
                          <Text
                            style={[
                              fontStyle(theme).headingSmall,
                              { color: '#05690D', fontSize: 11 },
                            ]}
                          >
                            {item?.status?.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: metrics.screenHeight * 0.7,
                }}
              >
                <NoDataFound
                  title={'No Policies Found'}
                  description={
                    'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
                  }
                />
              </View>
            )}
          </ScrollView>
        </View>

        {isDetailsVisible && (
          <PolicyDetails
            isVisible={isDetailsVisible}
            onDismiss={() => {
              setSelectedPolicy(null);
              setIsDetailsVisible(false);
            }}
            policyData={selectedPolicy}
          />
        )}
      </View>
    </AppLayout>
  );
};

export default Policies;

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
  });
