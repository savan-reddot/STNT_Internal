import { Text } from '../../components/common';
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MD3Theme, useTheme } from 'react-native-paper';
import { requestAppPermission } from '../../utils/permissions';
import { metrics } from '../../utils/metrics';
import Modal from 'react-native-modal';
import fontStyle from '../../styles/fontStyle';
import { Font_Medium } from '../../theme/fonts';

const formatDate = (date: any) => {
  const d = new Date(date);
  return (
    d.toDateString() +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
};

interface type {
  onSave: (files: any[]) => void;
  isVisible: boolean;
  details?: any; // Optional, if you want to pass additional details
  snapPoints?: string[] | number[];
  onDismiss?: (() => void) | undefined;
}

const UploadDocuments = ({ onSave, isVisible, details, onDismiss }: type) => {
  const theme = useTheme();
  const [isSelectionVisible, setIsSelectionVisible] = useState<boolean>(false);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (details?.files) {
      setDocuments(details.files);
    }
  }, [details?.files]);

  const handleCameraCapture = async () => {
    try {
      const hasPermission = await requestAppPermission('camera');
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to take pictures.',
          [{ text: 'OK' }],
        );
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2048,
        maxHeight: 2048,
      });

      if (result.didCancel) {
        console.log('User canceled camera');
        return;
      }

      if (result.errorMessage) {
        console.error('Camera error:', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage);
        return;
      }

      if (result.assets?.[0]) {
        const image = result.assets[0];
        setIsSelectionVisible(false);
        setDocuments(prev => [
          ...prev,
          {
            uri: image.uri,
            name: image.fileName || 'Captured Image',
            type: image.type,
            size: image.fileSize,
            id: Date.now().toString(),
          },
        ]);
        console.log('Image captured successfully:', image.fileName);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImagePicker = async () => {
    try {
      const hasPermission = await requestAppPermission('gallery');
      console.log('Gallery Permission:', hasPermission);
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant gallery permission to select images.',
          [{ text: 'OK' }],
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        // Use Android Photo Picker for Android 13+ (API 33+)
        selectionLimit: 1,
        includeBase64: false,
        quality: 0.8,
        maxWidth: 2048,
        maxHeight: 2048,
        // This enables the new Android Photo Picker
        presentationStyle: 'pageSheet',
      });

      if (result.didCancel) {
        console.log('User canceled image picker');
        return;
      }

      if (result.errorMessage) {
        console.error('Image picker error:', result.errorMessage);
        Alert.alert('Gallery Error', result.errorMessage);
        return;
      }

      if (result.assets?.[0]) {
        const image = result.assets[0];
        setIsSelectionVisible(false);
        setDocuments(prev => [
          ...prev,
          {
            uri: image.uri,
            name: image.fileName || 'Selected Image',
            type: image.type,
            size: image.fileSize,
            id: Date.now().toString(),
          },
        ]);
        console.log('Image selected successfully:', image.fileName);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleAddDocument = async () => {
    try {
      const hasPermission = await requestAppPermission('document');
      console.log('Document Permission:', hasPermission);

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant file access permission to upload documents.',
          [{ text: 'OK' }],
        );
        return;
      }

      const files = await pick({
        type: [types.pdf, types.images], // accepts PDFs and images
        allowMultiple: false, // or true for multiple selection
      });

      if (!files || files.length === 0) {
        console.log('No files selected');
        return;
      }

      const [file] = files; // destructure single file

      if (!file || !file.uri) {
        Alert.alert(
          'Error',
          'Failed to get file information. Please try again.',
        );
        return;
      }

      // Check file size (4.5 MB limit)
      const maxSize = 4.5 * 1024 * 1024; // 4.5 MB in bytes
      if (file.size && file.size > maxSize) {
        Alert.alert(
          'File Too Large',
          'The selected file is larger than 4.5 MB. Please choose a smaller file.',
          [{ text: 'OK' }],
        );
        return;
      }

      // Optionally copy to local app storage
      let localUri = file.uri;
      try {
        const [local] = await keepLocalCopy({
          files: [{ uri: file.uri, fileName: file.name || '' }],
          destination: 'documentDirectory',
        });
        // Check if the copy was successful and use the local URI
        if (local && 'localUri' in local) {
          localUri = local.localUri;
        } else if (local && 'sourceUri' in local) {
          localUri = local.sourceUri;
        }
      } catch (copyError) {
        console.warn(
          'Failed to copy file locally, using original URI:',
          copyError,
        );
        // Continue with original URI if local copy fails
      }

      setIsSelectionVisible(false);
      setDocuments(prev => [
        ...prev,
        {
          uri: localUri,
          name: file.name || 'Document',
          type: file.type || 'application/octet-stream',
          size: file.size,
          id: Date.now().toString(),
        },
      ]);
      console.log('Document added successfully:', file.name);
    } catch (err: any) {
      console.log('Document picker error:', err);
    }
  };

  const handleRemove = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSave = () => {
    onSave(documents);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles(theme).docItem}>
      {item &&
      item?.uri &&
      item?.type &&
      item?.type.toLowerCase() !== 'application/pdf' ? (
        <Image
          source={{ uri: item?.uri }}
          style={{
            height: metrics.screenWidth * 0.25,
            width: metrics.screenWidth * 0.25,
            resizeMode: 'contain',
            borderRadius: metrics.baseRadius,
          }}
        />
      ) : item && item?.uri ? (
        <Image
          source={{ uri: item?.uri }}
          style={{
            height: metrics.screenWidth * 0.25,
            width: metrics.screenWidth * 0.25,
            resizeMode: 'contain',
            borderRadius: metrics.baseRadius,
          }}
        />
      ) : (
        <Image
          source={require('../../../assets/images/file-upload-fill.png')}
          style={{
            height: metrics.screenWidth * 0.08,
            width: metrics.screenWidth * 0.08,
          }}
        />
      )}
      <View style={{ flex: 1, marginLeft: 8 }}>
        <Text
          style={[
            fontStyle(theme).headingSmall,
            {
              fontSize: metrics.moderateScale(14),
              fontWeight: '400',
              margin: 0,
            },
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles(theme).docDate}>
          {formatDate(item?.modificationDate || Date.now())}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)}>
        <Icon name="close" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        setDocuments([]);
        onDismiss && onDismiss();
      }}
      onDismiss={() => {
        setDocuments([]);
        onDismiss && onDismiss();
      }}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles(theme).container}>
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 0.7,
            borderColor: theme.dark ? '#444' : '#ccc',
            padding: metrics.doubleMargin,
            paddingBottom: 0,
          }}
        >
          <Icon
            onPress={onDismiss}
            name="close"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles(theme).title,
              {
                alignSelf: 'center',
                flex: 1,
                textAlign: 'center',
                marginLeft: -10,
              },
            ]}
          >
            Upload Document
          </Text>
        </View>
        <View
          style={{ flex: 1, padding: metrics.baseMargin * 1.5, paddingTop: 0 }}
        >
          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                margin: metrics.baseMargin,
                fontSize: metrics.moderateScale(14),
                fontWeight: '400',
              },
            ]}
          >
            {details?.title}
            <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              margin: metrics.baseMargin,
              marginVertical: 0,
            }}
            onPress={() => setIsSelectionVisible(true)}
          >
            <View style={styles(theme).uploadBox}>
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                {/* <TouchableOpacity
                onPress={handleCameraCapture}
                style={{
                  alignItems: 'center',
                  marginHorizontal: metrics.doubleMargin,
                }}
              >
                <Icon
                  name="camera-enhance"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles(theme).uploadText}>Camera</Text>
              </TouchableOpacity> */}
                {/* <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={handleImagePicker}
              >
                <Icon
                  name="insert-photo"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles(theme).uploadText}>Photos</Text>
              </TouchableOpacity> */}

                <Text style={styles(theme).uploadText}>Upload</Text>
              </View>

              <Text
                style={[
                  styles(theme).supportText,
                  { marginTop: metrics.baseMargin / 2 },
                ]}
              >
                Upload files as JPG, PDF, or PNG.
              </Text>
              <Text style={styles(theme).supportText}>
                The total size can't exceed 4.5 MB
              </Text>
            </View>
          </TouchableOpacity>
          <FlatList
            data={documents}
            keyExtractor={item => item.id}
            renderItem={renderItem}
          />

          {/* <View style={styles(theme).buttonRow}>
            <TouchableOpacity
              onPress={handleCameraCapture}
              style={styles(theme).actionButton}
            >
              <Icon name="photo-camera" size={20} color="white" />
              <Text style={styles(theme).buttonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={styles(theme).actionButton}
            >
              <Icon name="image" size={20} color="white" />
              <Text style={styles(theme).buttonText}>Gallery</Text>
            </TouchableOpacity>
          </View> */}

          <TouchableOpacity
            onPress={handleSave}
            style={styles(theme).saveButton}
          >
            <Text style={styles(theme).saveText}>Save</Text>
          </TouchableOpacity>
        </View>
        {isSelectionVisible && (
          <Modal
            isVisible={isSelectionVisible}
            onBackdropPress={() => setIsSelectionVisible(false)}
            style={styles(theme).modal}
          >
            <View style={styles(theme).innerModal}>
              <TouchableOpacity
                style={[
                  styles(theme).optionButton,
                  { paddingTop: metrics.baseMargin * 2 },
                ]}
                onPress={() => handleCameraCapture()}
              >
                <Text style={styles(theme).optionText}>Take a picture</Text>
              </TouchableOpacity>

              <View style={styles(theme).seprator} />

              <TouchableOpacity
                style={styles(theme).optionButton}
                onPress={() => handleImagePicker()}
              >
                <Text style={styles(theme).optionText}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>

              <View style={styles(theme).seprator} />

              <TouchableOpacity
                style={styles(theme).optionButton}
                onPress={() => handleAddDocument()}
              >
                <Text style={styles(theme).optionText}>Upload File</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles(theme).innerModal,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: metrics.baseRadius,
                  padding: metrics.baseMargin * 1.5,
                  marginTop: 0,
                  alignItems: 'center',
                },
              ]}
              onPress={() => setIsSelectionVisible(false)}
            >
              <Text
                style={[
                  styles(theme).optionText,
                  { fontWeight: '500', color: theme.colors.primary },
                ]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

export default UploadDocuments;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: '90%',
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: metrics.baseMargin * 1.5,
      color: theme.colors.onSurface,
    },
    uploadBox: {
      margin: metrics.baseMargin * 1.5,
      padding: metrics.baseMargin * 1.5,
      borderWidth: 1,
      borderColor: theme.dark ? '#444' : '#ccc',
      backgroundColor: theme.colors.surface,
      borderStyle: 'dashed',
      borderRadius: metrics.baseRadius,
      alignItems: 'center',
      marginBottom: metrics.baseMargin * 1.5,
      width: '100%',
    },
    uploadText: { color: theme.colors.primary, fontWeight: 'bold' },
    supportText: {
      fontSize: 12,
      color: (theme.colors as any).onSurfaceVariant || '#717171',
    },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: metrics.baseMargin * 1.5,
      margin: metrics.baseMargin,
      borderRadius: metrics.baseRadius,
      borderWidth: 1,
      borderColor: theme.dark ? '#444' : '#ccc',
      backgroundColor: theme.colors.surface,
    },
    docName: { fontWeight: '600', color: theme.colors.onSurface },
    docDate: {
      fontSize: metrics.moderateScale(12),
      color: (theme.colors as any).onSurfaceVariant || '#777',
      lineHeight: metrics.moderateScale(16),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: metrics.baseMargin * 1.5,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      padding: metrics.baseMargin,
      borderRadius: metrics.baseRadius,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      marginLeft: metrics.baseMargin / 2,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: metrics.baseMargin * 1.5,
      borderRadius: metrics.baseRadius,
      alignItems: 'center',
      marginTop: metrics.baseMargin * 2,
    },
    saveText: { color: theme.colors.onPrimary, fontWeight: 'bold' },
    innerModal: {
      backgroundColor: theme.colors.surface,
      borderRadius: metrics.baseRadius,
      margin: metrics.baseMargin,
    },
    optionButton: {
      padding: metrics.baseMargin * 2,
      alignSelf: 'center',
    },
    optionText: {
      fontSize: metrics.moderateScale(16),
      fontFamily: Font_Medium,
      marginHorizontal: metrics.baseMargin,
      color: theme.colors.primary,
    },
    seprator: {
      width: '100%',
      height: 0.7,
      backgroundColor: theme.dark ? '#444' : 'rgb(190,190,190)',
      marginTop: metrics.baseMargin,
    },
  });
