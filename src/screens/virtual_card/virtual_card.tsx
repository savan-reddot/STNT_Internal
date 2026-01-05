import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import ScreenGuard from 'react-native-screenguard';
import AppLayout from '../../components/safeareawrapper';
import { useLazyUser_metaQuery } from '../../redux/services';
import QRCode from 'react-native-qrcode-svg';
import NoDataFound from '../../components/no_data_found';
import ScreenLoader from '../../components/loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper';

const VirtualCard = () => {
  const theme = useTheme();
  const [metaData, setMetaData] = useState<any>(null);
  const [user_meta, { isLoading }] = useLazyUser_metaQuery();

  /** Flip animation */
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const init = async () => {
    const webToken = await AsyncStorage.getItem('webtoken');
    if (webToken) {
      const resp = await user_meta(0);
      if (resp?.data?.status) {
        setMetaData(resp.data.data);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      init();
      ScreenGuard.register({
        backgroundColor: '#000',
        timeAfterResume: 1000,
      });
      return () => ScreenGuard.unregister();
    }, []),
  );

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  if (isLoading) {
    return <ScreenLoader visible />;
  }

  if (!metaData || metaData?.virtualCard?.isExpired) {
    return (
      <View
        style={[
          styles.noDataFoundContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <NoDataFound
          title="No Virtual Card Found"
          description="Please verify your details in profile."
        />
      </View>
    );
  }

  const details = metaData.policyDetails;

  return (
    <AppLayout title="E-Pass">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
          <View style={styles.cardWrapper}>
            {/* FRONT – DETAILS */}
            <Animated.View
              style={[styles.card, { transform: [{ rotateY: frontRotate }] }]}
            >
              <View style={styles.frontCard}>
                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.logoBox}>
                    <Text style={styles.logoText}>✔</Text>
                  </View>
                  <View>
                    <Text style={styles.orgName}>ST&T GLOBAL</Text>
                    <Text style={styles.subTitle}>VERIFIED IDENTITY</Text>
                  </View>
                </View>

                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {details?.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </Text>
                </View>

                <Text style={styles.fullName}>{details?.name}</Text>
                <Text style={styles.nationality}>{details?.nationality}</Text>

                {/* Status */}
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{details?.policyType}</Text>
                </View>

                <View style={styles.divider} />

                {/* 🔹 Added fields */}
                <View style={styles.row}>
                  <Text style={styles.label}>UID</Text>
                  <Text style={styles.value}>{details?.uidNo}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Plan Type</Text>
                  <Text style={styles.value}>{details?.policyType}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Text style={styles.value}>{details?.dob}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Policy Start Date</Text>
                  <Text style={styles.value}>
                    {details?.policyEffectiveData}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Valid Until</Text>
                  <Text style={[styles.value, { color: '#2e7d32' }]}>
                    {details?.policyExpirationData}
                  </Text>
                </View>

                <Text style={[styles.tapBack, { textAlign: 'center' }]}>
                  TAP TO VIEW BACK
                </Text>
              </View>
            </Animated.View>

            {/* BACK – QR */}
            <Animated.View
              style={[
                styles.card,
                styles.backCard,
                { transform: [{ rotateY: backRotate }] },
              ]}
            >
              <View style={styles.backInner}>
                <Text style={styles.encryptedText}>ENCRYPTED E-PASS</Text>

                <View style={styles.qrBox}>
                  <QRCode value={metaData?.virtualCard?.urlPath} size={180} />
                </View>

                <Text style={styles.securityTitle}>SECURITY TOKEN</Text>
                <Text style={styles.securityDesc}>
                  Please present this QR code at all checkpoints. Generated with
                  AES-256 local encryption.
                </Text>

                <Text style={styles.tapBack}>TAP TO VIEW FRONT</Text>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </AppLayout>
  );
};

export default VirtualCard;

const styles = StyleSheet.create({
  cardWrapper: { alignItems: 'center' },
  card: {
    width: '100%',
    borderRadius: 28,
    backfaceVisibility: 'hidden',
  },
  backCard: { position: 'absolute', top: 0 },
  frontCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3fa26a',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  orgName: { fontWeight: '700', fontSize: 14 },
  subTitle: { fontSize: 12, color: '#3fa26a' },
  avatar: {
    marginTop: 24,
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#245b4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  fullName: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  nationality: { textAlign: 'center', color: '#888' },
  statusBadge: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: '#e8f5ee',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: '#2e7d32', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 18 },
  row: { marginBottom: 10 },
  label: { fontSize: 12, color: '#888' },
  value: { fontSize: 15, fontWeight: '600' },
  backInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 28,
    alignItems: 'center',
    padding: 24,
  },
  encryptedText: { marginTop: 10, color: '#999', fontWeight: '600' },
  qrBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fafafa',
  },
  securityTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
  },
  securityDesc: {
    marginTop: 8,
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
  },
  tapBack: {
    marginTop: 20,
    color: '#bbb',
    fontWeight: '600',
  },
  noDataFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Old Code

// import {
//   Animated,
//   Easing,
//   ImageBackground,
//   Linking,
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import React, { useCallback, useRef, useState } from 'react';
// import ScreenGuard from 'react-native-screenguard';
// import AppLayout from '../../components/safeareawrapper';
// import { useTheme } from 'react-native-paper';
// import { metrics } from '../../utils/metrics';
// import {
//   useApple_wallet_passMutation,
//   useGoogle_wallet_passMutation,
//   useLazyUser_metaQuery,
// } from '../../redux/services';
// import QRCode from 'react-native-qrcode-svg';
// import fontStyle from '../../styles/fontStyle';
// import NoDataFound from '../../components/no_data_found';
// import ScreenLoader from '../../components/loader';
// import { showErrorToast } from '../../utils/toastUtils';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const VirtualCard = ({ navigation }: any) => {
//   const theme = useTheme();
//   const [visible, setVisible] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(0)).current;
//   const [metaData, setMetaData] = useState<any>(null);
//   const [user_meta, { isLoading }] = useLazyUser_metaQuery();
//   const [apple_wallet_pass, { isAppleLoading }] =
//     useApple_wallet_passMutation();
//   const [google_wallet_pass, { isGoogleLoading }] =
//     useGoogle_wallet_passMutation();

//   const init = async () => {
//     const webToken = await AsyncStorage.getItem('webtoken');

//     if (webToken) {
//       const resp = await user_meta(0);
//       console.log('Meta Data : ', resp?.data);
//       if (resp && resp?.data) {
//         const { status, data } = resp?.data;
//         if (status) {
//           setMetaData(data);
//         }
//       }
//     }
//   };

//   // Prevent screenshots when this screen is focused and call init function
//   useFocusEffect(
//     useCallback(() => {
//       init();

//       // Register screen guard with color overlay when screen is focused
//       ScreenGuard.register({
//         backgroundColor: '#000000', // Black background
//         timeAfterResume: 1000,     // Time delay for Android
//       });

//       // Cleanup function to unregister screen guard when screen loses focus
//       return () => {
//         ScreenGuard.unregister();
//       };
//     }, [])
//   );

//   const downloadECard = async (isApple: boolean) => {
//     const request = {
//       uidNo: metaData?.policyDetails?.uidNo,
//     };

//     let resp;
//     if (isApple) {
//       resp = await apple_wallet_pass(request);
//       console.log('response ----> ', resp.data);
//       if (resp && resp?.data?.success) {
//         openDownloadLink(resp?.data?.url);
//       }
//     } else {
//       resp = await google_wallet_pass(request);
//       console.log('response ----> ', resp.data);
//       if (resp && resp?.data?.success) {
//         openDownloadLink(resp?.data?.url);
//       }
//     }
//   };

//   const openDownloadLink = async (url: string) => {
//     const supported = await Linking.canOpenURL(url);
//     if (supported) {
//       await Linking.openURL(url); // opens in Chrome/Safari etc.
//     } else {
//       showErrorToast('Cannot open this link', 'Error');
//     }
//   };

//   const openZoom = () => {
//     setVisible(true);
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeZoom = () => {
//     Animated.timing(scaleAnim, {
//       toValue: 0,
//       duration: 200,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: true,
//     }).start(() => setVisible(false));
//   };

//   return (
//     <AppLayout title={'E-Pass'}>
//       <ScreenLoader visible={isLoading} />
//       {metaData?.virtualCard?.isExpired === false && !isLoading ? (
//         <ScrollView style={{ padding: 15 }} contentContainerStyle={{ paddingBottom: metrics.doubleMargin }}>
//           <TouchableOpacity activeOpacity={0.8} onPress={openZoom} style={{
//             width: '100%',
//             height: 240,
//           }}>
//             <ImageBackground
//               source={{
//                 uri: `data:image/png;base64,${metaData?.virtualCard.front}`,
//               }}
//               style={styles.backgroundImage}
//               resizeMode="contain"
//             >
//               <View style={styles.overlayContent}>
//                 <Text style={styles.uid}>
//                   UID: {metaData?.policyDetails.uidNo}
//                 </Text>
//                 <Text numberOfLines={2} style={styles.name}>
//                   Name: {metaData?.policyDetails.name}
//                 </Text>
//                 <Text style={styles.dob}>
//                   DOB: {metaData?.policyDetails.dob}
//                 </Text>
//                 <QRCode value={metaData?.virtualCard.urlPath} size={60} />
//               </View>
//             </ImageBackground>
//           </TouchableOpacity>

//           <Text
//             style={[
//               fontStyle(theme).headingSmall,
//               {
//                 fontWeight: 'regular',
//                 padding: metrics.baseMargin,
//                 paddingBottom: 0,
//               },
//             ]}
//           >
//             *Tap the card to display the QR code.
//           </Text>

//           <View style={{ margin: metrics.baseMargin }}>
//             <Text
//               style={[
//                 fontStyle(theme).headingSmall,
//                 {
//                   fontSize: 14,
//                   fontWeight: '700',
//                   color: theme.colors.onBackground,
//                 },
//               ]}
//             >
//               Policy Details :
//             </Text>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: '700',
//                     color: theme.colors.onBackground,
//                   },
//                 ]}
//               >
//                 Plan Type :
//               </Text>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: 'regular',
//                     color: theme.colors.onBackground,
//                     marginLeft: metrics.baseMargin,
//                   },
//                 ]}
//               >
//                 {metaData?.policyDetails?.policyType}
//               </Text>
//             </View>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: '700',
//                     color: theme.colors.onBackground,
//                   },
//                 ]}
//               >
//                 Start Date :
//               </Text>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: 'regular',
//                     color: theme.colors.onBackground,
//                     marginLeft: metrics.baseMargin,
//                   },
//                 ]}
//               >
//                 {metaData?.policyDetails?.policyEffectiveData}
//               </Text>
//             </View>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: '700',
//                     color: theme.colors.onBackground,
//                   },
//                 ]}
//               >
//                 End Date :
//               </Text>
//               <Text
//                 style={[
//                   fontStyle(theme).headingSmall,
//                   {
//                     fontSize: 14,
//                     fontWeight: 'regular',
//                     color: theme.colors.onBackground,
//                     marginLeft: metrics.baseMargin,
//                   },
//                 ]}
//               >
//                 {metaData?.policyDetails?.policyExpirationData}
//               </Text>
//             </View>
//           </View>

//           {/* <Animated.View style={[styles.card, frontStyle]}>
//               <ImageBackground
//                 source={{
//                   uri: `data:image/png;base64,${metaData?.virtualCard.front}`,
//                 }}
//                 style={styles.backgroundImage}
//                 resizeMode="contain"
//               >

//                 <View style={styles.overlayContent}>
//                   <Text style={styles.uid}>
//                     UID: {metaData?.policyDetails.uidNo}
//                   </Text>
//                   <Text numberOfLines={2} style={styles.name}>
//                     Name: {metaData?.policyDetails.name}
//                   </Text>
//                   <Text style={styles.dob}>
//                     DOB: {metaData?.policyDetails.dob}
//                   </Text>
//                   <QRCode value={metaData?.virtualCard.urlPath} size={60} />
//                 </View>
//               </ImageBackground>
//             </Animated.View> */}

//           {/* Back Side */}
//           {/* <Animated.View style={[styles.card, backStyle]}>
//               <Image
//                 source={{
//                   uri: `data:image/png;base64,${metaData?.virtualCard.back}`,
//                 }}
//                 style={styles.backgroundImage}
//                 resizeMode="contain"
//               />
//             </Animated.View> */}

//           <View style={{ margin: metrics.baseMargin }}>
//             <Text style={fontStyle(theme).headingSmall}>Note :</Text>
//             <Text
//               style={[
//                 fontStyle(theme).headingSmall,
//                 { fontWeight: 'regular', marginTop: 0 },
//               ]}
//             >
//               1. A virtual claim payment card is unique digit computer
//               generated number that is created solely for a use between a
//               payer and payee.{' '}
//             </Text>
//             <Text
//               style={[
//                 fontStyle(theme).headingSmall,
//                 { fontWeight: 'regular', marginTop: 0 },
//               ]}
//             >
//               2. We will provide a Claim Assistance Card for your to ensure
//               that you have handy policy details as well as direct claims
//               assistance number always with you.
//             </Text>
//           </View>

//           {/* <View style={{ alignSelf: 'center', justifyContent: 'center' }}>
//             <TouchableOpacity
//               onPress={() => downloadECard(Platform.OS == 'ios')}
//             >
//               <Image
//                 source={
//                   Platform.OS == 'android'
//                     ? require('../../../assets/images/google_wallet.png')
//                     : require('../../../assets/images/apple_wallet.png')
//                 }
//                 style={{
//                   width: metrics.screenWidth * 0.85,
//                   height: metrics.screenWidth * 0.15,
//                   resizeMode: 'contain',
//                 }}
//               />
//             </TouchableOpacity>
//           </View> */}
//         </ScrollView>
//       ) : (
//         <View style={styles.noDataFoundContainer}>
//           <NoDataFound
//             title={'No Virtual Card Found'}
//             description={
//               'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
//             }
//           />
//         </View>
//       )}
//       {visible && (
//         <Modal visible={visible} transparent animationType="fade">
//           <Pressable style={styles.overlay} onPress={closeZoom}>
//             <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
//               <QRCode
//                 value={metaData?.virtualCard.urlPath}
//                 size={metrics.screenWidth * 0.8}
//               />
//             </Animated.View>
//           </Pressable>
//         </Modal>
//       )}
//     </AppLayout>
//   );
// };

// export default VirtualCard;

// const styles = StyleSheet.create({
//   card: {
//     // width: metrics.screenWidth * 0.8,
//     height: metrics.screenHeight * 0.3,
//     width: '100%',
//     // height: '100%',
//     borderRadius: 8,
//     alignSelf: 'center',
//     margin: metrics.baseMargin,
//   },
//   backgroundImage: {
//     width: '100%',
//     height: '100%',
//   },
//   overlayContent: {
//     position: 'absolute',
//     bottom: 25,
//     left: 20,
//     width: '60%',
//   },
//   uid: { fontWeight: 'bold', color: '#000' },
//   name: { color: '#000', marginTop: metrics.baseMargin, width: '100%', textTransform: 'capitalize' },
//   dob: { color: '#000', marginVertical: metrics.baseMargin },
//   backContent: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//   },
//   flipBtn: {
//     marginTop: metrics.baseMargin,
//     backgroundColor: '#000',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//     alignSelf: 'center',
//   },
//   flipBtnText: { color: '#fff', fontWeight: '600' },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   qrLarge: {
//     width: metrics.screenWidth * 0.8,
//     height: metrics.screenWidth * 0.8,
//   },
//   noDataFoundContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: metrics.baseMargin,
//     backgroundColor: "white",
//   },
// });
