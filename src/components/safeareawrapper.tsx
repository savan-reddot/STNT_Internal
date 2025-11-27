import React from 'react';
import {
  StyleSheet,
  StatusBar,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppHeader from './header';
import { MD3Theme, useTheme } from 'react-native-paper';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  title?: string;
  right?: any[];
  onBackPress?: () => void;
  headerStyle?: StyleProp<ViewStyle>;
  keyboardOffset?: number;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showHeader = true,
  title,
  right,
  onBackPress,
  headerStyle = {},
  keyboardOffset = 64,
}) => {
  const theme = useTheme();
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.primary}
      />
      {showHeader && (
        <AppHeader
          style={headerStyle}
          title={title}
          right={right}
          onBackPress={onBackPress}
        />
      )}
      <KeyboardAvoidingView
        style={styles(theme).container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {children}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
  });

export default AppLayout;
