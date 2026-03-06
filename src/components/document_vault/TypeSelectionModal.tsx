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

interface TypeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  uploadedDocData: any;
  docTypes: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
  otherType: string;
  onOtherTypeChange: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const TypeSelectionModal: React.FC<TypeSelectionModalProps> = ({
  visible,
  onClose,
  uploadedDocData,
  docTypes,
  selectedType,
  onSelectType,
  otherType,
  onOtherTypeChange,
  onSave,
  isSaving,
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
              <Text style={styles.modalTitle}>File Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fileNameText}>
              Filename:{' '}
              <Text
                style={{
                  fontWeight: '700',
                  color: theme.dark ? '#F8FAFC' : '#1E293B',
                }}
              >
                {decodeURIComponent(uploadedDocData?.filename)}
              </Text>
            </Text>

            <Text style={styles.selectTypeLabel}>Select Document Type:</Text>

            <View style={styles.typesGrid}>
              {docTypes.map(type => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      isSelected && styles.typeOptionSelected,
                    ]}
                    onPress={() => onSelectType(type)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        isSelected && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedType === 'other' && (
              <TextInput
                style={styles.otherInput}
                placeholder="Enter document type..."
                placeholderTextColor="#94A3B8"
                value={otherType}
                onChangeText={onOtherTypeChange}
              />
            )}

            <TouchableOpacity
              style={[styles.modalUploadButton, isSaving && { opacity: 0.7 }]}
              onPress={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalUploadButtonText}>Save Details</Text>
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
    fileNameText: {
      fontSize: 14,
      color: theme.dark ? '#94A3B8' : '#64748B',
      marginBottom: 24,
    },
    selectTypeLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#F8FAFC' : '#1E293B',
      marginBottom: 12,
    },
    typesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    typeOption: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#334155' : '#F1F5F9',
      marginRight: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.dark ? '#334155' : '#F1F5F9',
    },
    typeOptionSelected: {
      backgroundColor: '#0E7A68',
      borderColor: '#0E7A68',
    },
    typeOptionText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.dark ? '#94A3B8' : '#64748B',
    },
    typeOptionTextSelected: {
      color: '#fff',
    },
    otherInput: {
      borderWidth: 1,
      borderColor: theme.dark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      padding: 12,
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

export default TypeSelectionModal;
