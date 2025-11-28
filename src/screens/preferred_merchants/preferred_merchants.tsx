import {
  FlatList,
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
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

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

  const renderCityDropdown = () => (
    <Dropdown
      style={styles(theme).dropdownContainer}
      containerStyle={styles(theme).dropdownMenu}
      value={selectedCity || 'All'}
      data={cityOptions.map(city => ({ label: city, value: city }))}
      labelField="label"
      valueField="value"
      placeholder="All"
      renderLeftIcon={() => (
        <Image
          source={require('../../../assets/images/pin.png')}
          style={styles(theme).citySelectorIcon}
          resizeMode="contain"
        />
      )}
      renderItem={item => (
        <View style={styles(theme).dropdownItem}>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                color:
                  item.value === selectedCity
                    ? theme.colors.primary
                    : theme.colors.onBackground,
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      )}
      selectedTextStyle={[
        fontStyle(theme).headingSmall,
        styles(theme).citySelectorText,
      ]}
      itemTextStyle={fontStyle(theme).headingSmall}
      onChange={item => setSelectedCity(item.value)}
      renderRightIcon={() => (
        <Icon
          name="chevron-down"
          size={metrics.moderateScale(16)}
          color="#1D3557"
        />
      )}
    />
  );

  return (
    <AppLayout
      title="Merchants"
      onBackPress={() => navigation.pop()}
      right={renderCityDropdown()}
      titleExtraStyle={{ marginLeft: 50 }}
    >
      <View style={[globalStyle(theme).container]}>
        {/* Category Tabs */}
        {categoryOptions.length > 0 && (
          <View style={styles(theme).categoryTabsWrapper}>
            <FlatList
              horizontal
              data={categoryOptions}
              keyExtractor={item => `category-${item}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles(theme).categoryTabs}
              renderItem={({ item: category }) => {
                const isSelected = selectedCategory === category;
                return (
                  <TouchableOpacity
                    style={styles(theme).categoryTab}
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
              }}
            />
          </View>
        )}

        <ScreenLoader visible={isLoading} />

        <FlatList
          style={{ flex: 1 }}
          data={filteredMerchants}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : `merchant-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: metrics.doubleMargin,
            paddingBottom: metrics.doubleMargin * 4,
            flexGrow: 1,
          }}
          ListEmptyComponent={
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
          }
          renderItem={({ item: hotel }) => (
            <View style={styles(theme).list_parent}>
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
          )}
        />
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
    citySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: metrics.doubleMargin,
      paddingVertical: metrics.baseMargin * 0.6,
      borderRadius: metrics.screenWidth * 0.08,
      marginEnd: metrics.baseMargin,
      elevation: 2,
      shadowColor: '#00000020',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
    },
    citySelectorIcon: {
      height: metrics.moderateScale(14),
      width: metrics.moderateScale(14),
      tintColor: '#00A878',
      marginRight: metrics.smallMargin,
    },
    citySelectorText: {
      color: '#1D3557',
      fontWeight: '600',
      marginRight: metrics.smallMargin,
      maxWidth: metrics.screenWidth * 0.25,
    },
    menuContent: {
      borderRadius: metrics.baseRadius,
    },
    dropdownContainer: {
      minWidth: metrics.screenWidth * 0.3,
      backgroundColor: theme.colors.background,
      borderRadius: metrics.screenWidth * 0.08,
      paddingHorizontal: metrics.baseMargin,
      paddingVertical: metrics.baseMargin * 0,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    dropdownMenu: {
      borderRadius: metrics.baseRadius,
      paddingVertical: metrics.baseMargin,
    },
    dropdownItem: {
      paddingVertical: metrics.baseMargin,
      paddingHorizontal: metrics.doubleMargin,
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
