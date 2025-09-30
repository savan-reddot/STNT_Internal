import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import { Font_Regular } from '../../theme/fonts';
import AppHeader from '../../components/header';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Screens } from '../../common/screens';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import { useLazyGet_policyQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import { FAB } from 'react-native-paper';
import { showErrorToast } from '../../utils/toastUtils';

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
  const insets = useSafeAreaInsets();
  const action_list = [
    {
      id: 1,
      title: 'Buy Policy',
      icon: require('../../../assets/images/buy_policy.png'),
      onPress: () =>
        navigation.navigate(Screens.WebView, {
          url: 'https://stntinternational.com/ema-package/#form1',
        }),
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
  ];

  useEffect(() => {
    const init = async () => {
      const resp = await get_policy({ category: 'all' });
      console.log('resp?.data?.data -----> ', resp?.data?.data);
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

    init();
  }, []);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const openWhatsApp = () => {
    const phone = '6591362973';
    const message = `Hello ST&T Team,
My details are as follow\n
Name - ${user?.firstName} ${user?.lastName}
Passport - ${user?.passportNo.replace(
      /^(\w{2})\w*(\w{2})$/,
      (_, a, b) => a + '*'.repeat(user?.passportNo.length - 4) + b,
    )}
Email - ${user?.email}
I need some help.
`; // optional preset text
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(
      message,
    )}`;

    console.log('Whatsapp Message : ', message);

    Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (!supported) {
          showErrorToast(
            'Please install WhatsApp to send a message',
            'WhatsApp not installed',
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    // <AppLayout title="">
    <SafeAreaView
      edges={['top']}
      style={[
        globalStyle(theme).container,
        { backgroundColor: theme.colors.primary },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.primary}
      />

      <ScreenLoader visible={isLoading} />
      <View style={[globalStyle(theme).container]}>
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
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'all' })
            }
          >
            <View style={styles(theme).tile_child}>
              <Text style={fontStyle(theme).headingMedium}>
                {policy_data?.totalPolicies || 0}
              </Text>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { textAlign: 'center', marginHorizontal: metrics.baseMargin },
                ]}
              >
                Total Policies
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles(theme).seprator} />
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'active' })
            }
          >
            <View style={styles(theme).tile_child}>
              <Text style={fontStyle(theme).headingMedium}>
                {policy_data?.activePolicies || 0}
              </Text>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { textAlign: 'center', marginHorizontal: metrics.baseMargin },
                ]}
              >
                Active Policies
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles(theme).seprator} />
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate(Screens.Policies, { type: 'expired' })
            }
          >
            <View style={styles(theme).tile_child}>
              <Text style={fontStyle(theme).headingMedium}>
                {policy_data?.expiredPolicies || 0}
              </Text>
              <Text
                style={[fontStyle(theme).headingSmall, { textAlign: 'center' }]}
              >
                Expired Policies
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View
          style={{
            // paddingHorizontal: metrics.baseMargin,
            marginHorizontal: metrics.baseMargin,
            marginTop: metrics.baseMargin * 2,
          }}
        >
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
          />
        </View>

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
        {/* <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            margin: metrics.baseMargin,
            marginHorizontal: metrics.baseMargin * 2,
          }}
        >
          {action_list.map((item, index) => (
            <TouchableOpacity key={index} onPress={item.onPress}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: metrics.baseMargin,
                  backgroundColor: theme.colors.background,
                  borderRadius: metrics.baseRadius,
                  // margin: metrics.baseMargin / 2,
                  marginEnd: metrics.baseMargin,
                  // flex: 1,
                  width: metrics.screenWidth * 0.4,
                  elevation: 1,
                }}
              >
                <Image
                  source={item.icon}
                  style={{
                    width: metrics.screenWidth * 0.2,
                    height: metrics.screenWidth * 0.2,
                    marginRight: metrics.baseMargin,
                  }}
                />
                <Text
                  style={[
                    fontStyle(theme).headingMedium,
                    { fontWeight: '500', fontSize: 16 },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    custom_header: {
      backgroundColor: theme.colors.primary,
      paddingTop: metrics.baseMargin,
      paddingHorizontal: metrics.baseMargin * 2,
      paddingBottom: metrics.doubleMargin * 3,
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
    },
    tile_child: {
      flex: 1,
      borderTopLeftRadius: metrics.baseRadius,
      alignItems: 'center',
      padding: metrics.baseMargin,
    },
    gridContainer: {
      // marginHorizontal: CARD_MARGIN,
      // marginEnd: -CARD_MARGIN,
      paddingTop: 10,
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
  });
