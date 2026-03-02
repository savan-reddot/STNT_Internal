import { Text } from '../../components/common';
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import { useLazyEmergency_contactsQuery } from '../../redux/services';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import Icon from 'react-native-vector-icons/Ionicons';
import { showErrorToast } from '../../utils/toastUtils';
import NoDataFound from '../../components/no_data_found';

const EmergencyHelp = ({ navigation }: any) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [emergency_contacts, { isLoading }] = useLazyEmergency_contactsQuery();
  const [emg_contacts, setEmg_Contacts] = useState<any[]>();

  useEffect(() => {
    const init = async () => {
      const resp = await emergency_contacts(0);
      if (resp?.data?.status && resp?.data?.data) {
        const { contacts } = resp?.data?.data;
        if (contacts?.length > 0) {
          setEmg_Contacts(contacts);
        }
      }
    };
    init();
  }, []);

  const openDialPad = (phoneNumber: string) => {
    let phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (!supported) {
          showErrorToast('Phone dialer is not available on this device');
        } else {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <AppLayout title="Emergency Hub" onBackPress={() => navigation.pop()}>
      <View
        style={[
          globalStyle(theme).container,
          { padding: metrics.doubleMargin },
        ]}
      >
        {emg_contacts && emg_contacts.length > 0 ? (
          emg_contacts.map((emg, index) => (
            <View key={index} style={styles.cardWrapper}>
              {/* LEFT ICON */}
              <View style={styles.iconContainer}>
                <Icon name="globe-outline" size={26} color="#3BA66B" />
              </View>

              {/* CONTENT */}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{emg?.name?.toUpperCase()}</Text>

                {emg?.description ? (
                  <Text style={styles.subtitle}>{emg?.description}</Text>
                ) : null}

                <Text style={styles.phone}>{emg?.phoneNumber}</Text>
              </View>

              {/* CALL BUTTON */}
              <TouchableOpacity
                onPress={() => openDialPad(emg?.phoneNumber)}
                style={styles.callButton}
              >
                <Icon name="call-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <NoDataFound
              title="No Data Found"
              description="Looks like there’s nothing here yet."
            />
          </View>
        )}
      </View>
    </AppLayout>
  );
};

export default EmergencyHelp;

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },

    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: theme.dark ? '#1A3B2A' : '#EAFBF2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },

    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },

    subtitle: {
      fontSize: 13,
      color: (theme.colors as any).onSurfaceVariant || '#8A94A6',
      marginTop: 4,
    },

    phone: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginTop: 8,
    },

    callButton: {
      width: 52,
      height: 52,
      borderRadius: 18,
      backgroundColor: '#3BA66B',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },

    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenHeight * 0.7,
    },
  });
