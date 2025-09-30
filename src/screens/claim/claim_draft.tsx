import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../../components/safeareawrapper';
import { getRandomPastelColor, globalStyle } from '../../utils/globalStyles';
import { MD3Theme, useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import fontStyle from '../../styles/fontStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import {
  useLazyGet_claimsQuery,
  useLazyUser_metaQuery,
} from '../../redux/services';
import ScreenLoader from '../../components/loader';
import NoDataFound from '../../components/no_data_found';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import { showErrorToast } from '../../utils/toastUtils';
import UIDSelection from '../../components/uid_selection';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import moment from 'moment';
import { ca } from 'react-native-paper-dates';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'wip':
      return {
        backgroundColor: '#FCEEBA',
        bordercolor: '#F5DA80',
        color: '#A82C00',
      };
    case 'new':
      return {
        backgroundColor: '#E4ECEC',
        bordercolor: '#CBD5D6',
        color: '#545969',
      };
    case 'completed':
      return {
        backgroundColor: '#CEF6BB',
        bordercolor: '#B4E1A2',
        color: '#05690D',
      };
    case 'terminated':
      return {
        backgroundColor: '#FFD6D6',
        bordercolor: '#FFA3A3',
        color: '#D0021B',
      };
    case 'closed':
      return {
        backgroundColor: '#e2e2e2ff',
        bordercolor: '#bdbdbdff',
        color: '#4F4F4F',
      };
    default:
      return {
        backgroundColor: '#E2E2E2',
        bordercolor: '#BDBDBD',
        color: '#4F4F4F',
      };
  }
};

const DraftClaims = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [user_meta, { isLoading }] = useLazyUser_metaQuery();
  const [claims, setClaims] = useState<any[]>();
  const [visible, setVisible] = useState(false);

  const getUserMeta = async () => {
    const resp = await user_meta(0);
    console.log('resp?.data?.data -----> ', resp?.data?.data);
    if (resp?.data?.status && resp?.data?.data) {
      const { draftClaims } = resp?.data?.data;
      if (draftClaims?.length > 0) {
        setClaims(draftClaims);
      } else {
        setClaims([]);
      }
    }
  };

  useEffect(() => {
    getUserMeta();
  }, []);

  const list_data = useMemo(() => claims, [claims]);

  return (
    <AppLayout title="Draft Claims" onBackPress={() => navigation.pop()}>
      <View
        style={[
          globalStyle(theme).container,
          { padding: metrics.doubleMargin },
        ]}
      >
        <ScreenLoader visible={isLoading} />
        {list_data && list_data?.length > 0 ? (
          <ScrollView
            style={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {[...(list_data || [])].reverse().map((item, index) => {
              return (
                <TouchableWithoutFeedback
                  onPress={() => {
                    navigation.navigate(Screens.ClaimDetails, {
                      claimRequestId: item?.id,
                      isDraft: true,
                    });
                  }}
                >
                  <View key={'cl' + index} style={styles(theme).list_parent}>
                    <View
                      style={[
                        styles(theme).list_child,
                        { backgroundColor: getRandomPastelColor() },
                      ]}
                    >
                      <Icon
                        name="insert-drive-file"
                        size={metrics.moderateScale(24)}
                        color={'#fff'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          { fontSize: 14, fontWeight: '600' },
                        ]}
                      >
                        {`Draft ${index + 1}`}
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          { fontSize: 14, fontWeight: '600' },
                        ]}
                      >
                        {item?.draftName[0]?.title}
                      </Text>
                      <Text
                        style={[
                          fontStyle(theme).headingMedium,
                          {
                            fontSize: 14,
                            fontWeight: '400',
                            color: '#72849A',
                          },
                        ]}
                      >
                        {'Draft Date : ' +
                          moment(item?.dateOfDraft, 'DD-MM-YYYY').format(
                            'DD/MM/YYYY',
                          )}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </ScrollView>
        ) : (
          <NoDataFound
            title="No Claims Found"
            description={
              'Please verify your Passport Number and Email ID in Profile Settings, or contact ST&T Support.'
            }
          />
        )}
      </View>
    </AppLayout>
  );
};

export default DraftClaims;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    list_parent: {
      padding: metrics.baseMargin,
      paddingVertical: metrics.baseMargin * 2,
      borderRadius: 16,
      flexDirection: 'row',
      borderWidth: 2,
      borderColor: '#F6F6F6',
      backgroundColor: theme.colors.background,
      margin: metrics.baseMargin,
      marginHorizontal: 0,
    },
    list_child: {
      marginHorizontal: metrics.baseMargin,
      // marginEnd: metrics.baseMargin ,
      alignItems: 'center',
      justifyContent: 'center',
      height: metrics.screenWidth * 0.17,
      width: metrics.screenWidth * 0.17,
      borderRadius: metrics.baseRadius / 2,
    },
  });
