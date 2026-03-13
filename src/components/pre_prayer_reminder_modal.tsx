import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme, MD3Theme } from 'react-native-paper';
import Modal from 'react-native-modal';
import { Font_Bold } from '../theme/fonts';

interface PrePrayerReminderModalProps {
  isVisible: boolean;
  minutes: number;
  onClose: () => void;
  onSave: (minutes: number) => void;
}

const PrePrayerReminderModal = ({
  isVisible,
  minutes,
  onClose,
  onSave,
}: PrePrayerReminderModalProps) => {
  const theme = useTheme();
  const [tempMinutes, setTempMinutes] = useState(minutes.toString());

  useEffect(() => {
    if (isVisible) {
      setTempMinutes(minutes.toString());
    }
  }, [isVisible, minutes]);

  const handleSave = () => {
    const val = parseInt(tempMinutes.replace(/[^0-9]/g, '')) || 10;
    onSave(val);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
      hideModalContentWhileAnimating
      avoidKeyboard
    >
      <View style={styles(theme).modalContainer}>
        <Text style={styles(theme).modalTitle}>SET REMINDER TIME</Text>
        <Text style={styles(theme).modalSubtitle}>
          How many minutes before prayer should we notify you?
        </Text>

        <TextInput
          mode="outlined"
          value={tempMinutes}
          onChangeText={setTempMinutes}
          keyboardType="number-pad"
          placeholder="e.g. 15"
          style={styles(theme).modalInput}
          outlineColor="#10B981"
          activeOutlineColor="#10B981"
          textColor={theme.colors.onSurface}
          autoFocus
        />

        <View style={styles(theme).modalButtons}>
          <Button
            mode="text"
            onPress={onClose}
            textColor="#9CA3AF"
          >
            CANCEL
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles(theme).saveButton}
            labelStyle={{ fontFamily: Font_Bold }}
          >
            SAVE SETTINGS
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default PrePrayerReminderModal;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: theme.colors.surface,
      padding: 25,
      borderRadius: 30,
    },
    modalTitle: {
      fontSize: 16,
      fontFamily: Font_Bold,
      color: theme.colors.onSurface,
      marginBottom: 5,
    },
    modalSubtitle: {
      fontSize: 13,
      color: '#9CA3AF',
      marginBottom: 20,
    },
    modalInput: {
      backgroundColor: theme.colors.surface,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },
    saveButton: {
      backgroundColor: '#10B981',
      borderRadius: 10,
    },
  });
