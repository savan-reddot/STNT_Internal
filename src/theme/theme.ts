import { DarkTheme } from '@react-navigation/native';
import {
  configureFonts,
  DefaultTheme,
  MD2LightTheme,
} from 'react-native-paper';
import fontConfig from './fonts';

export const lightTheme = {
  ...MD2LightTheme,
  fonts: configureFonts({ config: fontConfig, isV3: false }),
  colors: {
    ...DefaultTheme.colors,
    primary: '#219C8E', // Teal
    onPrimary: '#FFFFFF', // White text on teal
    background: '#FFFFFF', // White background
    onBackground: '#000000', // Black text
    surface: '#FFFFFF', // Card/Input background
    text: '#000000', // Main text
    placeholder: '#9CA3AF', // Gray placeholder
    accent: '#1D4ED8', // Link color
    error: '#B00020', // Default error
  },
};

export const darkTheme = {
  ...DarkTheme,
  fonts: configureFonts({ config: fontConfig, isV3: false }),
  colors: {
    ...DarkTheme.colors,
    primary: '#219C8E',
    onPrimary: '#FFFFFF',
    background: '#121212', // Dark background
    onBackground: '#FFFFFF', // White text
    surface: '#1E1E1E', // Card/Input background
    text: '#FFFFFF',
    placeholder: '#A1A1AA', // Light gray
    accent: '#60A5FA', // Lighter blue for links
    error: '#CF6679',
  },
};
