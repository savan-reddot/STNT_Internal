import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
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
  const user = useAppSelector(getUser);
  const action_list = [
    {
      id: 1,
      title: 'Buy Policy',
      icon: require('../../../assets/images/buy_policy.png'),
      onPress: () => navigation.navigate(Screens.BuyPolicy),
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
      title: 'Preferred Merchants',
      icon: require('../../../assets/images/preferredmerchants.png'),
      onPress: () => navigation.navigate(Screens.PreferredMerchants),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      init();
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
            `${start}${'*'.repeat(Math.max(0, passportNumber.length - 4))}${end}`,
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
    Linking.openURL(url)
  };

  return (
    <AppLayout title="">
      <ScreenLoader visible={isLoading} />
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}>
        <View style={styles(theme).custom_header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={require('../../../assets/images/day.png')}
              style={styles(theme).day}
            />
            <Text
              style={[
                fontStyle(theme).headingMedium,
                {
                  color: 'white',
                  fontWeight: '400',
                  fontFamily: Font_Regular,
                  flex: 1,
                  marginHorizontal: metrics.baseMargin,
                  fontSize: 18,
                },
              ]}
            >
              {`${getGreeting()}, ${user?.firstName} ${user?.lastName}`}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(Screens.Notification)}
            >
              <View style={styles(theme).bell_parent}>
                <Image
                  source={require('../../../assets/images/bell.png')}
                  style={{
                    height: metrics.screenWidth * 0.05,
                    width: metrics.screenWidth * 0.05,
                  }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles(theme).tiles_view}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'all' })
            }
            style={styles(theme).tile_child}
          >
            <Text style={styles(theme).headingMedium}>
              {policy_data?.totalPolicies || 0}
            </Text>
            <Text
              style={[
                styles(theme).headingSmall,
                { textAlign: 'center', marginHorizontal: metrics.baseMargin },
              ]}
            >
              Total Policies
            </Text>
          </TouchableOpacity>
          <View style={styles(theme).seprator} />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'active' })
            }
            style={styles(theme).tile_child}
          >
            <Text style={styles(theme).headingMedium}>
              {policy_data?.activePolicies || 0}
            </Text>
            <Text
              style={[
                styles(theme).headingSmall,
                { textAlign: 'center', marginHorizontal: metrics.baseMargin },
              ]}
            >
              Active Policies
            </Text>
          </TouchableOpacity>
          <View style={styles(theme).seprator} />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'expired' })
            }
            style={styles(theme).tile_child}
          >
            <Text style={styles(theme).headingMedium}>
              {policy_data?.expiredPolicies || 0}
            </Text>
            <Text
              style={[styles(theme).headingSmall, { textAlign: 'center' }]}
            >
              Expired Policies
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={action_list}
          numColumns={2}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles(theme).gridContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => item.onPress()}
              style={styles(theme).card}
              key={item.id}
            >
              <Image
                resizeMode="contain"
                source={item.icon}
                style={styles(theme).icon}
              />
              <Text
                style={[
                  fontStyle(theme).headingMedium,
                  {
                    fontSize: 16,
                    fontWeight: '500',
                    marginTop: metrics.baseMargin,
                  },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          style={{ marginTop: metrics.baseMargin * 1 }}
        />

        <TouchableOpacity
          style={styles(theme).fab}
          onPress={() => openWhatsApp()}
        >
          <Image
            source={require('../../../assets/images/WhatsApp.png')}
            style={{
              height: metrics.screenWidth * 0.15,
              width: metrics.screenWidth * 0.15,
            }}
          />
        </TouchableOpacity>
      </View>
    </AppLayout >

  );
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
  });
