import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { Card, useTheme } from 'react-native-paper';
import { useLazyEmergency_contactsQuery } from '../../redux/services';
import { globalStyle } from '../../utils/globalStyles';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { showErrorToast } from '../../utils/toastUtils';
import NoDataFound from '../../components/no_data_found';

const EmergencyHelp = ({ navigation }: any) => {
  const theme = useTheme();
  const [emergency_contacts, { isLoading }] = useLazyEmergency_contactsQuery();
  const [emg_contacts, setEmg_Contacts] = useState<any[]>();

  useEffect(() => {
    const init = async () => {
      const resp = await emergency_contacts(0);
      console.log('resp?.data?.emergency_contacts -----> ', resp?.data?.data);
      if (resp?.data?.status && resp?.data?.data) {
        const { contacts, totalContacts } = resp?.data?.data;
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
      .catch(err => console.error('Error opening dialer', err));
  };

  return (
    <AppLayout title="Need Help" onBackPress={() => navigation.pop()}>
      <View
        style={[
          globalStyle(theme).container,
          { padding: metrics.doubleMargin },
        ]}
      >
        {emg_contacts && emg_contacts?.length > 0 ? (
          emg_contacts?.map((emg, index) => {
            return (
              <Card
                style={{
                  borderRadius: metrics.baseRadius,
                  marginTop: index === 0 ? 0 : metrics.baseMargin,
                }}
                key={index + 'emg'}
              >
                <Card.Content>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: metrics.baseMargin,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          { fontSize: 14, fontWeight: '500' },
                        ]}
                      >
                        {emg?.name}
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          {
                            fontSize: 11,
                            color: '#616161',
                            fontWeight: '300',
                            marginTop: metrics.smallMargin,
                          },
                        ]}
                      >
                        {emg?.description}
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          {
                            fontSize: 15,
                            fontWeight: '400',
                            marginTop: metrics.smallMargin,
                          },
                        ]}
                      >
                        {emg?.phoneNumber}
                      </Text>
                      {/* <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          {
                            fontSize: 15,
                            fontWeight: '400',
                            marginTop: metrics.smallMargin,
                          },
                        ]}
                      >
                        {emg?.open_timings
                          ? emg?.open_timings
                          : emg?.name.toUpperCase() == 'SAUDI'
                          ? '24 Hours'
                          : emg?.name.toUpperCase() == 'ST&T OFFICE'
                          ? '9.30 am to 6.00 pm'
                          : emg?.name.toUpperCase() == 'ST&T HOTLINE'
                          ? '9.30 am to 6.00 pm'
                          : '9.30 am to 6.00 pm'}
                      </Text> */}
                    </View>
                    <TouchableOpacity
                      onPress={() => openDialPad(emg?.phoneNumber)}
                    >
                      <Image
                        source={require('../../../assets/images/call_new.png')}
                        style={{
                          height: metrics.screenWidth * 0.1,
                          width: metrics.screenWidth * 0.1,
                          marginLeft: metrics.baseMargin,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: metrics.screenHeight * 0.7,
            }}
          >
            <NoDataFound
              title={'No Data Found'}
              description={'Looks like there’s nothing here yet.'}
            />
          </View>
        )}
      </View>
    </AppLayout>
  );
};

export default EmergencyHelp;

const styles = StyleSheet.create({});
