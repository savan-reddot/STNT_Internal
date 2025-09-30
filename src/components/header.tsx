import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { MD3Theme, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure you installed react-native-vector-icons
import { metrics } from '../utils/metrics';
import { Font_Bold } from '../theme/fonts';

interface AppHeaderProps {
  title?: string;
  right?: any[];
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'App',
  onBackPress,
  right,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles(theme).header,
        style,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {onBackPress ? (
        <TouchableOpacity
          style={styles(theme).iconButton}
          onPress={onBackPress}
        >
          <Icon
            name="chevron-back-outline"
            size={metrics.moderateScale(30)}
            color={theme.colors.background}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles(theme).iconButton} />
      )}
      <Text
        style={[
          styles(theme).title,
          { marginEnd: !right ? metrics.doubleMargin * 2.5 : 0 },
        ]}
      >
        {title}
      </Text>
      {right && right}
    </View>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    header: {
      //   height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: metrics.baseMargin,
      paddingBottom: metrics.baseMargin * 1.5,
      backgroundColor: theme.colors.primary,
    },
    iconButton: { width: 40, alignItems: 'center', justifyContent: 'flex-end' },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.background,
      fontFamily: Font_Bold,
      marginTop: metrics.baseMargin,
      flex: 1,
      textAlign: 'center',
    },
  });

export default AppHeader;
