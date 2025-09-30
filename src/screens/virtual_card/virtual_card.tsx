import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';

import {
  useApple_wallet_passMutation,
  useGoogle_wallet_passMutation,
  useLazyUser_metaQuery,
} from '../../redux/services';
import QRCode from 'react-native-qrcode-svg';
import fontStyle from '../../styles/fontStyle';
import NoDataFound from '../../components/no_data_found';
import ScreenLoader from '../../components/loader';
import { showErrorToast } from '../../utils/toastUtils';

const VirtualCard = ({ navigation }: any) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [metaData, setMetaData] = useState<any>(null);
  const [user_meta, { isLoading }] = useLazyUser_metaQuery();
  const [apple_wallet_pass, { isAppleLoading }] =
    useApple_wallet_passMutation();
  const [google_wallet_pass, { isGoogleLoading }] =
    useGoogle_wallet_passMutation();

  useEffect(() => {
    const init = async () => {
      const resp = await user_meta(0);
      console.log('Meta Data : ', resp?.data);
      if (resp && resp?.data) {
        const { status, data } = resp?.data;
        if (status) {
          setMetaData(data);
        }
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadECard = async (isApple: boolean) => {
    const request = {
      uidNo: metaData?.policyDetails?.uidNo,
    };

    let resp;
    if (isApple) {
      resp = await apple_wallet_pass(request);
      console.log('response ----> ', resp.data);
      if (resp && resp?.data?.success) {
        openDownloadLink(resp?.data?.url);
      }
    } else {
      resp = await google_wallet_pass(request);
      console.log('response ----> ', resp.data);
      if (resp && resp?.data?.success) {
        openDownloadLink(resp?.data?.url);
      }
    }
  };

  const openDownloadLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url); // opens in Chrome/Safari etc.
    } else {
      showErrorToast('Cannot open this link', 'Error');
    }
  };

  const openZoom = () => {
    setVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const closeZoom = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <AppLayout title={'E-Card'}>
      <ScreenLoader visible={isLoading} />
      {metaData && !isLoading ? (
        <ScrollView>
          <View
            style={[
              globalStyle(theme).container,
              { padding: metrics.doubleMargin / 2 },
            ]}
          >
            <View style={styles.cardContainer}>
              <TouchableOpacity activeOpacity={0.8} onPress={openZoom}>
                <ImageBackground
                  source={{
                    uri: `data:image/png;base64,${metaData?.virtualCard.front}`,
                  }}
                  style={styles.backgroundImage}
                  resizeMode="contain"
                >
                  <View style={styles.overlayContent}>
                    <Text style={styles.uid}>
                      UID: {metaData?.policyDetails.uidNo}
                    </Text>
                    <Text numberOfLines={2} style={styles.name}>
                      Name: {metaData?.policyDetails.name}
                    </Text>
                    <Text style={styles.dob}>
                      DOB: {metaData?.policyDetails.dob}
                    </Text>
                    <QRCode value={metaData?.virtualCard.urlPath} size={60} />
                  </View>
                </ImageBackground>
              </TouchableOpacity>

              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    fontWeight: 'regular',
                    padding: metrics.baseMargin,
                    paddingBottom: 0,
                  },
                ]}
              >
                *Tap the card to display the QR code.
              </Text>

              <View style={{ margin: metrics.baseMargin }}>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    {
                      fontSize: 14,
                      fontWeight: '700',
                      color: theme.colors.onBackground,
                    },
                  ]}
                >
                  Policy Details :
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: '700',
                        color: theme.colors.onBackground,
                      },
                    ]}
                  >
                    Plan Type :
                  </Text>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: 'regular',
                        color: theme.colors.onBackground,
                        marginLeft: metrics.baseMargin,
                      },
                    ]}
                  >
                    {metaData?.policyDetails?.policyType}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: '700',
                        color: theme.colors.onBackground,
                      },
                    ]}
                  >
                    Start Date :
                  </Text>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: 'regular',
                        color: theme.colors.onBackground,
                        marginLeft: metrics.baseMargin,
                      },
                    ]}
                  >
                    {metaData?.policyDetails?.policyEffectiveData}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: '700',
                        color: theme.colors.onBackground,
                      },
                    ]}
                  >
                    End Date :
                  </Text>
                  <Text
                    style={[
                      fontStyle(theme).headingSmall,
                      {
                        fontSize: 14,
                        fontWeight: 'regular',
                        color: theme.colors.onBackground,
                        marginLeft: metrics.baseMargin,
                      },
                    ]}
                  >
                    {metaData?.policyDetails?.policyExpirationData}
                  </Text>
                </View>
              </View>

              {/* <Animated.View style={[styles.card, frontStyle]}>
              <ImageBackground
                source={{
                  uri: `data:image/png;base64,${metaData?.virtualCard.front}`,
                }}
                style={styles.backgroundImage}
                resizeMode="contain"
              >
                
                <View style={styles.overlayContent}>
                  <Text style={styles.uid}>
                    UID: {metaData?.policyDetails.uidNo}
                  </Text>
                  <Text numberOfLines={2} style={styles.name}>
                    Name: {metaData?.policyDetails.name}
                  </Text>
                  <Text style={styles.dob}>
                    DOB: {metaData?.policyDetails.dob}
                  </Text>
                  <QRCode value={metaData?.virtualCard.urlPath} size={60} />
                </View>
              </ImageBackground>
            </Animated.View> */}

              {/* Back Side */}
              {/* <Animated.View style={[styles.card, backStyle]}>
              <Image
                source={{
                  uri: `data:image/png;base64,${metaData?.virtualCard.back}`,
                }}
                style={styles.backgroundImage}
                resizeMode="contain"
              />
            </Animated.View> */}

              <View style={{ margin: metrics.baseMargin }}>
                <Text style={fontStyle(theme).headingSmall}>Note :</Text>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { fontWeight: 'regular', marginTop: 0 },
                  ]}
                >
                  1. A virtual claim payment card is unique digit computer
                  generated number that is created solely for a use between a
                  payer and payee.{' '}
                </Text>
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { fontWeight: 'regular', marginTop: 0 },
                  ]}
                >
                  2. We will provide a Claim Assistance Card for your to ensure
                  that you have handy policy details as well as direct claims
                  assistance number always with you.
                </Text>
              </View>

              <View style={{ alignSelf: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => downloadECard(Platform.OS == 'ios')}
                >
                  <Image
                    source={
                      Platform.OS == 'android'
                        ? require('../../../assets/images/google_wallet.png')
                        : require('../../../assets/images/apple_wallet.png')
                    }
                    style={{
                      width: metrics.screenWidth * 0.85,
                      height: metrics.screenWidth * 0.15,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <NoDataFound
          title={'No Virtual Card Found'}
          description={
            'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
          }
        />
      )}
      {visible && (
        <Modal visible={visible} transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={closeZoom}>
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
              <QRCode
                value={metaData?.virtualCard.urlPath}
                size={metrics.screenWidth * 0.8}
              />
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </AppLayout>
  );
};

export default VirtualCard;

const styles = StyleSheet.create({
  card: {
    // width: metrics.screenWidth * 0.8,
    height: metrics.screenHeight * 0.3,
    width: '100%',
    // height: '100%',
    borderRadius: 8,
    alignSelf: 'center',
    margin: metrics.baseMargin,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlayContent: {
    position: 'absolute',
    top: metrics.screenHeight * 0.1,
    left: 20,
  },
  uid: { fontWeight: 'bold', color: '#000' },
  name: { color: '#000', marginTop: metrics.baseMargin, width: '60%' },
  dob: { color: '#000', marginVertical: metrics.baseMargin },
  backContent: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  flipBtn: {
    marginTop: metrics.baseMargin,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  flipBtnText: { color: '#fff', fontWeight: '600' },
  cardContainer: {
    width: '100%',
    height: metrics.screenHeight * 0.3,
    margin: metrics.baseMargin,
    marginHorizontal: 0,
    alignSelf: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLarge: {
    width: metrics.screenWidth * 0.8,
    height: metrics.screenWidth * 0.8,
  },
});
