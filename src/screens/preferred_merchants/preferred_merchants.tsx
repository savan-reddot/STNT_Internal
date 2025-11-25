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

const PreferredMerchants = ({ navigation }: any) => {
  const theme = useTheme();
  const [preferred_merchants, { isLoading }] = useLazyPreferred_merchantsQuery();

  // FIX: Always keep merchantsData as an array
  const [merchantsData, setMerchantsData] = useState<any[]>([]);

  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // FIX: Generate city options only after data loads
  const cityOptions = useMemo(() => {
    if (!merchantsData || merchantsData.length === 0) return ['All'];

    const uniqueCities = new Set(
      merchantsData.map(item => item?.city?.trim() || 'Others'),
    );

    return ['All', ...Array.from(uniqueCities)];
  }, [merchantsData]);

  // FIX: Generate category options only after data loads
  const categoryOptions = useMemo(() => {
    if (!merchantsData || merchantsData.length === 0) return ['All'];

    const uniqueCategories = new Set(
      merchantsData.map(item => item?.category?.trim() || 'Others'),
    );

    return ['All', ...Array.from(uniqueCategories)];
  }, [merchantsData]);

  // FIX: Filter merchants AFTER merchantsData loads
  const filteredMerchants = useMemo(() => {
    if (!merchantsData || merchantsData.length === 0) return [];

    return merchantsData.filter(item => {
      const cityLabel = item?.city?.trim() || 'Others';
      const categoryLabel = item?.category?.trim() || 'Others';

      const cityMatch = selectedCity === 'All' || selectedCity === cityLabel;
      const categoryMatch =
        selectedCategory === 'All' || selectedCategory === categoryLabel;

      return cityMatch && categoryMatch;
    });
  }, [merchantsData, selectedCity, selectedCategory]);

  useEffect(() => {
    getPreferredMerchants();
  }, []);

  const getPreferredMerchants = async () => {
    try {
      const resp = await preferred_merchants(0);
      const list = resp?.data?.data ?? [];

      setMerchantsData(Array.isArray(list) ? list : []);
    } catch (e) {
      setMerchantsData([]);
    }
  };

  const openDialer = (phoneNumber: any) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          showErrorToast('Dialer not supported on this device', 'Error');
        } else {
          Linking.openURL(url);
        }
      })
      .catch(err => console.error('Error opening dialer', err));
  };

  const openMap = (address: string) => {
    let url = '';

    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
    } else {
      url = `geo:0,0?q=${encodeURIComponent(address)}`;
    }

    Linking.openURL(url);
  };

  return (
    <AppLayout title="Preferred Merchants" onBackPress={() => navigation.pop()}>
      <View style={[globalStyle(theme).container]}>
        {/* City Filter Chips */}
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

        {/* Category Tabs */}
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

        {/* Merchants List */}
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
            {filteredMerchants.length > 0 ? (
              filteredMerchants.map((hotel, index) => (
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
                      <TouchableOpacity onPress={() => openMap(hotel?.address)}>
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
                          { tintColor: hotel?.is24_Operation ? undefined : 'red' },
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
              ))
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
      paddingTop: 0,
      paddingHorizontal: metrics.baseMargin * 1.5,
      paddingBottom: metrics.baseMargin * 1.5,
    },
    title: {
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
      width: '100%',
      textAlign: 'center',
    },
    categoryTextSelected: {
      color: '#008069',
      fontWeight: '700',
      width: '100%',
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
      width: '80%',
    },
  });
