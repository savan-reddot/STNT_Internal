import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import { Font_Bold, Font_Regular } from '../../theme/fonts';
import { useLazyTrusted_hospitalsQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { showErrorToast } from '../../utils/toastUtils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TrustedHospitals = ({ navigation }: any) => {
  const theme = useTheme();
  const [trusted_hospitals, { isLoading }] = useLazyTrusted_hospitalsQuery();

  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('Makkah');

  const categories = ['Makkah', 'Madinah', 'Jeddah'];

  useEffect(() => {
    selectedCat && getHospitals(selectedCat);
  }, [selectedCat]);

  const getHospitals = async (category: string) => {
    const resp = await trusted_hospitals({ category });
    if (resp?.data?.status && resp?.data?.data?.hospitals) {
      setHospitals(resp.data.data.hospitals);
    } else {
      setHospitals([]);
    }
  };

  const openDialer = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      showErrorToast('Dialer not supported', 'Error'),
    );
  };

  const openMap = (address: string) => {
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${encodeURIComponent(address)}`
        : `geo:0,0?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <AppLayout title="Hospitals" onBackPress={() => navigation.pop()}>
      <View style={{ flex: 1 }}>
        {/* Tabs */}
        <View style={styles(theme).tabs}>
          {categories.map(cat => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles(theme).tab, active && styles(theme).activeTab]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text
                  style={[
                    styles(theme).tabText,
                    active && styles(theme).tabActiveText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: metrics.doubleMargin }}
        >
          <ScreenLoader visible={isLoading} />

          {hospitals.length > 0 ? (
            hospitals.map((item, index) => (
              <View key={index} style={styles(theme).card}>
                {/* Hospital Image */}
                <Image
                  source={
                    item?.imageUrl
                      ? { uri: item.imageUrl }
                      : require('../../../assets/images/logo.png')
                  }
                  style={styles(theme).hospitalImage}
                  resizeMode="cover"
                />

                {/* Header */}
                <View style={styles(theme).row}>
                  <View style={styles(theme).iconWrap}>
                    <Icon name="hospital-building" size={26} color="#D14343" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles(theme).title}>{item?.name}</Text>

                    <View style={styles(theme).addressRow}>
                      <Icon name="map-marker" size={16} color="#9CA3AF" />
                      <Text style={styles(theme).address}>{item?.address}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles(theme).actions}>
                  <TouchableOpacity
                    disabled={!item?.phoneNumber}
                    style={[
                      styles(theme).callBtn,
                      !item?.phoneNumber && { opacity: 0.5 },
                    ]}
                    onPress={() => openDialer(item.phoneNumber)}
                  >
                    <Icon name="phone" size={20} color="#4B5563" />
                    <Text style={styles(theme).callText}>CALL NOW</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles(theme).routeBtn}
                    onPress={() => openMap(item?.address)}
                  >
                    <Icon name="navigation" size={20} color="#fff" />
                    <Text style={styles(theme).routeText}>ROUTE</Text>
                  </TouchableOpacity>
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
                title="No Data Found"
                description="Looks like there’s nothing here yet."
              />
            </View>
          )}
        </ScrollView>
      </View>
    </AppLayout>
  );
};

export default TrustedHospitals;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    tabs: {
      flexDirection: 'row',
      backgroundColor: theme.dark ? '#1F2937' : '#fff',
      padding: 6,
      borderRadius: 40,
      marginHorizontal: metrics.doubleMargin,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 30,
    },
    activeTab: {
      backgroundColor: '#0F8A65',
    },
    tabText: {
      fontSize: 14,
      color: (theme.colors as any).onSurfaceVariant || '#9CA3AF',
      fontFamily: Font_Bold,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    tabActiveText: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    hospitalImage: {
      width: '100%',
      height: 160,
    },
    row: {
      flexDirection: 'row',
      gap: 14,
      padding: 20,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.dark ? '#3B1E1E' : '#FDECEC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      marginBottom: 4,
      fontWeight: 'bold',
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    address: {
      fontSize: 14,
      color: '#9CA3AF',
      fontFamily: Font_Regular,
    },
    actions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 20,
      gap: 12,
    },
    callBtn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.dark ? '#374151' : '#E5E7EB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    callText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    routeBtn: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      backgroundColor: '#2E8B57',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    routeText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },
  });
