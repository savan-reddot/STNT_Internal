import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { metrics } from '../utils/metrics';
import { MD3Theme, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import fontStyle from '../styles/fontStyle';
import UButton from './custombutton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOK: (signature: string) => void;
}

const SignatureModal = ({ visible, onClose, onOK }: Props) => {
  const theme = useTheme();
  const ref = useRef<any>();
  const [isDeclare, setIsDeclare] = useState(false);

  const handleOK = (sig: string) => {
    onOK(sig); // returns base64 encoded png
    onClose();
  };

  const handleClear = () => {
    ref.current.clearSignature();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {
        onClose && onClose();
      }}
      onDismiss={() => {
        onClose && onClose();
      }}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles(theme).container}>
        <View style={styles(theme).header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" color={theme.colors.onBackground} size={24} />
          </TouchableOpacity>
          <Text style={styles(theme).title}>Signature</Text>
        </View>

        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          onEmpty={() => console.log('Empty')}
          autoClear={false}
          webStyle={`
              .m-signature-pad--footer {display: none;padding: 8px;}
            `}
        />

        <View style={styles(theme).footer}>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles(theme).clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: metrics.baseMargin * 2,
            marginBottom: metrics.doubleMargin,
          }}
        >
          <TouchableOpacity onPress={() => setIsDeclare(!isDeclare)}>
            {isDeclare ? (
              <Icon
                name="check-box-outline-blank"
                size={24}
                color={'#616161'}
              />
            ) : (
              <Icon name="check-box" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                fontSize: 14,
                fontWeight: '400',
                color: '#616161',
                flex: 1,
                marginHorizontal: metrics.baseMargin * 1.5,
              },
            ]}
          >
            By signing, I hereby acknowledged and agree to the terms &
            conditions of ST&T International
          </Text>
        </View>

        <View
          style={{
            margin: metrics.baseMargin * 1.5,
            marginHorizontal: metrics.doubleMargin,
          }}
        >
          <UButton
            title="Save"
            onPress={() => ref.current?.readSignature()}
            style={{ flex: 0 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default SignatureModal;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: '75%',
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600' },
    closeText: { fontSize: 18, color: '#000' },
    footer: { padding: 16, alignItems: 'flex-end' },
    clearText: {
      color: theme.colors.primary,
      fontSize: 16,
      textDecorationLine: 'underline',
      fontWeight: '700',
    },
  });

const style = `
  .m-signature-pad {box-shadow: none; border: 1px;}
  .m-signature-pad--footer {display: none; margin: 0px;}
`;
