import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import { Font_Bold, Font_Regular } from '../../theme/fonts';
import { useLazyTrusted_hospitalsQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { showErrorToast } from '../../utils/toastUtils';

const data = [
  {
    id: 1,
    title: 'Albayt Medical Center',
    address: 'P11 Abraj Albyat Clock Tower (Next to Movenpick Hotel)',
    contact_number: '+ 966 12 571 840',
    is24_Operation: true,
    image: require('../../../assets/images/sample.png'),
  },
  {
    id: 2,
    title: 'Albayt Medical Center',
    address: 'P11 Abraj Albyat Clock Tower (Next to Movenpick Hotel)',
    contact_number: '+ 966 12 571 840',
    is24_Operation: false,
    image: require('../../../assets/images/sample.png'),
  },
  {
    id: 3,
    title: 'Albayt Medical Center',
    address: 'P11 Abraj Albyat Clock Tower (Next to Movenpick Hotel)',
    contact_number: '+ 966 12 571 840',
    is24_Operation: false,
    image: require('../../../assets/images/sample.png'),
  },
];

const TrustedHospitals = ({ navigation }: any) => {
  const theme = useTheme();
  const [trusted_hospitals, { isLoading }] = useLazyTrusted_hospitalsQuery();
  const [hospitals, setHospitals] = useState<any[]>();
  const [selectedCat, setSelectedCat] = useState('Makkah');

  const categories = [
    {
      title: 'Makkah',
      value: 'Makkah',
      onSelect: () => setSelectedCat('Makkah'),
    },
    {
      title: 'Madinah',
      value: 'Madinah',
      onSelect: () => setSelectedCat('Madinah'),
    },
    {
      title: 'Jeddah',
      value: 'Jeddah',
      onSelect: () => setSelectedCat('Jeddah'),
    },
  ];

  useEffect(() => {
    selectedCat && getHospitals(selectedCat);
  }, [selectedCat]);

  const getHospitals = async (category: string) => {
    const resp = await trusted_hospitals({ category });
    console.log('resp?.data?.trusted_hospitals -----> ', resp?.data?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { hospitals, totalHospitals } = resp?.data?.data;
      if (hospitals?.length > 0) {
        setHospitals(hospitals);
      } else {
        setHospitals([]);
      }
    } else {
      setHospitals([]);
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
    <AppLayout title="Trusted Hospitals" onBackPress={() => navigation.pop()}>
      <View style={[globalStyle(theme).container]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: metrics.screenHeight * 0.06,
            width: metrics.screenWidth,
          }}
        >
          {categories?.map((cat, index) => {
            const isSelected = selectedCat === cat.value;
            return (
              <TouchableOpacity
                style={{ flex: 1 }}
                key={index + 'cat'}
                onPress={cat.onSelect}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomWidth: isSelected ? 3 : 0.7,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.backdrop,
                  }}
                >
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontWeight: isSelected ? '700' : 'regular',
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.onBackground,
                      },
                    ]}
                  >
                    {cat.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
            {hospitals && hospitals?.length > 0 ? (
              hospitals?.map((hotel, index) => {
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
                            {hotel?.address}
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
                          {hotel?.workingHours}
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

export default TrustedHospitals;

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
  });
