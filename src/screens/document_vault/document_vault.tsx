import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AppLayout from '../../components/safeareawrapper';

const TABS = ['ALL', 'IDENTITY', 'TRAVEL', 'MEDICAL'];

const DUMMY_FILES = [
  {
    id: 1,
    name: 'PASSPORT_AHMED.PDF',
    date: '12 JAN 2024',
    size: '2.4 MB',
    isPdf: true,
  },
  {
    id: 2,
    name: 'UMRAH_VISA_APPRO...',
    date: '15 JAN 2024',
    size: '1.1 MB',
    isPdf: true,
  },
  {
    id: 3,
    name: 'VACCINATION_CERT....',
    date: '20 DEC 2023',
    size: '3.5 MB',
    isPdf: true,
  },
];

const DocumentVault = ({ navigation }: any) => {
  const { top } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('ALL');

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
      launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'back',
          saveToPhotos: false,
        },
        response => {
          console.log('Camera Response: ', response);
          if (response.didCancel) {
            console.log('User cancelled camera capture');
          } else if (response.errorCode) {
            console.log('Camera Error: ', response.errorMessage);
          } else {
            console.log('Camera Response: ', response);
            // Handle the captured photo if needed
          }
        },
      );
    } else {
      console.log('Camera permission denied');
    }
  };

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
              {TABS.map((tab, index) => {
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

            {DUMMY_FILES.map(file => (
              <View key={file.id} style={styles.fileCard}>
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
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileMeta}>
                    {file.date} • {file.size}
                  </Text>
                </View>

                <TouchableOpacity style={styles.downloadButton}>
                  <Icon name="download-outline" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
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
    marginRight: 12,
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
});

export default DocumentVault;
