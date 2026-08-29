import { Text } from './common';
import React, {
  forwardRef,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import { useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  useLazyVerificationUserQuery,
  usePassportByIdMutation,
} from '../redux/services';
import { getUser, setWebToken } from '../redux/reducer';
import { showErrorToast } from '../utils/toastUtils';
import ScreenLoader from './loader';

const data = [
  { label: 'UID 1', value: '1' },
  { label: 'UID 2', value: '2' },
  { label: 'UID 3', value: '3' },
];

interface UIDSelectionProps {
  isVisible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

const UIDSelection = ({
  isVisible,
  onDismiss,
  onSuccess,
}: UIDSelectionProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(getUser);
  const [verificationUser, { isLoading }] = useLazyVerificationUserQuery();
  const [passportById, { isLoading: isPassportNoLoading }] =
    usePassportByIdMutation();
  const [value, setValue] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (user?.availableUids?.length > 0) {
      setData(
        user?.availableUids?.map((uid: any) => ({
          label: uid?.formatted + '  -  ' + uid?.name,
          value: uid?.formatted,
        })) || [],
      );

      if (!value) {
        let defaultUidObj: any = null;
        if (user?.passportNo) {
          const userPassport = user.passportNo.trim().toLowerCase();
          const matchedUids = user.availableUids.filter(
            (item: any) =>
              item?.passportNo?.trim()?.toLowerCase() === userPassport,
          );
          if (matchedUids.length === 1) {
            defaultUidObj = matchedUids[0];
          } else if (matchedUids.length > 1) {
            defaultUidObj = matchedUids.slice().sort((a: any, b: any) => {
              const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            })[0];
          }
        }
        if (defaultUidObj?.formatted) {
          setValue(defaultUidObj.formatted);
        } else if (user?.latestUid) {
          setValue(user.latestUid);
        }
      }
    }
  }, [user]);

  const verifyUser = async () => {
    const selectedUidObj = user?.availableUids?.find(
      (uid: any) => uid?.formatted === value,
    );
    const targetUid = selectedUidObj?.formatted || value || user?.latestUid;

    const passportResp = await passportById({ uidNo: targetUid });
    console.log('passportById Response : ', JSON.stringify(passportResp));
    if (passportResp?.data?.status) {
      const { data } = passportResp?.data;
      if (data && data?.passportNo) {
        console.log('Passport No : ', data?.passportNo);
        const verificationResp = await verificationUser({
          name:
            selectedUidObj?.name ||
            `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          passportNo: selectedUidObj?.passportNo || data?.passportNo,
          uidNo: targetUid,
        });
        console.log('response : ', verificationResp.data);
        if (verificationResp?.data?.success) {
          const { token } = verificationResp?.data;
          await AsyncStorage.setItem('webtoken', token);
          dispatch(setWebToken(token));
          onSuccess && onSuccess();
        } else {
          showErrorToast('Verification failed. Please try again.', 'Error !!');
          onDismiss && onDismiss();
        }
      }
    }
  };

  const isLoad = isLoading || isPassportNoLoading;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        onDismiss && onDismiss();
      }}
      onDismiss={() => {
        onDismiss && onDismiss();
      }}
      style={styles(theme).modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.3}
    >
      <View style={styles(theme).contentContainer}>
        <ScreenLoader visible={isLoad} />
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <Text style={[styles(theme).title, { flex: 1 }]}>Select UID</Text>
          <TouchableOpacity onPress={() => verifyUser()}>
            <Text
              style={[
                styles(theme).title,
                { color: theme.colors.primary, fontSize: 16 },
              ]}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
        <Dropdown
          style={styles(theme).dropdown}
          placeholderStyle={styles(theme).placeholderStyle}
          selectedTextStyle={styles(theme).selectedTextStyle}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Select UID"
          value={value}
          onChange={item => setValue(item.value)}
          containerStyle={styles(theme).dropdownContainer}
          itemTextStyle={styles(theme).dropdownItemText}
          activeColor={theme.dark ? '#374151' : '#E6EBF1'} // active color for dark mode
          selectedTextProps={{
            allowFontScaling: false,
            maxFontSizeMultiplier: 1,
          }}
        />
      </View>
    </Modal>
  );
};

export default UIDSelection;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      height: '35%',
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
      height: '35%',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: metrics.baseMargin * 1.5,
      color: theme.colors.onSurface,
    },
    contentContainer: {
      padding: metrics.doubleMargin * 2,
      paddingHorizontal: metrics.doubleMargin,
      backgroundColor: theme.colors.surface,
      borderRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
      borderTopRightRadius: metrics.baseRadius,
    },

    dropdown: {
      height: 50,
      borderColor: theme.dark ? '#444' : '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    placeholderStyle: {
      fontSize: 14,
      color: (theme.colors as any).onSurfaceVariant || '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    dropdownContainer: {
      borderRadius: metrics.baseRadius,
      borderColor: theme.dark ? '#444' : '#E6EBF1',
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
    },
    dropdownItemText: {
      fontSize: 12,
      color: theme.colors.onSurface,
    },
  });
