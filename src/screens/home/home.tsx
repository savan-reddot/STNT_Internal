import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  ScrollView,
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
// @ts-ignore - react-native-version-check doesn't have TypeScript definitions
import VersionCheck from 'react-native-version-check';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import { Font_Bold, Font_Regular } from '../../theme/fonts';
import { Screens } from '../../common/screens';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import { useLazyGet_policyQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import { useFocusEffect } from '@react-navigation/native';
import AppLayout from '../../components/safeareawrapper';
import UpdateModal from '../../components/update_modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2; // 2-column layout

interface POLICY_DATA {
  policies: any[];
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
}

const Home = ({ navigation }: any) => {
  const theme = useTheme();
  const [get_policy, { isLoading }] = useLazyGet_policyQuery();
  const initPolicyData: POLICY_DATA = {
    policies: [],
    totalPolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
  };
  const [policy_data, setPolicy_Data] = useState<POLICY_DATA>(initPolicyData);
  const [updateInfo, setUpdateInfo] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { top } = useSafeAreaInsets();

  const user = useAppSelector(getUser);

  const action_list = [
    {
      id: 1,
      title: 'Buy Policy',
      icon: require('../../../assets/images/buy_policy.png'),
      onPress: () => navigation.navigate(Screens.PlanSelection),
    },
    {
      id: 2,
      title: 'Need Help?',
      icon: require('../../../assets/images/emergeny_help.png'),
      onPress: () => navigation.navigate(Screens.EmergencyHelp),
    },
    {
      id: 3,
      title: 'Claim',
      icon: require('../../../assets/images/claims.png'),
      onPress: () => navigation.navigate(Screens.Claim),
    },
    {
      id: 4,
      title: 'Trusted Hospitals',
      icon: require('../../../assets/images/trusted_hospitals.png'),
      onPress: () => navigation.navigate(Screens.TrustedHospitals),
    },
    {
      id: 5,
      title: 'Merchants with ST&T offers',
      icon: require('../../../assets/images/preferredmerchants.png'),
      onPress: () => navigation.navigate(Screens.PreferredMerchants),
    },
  ];

  const checkAppVersion = useCallback(async () => {
    try {
      const updateNeeded = await VersionCheck.needUpdate();
      if (updateNeeded.isNeeded) {
        setUpdateInfo(updateNeeded);
        setTimeout(() => {
          setShowUpdateModal(updateNeeded.isNeeded);
        }, 500);
      } else {
        console.log(
          'App is up to date. Current:',
          updateNeeded.currentVersion,
          'Latest:',
          updateNeeded.latestVersion,
        );
        setUpdateInfo({});
        setShowUpdateModal(false);
      }
    } catch (error) {
      console.error('Error checking app version:', error);
    }
  }, []);

  // Listen for app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkAppVersion();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAppVersion]);

  useFocusEffect(
    useCallback(() => {
      init();
      checkAppVersion();
      return () => {
        // console.log('Screen is unfocused ❌');
      };
    }, []),
  );

  const init = async () => {
    const resp = await get_policy({ category: 'all' });
    // console.log('resp?.data?.data -----> ', resp?.data?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { policies, totalPolicies, activePolicies, expiredPolicies } =
        resp?.data?.data;
      if (policies?.length > 0) {
        setPolicy_Data(resp?.data?.data);
      }
    } else {
      setPolicy_Data(initPolicyData);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const openWhatsApp = () => {
    const phone = '6591362973';
    const passportNumber = user?.passportNo ?? '';
    const maskedPassport =
      passportNumber && passportNumber.length > 4
        ? passportNumber.replace(
            /^(\w{2})\w*(\w{2})$/,
            (_match: string, start: string, end: string) =>
              `${start}${'*'.repeat(
                Math.max(0, passportNumber.length - 4),
              )}${end}`,
          )
        : passportNumber;

    const message = `Hello ST&T Team,
My details are as follow\n
Name - ${user?.firstName} ${user?.lastName}
Passport - ${maskedPassport}
Email - ${user?.email}
I need some help.
`; // optional preset text
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const isExpired = policy_data?.policies?.[0]?.isExpired;
  const currentPlan = policy_data?.policies?.[0]?.manifest?.type
    ? `${policy_data?.policies?.[0]?.manifest?.type} ${policy_data?.policies?.[0]?.manifest?.package}`
    : '';

  const SERVICES = [
    {
      id: 1,
      title: 'Policy',
      icon: 'shield-outline',
      iconColor: '#3BA66B',
      bgColor: '#EAFBF2',
      onPress: () => navigation.navigate(Screens.PlanSelection),
    },
    {
      id: 2,
      title: 'Claims',
      icon: 'document-text-outline',
      iconColor: '#3D6AF2',
      bgColor: '#EEF3FF',
      onPress: () =>
        navigation.navigate(Screens.Policies, { initialTab: 'claims' }),
    },
    {
      id: 3,
      title: 'Emergency',
      icon: 'call-outline',
      iconColor: '#E24A3B',
      bgColor: '#FFF0EE',
      onPress: () => navigation.navigate(Screens.EmergencyHelp),
    },
    {
      id: 4,
      title: 'Hospitals',
      icon: 'heart-outline',
      iconColor: '#D84A7A',
      bgColor: '#FFF1F6',
      onPress: () => navigation.navigate(Screens.TrustedHospitals),
    },
    {
      id: 5,
      title: 'Deals',
      icon: 'pricetag-outline',
      iconColor: '#D0893C',
      bgColor: '#FFF8E8',
      onPress: () => navigation.navigate(Screens.PreferredMerchants),
    },
    {
      id: 6,
      title: 'Vault',
      icon: 'lock-closed-outline',
      iconColor: '#5A67F2',
      bgColor: '#F1F3FF',
    },
  ];

  return (
    <>
      <View
        style={{
          flex: 1,
          paddingTop: top,
          backgroundColor: theme.colors.background,
        }}
      >
        <ScreenLoader visible={isLoading} />

        {/* ---------- HEADER ---------- */}
        <View style={styles(theme).header}>
          <View style={styles(theme).headerLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Screens.Profile)}
            >
              <Image
                source={
                  user?.profile_picture
                    ? { uri: user.profile_picture }
                    : require('../../../assets/images/account-circle-line.png')
                }
                style={styles(theme).avatar}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles(theme).welcome}>WELCOME BACK,</Text>
              <Text style={styles(theme).username}>
                {user?.firstName?.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles(theme).headerActions}>
            {/* WARNING ICON */}
            <TouchableOpacity
              onPress={() => navigation.navigate(Screens.EmergencyHelp)}
              style={styles(theme).warningButton}
            >
              <Icon name="warning-outline" size={22} color="#EF4444" />
            </TouchableOpacity>

            {/* NOTIFICATION ICON */}
            <TouchableOpacity
              onPress={() => navigation.navigate(Screens.Notification)}
              style={styles(theme).notificationButton}
            >
              <Icon
                name="notifications-outline"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flexGrow: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- PLAN CARD ---------- */}
          {currentPlan && (
            <TouchableOpacity
              activeOpacity={0.95}
              style={[
                styles(theme).planCard,
                { backgroundColor: theme.dark ? '#1F2937' : '#0B1320' },
              ]}
              onPress={() =>
                navigation.navigate(Screens.Policies, { type: 'all' })
              }
            >
              <View style={styles(theme).planHeader}>
                <Icon
                  name="shield-checkmark-outline"
                  size={42}
                  color="#6EE7B7"
                  style={{ opacity: 0.9 }}
                />

                <View style={styles(theme).activeBadge}>
                  <Icon
                    name="ellipse"
                    size={8}
                    color={isExpired ? '#EF4444' : '#10B981'}
                  />
                  <Text
                    style={[
                      styles(theme).activeText,
                      isExpired && styles(theme).expiredText,
                    ]}
                  >
                    {isExpired ? 'EXPIRED' : 'ACTIVE PROTECTION'}
                  </Text>
                </View>
              </View>

              <View style={styles(theme).planLabelRow}>
                <Text style={styles(theme).planLabel}>CURRENT PLAN</Text>
                <View style={styles(theme).policyBadge}>
                  <Text style={styles(theme).policyNumberText}>
                    {policy_data?.policies?.[0]?.policyNumber}
                  </Text>
                </View>
              </View>

              <Text style={styles(theme).planName}>{currentPlan}</Text>

              {/* Feature Icons */}
              {/* <View style={styles(theme).featureIconsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles(theme).featureIconsContent}
                >
                  {[
                    'heart',
                    'pulse',
                    'airplane',
                    'briefcase',
                    'shield-checkmark',
                    'thermometer',
                    'headset',
                  ].map((icon, index) => (
                    <View key={icon} style={styles(theme).featureIconWrapper}>
                      <Icon
                        name={`${icon}-outline`}
                        size={15}
                        color={'#10B981'}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View> */}

              {policy_data?.policies?.[0]?.maximum_coverage_amount && (
                <View
                  style={[
                    styles(theme).divider,
                    { backgroundColor: theme.dark ? '#0B1320' : '#1F2937' },
                  ]}
                />
              )}

              {policy_data?.policies?.[0]?.maximum_coverage_amount && (
                <View style={styles(theme).coverageRow}>
                  <View>
                    <Text style={styles(theme).coverageLabel}>
                      COVERAGE AMOUNT
                    </Text>
                    <Text style={styles(theme).coverageAmount}>
                      SGD {policy_data?.policies?.[0]?.maximum_coverage_amount}
                    </Text>
                  </View>

                  <Icon name="chevron-forward" size={24} color="#10B981" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* ---------- ALERTS ---------- */}
          {/* <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles(theme).alertContainer}
          >
            <View
              style={[
                styles(theme).alertCard,
                { backgroundColor: theme.dark ? '#3A2E1E' : '#FFF6E8' },
              ]}
            >
              <Icon name="sunny-outline" size={30} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles(theme).alertTitle}>
                  EXTREME HEAT WARNING
                </Text>
                <Text style={styles(theme).alertDesc}>
                  Temperatures reaching 45°C in Mecca. Avoid direct sun between
                  12 PM - 3 PM.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles(theme).alertCard,
                { backgroundColor: theme.dark ? '#3B1E1E' : '#FFF0F0' },
              ]}
            >
              <Icon name="people-outline" size={30} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <Text style={styles(theme).alertTitle}>HIGH CROWD DENSITY</Text>
                <Text style={styles(theme).alertDesc}>
                  Mataf area is at 90% capacity. Use upper floors.
                </Text>
              </View>
            </View>
          </ScrollView> */}

          {/* ---------- SERVICES ---------- */}
          <View style={styles(theme).serviceHeader}>
            <Text style={styles(theme).serviceTitle}>SERVICES</Text>
            {/* <TouchableOpacity>
              <Text style={styles(theme).viewAll}>VIEW ALL</Text>
            </TouchableOpacity> */}
          </View>

          <FlatList
            data={SERVICES}
            numColumns={3}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles(theme).serviceGrid}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles(theme).serviceCard,
                  { opacity: index === 5 ? 0.5 : 1 },
                ]}
                onPress={item?.onPress}
                disabled={index === 5}
              >
                <View
                  style={[
                    styles(theme).iconWrapper,
                    {
                      backgroundColor: theme.dark ? '#1F2937' : item.bgColor,
                    },
                  ]}
                >
                  <Icon name={item.icon} size={28} color={item.iconColor} />
                </View>

                <Text style={styles(theme).serviceText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>

        <UpdateModal
          visible={showUpdateModal}
          updateInfo={updateInfo}
          onUpdate={() => {
            setShowUpdateModal(false);
          }}
        />
      </View>

      <TouchableOpacity
        style={styles(theme).fab}
        onPress={() => openWhatsApp()}
      >
        <Image
          source={require('../../../assets/images/WhatsApp.png')}
          style={styles(theme).fabImage}
        />
      </TouchableOpacity>
    </>
  );

  // return (
  //   <AppLayout title="">
  //     <ScreenLoader visible={isLoading} />

  //     <View style={{
  //       flex: 1,
  //       backgroundColor: theme.colors.background,
  //     }}>
  //       <View style={styles(theme).custom_header}>
  //         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //           <Image
  //             source={require('../../../assets/images/day.png')}
  //             style={styles(theme).day}
  //           />
  //           <Text
  //             style={[
  //               fontStyle(theme).headingMedium,
  //               {
  //                 color: 'white',
  //                 fontWeight: '400',
  //                 fontFamily: Font_Regular,
  //                 flex: 1,
  //                 marginHorizontal: metrics.baseMargin,
  //                 fontSize: 18,
  //               },
  //             ]}
  //           >
  //             {`${getGreeting()}, ${user?.firstName} ${user?.lastName}`}
  //           </Text>
  //           <TouchableOpacity
  //             onPress={() => navigation.navigate(Screens.Notification)}
  //           >
  //             <View style={styles(theme).bell_parent}>
  //               <Image
  //                 source={require('../../../assets/images/bell.png')}
  //                 style={{
  //                   height: metrics.screenWidth * 0.05,
  //                   width: metrics.screenWidth * 0.05,
  //                 }}
  //                 resizeMode="contain"
  //               />
  //             </View>
  //           </TouchableOpacity>
  //         </View>
  //       </View>

  //       <View style={styles(theme).tiles_view}>
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate(Screens.Policies, { type: 'all' })
  //           }
  //           style={styles(theme).tile_child}
  //         >
  //           <Text style={styles(theme).headingMedium}>
  //             {policy_data?.totalPolicies || 0}
  //           </Text>
  //           <Text
  //             style={[
  //               styles(theme).headingSmall,
  //               { textAlign: 'center', marginHorizontal: metrics.baseMargin },
  //             ]}
  //           >
  //             Total Policies
  //           </Text>
  //         </TouchableOpacity>
  //         <View style={styles(theme).seprator} />
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate(Screens.Policies, { type: 'active' })
  //           }
  //           style={styles(theme).tile_child}
  //         >
  //           <Text style={styles(theme).headingMedium}>
  //             {policy_data?.activePolicies || 0}
  //           </Text>
  //           <Text
  //             style={[
  //               styles(theme).headingSmall,
  //               { textAlign: 'center', marginHorizontal: metrics.baseMargin },
  //             ]}
  //           >
  //             Active Policies
  //           </Text>
  //         </TouchableOpacity>
  //         <View style={styles(theme).seprator} />
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate(Screens.Policies, { type: 'expired' })
  //           }
  //           style={styles(theme).tile_child}
  //         >
  //           <Text style={styles(theme).headingMedium}>
  //             {policy_data?.expiredPolicies || 0}
  //           </Text>
  //           <Text
  //             style={[styles(theme).headingSmall, { textAlign: 'center' }]}
  //           >
  //             Expired Policies
  //           </Text>
  //         </TouchableOpacity>
  //       </View>

  //       <FlatList
  //         data={action_list}
  //         numColumns={2}
  //         keyExtractor={(item: any) => item.id.toString()}
  //         contentContainerStyle={styles(theme).gridContainer}
  //         renderItem={({ item }) => (
  //           <TouchableOpacity
  //             onPress={() => item.onPress()}
  //             style={styles(theme).card}
  //             key={item.id}
  //           >
  //             <Image
  //               resizeMode="contain"
  //               source={item.icon}
  //               style={styles(theme).icon}
  //             />
  //             <Text
  //               style={[
  //                 fontStyle(theme).headingMedium,
  //                 {
  //                   fontSize: 16,
  //                   fontWeight: '500',
  //                   marginTop: metrics.baseMargin,
  //                 },
  //               ]}
  //             >
  //               {item.title}
  //             </Text>
  //           </TouchableOpacity>
  //         )}
  //         style={{ marginTop: metrics.baseMargin * 1 }}
  //       />

  //       <TouchableOpacity
  //         style={styles(theme).fab}
  //         onPress={() => openWhatsApp()}
  //       >
  //         <Image
  //           source={require('../../../assets/images/WhatsApp.png')}
  //           style={{
  //             height: metrics.screenWidth * 0.15,
  //             width: metrics.screenWidth * 0.15,
  //           }}
  //         />
  //       </TouchableOpacity>
  //     </View>

  //     <UpdateModal
  //       visible={showUpdateModal}
  //       updateInfo={updateInfo}
  //       onUpdate={() => {
  //         setShowUpdateModal(false);
  //       }}
  //     />
  //   </AppLayout >
  // );
};

export default Home;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    custom_header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: metrics.baseMargin * 2,
      height: metrics.screenWidth * 0.28,
    },
    day: {
      height: metrics.screenWidth * 0.08,
      width: metrics.screenWidth * 0.08,
      marginHorizontal: metrics.baseMargin,
    },
    bell_parent: {
      height: metrics.screenWidth * 0.09,
      width: metrics.screenWidth * 0.09,
      borderRadius: metrics.screenWidth * 0.1,
      backgroundColor: 'rgba(255,255,255,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      marginEnd: metrics.baseMargin,
    },
    tiles_view: {
      flexDirection: 'row',
      marginHorizontal: metrics.baseMargin * 2,
      marginTop: -metrics.doubleMargin * 2.7,
      borderRadius: 16,
      elevation: 1,
      backgroundColor: '#fff',
      padding: metrics.baseMargin,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    tile_child: {
      flex: 1,
      borderTopLeftRadius: metrics.baseRadius,
      alignItems: 'center',
      padding: metrics.baseMargin,
    },
    gridContainer: {
      marginHorizontal: metrics.baseMargin,
      paddingBottom: metrics.baseMargin * 10,
    },
    card: {
      width: CARD_WIDTH,
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: metrics.baseRadius,
      paddingVertical: 20,
      alignItems: 'center',
      margin: metrics.baseMargin,
      elevation: 1, // for Android shadow
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }, // for iOS shadow
    },
    icon: {
      width: CARD_WIDTH * 0.65,
      height: CARD_WIDTH * 0.65,
      resizeMode: 'contain',
    },
    title: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: '500',
      color: '#000',
    },
    seprator: {
      width: 0.7,
      backgroundColor: 'rgba(230,230,230)',
      height: '80%',
      alignSelf: 'center',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
    headingMedium: {
      fontFamily: Font_Bold,
      fontWeight: '700',
      fontSize: metrics.moderateScale(20),
      letterSpacing: 0.2,
      lineHeight: 19.3,
      marginHorizontal: 0,
      color: theme.colors.onBackground,
    },
    headingSmall: {
      fontFamily: Font_Bold,
      fontWeight: '700',
      fontSize: metrics.moderateScale(14),
      margin: metrics.baseMargin,
      marginHorizontal: 0,
      color: theme.colors.onBackground,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    welcome: {
      fontSize: 12,
      color: theme.dark ? '#9CA3AF' : '#8A94A6',
      fontWeight: '600',
    },
    username: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.onBackground,
    },
    bell: {
      position: 'relative',
    },
    bellIcon: {
      width: 24,
      height: 24,
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#E53935',
      borderRadius: 10,
      paddingHorizontal: 5,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },
    planCard: {
      borderRadius: 24,
      marginHorizontal: 20,
      padding: 20,
      marginTop: 20,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    shieldIcon: {
      width: 32,
      height: 32,
    },
    activeBadge: {
      flexDirection: 'row',
      backgroundColor: '#1F3D36',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#6EE7B7',
    },
    activeText: {
      color: '#6EE7B7',
      fontWeight: '700',
      fontSize: 12,
    },
    expiredText: {
      color: '#EF4444',
    },
    planLabel: {
      color: '#9CA3AF',
      fontSize: 12,
      fontWeight: '600',
    },
    planName: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '800',
      marginTop: 6,
      textTransform: 'uppercase',
    },
    divider: {
      height: 1,
      marginVertical: 20,
    },
    coverageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coverageLabel: {
      color: '#9CA3AF',
      fontSize: 12,
    },
    coverageAmount: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
      marginTop: 4,
    },
    arrow: {
      width: 20,
      height: 20,
    },
    alertContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
      gap: 16,
    },
    alertCard: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 20,
      width: 300,
      gap: 12,
    },
    alertIcon: {
      width: 40,
      height: 40,
    },
    alertTitle: {
      fontWeight: '800',
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    alertDesc: {
      fontSize: 13,
      color: theme.dark ? '#D1D5DB' : '#6B7280',
      marginTop: 4,
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 30,
    },
    serviceTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.onBackground,
    },
    viewAll: {
      color: '#4CAF50',
      fontWeight: '700',
    },
    serviceGrid: {
      paddingHorizontal: 10,
      marginTop: 20,
    },
    serviceCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      alignItems: 'center',
      paddingVertical: 15,
      margin: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconWrapper: {
      width: 60,
      height: 60,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    serviceText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    featureIconsContainer: {
      marginTop: 15,
    },
    featureIconsContent: {
      gap: 12,
      paddingRight: 20,
    },
    featureIconWrapper: {
      width: 30,
      height: 30,
      borderRadius: 19,
      borderWidth: 1.5,
      borderColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    warningButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#3B1E1E' : '#FDECEC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#1F2937' : '#F5F6FA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    planLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      gap: 10,
    },
    policyBadge: {
      backgroundColor: theme.dark ? '#0B1320' : '#1F2937',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    policyNumberText: {
      color: '#9CA3AF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    fabImage: {
      height: metrics.screenWidth * 0.15,
      width: metrics.screenWidth * 0.15,
    },
  });
