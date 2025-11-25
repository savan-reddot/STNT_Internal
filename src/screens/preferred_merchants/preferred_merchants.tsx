import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import { Font_Bold, Font_Regular } from '../../theme/fonts';
import { useLazyPreferred_merchantsQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { showErrorToast } from '../../utils/toastUtils';

const merchantsData: any[] = [
  {
    id: 5,
    name: 'City Shop 1',
    address: 'zdghjgbfvdsa',
    phoneNumber: '+65 123456778',
    workingHours: 'rdgdf',
    imageUrl:
      'https://stnt-stag.s3.ap-southeast-1.amazonaws.com/static/uploads/profile-pictures/4d1622bb-1bf3-4090-a723-66ce9699ec54_galgotais-logo-official.png',
    city: 'Mecca',
    category: 'pharmacy',
    status: 'active',
    dashboardType: 'stnt',
    userId: 7,
    createdAt: '2025-11-19T09:44:09.000Z',
    updatedAt: '2025-11-19T09:45:38.000Z',
  },
  {
    id: 1,
    name: 'Shop',
    address: 'hjgjjh jhhjh',
    phoneNumber: '+966 123456789',
    workingHours: '10',
    imageUrl:
      'https://stnt-stag.s3.ap-southeast-1.amazonaws.com/static/uploads/profile-pictures/d3b36123-0616-4e54-babf-e5785dcdcd0egalgotias-university-vector-logo.png',
    city: 'Mecca',
    category: 'shopping',
    status: 'active',
    dashboardType: 'stnt',
    userId: 7,
    createdAt: '2025-11-17T06:59:58.000Z',
    updatedAt: '2025-11-19T09:46:05.000Z',
  },
  {
    id: 3,
    name: 'TEST SHOP',
    address: 'SAUDI ARABIA',
    phoneNumber: '+966 123456789',
    workingHours: '10',
    imageUrl: null,
    city: null,
    category: null,
    status: 'active',
    dashboardType: 'stnt',
    userId: 7,
    createdAt: '2025-11-17T07:48:07.000Z',
    updatedAt: '2025-11-17T07:48:07.000Z',
  },
  {
    id: 4,
    name: 'testing',
    address: 'jhbhbbjhb',
    phoneNumber: '+65 12345678',
    workingHours: 'bbjhbjbjhb',
    imageUrl: null,
    city: 'Mecca',
    category: 'food',
    status: 'active',
    dashboardType: 'stnt',
    userId: 7,
    createdAt: '2025-11-19T09:09:56.000Z',
    updatedAt: '2025-11-19T09:09:56.000Z',
  },
];

const PreferredMerchants = ({ navigation }: any) => {
  const theme = useTheme();
  const [preferred_merchants, { isLoading }] = useLazyPreferred_merchantsQuery();
  const [outlets, setMerchantsData] = useState<any[]>();
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cityOptions = useMemo(() => {
    const uniqueCities = new Set(
      merchantsData.map(item => item?.city?.trim() || 'Others'),
    );
    return ['All', ...Array.from(uniqueCities)];
  }, [merchantsData]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = new Set(
      merchantsData.map(item => item?.category ? item.category.trim() : 'Others'),
    );
    return ['All', ...Array.from(uniqueCategories)];
  }, [merchantsData]);

  const filteredMerchants = useMemo(() => {
    return merchantsData.filter(item => {
      const cityLabel = item?.city?.trim() || 'Others';
      const categoryLabel = item?.category ? item.category.trim() : 'Others';

      const cityMatch = selectedCity === 'All' || cityLabel === selectedCity;
      const categoryMatch =
        selectedCategory === 'All' || categoryLabel === selectedCategory;

      return cityMatch && categoryMatch;
    });
  }, [merchantsData, selectedCategory, selectedCity]);

  useEffect(() => {
    // getPreferredMerchants();
  }, []);

  const getPreferredMerchants = async () => {
    const resp = await preferred_merchants(0);
    console.log('preferred_merchants==>>', resp?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { hospitals, totalHospitals } = resp?.data?.data;
      if (hospitals?.length > 0) {
        setMerchantsData(hospitals);
      } else {
        setMerchantsData([]);
      }
    } else {
      setMerchantsData([]);
    }
  };

  const openDialer = (phoneNumber: any) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (!supported) {
          showErrorToast('Dialer not supported on this device', 'Error');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('Error opening dialer', err));
  };

  const openMap = (address: string) => {
    let url = '';

    if (Platform.OS === 'ios') {
      // Apple Maps
      url = `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
    } else {
      // Google Maps (default on most Android devices)
      url = `geo:0,0?q=${encodeURIComponent(address)}`;
    }

    Linking.openURL(url)
  };

  return (
    <AppLayout title="Preferred Merchants" onBackPress={() => navigation.pop()}>
      <View style={[globalStyle(theme).container]}>
        <View style={styles(theme).chipWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles(theme).chipRow}
          >
            {cityOptions.map(city => {
              const isSelected = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles(theme).chip,
                    isSelected && styles(theme).chipSelected,
                  ]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      styles(theme).chipText,
                      isSelected && styles(theme).chipTextSelected,
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles(theme).categoryTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles(theme).categoryTabs}
          >
            {categoryOptions.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  style={styles(theme).categoryTab}
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      styles(theme).categoryText,
                      isSelected && styles(theme).categoryTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {category}
                  </Text>
                  <View
                    style={[
                      styles(theme).tabIndicator,
                      isSelected && styles(theme).tabIndicatorActive,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          showsVerticalScrollIndicator={false}
        >
          <ScreenLoader visible={isLoading} />
          <View
            style={[
              globalStyle(theme).container,
              { padding: metrics.doubleMargin },
            ]}
          >
            {filteredMerchants && filteredMerchants?.length > 0 ? (
              filteredMerchants?.map((hotel, index) => {
                return (
                  <View style={styles(theme).list_parent} key={index}>
                    <Image
                      source={
                        hotel?.imageUrl
                          ? { uri: hotel?.imageUrl }
                          : require('../../../assets/images/logo.png')
                      }
                      style={styles(theme).parent_img}
                    />
                    <View style={styles(theme).child_view}>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          styles(theme).title,
                        ]}
                      >
                        {hotel?.name}
                      </Text>
                      <View style={styles(theme).item_view}>
                        <Image
                          source={require('../../../assets/images/pin.png')}
                          style={styles(theme).list_item_img}
                          resizeMode="contain"
                        />
                        <TouchableOpacity
                          onPress={() => openMap(hotel?.address)}
                        >
                          <Text
                            style={[
                              fontStyle(theme).headingMedium,
                              styles(theme).list_subtitle,
                              { textDecorationLine: 'underline' },
                            ]}
                          >
                            {hotel?.address || 'N/A'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles(theme).item_view}>
                        <Image
                          source={require('../../../assets/images/call.png')}
                          style={styles(theme).call_img}
                          resizeMode="contain"
                        />
                        <TouchableOpacity
                          onPress={() =>
                            hotel?.phoneNumber && openDialer(hotel?.phoneNumber)
                          }
                        >
                          <Text
                            style={[
                              fontStyle(theme).headingMedium,
                              styles(theme).list_subtitle,
                              {
                                textDecorationLine: hotel?.phoneNumber
                                  ? 'underline'
                                  : 'none',
                              },
                            ]}
                          >
                            {hotel?.phoneNumber || 'N/A'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles(theme).item_view}>
                        <Image
                          source={require('../../../assets/images/24.png')}
                          style={[
                            styles(theme).call_img,
                            {
                              tintColor: hotel?.is24_Operation
                                ? undefined
                                : 'red',
                            },
                          ]}
                          resizeMode="contain"
                        />
                        <Text
                          style={[
                            fontStyle(theme).headingMedium,
                            styles(theme).list_subtitle,
                          ]}
                        >
                          {hotel?.workingHours || '-'}
                        </Text>
                      </View>
                    </View>
                  </View>
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
                  title={'No Data Found'}
                  description={'Looks like there’s nothing here yet.'}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};

export default PreferredMerchants;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    list_parent: {
      margin: metrics.baseMargin,
      backgroundColor: theme.colors.background,
      borderRadius: metrics.baseRadius,
      elevation: 1,
      shadowOpacity: 0.4,
      shadowColor: theme.colors.backdrop,
      shadowOffset: { width: 1, height: 1 },
    },
    parent_img: {
      width: '100%',
      height: metrics.screenHeight * 0.2,
      borderRadius: metrics.baseRadius,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      resizeMode: 'contain',
    },
    child_view: {
      // padding: metrics.baseMargin,
      paddingTop: 0,
      paddingHorizontal: metrics.baseMargin * 1.5,
      paddingBottom: metrics.baseMargin * 1.5,
    },
    title: {
      // marginHorizontal: metrics.baseMargin,
      fontFamily: Font_Bold,
      fontWeight: '700',
      fontSize: metrics.moderateScale(16),
      color: theme.colors.onBackground,
      margin: metrics.baseMargin,
      marginLeft: 0,
      marginTop: metrics.baseMargin * 2,
    },
    item_view: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: metrics.baseMargin,
    },
    list_subtitle: {
      marginHorizontal: metrics.baseMargin,
      fontFamily: Font_Regular,
      fontWeight: '400',
      fontSize: metrics.moderateScale(14),
      color: '#72849A',
    },
    list_item_img: {
      height: metrics.moderateScale(24),
      width: metrics.moderateScale(24),
    },
    call_img: {
      height: metrics.moderateScale(22),
      width: metrics.moderateScale(22),
    },
    chipWrapper: {
      paddingTop: metrics.baseMargin,
      paddingBottom: metrics.baseMargin * 0.5,
      paddingHorizontal: metrics.doubleMargin,
    },
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chip: {
      paddingVertical: metrics.baseMargin * 0.6,
      paddingHorizontal: metrics.doubleMargin,
      borderRadius: metrics.doubleMargin,
      borderWidth: 1,
      borderColor: '#D0D5DD',
      marginRight: metrics.baseMargin,
      backgroundColor: '#FFFFFF',
    },
    chipSelected: {
      backgroundColor: '#008069',
      borderColor: '#008069',
    },
    chipText: {
      color: '#1D2939',
    },
    chipTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    categoryTabsWrapper: {
      paddingHorizontal: metrics.doubleMargin,
      marginTop: metrics.baseMargin,
      borderBottomWidth: 1,
      borderBottomColor: '#E4E7EC',
    },
    categoryTabs: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryTab: {
      width: 100,
      alignItems: 'center',
    },
    categoryText: {
      color: '#475467',
      fontWeight: '500',
      textTransform: 'capitalize',
      width: "100%",
      textAlign: 'center',
    },
    categoryTextSelected: {
      color: '#008069',
      fontWeight: '700',
      width: "100%",
    },
    tabIndicator: {
      height: 3,
      width: '60%',
      borderRadius: 8,
      backgroundColor: 'transparent',
      marginTop: metrics.smallMargin,
    },
    tabIndicatorActive: {
      backgroundColor: '#008069',
      width: "80%",
    },
  });
