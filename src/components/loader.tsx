import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from 'react-native-paper';

const ScreenLoader = ({ visible = false }) => {
  const theme = useTheme();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)', // white transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScreenLoader;
