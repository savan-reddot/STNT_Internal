import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { metrics } from '../utils/metrics';
import { MD3Theme, useTheme } from 'react-native-paper';
import { globalStyle } from '../utils/globalStyles';
import { Font_Medium } from '../theme/fonts';
import { Screens } from '../common/screens';

export const onboardingData = [
  {
    id: '1',
    image: require('../../assets/images/onboard_1.png'),
    title: 'Plan & Travel with Confidence',
    description:
      'Access your Umrah travel details, bookings, and tips in real-time.',
  },
  {
    id: '2',
    image: require('../../assets/images/onboard_2.png'),
    title: 'Protect Your Journey, Stay Secure',
    description:
      'Get Umrah insurance instantly and find trusted hospitals near you',
  },
  {
    id: '3',
    image: require('../../assets/images/onboard_3.png'),
    title: 'All Your Travel Docs, Secured',
    description:
      'Securely access your ePass, insurance, and ID anytime, anywhere',
  },
];

const Onboard = ({ navigation }: any) => {
  const theme = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace(Screens.Login); // Navigate to Login or Home
    }
  };
  return (
    <View style={[globalStyle(theme).container, styles(theme).container]}>
      <FlatList
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles(theme).slide]}>
            <Image source={item.image} style={styles(theme).image} />
            <Text style={styles(theme).title}>{item.title}</Text>
            <Text style={styles(theme).description}>{item.description}</Text>
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={flatListRef}
      />

      {/* Pagination Dots */}
      <View style={styles(theme).pagination}>
        {onboardingData.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (i - 1) * metrics.screenWidth,
              i * metrics.screenWidth,
              (i + 1) * metrics.screenWidth,
            ],
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles(theme).dot, { width: dotWidth }]}
            />
          );
        })}
      </View>

      {/* Button */}
      <TouchableOpacity style={styles(theme).button} onPress={handleNext}>
        <Text style={styles(theme).buttonText}>
          {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboard;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: metrics.doubleMargin,
      paddingHorizontal: 0,
    },
    slide: {
      width: metrics.screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
      // paddingHorizontal: metrics.baseMargin,
      // backgroundColor: 'red',
    },
    image: {
      width: metrics.screenWidth * 0.6,
      height: metrics.screenWidth * 0.6,
      resizeMode: 'contain',
      marginBottom: metrics.doubleMargin,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      color: theme.colors.onBackground,
      marginBottom: metrics.baseMargin,
      fontFamily: Font_Medium,
    },
    description: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.onBackground,
      textAlign: 'center',
      paddingHorizontal: metrics.doubleMargin,
      fontFamily: Font_Medium,
    },
    pagination: {
      flexDirection: 'row',
      marginBottom: metrics.doubleMargin,
      marginTop: metrics.baseMargin,
    },
    dot: {
      height: metrics.baseMargin,
      borderRadius: metrics.baseMargin / 2,
      backgroundColor: theme.colors.primary,
      marginHorizontal: 4,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: metrics.baseRadius,
      paddingVertical: metrics.doubleMargin,
      paddingHorizontal: metrics.baseMargin,
      //   position: 'absolute',
      alignItems: 'center',
      //   bottom: 40,
      width: '90%',
    },
    buttonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
