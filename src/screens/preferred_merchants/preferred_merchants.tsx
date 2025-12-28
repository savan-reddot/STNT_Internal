import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
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
      titleExtraStyle={{ marginLeft: 70 }}
    >
      <View style={{ flex: 1 }}>
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
                    style={[
                      styles(theme).pillTab,
                      isSelected && styles(theme).pillTabActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles(theme).pillText,
                        isSelected && styles(theme).pillTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {category}
                    </Text>
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
          renderItem={({ item: hotel }) => {
            return (
              <View style={styles(theme).card}>

                {/* IMAGE */}
                <ImageBackground
                  source={
                    hotel?.imageUrl
                      ? { uri: hotel.imageUrl }
                      : require('../../../assets/images/logo.png')
                  }
                  style={styles(theme).cardImage}
                  imageStyle={styles(theme).cardImageRadius}
                >
                  {/* Rating */}
                  {hotel?.rating && (
                    <View style={styles(theme).ratingBadge}>
                      <Icon name="star" size={12} color="#FFC107" />
                      <Text style={styles(theme).ratingText}>{hotel.rating}</Text>
                    </View>
                  )}
                </ImageBackground>

                {/* TAGS */}
                {hotel?.category && (
                  <View style={styles(theme).tag}>
                    <Text style={styles(theme).tagText}>{hotel.category}</Text>
                  </View>
                )}

                {/* CONTENT */}
                <View style={styles(theme).cardContent}>
                  <View style={styles(theme).titleRow}>
                    <Text style={styles(theme).cardTitle}>{hotel?.name}</Text>

                    <View style={styles(theme).partnerBadge}>
                      <Text style={styles(theme).partnerText}>PARTNER</Text>
                    </View>
                  </View>

                  {/* ADDRESS */}
                  {hotel?.address && (
                    <View style={styles(theme).metaRow}>
                      <Text style={styles(theme).metaText}>{hotel.address}</Text>
                    </View>
                  )}

                  {/* ACTIONS */}
                  <View style={styles(theme).actionRow}>
                    {hotel?.phoneNumber && (
                      <TouchableOpacity
                        style={styles(theme).callButton}
                        onPress={() => openDialer(hotel.phoneNumber)}
                      >
                        <Icon name="call-outline" size={18} color="#008069" />
                        <Text style={styles(theme).callText}>CALL NOW</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles(theme).directionButton}
                      onPress={() => openMap(hotel?.address)}
                    >
                      <Icon name="navigate-outline" size={18} color="#FFFFFF" />
                      <Text style={styles(theme).directionText}>
                        DIRECTIONS
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}

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
      minWidth: metrics.screenWidth * 0.30,
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
      marginVertical: metrics.baseMargin,
    },
    pillTab: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#EAECF0',
      marginRight: 12,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillTabActive: {
      backgroundColor: '#008069',
      borderColor: '#008069',
    },
    pillText: {
      fontSize: metrics.moderateScale(14),
      fontFamily: Font_Regular,
      color: '#98A2B3',
      textTransform: 'uppercase',
      fontWeight: "bold"
    },
    pillTextActive: {
      color: '#FFFFFF',
      fontFamily: Font_Bold,
      fontWeight: "bold"
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
    discountBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: metrics.baseMargin,
      paddingHorizontal: metrics.baseMargin,
      alignItems: 'center',
      justifyContent: 'center',
    },
    discountText: {
      ...fontStyle(theme).bodyLarge,
      color: '#FFFFFF',
      fontWeight: '400',
      fontSize: metrics.moderateScale(14),
      letterSpacing: 0.5,
    },
    gradient: {
      ...StyleSheet.absoluteFillObject,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      marginBottom: metrics.doubleMargin,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
    },
    cardImage: {
      height: metrics.screenHeight * 0.22,
    },
    cardImageRadius: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    ratingBadge: {
      position: 'absolute',
      right: metrics.baseMargin,
      top: metrics.baseMargin,
      backgroundColor: '#1F2937',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    ratingText: {
      color: '#FFFFFF',
      fontSize: 12,
      marginLeft: 4,
    },
    cardContent: {
      padding: metrics.doubleMargin,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontFamily: Font_Bold,
      fontSize: 18,
      color: '#101828',
      flex: 1,
      marginRight: 8,
      fontWeight: "bold",
      textTransform: "uppercase"
    },
    partnerBadge: {
      borderWidth: 1,
      borderColor: '#B7E4C7',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    partnerText: {
      color: '#008069',
      fontSize: 12,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    metaIcon: {
      width: 16,
      height: 16,
      marginRight: 6,
    },
    metaText: {
      color: '#667085',
      fontSize: 13,
      flex: 1,
    },
    tag: {
      backgroundColor: '#F2F4F7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 10,
      position: "absolute",
      left: 10,
      flex: 1
    },
    tagText: {
      fontSize: 12,
      color: '#475467',
      textTransform: "uppercase"
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: metrics.doubleMargin,
    },
    callButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#008069',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      flex: 1,
      marginRight: 10,
      justifyContent: 'center',
      height: 45
    },
    callText: {
      color: '#008069',
      fontWeight: '600',
      marginLeft: 6,
    },
    directionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0B132B',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      flex: 1,
      justifyContent: 'center',
      height: 45
    },
    directionText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 6,
    },
  });
