import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { pick, types, keepLocalCopy } from '@react-native-documents/picker';
import { requestAppPermission } from '../../utils/permissions';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import {
  useDocument_vault_uploadMutation,
  useCreate_document_vaultMutation,
  useLazyGet_all_documentsQuery,
} from '../../redux/services';
import AppLayout from '../../components/safeareawrapper';

const DocumentVault = ({ navigation }: any) => {
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('ALL');

  const [getAllDocuments, { isLoading: isListLoading }] =
    useLazyGet_all_documentsQuery();
  const [uploadDocumentVault, { isLoading: isUploading }] =
    useDocument_vault_uploadMutation();
  const [createDocumentVault, { isLoading: isCreating }] =
    useCreate_document_vaultMutation();

  const [documents, setDocuments] = useState<any[]>([]);
  const [dynamicTabs, setDynamicTabs] = useState<string[]>(['ALL']);

  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [uploadedDocData, setUploadedDocData] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [otherType, setOtherType] = useState<string>('');

  // Preview states
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

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
        const { scannedImages } = await DocumentScanner.scanDocument({
          maxNumDocuments: 1,
        });
        console.log('scannedImages', scannedImages);
        if (scannedImages && scannedImages.length > 0) {
          const uri = scannedImages[0];
          const formData = new FormData();
          formData.append('file', {
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: 'image/jpeg',
            name: `scan_${Date.now()}.jpg`,
          });

          const uploadRes = await uploadDocumentVault(formData).unwrap();
          console.log('uploadRes', uploadRes);
          if (uploadRes?.status) {
            setUploadedDocData(uploadRes.data);
            setSelectedType('');
            setOtherType('');
            setShowTypeModal(true);
          } else {
            showErrorToast('Upload failed.');
          }
        }
      } catch (e) {
        console.log('Scanner error:', e);
      }
    } else {
      showErrorToast('Camera permission denied');
    }
  };

  const handleUploadFile = async () => {
    try {
      const hasPermission = await requestAppPermission('document');
      if (!hasPermission) {
        showErrorToast('File access permission denied');
        return;
      }

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

      const formData = new FormData();
      formData.append('file', {
        uri:
          Platform.OS === 'android'
            ? localUri
            : localUri.replace('file://', ''),
        type: file.type || 'application/pdf',
        name: file.name || `file_${Date.now()}`,
      });

      const uploadRes = await uploadDocumentVault(formData).unwrap();
      if (uploadRes?.status) {
        setUploadedDocData(uploadRes.data);
        setSelectedType('');
        setOtherType('');
        setShowTypeModal(true);
      } else {
        showErrorToast('Upload failed.');
      }
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

  const handlePreview = (file: any) => {
    if (!file.document_url) {
      showErrorToast('Document URL not found');
      return;
    }
    const urlStr = String(file.document_url).toLowerCase();
    if (urlStr.includes('.pdf')) {
      Linking.openURL(file.document_url).catch(() => {
        showErrorToast('Could not open PDF');
      });
    } else {
      setPreviewDoc(file);
      setPreviewModalVisible(true);
    }
  };

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
                <Icon name="camera-outline" size={28} color="#fff" />
              </View>
              <Text style={styles.actionTitleScan}>SCAN PAPER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardUpload]}
              onPress={handleUploadFile}
            >
              <View style={styles.actionIconUploadBox}>
                <Icon name="cloud-upload-outline" size={28} color="#1E293B" />
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
                  onPress={() => handlePreview(file)}
                  activeOpacity={0.7}
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
                    <Text style={styles.fileName}>{file.document_name}</Text>
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
                    onPress={() => {
                      if (file.document_url) {
                        Linking.openURL(file.document_url).catch(() => {
                          showErrorToast('Could not download document');
                        });
                      }
                    }}
                  >
                    <Icon name="download-outline" size={20} color="#64748B" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <Text
                style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}
              >
                No documents found
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* OVERLAYS FOR LOADING / MODALS */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Uploading document...</Text>
        </View>
      )}

      {/* TYPE SELECTION MODAL */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File Details</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fileNameText}>
              Filename:{' '}
              <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                {uploadedDocData?.filename}
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
                    onPress={() => setSelectedType(type)}
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
                onChangeText={setOtherType}
              />
            )}

            <TouchableOpacity
              style={[styles.modalUploadButton, isCreating && { opacity: 0.7 }]}
              onPress={handleCreateDocument}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalUploadButtonText}>Save Details</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.previewHeader,
              { paddingTop: Platform.OS === 'ios' ? top : 16 },
            ]}
          >
            <TouchableOpacity
              style={styles.closePreviewBtn}
              onPress={() => setPreviewModalVisible(false)}
            >
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {previewDoc?.document_name || 'Document Preview'}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.previewImageContainer}>
            {previewDoc?.document_url && (
              <Image
                source={{ uri: previewDoc.document_url }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#E8FBF4',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 122, 104, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#64748B',
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
    backgroundColor: '#0F172A',
    marginRight: 8,
  },
  actionCardUpload: {
    backgroundColor: '#fff',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionIconUploadBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionTitleScan: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionTitleUpload: {
    color: '#1E293B',
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
    backgroundColor: '#fff',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    color: '#1E293B',
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
    backgroundColor: '#F8FAFC',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    color: '#1E293B',
  },
  fileNameText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  selectTypeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
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
    backgroundColor: '#F1F5F9',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  typeOptionSelected: {
    backgroundColor: '#0E7A68',
    borderColor: '#0E7A68',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  otherInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  modalUploadButton: {
    backgroundColor: '#0F172A',
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
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#000',
  },
  closePreviewBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default DocumentVault;
