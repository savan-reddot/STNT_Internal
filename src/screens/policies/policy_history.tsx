import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import { getRandomPastelColor } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLazyGet_policyQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import PolicyDetails from '../../components/policy_details';
import moment from 'moment';

const PolicyHistory = ({ navigation, route }: any) => {
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
      setIsDetailsVisible(true);
    }
  }, [selectedPolicy]);

  useEffect(() => {
    getPolicies(selectedCat);
  }, [selectedCat]);

  const getPolicies = async (category: string) => {
    const resp = await get_policy({ category });
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
    <AppLayout title="My Policy" onBackPress={() => navigation.goBack()}>
      <View style={styles(theme).container}>
        <ScreenLoader visible={isLoading} />
        <View style={{ flexDirection: 'row' }}>
          {categories?.map((cat, index) => {
            const isSelected = selectedCat == cat?.value;
            return (
              <TouchableOpacity
                onPress={() => cat?.onSelect()}
                key={index}
                style={[
                  styles(theme).categoryButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.dark
                      ? '#374151'
                      : '#fff',
                  },
                ]}
              >
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    styles(theme).categoryText,
                    {
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected
                        ? '#fff'
                        : theme.dark
                        ? '#E5E7EB'
                        : '#000',
                    },
                  ]}
                >
                  {`${cat?.title} (${
                    cat?.value == 'all'
                      ? (policiesData && policiesData?.totalPolicies) || 0
                      : cat?.value == 'active'
                      ? (policiesData && policiesData?.activePolicies) || 0
                      : cat?.value == 'expired'
                      ? (policiesData && policiesData?.expiredPolicies) || 0
                      : 0
                  })`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
                      style={[
                        styles(theme).iconContainer,
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
                          styles(theme).travellerName,
                        ]}
                      >
                        {item?.traveller?.name}
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          styles(theme).policyType,
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
                          styles(theme).policyType,
                        ]}
                      >
                        {'Claims : '}
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            styles(theme).claimsCount,
                          ]}
                        >
                          {item?.claimsCount}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          styles(theme).expiryText,
                        ]}
                      >
                        {`${item.isExpired ? 'Expired' : 'Expire'} On : ` +
                          moment(item?.endDate, 'YYYY-MM-DD').format(
                            'DD-MM-YYYY',
                          )}
                      </Text>
                    </View>
                    {item.status && (
                      <View
                        style={[
                          styles(theme).statusBadge,
                          {
                            backgroundColor: item.isExpired
                              ? '#F9E4F1'
                              : '#CEF6BB',
                            borderColor: item.isExpired ? '#F2C9E3' : '#B4E1A2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            fontStyle(theme).headingSmall,
                            styles(theme).statusText,
                            { color: item.isExpired ? '#B3063D' : '#05690D' },
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
            <View style={styles(theme).noDataContainer}>
              <NoDataFound
                title={'No Policies Found'}
                description={
                  'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
                }
              />
            </View>
          )}
        </ScrollView>

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

export default PolicyHistory;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    list_parent: {
      padding: metrics.baseMargin,
      paddingVertical: metrics.baseMargin * 2,
      borderRadius: 16,
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: theme.dark ? '#374151' : '#F6F6F6',
      backgroundColor: theme.dark ? '#1F2937' : '#fff',
      margin: metrics.baseMargin,
      marginHorizontal: 0,
    },
    container: {
      flex: 1,
      padding: metrics.doubleMargin,
      backgroundColor: theme.colors.background,
    },
    categoryButton: {
      margin: metrics.baseMargin,
      marginLeft: 0,
      paddingHorizontal: metrics.baseMargin * 1.5,
      paddingVertical: 3,
      borderRadius: metrics.baseRadius * 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    categoryText: {
      // styles from headingSmall are applied separately
    },
    iconContainer: {
      marginHorizontal: metrics.baseMargin,
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenWidth * 0.17,
      width: metrics.screenWidth * 0.15,
      borderRadius: metrics.baseRadius,
    },
    travellerName: {
      fontSize: 15,
      fontWeight: '600',
      textTransform: 'capitalize',
      color: theme.colors.onSurface,
    },
    policyType: {
      fontSize: 14,
      fontWeight: '400',
      marginTop: metrics.smallMargin,
      color: theme.colors.onSurfaceVariant,
    },
    claimsCount: {
      fontSize: 14,
      fontWeight: '700',
      marginTop: metrics.smallMargin,
      color: theme.colors.onSurface,
    },
    expiryText: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.dark ? '#EF4444' : '#FF3B30',
      marginTop: metrics.smallMargin,
    },
    statusBadge: {
      paddingVertical: 0,
      paddingHorizontal: metrics.baseMargin,
      borderRadius: 4,
      borderWidth: 1,
      alignSelf: 'flex-start',
      marginTop: metrics.smallMargin,
    },
    statusText: {
      fontSize: 11,
    },
    noDataContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenHeight * 0.7,
    },
  });
