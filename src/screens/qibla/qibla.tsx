import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, KaabaIcon } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import { useTheme, MD3Theme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Checkbox } from 'react-native-paper';
import PrePrayerReminderModal from '../../components/pre_prayer_reminder_modal';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  getPrayerNotifications,
  getPrePrayerNotifications,
  getPrePrayerMinutes,
  setPrayerNotifications,
  setPrePrayerNotifications,
  setPrePrayerMinutes,
  getPrayerMethod,
  setPrayerMethod,
} from '../../redux/reducer';
import { Font_Bold } from '../../theme/fonts';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { requestAppPermission } from '../../utils/permissions';
import { schedulePrayerNotifications } from '../../utils/notificationUtils';
import {
  calculateBearing,
  calculateDistance,
  formatDistance,
} from '../../utils/locationUtils';
import moment from 'moment-timezone';
import Svg, { Path, Circle } from 'react-native-svg';
import CompassHeading from 'react-native-compass-heading';
import { Dropdown } from 'react-native-element-dropdown';
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

const CALC_METHODS = [
  { label: '0 - Jafari / Shia Ithna-Ashari', value: 0 },
  { label: '1 - University of Islamic Sciences, Karachi', value: 1 },
  { label: '2 - Islamic Society of North America', value: 2 },
  { label: '3 - Muslim World League', value: 3 },
  { label: '4 - Umm Al-Qura University, Makkah', value: 4 },
  { label: '5 - Egyptian General Authority of Survey', value: 5 },
  { label: '7 - Institute of Geophysics, University of Tehran', value: 7 },
  { label: '8 - Gulf Region', value: 8 },
  { label: '9 - Kuwait', value: 9 },
  { label: '10 - Qatar', value: 10 },
  { label: '11 - Majlis Ugama Islam Singapura, Singapore', value: 11 },
  { label: '12 - Union Organization islamic de France', value: 12 },
  { label: '13 - Diyanet İşleri Başkanlığı, Turkey', value: 13 },
  { label: '14 - Spiritual Administration of Muslims of Russia', value: 14 },
  { label: '15 - Moonsighting Committee Worldwide', value: 15 },
  { label: '16 - Dubai (experimental)', value: 16 },
  { label: '17 - Jabatan Kemajuan Islam Malaysia (JAKIM)', value: 17 },
  { label: '18 - Tunisia', value: 18 },
  { label: '19 - Algeria', value: 19 },
  { label: '20 - KEMENAG - Kementerian Agama RI', value: 20 },
  { label: '21 - Morocco', value: 21 },
  { label: '22 - Comunidade Islamica de Lisboa', value: 22 },
  { label: '23 - Ministry of Awqaf, Jordan', value: 23 },
];

const QiblaPrayers = ({ navigation }: any) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [distanceToMecca, setDistanceToMecca] = useState<number>(0);
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('MECCA, SA');
  const [locationTz, setLocationTz] = useState<string>('Asia/Riyadh');
  const [displayHeading, setDisplayHeading] = useState(0);
  const headingRotation = useSharedValue(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedMethod = useAppSelector(getPrayerMethod);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const prayerNotifications = useAppSelector(getPrayerNotifications);
  const prePrayerNotifications = useAppSelector(getPrePrayerNotifications);
  const prePrayerMinutes = useAppSelector(getPrePrayerMinutes);
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    if (prayerTimes && locationTz) {
      schedulePrayerNotifications(
        prayerTimes,
        locationTz,
        prayerNotifications,
        prePrayerNotifications,
        prePrayerMinutes,
      );
    }
  }, [
    prayerTimes,
    locationTz,
    prayerNotifications,
    prePrayerNotifications,
    prePrayerMinutes,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestAppPermission('location');
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          async position => {
            const { latitude, longitude } = position.coords;
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

            setCoords({ lat: latitude, lon: longitude });

            // Fetch Local Prayer Times
            await fetchPrayerTimes(latitude, longitude, selectedMethod);
          },
          error => {
            console.error(error);
            // Fallback to Mecca
            setCoords({ lat: MECCA_COORDS.lat, lon: MECCA_COORDS.lon });
            fetchPrayerTimes(
              MECCA_COORDS.lat,
              MECCA_COORDS.lon,
              selectedMethod,
            );
            setLocationName('MECCA, SA');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      } else {
        // Fallback to Mecca
        setCoords({ lat: MECCA_COORDS.lat, lon: MECCA_COORDS.lon });
        await fetchPrayerTimes(
          MECCA_COORDS.lat,
          MECCA_COORDS.lon,
          selectedMethod,
        );
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

  const fetchPrayerTimes = async (lat: number, lon: number, method: number) => {
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}`,
      );
      setPrayerTimes(response?.data?.data?.timings);
      const tz = response?.data?.data?.meta?.timezone || 'UTC';
      setLocationTz(tz);
      determineCurrentPrayer(response?.data?.data?.timings, tz);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setLoading(false);
    }
  };

  const determineCurrentPrayer = (timings: any, tz: string) => {
    const now = moment();
    let current = '';

    const sortedPrayers = PRAYERS.map(p => ({
      name: p.name,
      time: moment.tz(timings[p.key], 'HH:mm', tz).local(),
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
    <AppLayout title="QIBLA & PRAYERS">
      <ScrollView contentContainerStyle={styles(theme).container}>
        <View style={styles(theme).qiblaCard}>
          <View style={styles(theme).iconView}>
            <Text style={styles(theme).qiblaTitle}>QIBLA DIRECTION</Text>
            <View style={styles(theme).qiblaIcon}>
              <KaabaIcon size={28} />
            </View>
          </View>

          {/* Compass Section */}
          <View style={styles(theme).compassSection}>
            <Text style={styles(theme).qiblaDegreeLabel}>
              Your Device's Angle To Qibla:{' '}
              <Text style={styles(theme).qiblaDegreeValue}>
                {Math.abs(
                  Math.round(
                    ((qiblaBearing - displayHeading + 180) % 360) - 180,
                  ),
                )}
                °
              </Text>
            </Text>
            <Text style={styles(theme).qiblaDegreeLabel}>
              Qibla Angle:{' '}
              <Text style={styles(theme).qiblaDegreeValue}>
                {Math.round(qiblaBearing)}°
              </Text>
            </Text>

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

            {/* Info Section below Compass but still inside Card */}
            <View style={styles(theme).infoSection}>
              <Text style={styles(theme).distanceText}>
                Distance from Qibla : {formatDistance(distanceToMecca)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles(theme).methodCard}>
          <Text style={styles(theme).methodLabel}>METHOD</Text>
          <Dropdown
            style={styles(theme).dropdown}
            placeholderStyle={styles(theme).placeholderStyle}
            selectedTextStyle={styles(theme).selectedTextStyle}
            inputSearchStyle={styles(theme).inputSearchStyle}
            iconStyle={styles(theme).iconStyle}
            data={CALC_METHODS}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Method"
            searchPlaceholder="Search method..."
            value={selectedMethod}
            onChange={item => {
              dispatch(setPrayerMethod(item.value));
              if (coords) {
                fetchPrayerTimes(coords.lat, coords.lon, item.value);
              }
            }}
            renderLeftIcon={() => (
              <Icon
                style={styles(theme).dropdownIcon}
                color="#10B981"
                name="calculator"
                size={20}
              />
            )}
            containerStyle={styles(theme).dropdownContainer}
            itemTextStyle={styles(theme).dropdownItemText}
          />
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
                ? moment
                    .tz(prayerTimes[prayer.key], 'HH:mm', locationTz)
                    .local()
                    .format('hh:mm A')
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

        {/* NOTIFICATION SETTINGS SECTION */}
        <View style={styles(theme).settingsCard}>
          <Text style={styles(theme).settingsTitle}>PRAYER NOTIFICATIONS</Text>

          <View style={styles(theme).settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles(theme).settingLabel}>
                Enable Prayer Alerts
              </Text>
              <Text style={styles(theme).settingDescription}>
                Receive a beautiful reminder when it's time to pray.
              </Text>
            </View>
            <Checkbox.Android
              status={prayerNotifications ? 'checked' : 'unchecked'}
              onPress={() =>
                dispatch(setPrayerNotifications(!prayerNotifications))
              }
              color="#10B981"
            />
          </View>

          <View
            style={[
              styles(theme).settingItem,
              {
                borderTopWidth: 1,
                borderTopColor: theme.dark ? '#374151' : '#F3F4F6',
                paddingTop: 15,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles(theme).settingLabel}>
                Pre-Prayer Reminder
              </Text>
              <Text style={styles(theme).settingDescription}>
                {prePrayerNotifications
                  ? `Get notified ${prePrayerMinutes} mins before prayer start time.`
                  : 'Get notified a few minutes before the prayer starts.'}
              </Text>
            </View>
            <Checkbox.Android
              status={prePrayerNotifications ? 'checked' : 'unchecked'}
              onPress={() => {
                const newValue = !prePrayerNotifications;
                if (newValue) {
                  setIsModalVisible(true);
                } else {
                  dispatch(setPrePrayerNotifications(false));
                }
              }}
              color="#10B981"
            />
          </View>
        </View>

        <PrePrayerReminderModal
          isVisible={isModalVisible}
          minutes={prePrayerMinutes}
          onClose={() => setIsModalVisible(false)}
          onSave={val => {
            dispatch(setPrePrayerMinutes(val));
            dispatch(setPrePrayerNotifications(true));
            setIsModalVisible(false);
          }}
        />
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
      width: '90%',
      backgroundColor: '#111827',
      margin: 20,
      borderRadius: 40,
      padding: 20,
      alignItems: 'center',
      aspectRatio: 1,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    iconView: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      marginBottom: 5,
    },
    qiblaTitle: {
      color: '#10B981',
      fontSize: 12,
      fontFamily: Font_Bold,
      letterSpacing: 2,
      marginBottom: 10,
    },
    qiblaIcon: {
      marginBottom: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 30,
    },
    compassSection: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    compassDial: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
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
      marginTop: 10,
    },
    qiblaDegreeLabel: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: Font_Bold,
      marginBottom: 5,
    },
    qiblaDegreeValue: {
      color: '#FFFFFF',
      fontSize: 14,
    },
    distanceText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: Font_Bold,
      textAlign: 'center',
    },
    prayerTimesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 25,
      marginTop: 20,
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
    settingsCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 30,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    settingsTitle: {
      fontSize: 12,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      letterSpacing: 1.5,
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    settingLabel: {
      fontSize: 14,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
    },
    settingDescription: {
      fontSize: 12,
      color: '#9CA3AF',
      marginTop: 2,
    },
    minutesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 15,
      paddingLeft: 5,
    },
    minutesLabel: {
      fontSize: 13,
      color: theme.colors.onSurface,
      fontFamily: Font_Bold,
    },
    minutesInput: {
      width: 60,
      height: 40,
      backgroundColor: theme.colors.surface,
    },
    saveButton: {
      backgroundColor: '#10B981',
      borderRadius: 10,
    },
    methodCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 30,
      padding: 15,
      marginTop: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    methodLabel: {
      fontSize: 10,
      fontFamily: Font_Bold,
      color: '#9CA3AF',
      letterSpacing: 1.5,
      marginBottom: 10,
      paddingLeft: 5,
    },
    dropdown: {
      height: 50,
      borderColor: theme.dark ? '#374151' : '#E5E7EB',
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 15,
    },
    dropdownIcon: {
      marginRight: 10,
    },
    placeholderStyle: {
      fontSize: 14,
      color: '#9CA3AF',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontFamily: Font_Bold,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 14,
      borderRadius: 10,
    },
    dropdownContainer: {
      borderRadius: 15,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.dark ? '#374151' : '#E5E7EB',
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
  });
