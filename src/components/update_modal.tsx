import { Text } from './common';
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking
} from 'react-native';
import Modal from 'react-native-modal';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import fontStyle from '../styles/fontStyle';
import { Font_Bold } from '../theme/fonts';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: any;
  onUpdate: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ visible, updateInfo, onUpdate }) => {
  const theme = useTheme();
  const { storeUrl, currentVersion, latestVersion } = updateInfo || {};

  const openStore = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(err => {
        console.error('Error opening store:', err);
      });
    }
  };

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomInDown"
      style={styles(theme).modal}
      onBackdropPress={() => { }} // Prevent closing by tapping outside
    >
      <View style={styles(theme).container}>
        <Text style={styles(theme).title}>Update Required</Text>
        <Text style={styles(theme).message}>
          A new version of the app is available. Please update to continue using
          the app.
        </Text>
        {(currentVersion || latestVersion) && (
          <View style={styles(theme).versionContainer}>
            <Text style={styles(theme).versionText}>
              Current Version: <Text style={styles(theme).versionValue}>{currentVersion || 'N/A'}</Text>
            </Text>
            <Text style={styles(theme).versionText}>
              Latest Version: <Text style={styles(theme).versionValue}>{latestVersion || 'N/A'}</Text>
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles(theme).updateButton}
          onPress={() => {
            openStore();
            setTimeout(() => {
              onUpdate();
            }, 1000);
          }}
        >
          <Text style={styles(theme).updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    modal: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
    },
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: metrics.baseRadius * 2,
      padding: metrics.doubleMargin * 2,
      width: metrics.screenWidth * 0.85,
      alignItems: 'center',
    },
    title: {
      ...fontStyle(theme).headingMedium,
      fontSize: metrics.moderateScale(20),
      fontFamily: Font_Bold,
      marginBottom: metrics.baseMargin,
      textAlign: 'center',
    },
    message: {
      ...fontStyle(theme).bodyLarge,
      fontSize: metrics.moderateScale(14),
      textAlign: 'center',
      marginBottom: metrics.baseMargin,
      color: theme.colors.onBackground,
      lineHeight: 20,
    },
    versionContainer: {
      width: '100%',
      marginBottom: metrics.doubleMargin * 2,
      paddingVertical: metrics.baseMargin,
      paddingHorizontal: metrics.baseMargin,
      backgroundColor: theme.colors.surface,
      borderRadius: metrics.baseRadius,
    },
    versionText: {
      ...fontStyle(theme).bodyLarge,
      fontSize: metrics.moderateScale(13),
      color: theme.colors.onBackground,
      marginBottom: metrics.smallMargin,
      textAlign: 'center',
    },
    versionValue: {
      fontFamily: Font_Bold,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    updateButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: metrics.baseMargin * 1.5,
      paddingHorizontal: metrics.doubleMargin * 2,
      borderRadius: metrics.baseRadius,
      width: '100%',
      alignItems: 'center',
    },
    updateButtonText: {
      ...fontStyle(theme).headingMedium,
      fontSize: metrics.moderateScale(16),
      fontFamily: Font_Bold,
      color: '#FFFFFF',
    },
  });

