import React from 'react';
import { View, Text } from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { metrics } from './metrics';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: 'green',
        backgroundColor: '#e6ffee',
        padding: 10,
        borderRadius: 8,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16, // Custom font size
        fontWeight: 'bold',
        color: 'green', // Custom text color
      }}
      text2Style={{
        fontSize: 14,
        color: '#333',
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text2NumberOfLines={3}
      style={{
        borderLeftColor: 'red',
        backgroundColor: '#ffe6e6',
        padding: 10,
        borderRadius: 8,
      }}
      text1Style={{
        fontSize: 14,
        color: 'red',
      }}
      text2Style={{
        fontSize: 15,
        color: '#333',
      }}
    />
  ),

  // You can add more types (info, warning, etc.)
};
