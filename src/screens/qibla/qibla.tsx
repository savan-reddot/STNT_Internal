import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import { useTheme, MD3Theme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Font_Bold } from '../../theme/fonts';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { requestAppPermission } from '../../utils/permissions';
import {
  calculateBearing,
  calculateDistance,
  formatDistance,
} from '../../utils/locationUtils';
import moment from 'moment';
import Svg, { Path, Circle } from 'react-native-svg';
import CompassHeading from 'react-native-compass-heading';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  Easing,
  withTiming,
} from 'react-native-reanimated';

const MECCA_COORDS = {
  lat: 21.4225,
  lon: 39.8262,
};

const PRAYERS = [
  { name: 'FAJR', key: 'Fajr', icon: 'weather-night' },
  { name: 'DHUHR', key: 'Dhuhr', icon: 'white-balance-sunny' },
  { name: 'ASR', key: 'Asr', icon: 'weather-sunset' },
  { name: 'MAGHRIB', key: 'Maghrib', icon: 'weather-sunset-down' },
  { name: 'ISHA', key: 'Isha', icon: 'moon-waning-crescent' },
];

const QiblaPrayers = ({ navigation }: any) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [distanceToMecca, setDistanceToMecca] = useState<number>(0);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('MECCA, SA');

  // High-precision heading for text update
  const [displayHeading, setDisplayHeading] = useState(0);

  // Reanimated shared values for smooth movement
  const headingRotation = useSharedValue(0);

  useEffect(() => {
    fetchData();

    // Start Compass Heading Listener
    const degree_update_rate = 1;
    CompassHeading.start(degree_update_rate, ({ heading }: any) => {
      setDisplayHeading(heading);

      let newRotation = -heading;
      const prevRotation = headingRotation.value;

      const diff = newRotation - prevRotation;
      if (diff > 180) newRotation -= 360;
      else if (diff < -180) newRotation += 360;

      headingRotation.value = withTiming(newRotation, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    });

    return () => {
      CompassHeading.stop();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestAppPermission('location');
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });

            const bearing = calculateBearing(
              latitude,
              longitude,
              MECCA_COORDS.lat,
              MECCA_COORDS.lon,
            );
            setQiblaBearing(bearing);

            const distance = calculateDistance(
              latitude,
              longitude,
              MECCA_COORDS.lat,
              MECCA_COORDS.lon,
            );
            setDistanceToMecca(distance);

            // Fetch address/city name
            fetchLocationName(latitude, longitude);

            // Fetch Local Prayer Times
            await fetchPrayerTimes(latitude, longitude);
          },
          error => {
            console.error(error);
            // Fallback to Mecca
            fetchPrayerTimes(MECCA_COORDS.lat, MECCA_COORDS.lon);
            setLocationName('MECCA, SA');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        // Fallback to Mecca
        await fetchPrayerTimes(MECCA_COORDS.lat, MECCA_COORDS.lon);
        setLocationName('MECCA, SA');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'UmrahTravellerApp' } },
      );
      const address = response.data.address;
      const city = address.state_district;
      const state = address.state;
      const countryCode = address.country_code?.toUpperCase() || '';
      setLocationName(
        `${city.toUpperCase()}, ${state.toUpperCase()}, ${countryCode.toUpperCase()}`,
      );
    } catch (error) {
      console.error('Error fetching location name:', error);
    }
  };

  const fetchPrayerTimes = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`,
      );
      setPrayerTimes(response?.data?.data?.timings);
      determineCurrentPrayer(response?.data?.data?.timings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setLoading(false);
    }
  };

  const determineCurrentPrayer = (timings: any) => {
    const now = moment();
    let current = '';

    const sortedPrayers = PRAYERS.map(p => ({
      name: p.name,
      time: moment(timings[p.key], 'HH:mm'),
    })).sort((a, b) => a.time.diff(b.time));

    for (let i = 0; i < sortedPrayers.length; i++) {
      const prayer = sortedPrayers[i];
      const nextPrayer = sortedPrayers[i + 1] || {
        name: 'FAJR',
        time: sortedPrayers[0].time.clone().add(1, 'day'),
      };

      if (
        now.isBetween(prayer.time, nextPrayer.time) ||
        now.isSame(prayer.time)
      ) {
        current = prayer.name;
        break;
      }
    }

    if (!current) {
      current = 'ISHA';
    }

    setCurrentPrayer(current);
  };

  const getBearingString = (bearing: number) => {
    const normalized = (bearing + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % 8;
    return `${Math.round(normalized)}° ${directions[index]}`;
  };

  const animatedDialStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${headingRotation.value}deg` }],
    };
  });

  const animatedNeedleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${qiblaBearing}deg` }],
    };
  });

  if (loading) {
    return (
      <AppLayout title="QIBLA & PRAYERS">
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="QIBLA & PRAYERS" onBackPress={() => navigation.pop()}>
      <ScrollView contentContainerStyle={styles(theme).container}>
        <View style={styles(theme).qiblaCard}>
          <Text style={styles(theme).qiblaTitle}>QIBLA DIRECTION</Text>

          {/* Compass Section */}
          <View style={styles(theme).compassSection}>
            <View style={styles(theme).compassContainer}>
              <Animated.View
                style={[styles(theme).compassDial, animatedDialStyle]}
              >
                <View
                  style={[styles(theme).directionMark, styles(theme).northText]}
                >
                  <Text
                    style={[styles(theme).directionText, { color: '#EF4444' }]}
                  >
                    N
                  </Text>
                </View>
                <View
                  style={[styles(theme).directionMark, styles(theme).eastText]}
                >
                  <Text style={styles(theme).directionText}>E</Text>
                </View>
                <View
                  style={[styles(theme).directionMark, styles(theme).southText]}
                >
                  <Text style={styles(theme).directionText}>S</Text>
                </View>
                <View
                  style={[styles(theme).directionMark, styles(theme).westText]}
                >
                  <Text style={styles(theme).directionText}>W</Text>
                </View>

                <Animated.View
                  style={[styles(theme).needleWrapper, animatedNeedleStyle]}
                >
                  <Svg height="140" width="140" viewBox="0 0 100 100">
                    <Path d="M50 10 L70 45 L50 38 L30 45 Z" fill="#10B981" />
                    <Circle cx="50" cy="50" r="5" fill="#FFFFFF" />
                  </Svg>
                </Animated.View>
              </Animated.View>
            </View>

            {/* Info Section below Compass but still inside Card */}
            <View style={styles(theme).infoSection}>
              <Text style={styles(theme).bearingText}>
                {getBearingString(displayHeading)}
              </Text>
              <Text style={styles(theme).distanceText}>
                MECCA • {formatDistance(distanceToMecca).toUpperCase()} AWAY
              </Text>
            </View>
          </View>
        </View>

        <View style={styles(theme).prayerTimesHeader}>
          <Text style={styles(theme).sectionTitle}>PRAYER TIMES</Text>
          <Text style={styles(theme).locationText}>{locationName}</Text>
        </View>

        <View style={styles(theme).prayerList}>
          {prayerTimes &&
            PRAYERS.map((prayer, index) => {
              const isCurrent = currentPrayer === prayer.name;
              const time = prayerTimes[prayer.key]
                ? moment(prayerTimes[prayer.key], 'HH:mm').format('hh:mm A')
                : '--:--';

              return (
                <View
                  key={index}
                  style={[
                    styles(theme).prayerItem,
                    isCurrent && styles(theme).currentPrayerItem,
                    index === PRAYERS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles(theme).prayerInfo}>
                    <Icon
                      name={prayer.icon}
                      size={20}
                      color={isCurrent ? '#10B981' : '#D1D5DB'}
                    />
                    <Text
                      style={[
                        styles(theme).prayerName,
                        isCurrent && styles(theme).currentPrayerText,
                      ]}
                    >
                      {prayer.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles(theme).prayerTime,
                      isCurrent && styles(theme).currentPrayerText,
                    ]}
                  >
                    {time}
                  </Text>
                </View>
              );
            })}
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default QiblaPrayers;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qiblaCard: {
      backgroundColor: '#111827',
      margin: 20,
      borderRadius: 40,
      paddingVertical: 30,
      paddingHorizontal: 20,
      alignItems: 'center',
      aspectRatio: 1,
      justifyContent: 'center', // Changed to center for overall alignment
      alignSelf: 'center',
    },
    qiblaTitle: {
      color: '#10B981',
      fontSize: 12,
      fontFamily: Font_Bold,
      letterSpacing: 2,
      marginBottom: 20,
    },
    compassSection: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    compassContainer: {
      width: 180,
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    compassDial: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    directionMark: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
    },
    northText: { top: 5 },
    eastText: { right: 5 },
    southText: { bottom: 5 },
    westText: { left: 5 },
    needleWrapper: {
      width: 140,
      height: 140,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    },
    directionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: Font_Bold,
    },
    infoSection: {
      alignItems: 'center',
    },
    bearingText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontFamily: Font_Bold,
      textAlign: 'center',
    },
    distanceText: {
      color: '#10B981',
      fontSize: 12,
      fontFamily: Font_Bold,
      letterSpacing: 1,
      textAlign: 'center',
      marginTop: 5,
    },
    prayerTimesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 25,
      marginTop: 10,
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      letterSpacing: 1.5,
    },
    locationText: {
      fontSize: 10,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      letterSpacing: 1,
    },
    prayerList: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 30,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    prayerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#374151' : '#F3F4F6',
    },
    currentPrayerItem: {
      backgroundColor: theme.dark ? '#064E3B' : '#ECFDF5',
      borderRadius: 15,
    },
    prayerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
    },
    prayerName: {
      fontSize: 14,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      letterSpacing: 1,
    },
    currentPrayerText: {
      color: '#10B981',
    },
    prayerTime: {
      fontSize: 14,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
    },
  });
