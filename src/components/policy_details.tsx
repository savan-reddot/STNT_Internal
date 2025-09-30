import React, {
  forwardRef,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../common/screens';
import fontStyle from '../styles/fontStyle';
import moment from 'moment';

const data = [
  { label: 'UID 1', value: '1' },
  { label: 'UID 2', value: '2' },
  { label: 'UID 3', value: '3' },
];

interface PolicyDetailsProps {
  isVisible: boolean;
  onDismiss: () => void;
  policyData: any;
}

const PolicyDetails = ({
  isVisible,
  onDismiss,
  policyData,
}: PolicyDetailsProps) => {
  const theme = useTheme();
  const navigation = useNavigation();
  // const [policyData, setPolicyData] = useState<any>();

  // useEffect(() => {
  //   data && setPolicyData(data);
  // }, [data]);

  const handlePress = () => {
    const url =
      'https://stntinternational.com/wp-content/uploads/2025/03/UMRAH-Policy-Wording_1447H.pdf';
    // Linking.openURL(url).catch(err =>
    //   console.error('Failed to open URL:', err),
    // );
    // setPolicyData(null);
    onDismiss && onDismiss();
    navigation.navigate(Screens.WebView, { url: url });
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        // setPolicyData(null);
        onDismiss && onDismiss();
      }}
      onDismiss={() => {
        // setPolicyData(null);
        onDismiss && onDismiss();
      }}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}
    >
      <View style={styles(theme).contentContainer}>
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Text style={[styles(theme).title, { flex: 1 }]}></Text>
          <TouchableOpacity onPress={() => onDismiss && onDismiss()}>
            <Icon name="close" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: metrics.baseMargin * 2.5 }}>
          <View style={styles(theme).item_view}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <Text
                style={[
                  styles(theme).title,
                  {
                    fontWeight: '700',
                    color: theme.colors.onBackground,
                  },
                ]}
              >
                Policy :
              </Text>
              <Text
                style={[
                  styles(theme).title,
                  {
                    fontWeight: '400',
                    marginLeft: metrics.baseMargin,
                  },
                ]}
              >
                {policyData?.type || 'N/A'}
              </Text>
            </View>
            {policyData?.status && (
              <View
                style={{
                  backgroundColor: '#CEF6BB',
                  paddingVertical: 0,
                  paddingHorizontal: metrics.baseMargin,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#B4E1A2',
                  alignSelf: 'flex-end',
                }}
              >
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { color: '#05690D', fontSize: 11 },
                  ]}
                >
                  {policyData?.status?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles(theme).item_view}>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: '700',
                  color: theme.colors.onBackground,
                },
              ]}
            >
              Policy Number :
            </Text>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: '400',
                  marginLeft: metrics.baseMargin,
                },
              ]}
            >
              {policyData?.policyNumber || 'N/A'}
            </Text>
          </View>
          <View style={styles(theme).item_view}>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: '700',
                },
              ]}
            >
              {'No of Claims : '}
              <Text
                style={[
                  styles(theme).title,
                  {
                    fontWeight: '400',
                  },
                ]}
              >
                {policyData?.claimsCount}
              </Text>
            </Text>
          </View>
          <View style={styles(theme).item_view}>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: '700',
                  color: theme.colors.onBackground,
                },
              ]}
            >
              Expired On :
            </Text>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: '400',
                  marginLeft: metrics.baseMargin,
                },
              ]}
            >
              {moment(policyData?.endDate, 'YYYY-MM-DD').format('DD-MM-YYYY') ||
                'N/A'}
            </Text>
          </View>
          <Text
            style={[
              styles(theme).title,
              {
                fontWeight: '700',
                marginTop: metrics.baseMargin,
              },
            ]}
          >
            Policy Wordings :
          </Text>
          <TouchableOpacity onPress={() => handlePress()}>
            <Text
              style={[
                styles(theme).title,
                {
                  fontWeight: 'regular',
                  textDecorationLine: 'underline',
                  color: 'blue',
                },
              ]}
            >
              https://stntinternational.com/wp-content/uploads/2025/03/UMRAH-Policy-Wording_1447H.pdf
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PolicyDetails;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: '40%',
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    modal: {
      justifyContent: 'flex-end',
      marginBottom: -metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
      overflow: 'hidden',
      height: '40%',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    contentContainer: {
      padding: metrics.doubleMargin * 2,
      paddingTop: metrics.doubleMargin,
      paddingHorizontal: metrics.doubleMargin,
      backgroundColor: theme.colors.background,
      borderRadius: metrics.baseRadius,
    },

    dropdown: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    placeholderStyle: {
      fontSize: 14,
      color: '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: '#000',
    },
    item_view: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: metrics.baseMargin,
      marginHorizontal: 0,
    },
  });
