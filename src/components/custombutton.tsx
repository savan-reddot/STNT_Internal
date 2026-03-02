import { Text } from './common';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import React from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';

interface UType {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const UButton = ({ title = '', onPress, style, textStyle }: UType) => {
  const theme = useTheme();
  return (
    <Pressable style={[styles(theme).button, style]} onPress={onPress}>
      <Text style={[styles(theme).buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
};

export default UButton;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      marginVertical: metrics.baseMargin,
      borderRadius: metrics.baseRadius,
      paddingVertical: metrics.doubleMargin,
      paddingHorizontal: metrics.baseMargin,
      alignItems: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
