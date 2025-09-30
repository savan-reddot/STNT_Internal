import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { MD3Theme, useTheme } from 'react-native-paper';
import {
  requestAppPermission,
  requestCameraPermission,
  requestGalleryPermission,
  requestStoragePermission,
} from '../../utils/permissions';
import { metrics } from '../../utils/metrics';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    const hasPermission = await requestAppPermission('camera');
    if (!hasPermission) return;

    const result = await launchCamera({ mediaType: 'photo' });
    if (result.assets?.[0]) {
      const image = result.assets[0];
      setIsSelectionVisible(false);
      setDocuments(prev => [
        ...prev,
        {
          uri: image.uri,
          name: image.fileName || 'Captured Image',
          type: image.type,
          id: Date.now().toString(),
        },
      ]);
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestAppPermission('gallery');
    console.log(hasPermission);
    if (!hasPermission) return;

    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets?.[0]) {
      const image = result.assets[0];
      setIsSelectionVisible(false);
      setDocuments(prev => [
        ...prev,
        {
          uri: image.uri,
          name: image.fileName || 'Selected Image',
          type: image.type,
          id: Date.now().toString(),
        },
      ]);
    }
  };

  const handleAddDocument = async () => {
    const hasPermission = await requestAppPermission('document');
    console.log('Storage Permission:', hasPermission);
    if (!hasPermission) return;

    try {
      const files = await pick({
        type: [types.pdf, types.images], // accepts PDFs and images
        allowMultiple: false, // or true for multiple selection
      });
      const [file] = files; // destructure single file

      // Optionally copy to local app storage
      const [local] = await keepLocalCopy({
        files: [{ uri: file.uri, fileName: file.name || '' }],
        destination: 'documentDirectory',
      });

      setIsSelectionVisible(false);
      // now local.uri points to a local stored file
      setDocuments(prev => [
        ...prev,
        {
          uri: local?.uri ?? file.uri,
          name: file.name,
          type: file.type,
          size: file.size,
          id: Date.now().toString(),
        },
      ]);
    } catch (err) {
      console.warn('Picker error', err);
    }
  };

  const handleRemove = id => {
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
            borderColor: '#ccc',
            padding: metrics.doubleMargin,
            paddingBottom: 0,
          }}
        >
          <Icon onPress={onDismiss} name="close" size={24} color={'grey'} />
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
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderRadius: metrics.baseRadius,
                  padding: metrics.baseMargin * 1.5,
                  marginTop: 0,
                  alignItems: 'center',
                },
              ]}
              onPress={() => setIsSelectionVisible(false)}
            >
              <Text style={[styles(theme).optionText, { fontWeight: '500' }]}>
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
      height: '95%',
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    modal: {
      justifyContent: 'flex-end',
      // margin: 0,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: metrics.baseMargin * 1.5,
    },
    uploadBox: {
      margin: metrics.baseMargin * 1.5,
      padding: metrics.baseMargin * 1.5,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#F5F5F5',
      borderStyle: 'dashed',
      borderRadius: metrics.baseRadius,
      alignItems: 'center',
      marginBottom: metrics.baseMargin * 1.5,
      width: '100%',
    },
    uploadText: { color: '#007aff', fontWeight: 'bold' },
    supportText: {
      fontSize: 12,
      color: '#717171',
    },
    docItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: metrics.baseMargin * 1.5,
      margin: metrics.baseMargin,
      borderRadius: metrics.baseRadius,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#F5F5F5',
    },
    docName: { fontWeight: '600' },
    docDate: {
      fontSize: metrics.moderateScale(12),
      color: '#777',
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
      color: theme.colors.background,
      marginLeft: metrics.baseMargin / 2,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: metrics.baseMargin * 1.5,
      borderRadius: metrics.baseRadius,
      alignItems: 'center',
      marginTop: metrics.baseMargin * 2,
    },
    saveText: { color: theme.colors.background, fontWeight: 'bold' },
    innerModal: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    },
    seprator: {
      width: '100%',
      height: 0.7,
      backgroundColor: 'rgb(190,190,190)',
      marginTop: metrics.baseMargin,
    },
  });
