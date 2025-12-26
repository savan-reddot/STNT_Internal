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
import Icon from 'react-native-vector-icons/Ionicons';

export const onboardingData = [
  {
    id: '1',
    image: require('../../assets/images/onboard_1.png'),
    title: 'Spiritual Companion',
    description:
      'Your personal guide for a blessed journey, featuring prayer times, Qibla, and daily rituals.',
  },
  {
    id: '2',
    image: require('../../assets/images/onboard_2.png'),
    title: 'Digital E-Visa',
    description:
      'Seamless entry with your digital pass. Keep your visa and insurance details secure in one place.'
  },
  {
    id: '3',
    image: require('../../assets/images/onboard_3.png'),
    title: 'Pilgrim Support',
    description:
      '24/7 Concierge and Mutawwif assistance to guide you through every step of your pilgrimage.'
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
            <View style={styles(theme).imageContainer}>
              <Image source={item.image} style={styles(theme).image} />
            </View>
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
          {currentIndex === onboardingData.length - 1 ? 'GET STARTED' : 'NEXT'}
        </Text>
        <Icon
          name="arrow-forward-outline"
          size={metrics.moderateScale(16)}
          color={theme.colors.background}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles(theme).skipButton} onPress={() => navigation.navigate(Screens.Login)}>
        <Text style={styles(theme).skipButtonText}>
          Skip to Login
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
    imageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: metrics.doubleMargin,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderRadius: metrics.doubleMargin,
      paddingHorizontal: metrics.smallMargin,
      paddingVertical: 25,
      transform: [{ rotate: '03deg' }],

    },
    image: {
      width: metrics.screenWidth * 0.6,
      height: metrics.screenWidth * 0.6,
      resizeMode: 'contain',
      marginBottom: metrics.doubleMargin,
    },
    title: {
      fontSize: metrics.moderateScale(20),
      fontWeight: '700',
      textAlign: 'center',
      color: theme.colors.onBackground,
      marginBottom: metrics.baseMargin,
      fontFamily: Font_Medium,
      marginTop: metrics.doubleMargin,
      textTransform: 'uppercase',
      width: metrics.screenWidth,
    },
    description: {
      fontSize: 14,
      fontWeight: '400',
      color: theme.colors.onBackground,
      textAlign: 'center',
      paddingHorizontal: 30,
      fontFamily: Font_Medium,
      marginTop: metrics.baseRadius,
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
      backgroundColor: "#022c22",
      borderRadius: 24,
      paddingVertical: metrics.doubleMargin,
      paddingHorizontal: metrics.baseMargin,
      alignItems: 'center',
      justifyContent: 'center',
      width: '90%',
      flexDirection: 'row',
      gap: metrics.smallMargin,
      alignSelf: 'center',
    },
    buttonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    skipButton: {
      paddingVertical: metrics.doubleMargin,
      paddingHorizontal: metrics.baseMargin,
      alignItems: 'center',
      width: '90%',
    },
    skipButtonText: {
      color: "#A1A1AA",
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      width: metrics.screenWidth,
      textAlign: 'center',
    },
  });
