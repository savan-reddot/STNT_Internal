import { Text, TextInput } from '../common';
import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, MD3Theme } from 'react-native-paper';

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  editName: string;
  onNameChange: (text: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  title?: string;
  submitText?: string;
}

const EditNameModal: React.FC<EditNameModalProps> = ({
  visible,
  onClose,
  editName,
  onNameChange,
  onUpdate,
  isUpdating,
  title = 'Edit Document Name',
  submitText = 'Update Name',
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectTypeLabel}>New Filename:</Text>
            <TextInput
              style={styles.otherInput}
              placeholder="Enter document name..."
              placeholderTextColor="#94A3B8"
              value={editName}
              onChangeText={onNameChange}
            />

            <TouchableOpacity
              style={[styles.modalUploadButton, isUpdating && { opacity: 0.7 }]}
              onPress={onUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalUploadButtonText}>{submitText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.dark ? '#1E293B' : '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.dark ? '#F8FAFC' : '#1E293B',
    },
    selectTypeLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#F8FAFC' : '#1E293B',
      marginBottom: 12,
    },
    otherInput: {
      borderWidth: 1,
      borderColor: theme.dark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      fontSize: 14,
      color: theme.dark ? '#F8FAFC' : '#1E293B',
      marginBottom: 16,
      backgroundColor: theme.dark ? theme.colors.background : '#F8FAFC',
    },
    modalUploadButton: {
      backgroundColor: theme.dark ? '#334155' : '#0F172A',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    modalUploadButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default EditNameModal;
