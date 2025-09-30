import { MD3Theme } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';
import { metrics } from '../utils/metrics';
import { Font_Bold, Font_Medium, Font_Regular } from '../theme/fonts';

const fontStyle = (theme: MD3Theme) =>
  StyleSheet.create({
    titleSmall: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(14),
      letterSpacing: 0.1,
      margin: metrics.baseMargin,
      marginHorizontal: 0,
      color: theme.colors.onBackground,
    },
    titleMedium: {
      fontFamily: Font_Medium,
      fontSize: metrics.moderateScale(14),
      marginHorizontal: metrics.baseMargin,
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
    headingMedium: {
      fontFamily: Font_Bold,
      fontWeight: '700',
      fontSize: metrics.moderateScale(20),
      letterSpacing: 0.2,
      lineHeight: 19.3,
      marginHorizontal: 0,
      color: theme.colors.onBackground,
    },
    titleLarge: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(16),
      letterSpacing: 0,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    titleSemiLarge: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(15),
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    titleExtraLarge: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(25),
      // "letterSpacing": 0,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    labelSmall: {
      fontFamily: Font_Regular,
      fontSize: metrics.moderateScale(10),
      fontWeight: '500',
      letterSpacing: 0.5,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    labelMedium: {
      fontFamily: Font_Regular,
      fontSize: metrics.moderateScale(12),
      fontWeight: '500',
      letterSpacing: 0.5,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    labelLarge: {
      fontFamily: Font_Regular,
      fontSize: metrics.moderateScale(14),
      fontWeight: '500',
      letterSpacing: 0.1,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.onBackground,
    },
    bodySmall: {
      fontFamily: Font_Regular,
      fontSize: metrics.moderateScale(10),
      fontWeight: '400',
      letterSpacing: 0.4,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    bodyMedium: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(11),
      letterSpacing: 0.25,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.onBackground,
    },
    bodyLarge: {
      fontFamily: Font_Bold,
      fontSize: metrics.moderateScale(13),
      fontWeight: undefined,
      letterSpacing: 0.15,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
  });

export default fontStyle;
