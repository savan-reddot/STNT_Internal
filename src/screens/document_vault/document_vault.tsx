import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
  KeyboardAvoidingView,
  ActionSheetIOS,
} from 'react-native';
import { Text } from '../../components/common';
import TypeSelectionModal from '../../components/document_vault/TypeSelectionModal';
import EditNameModal from '../../components/document_vault/EditNameModal';
import NativeActionSheet, {
  NativeActionSheetRef,
} from '../../components/common/NativeActionSheet';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import RNImageToPdf from 'react-native-image-to-pdf';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import {
  useDocument_vault_uploadMutation,
  useCreate_document_vaultMutation,
  useLazyGet_all_documentsQuery,
  useDelete_document_vaultMutation,
  useUpdate_document_vaultMutation,
} from '../../redux/services';
import AppLayout from '../../components/safeareawrapper';
import { useTheme, MD3Theme } from 'react-native-paper';
import { Screens } from '../../common/screens';

const DocumentVault = ({ navigation }: any) => {
  const actionSheetRef = React.useRef<NativeActionSheetRef>(null);
  const theme = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState('ALL');

  const [getAllDocuments, { isLoading: isListLoading }] =
    useLazyGet_all_documentsQuery();
  const [uploadDocumentVault, { isLoading: isUploading }] =
    useDocument_vault_uploadMutation();
  const [createDocumentVault, { isLoading: isCreating }] =
    useCreate_document_vaultMutation();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDelete_document_vaultMutation();
  const [updateDocument, { isLoading: isUpdatingName }] =
    useUpdate_document_vaultMutation();

  const [documents, setDocuments] = useState<any[]>([]);
  const [dynamicTabs, setDynamicTabs] = useState<string[]>(['ALL']);

  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadedDocData, setUploadedDocData] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [otherType, setOtherType] = useState<string>('');
  const [pendingFile, setPendingFile] = useState<any>(null);

  const docTypes = [
    'identity',
    'travel',
    'medical',
    'ticket',
    'finance',
    'other',
  ];

  const fetchDocuments = React.useCallback(async () => {
    try {
      const res = await getAllDocuments({}).unwrap();
      if (res?.success && res?.data?.rows) {
        const docs = res.data.rows;
        setDocuments(docs);

        // Build dynamic tabs from tags
        const allTags = new Set(['ALL']);
        docs.forEach((doc: any) => {
          if (doc.tags && Array.isArray(doc.tags)) {
            doc.tags.forEach((tag: string) => {
              allTags.add(tag.toUpperCase());
            });
          }
        });
        setDynamicTabs(Array.from(allTags));
      }
    } catch (e) {
      console.log('Fetch docs error', e);
    }
  }, [getAllDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      return result === RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    }
  };

  const handleScanPaper = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      try {
        const { scannedImages } = await DocumentScanner.scanDocument();
        console.log('scannedImages', scannedImages);
        if (scannedImages && scannedImages.length > 0) {
          try {
            const options = {
              imagePaths: scannedImages.map(img => img.replace('file://', '')),
              name: `scan_${Date.now()}`,
              quality: 0.8,
            };

            const pdf = await RNImageToPdf.createPDFbyImages(options);
            console.log('pdf output', pdf);

            setPendingFile({
              uri:
                Platform.OS === 'android'
                  ? `file://${pdf.filePath}`
                  : pdf.filePath,
              type: 'application/pdf',
            });
            setEditName(''); // blank as requested
            setEditingDoc(null);
            setShowEditModal(true);
          } catch (pdfErr) {
            console.log('PDF Conversion error:', pdfErr);
            showErrorToast('Failed to generate PDF from scan');
          }
        }
      } catch (e: any) {
        showErrorToast(e?.data?.errorMessage || 'Upload failed try again.');
        console.log('Scanner error:', e);
      }
    } else {
      showErrorToast('Camera permission denied');
    }
  };

  const handleUploadFile = async () => {
    try {
      const files = await pick({
        type: [types.pdf, types.images],
        allowMultiple: false,
      });

      if (!files || files.length === 0) {
        return;
      }

      const [file] = files;
      if (!file || !file.uri) {
        showErrorToast('Could not retrieve file details');
        return;
      }

      const maxSize = 4.5 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        showErrorToast('File is too large (max 4.5MB)');
        return;
      }

      let localUri = file.uri;
      try {
        const [local] = await keepLocalCopy({
          files: [{ uri: file.uri, fileName: file.name || '' }],
          destination: 'documentDirectory',
        });
        if (local && 'localUri' in local) {
          localUri = local.localUri;
        } else if (local && 'sourceUri' in local) {
          localUri = local.sourceUri;
        }
      } catch (copyError) {
        console.warn('Failed to copy file locally:', copyError);
      }

      let uploadUri = localUri;
      let uploadType = file.type || 'application/pdf';
      const baseName = file.name
        ? file.name.replace(/\.[^/.]+$/, '')
        : `file_${Date.now()}`;

      if (file.type && file.type.startsWith('image/')) {
        try {
          const options = {
            imagePaths: [localUri.replace('file://', '')],
            name: baseName,
            quality: 0.8,
          };
          const pdf = await RNImageToPdf.createPDFbyImages(options);

          uploadUri =
            Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath;
          uploadType = 'application/pdf';
        } catch (pdfErr) {
          console.log('PDF Conversion error in Picker:', pdfErr);
          showErrorToast('Failed to generate PDF from image');
          return;
        }
      }

      setPendingFile({
        uri: uploadUri,
        type: uploadType,
      });
      setEditName(baseName);
      setEditingDoc(null);
      setShowEditModal(true);
    } catch (e: any) {
      console.log('Document picker error:', e);
    }
  };

  const handleCreateDocument = async () => {
    if (!selectedType) {
      showErrorToast('Please select a document type');
      return;
    }
    const finalType = selectedType === 'other' ? otherType : selectedType;
    if (selectedType === 'other' && !finalType.trim()) {
      showErrorToast('Please enter document type');
      return;
    }

    try {
      const payload = {
        document_url: uploadedDocData.document_url,
        document_name: uploadedDocData.filename,
        tags: [finalType],
      };
      const res = await createDocumentVault(payload).unwrap();
      console.log('createDocumentVault==>', res);
      if (res?.success) {
        showSuccessToast('Document uploaded successfully');
        setShowTypeModal(false);
        fetchDocuments(); // Refresh the list
      } else {
        showErrorToast('Failed to save document info');
      }
    } catch (e) {
      console.log('Create doc error:', e);
      showErrorToast('An error occurred');
    }
  };

  const handleDeleteFile = (id: string | number) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteDocument(id).unwrap();
              if (res?.success) {
                showSuccessToast('Document deleted successfully');
                fetchDocuments();
              } else {
                showErrorToast('Failed to delete document');
              }
            } catch (e) {
              console.log('Delete doc error:', e);
              showErrorToast('An error occurred');
            }
          },
        },
      ],
    );
  };

  const handleUpdateDocument = async () => {
    if (!editName.trim()) {
      showErrorToast('Please enter document name');
      return;
    }
    try {
      const payload = {
        document_url: editingDoc.document_url,
        document_name: editName,
        tags: editingDoc.tags,
      };
      const res = await updateDocument({
        request: payload,
        id: editingDoc.id,
      }).unwrap();
      if (res?.success) {
        showSuccessToast('Document updated successfully');
        setShowEditModal(false);
        fetchDocuments();
      } else {
        showErrorToast('Failed to update document');
      }
    } catch (e) {
      console.log('Update doc error:', e);
      showErrorToast('An error occurred');
    }
  };

  const handleUploadNamedFile = async () => {
    if (!editName.trim()) {
      showErrorToast('Please enter document name');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri:
          Platform.OS === 'android'
            ? pendingFile.uri
            : pendingFile.uri.replace('file://', ''),
        type: pendingFile.type,
        name: editName.toLowerCase().endsWith('.pdf')
          ? editName
          : `${editName}.pdf`,
      });

      const uploadRes = await uploadDocumentVault(formData).unwrap();
      console.log('uploadRes', uploadRes);
      if (uploadRes?.status) {
        setUploadedDocData(uploadRes.data);
        setSelectedType('');
        setOtherType('');
        setShowEditModal(false);
        setShowTypeModal(true);
      } else {
        showErrorToast('Upload failed.');
      }
    } catch (e: any) {
      showErrorToast(e?.data?.errorMessage || 'Upload failed try again.');
      console.log('Upload error:', e);
    }
  };

  const showFileActions = (file: any) => {
    setSelectedFile(file); // Store selected file for Android bottom sheet
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            'Cancel',
            'Download Document',
            'Edit Name',
            'Delete Document',
          ],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: decodeURIComponent(file.document_name),
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleDownload(file);
          } else if (buttonIndex === 2) {
            handleEdit(file);
          } else if (buttonIndex === 3) {
            handleDeleteFile(file.id);
          }
        },
      );
    } else {
      actionSheetRef.current?.present();
    }
  };

  const handleDownload = (file: any) => {
    if (file.document_url) {
      Linking.openURL(file.document_url).catch(() => {
        showErrorToast('Could not download document');
      });
    }
  };

  const handleEdit = (file: any) => {
    setEditingDoc(file);
    setEditName(decodeURIComponent(file.document_name));
    setShowEditModal(true);
  };

  const [selectedFile, setSelectedFile] = useState<any>(null);

  const androidActionOptions = useMemo(() => {
    if (!selectedFile) return [];
    return [
      {
        label: 'Download Document',
        icon: 'download-outline',
        onPress: () => handleDownload(selectedFile),
      },
      {
        label: 'Edit Name',
        icon: 'pencil-outline',
        onPress: () => handleEdit(selectedFile),
      },
      {
        label: 'Delete Document',
        icon: 'trash-outline',
        onPress: () => handleDeleteFile(selectedFile.id),
        destructive: true,
      },
    ];
  }, [selectedFile]);

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'ALL') return true;
    if (!doc.tags || !Array.isArray(doc.tags)) return false;
    return doc.tags.map((t: string) => t.toUpperCase()).includes(activeTab);
  });

  return (
    <AppLayout title={'Document Vault'} onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* BANNER */}
          <View style={styles.banner}>
            <View style={styles.bannerIconContainer}>
              <Icon name="lock-closed-outline" size={24} color="#0E7A68" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>ENCRYPTED VAULT</Text>
              <Text style={styles.bannerSubtitle}>
                LOCAL STORAGE WITH AES-256 LEVEL PROTECTION. YOUR PRIVACY IS OUR
                PRIORITY.
              </Text>
            </View>
          </View>

          {/* ACTION CARDS */}
          <View style={styles.actionCardsRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardScan]}
              onPress={handleScanPaper}
            >
              <View style={styles.actionIconUpload}>
                <Icon
                  name="camera-outline"
                  size={28}
                  color={theme.dark ? '#1E293B' : '#fff'}
                />
              </View>
              <Text style={styles.actionTitleScan}>SCAN PAPER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardUpload]}
              onPress={handleUploadFile}
            >
              <View style={styles.actionIconUploadBox}>
                <Icon
                  name="cloud-upload-outline"
                  size={28}
                  color={theme.dark ? '#94A3B8' : '#1E293B'}
                />
              </View>
              <Text style={styles.actionTitleUpload}>UPLOAD FILE</Text>
            </TouchableOpacity>
          </View>

          {/* TABS */}
          <View style={styles.tabsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dynamicTabs.map((tab, index) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tabButton,
                      isActive && styles.tabButtonActive,
                    ]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text
                      style={[styles.tabText, isActive && styles.tabTextActive]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* RECENT FILES */}
          <View style={styles.recentFilesSection}>
            <Text style={styles.recentFilesTitle}>RECENT FILES</Text>

            {isListLoading ? (
              <ActivityIndicator
                size="large"
                color="#0E7A68"
                style={{ marginTop: 20 }}
              />
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((file: any) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileCard}
                  onPress={() =>
                    navigation.navigate(Screens.WebView, {
                      url: file?.document_url,
                      title: decodeURIComponent(file?.document_name),
                    })
                  }
                >
                  <View style={styles.fileIconBox}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color="#64748B"
                    />
                    <View style={styles.checkBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={16}
                        color="#10B981"
                      />
                    </View>
                  </View>

                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>
                      {decodeURIComponent(file.document_name)}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {new Date(file.createdAt || Date.now())
                        .toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        .toUpperCase()}
                      • {file.tags?.join(', ')?.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => showFileActions(file)}
                  >
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      size={24}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.dark ? '#94A3B8' : '#94A3B8',
                  marginTop: 20,
                }}
              >
                No documents found
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* OVERLAYS FOR LOADING / MODALS */}
      {(isUploading || isDeleting) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>
            {isUploading ? 'Uploading document...' : 'Deleting document...'}
          </Text>
        </View>
      )}

      <TypeSelectionModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        uploadedDocData={uploadedDocData}
        docTypes={docTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        otherType={otherType}
        onOtherTypeChange={setOtherType}
        onSave={handleCreateDocument}
        isSaving={isCreating}
      />

      <EditNameModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        editName={editName}
        onNameChange={setEditName}
        onUpdate={editingDoc ? handleUpdateDocument : handleUploadNamedFile}
        isUpdating={editingDoc ? isUpdatingName : isUploading}
        title={editingDoc ? 'Edit Document Name' : 'Name Your Document'}
        submitText={editingDoc ? 'Update Name' : 'Continue'}
      />

      <NativeActionSheet
        ref={actionSheetRef}
        title={
          selectedFile?.document_name
            ? decodeURIComponent(selectedFile.document_name)
            : ''
        }
        options={androidActionOptions}
      />
    </AppLayout>
  );
};

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? theme.colors.background : '#F8FAFC',
    },
    contentContainer: {
      padding: 20,
    },
    banner: {
      backgroundColor: theme.dark ? 'rgba(14, 122, 104, 0.05)' : '#E8FBF4',
      borderRadius: 20,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.dark ? 'rgba(14, 122, 104, 0.4)' : 'transparent',
    },
    bannerIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.dark
        ? 'rgba(14, 122, 104, 0.2)'
        : 'rgba(14, 122, 104, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    bannerTextContainer: {
      flex: 1,
    },
    bannerTitle: {
      color: theme.dark ? '#fff' : '#1E293B',
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 6,
    },
    bannerSubtitle: {
      color: theme.dark ? '#94A3B8' : '#64748B',
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    actionCardsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    actionCard: {
      flex: 1,
      borderRadius: 28,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: 1,
    },
    actionCardScan: {
      backgroundColor: theme.dark ? '#fff' : '#0F172A',
      marginRight: 8,
    },
    actionCardUpload: {
      backgroundColor: theme.dark ? '#1E293B' : '#fff',
      marginLeft: 8,
      borderWidth: theme.dark ? 0 : 1,
      borderColor: theme.dark ? 'transparent' : '#F1F5F9',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    actionIconUpload: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#F1F5F9' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    actionIconUploadBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    actionTitleScan: {
      color: theme.dark ? '#1E293B' : '#fff',
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    actionTitleUpload: {
      color: theme.dark ? '#fff' : '#1E293B',
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    tabsRow: {
      flexDirection: 'row',
      marginBottom: 32,
    },
    tabButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#fff' : '#fff',
      marginRight: 5,
      borderWidth: 1,
      borderColor: theme.dark ? '#fff' : '#F1F5F9',
    },
    tabButtonActive: {
      backgroundColor: '#0E7A68',
      borderColor: '#0E7A68',
    },
    tabText: {
      color: '#94A3B8',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    tabTextActive: {
      color: '#fff',
    },
    recentFilesSection: {
      flex: 1,
    },
    recentFilesTitle: {
      color: '#94A3B8',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 16,
      marginLeft: 4,
    },
    fileCard: {
      backgroundColor: theme.dark ? '#1E293B' : '#fff',
      borderRadius: 20,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: theme.dark ? 0 : 1,
      borderColor: theme.dark ? 'transparent' : '#F1F5F9',
    },
    fileIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    checkBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: theme.dark ? '#1E293B' : '#fff',
      borderRadius: 10,
    },
    fileDetails: {
      flex: 1,
    },
    fileName: {
      color: theme.dark ? '#F8FAFC' : '#1E293B',
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 4,
    },
    fileMeta: {
      color: '#94A3B8',
      fontSize: 11,
      fontWeight: '600',
    },
    downloadButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    },
    loadingText: {
      color: '#fff',
      marginTop: 12,
      fontSize: 16,
      fontWeight: '600',
    },
    modalUploadButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default DocumentVault;
