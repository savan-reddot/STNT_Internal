import React, {
  forwardRef,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Image,
  Linking,
  ScrollView,
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
import { Font_Medium } from '../theme/fonts';
import moment from 'moment';
import UButton from './custombutton';

interface ClaimDetailsProps {
  isVisible: boolean;
  isDraft: boolean;
  onDismiss: () => void;
  claimData: any;
  data: any;
}

const ClaimDetailsEdit = ({
  isVisible,
  isDraft,
  onDismiss,
  claimData,
  data,
}: ClaimDetailsProps) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const claimFormData = claimData?.claimCategory?.claimForm
    ? JSON.parse(claimData?.claimCategory?.claimForm?.claimFormData)
    : {};

  function isDateString(val: any) {
    return (
      typeof val === 'string' && !isNaN(Date.parse(val)) // valid date
    );
  }

  function toDisplayDate(iso: any) {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

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
      <ScrollView style={{ flex: 1 }}>
        <View style={styles(theme).contentContainer}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              padding: metrics.doubleMargin,
              paddingBottom: metrics.smallMargin,
            }}
          >
            <Text style={[styles(theme).title, { flex: 1 }]}></Text>
            <TouchableOpacity onPress={() => onDismiss && onDismiss()}>
              <Icon name="close" size={24} color={theme.colors.onBackground} />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: metrics.baseMargin }}>
            <View style={styles(theme).section}>
              <Image
                source={require('../../assets/images/docs.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16), flex: 1 },
                ]}
              >
                Documents
              </Text>
              {data?.status == 'new' && (
                <TouchableOpacity
                  onPress={() => {
                    onDismiss && onDismiss();
                    navigation.navigate(Screens.AddNewClaim, {
                      isEditClaim: true,
                      item: claimData,
                      data: data,
                      isFormEdit: false,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
              {isDraft && (
                <TouchableOpacity
                  onPress={() => {
                    onDismiss && onDismiss();
                    navigation.navigate(Screens.AddNewClaim, {
                      isEditClaim: true,
                      item: claimData,
                      data: data,
                      isFormEdit: false,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View>
              {claimData?.files &&
                claimData?.files?.length > 0 &&
                claimData?.files?.map((doc: any, index: number) => {
                  return (
                    <View
                      style={[
                        styles(theme).claim_detail_item,
                        {
                          borderBottomWidth:
                            index == claimData?.files?.length - 1 ? 0 : 0.3,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: doc?.path }}
                        style={styles(theme).doc}
                      />
                      <View style={{ marginLeft: metrics.baseMargin, flex: 1 }}>
                        <Text
                          style={[
                            fontStyle(theme).headingSmall,
                            {
                              fontSize: 14.5,
                              fontWeight: 'regular',
                              color: theme.colors.onBackground,
                              lineHeight: 19.2,
                              letterSpacing: 0,
                              verticalAlign: 'middle',
                              marginHorizontal: metrics.baseMargin,
                            },
                          ]}
                        >
                          {doc?.fieldname}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>

            <View
              style={[
                styles(theme).section,
                { marginTop: metrics.doubleMargin },
              ]}
            >
              <Image
                source={require('../../assets/images/docs.png')}
                style={styles(theme).section_img}
              />
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  { fontSize: metrics.moderateScale(16), flex: 1 },
                ]}
              >
                Claim form details
              </Text>
              {data?.status == 'new' && (
                <TouchableOpacity
                  onPress={() => {
                    onDismiss && onDismiss();
                    navigation.navigate(Screens.AddNewClaim, {
                      isEditClaim: true,
                      isDraft: isDraft || false,
                      item: claimData,
                      data: data,
                      isFormEdit: true,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
              {isDraft && (
                <TouchableOpacity
                  onPress={() => {
                    onDismiss && onDismiss();
                    navigation.navigate(Screens.AddNewClaim, {
                      isEditClaim: true,
                      isDraft: isDraft || false,
                      item: claimData,
                      data: data,
                      isFormEdit: true,
                    });
                  }}
                >
                  <Icon
                    name="edit"
                    color={'#fff'}
                    style={{
                      padding: metrics.baseMargin * 0.8,
                      borderRadius: 50,
                      backgroundColor: theme.colors.primary,
                      marginEnd: metrics.baseMargin,
                    }}
                    size={16}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View>
              {Object.entries(claimFormData).map(([label, value]) => {
                let displayValue;
                console.log('value ----> ', value);
                console.log('type value ----> ', typeof value.status);
                if (isDateString(value)) {
                  displayValue = moment(value, 'DD-MM-YYYY').format(
                    'DD-MM-YYYY',
                  );
                } else if (typeof value === 'object' && 'status' in value) {
                  displayValue =
                    value.status && value.status === true ? 'Yes' : 'No';
                } else if (typeof value === 'object') {
                  displayValue = Object.entries(value)
                    .map(([k, v]) => `${v}`)
                    .join('  ');
                } else {
                  displayValue = String(value);
                }
                return (
                  <View key={label} style={styles(theme).row}>
                    <Text style={styles(theme).label}>{label}</Text>
                    <Text style={styles(theme).value}>{displayValue}</Text>
                  </View>
                );
              })}
            </View>

            {/* <UButton
              style={{
                flex: 0,
                margin: metrics.doubleMargin,
                marginBottom: metrics.baseMargin * 3,
              }}
              title="Edit Details"
              onPress={() => {
                onDismiss && onDismiss();
                navigation.navigate(Screens.AddNewClaim, {
                  isEditClaim: true,
                  item: claimData,
                  data: data,
                  isFormEdit: true,
                });
              }}
            /> */}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

function formatObject(obj: any) {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ');
}

export default ClaimDetailsEdit;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      height: '85%',
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
    },
    claim_detail_item: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.3,
      paddingTop: metrics.baseMargin * 2,
      padding: metrics.baseMargin * 0.8,
      paddingHorizontal: metrics.baseMargin * 1.5,
      borderColor: '#616161',
    },
    modal: {
      justifyContent: 'flex-end',
      marginBottom: -metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin,
      marginHorizontal: 0,
      borderTopEndRadius: metrics.baseRadius,
      borderTopLeftRadius: metrics.baseRadius,
      overflow: 'hidden',
      maxHeight: '95%',
      bottom: 0,
      right: 0,
      left: 0,
      position: 'absolute',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    contentContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: metrics.baseRadius,
    },
    section: {
      flexDirection: 'row',
      paddingLeft: metrics.doubleMargin,
      padding: metrics.baseMargin,
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
    },
    section_img: {
      height: metrics.screenWidth * 0.07,
      width: metrics.screenWidth * 0.07,
      marginEnd: metrics.baseMargin * 2,
    },
    doc: {
      height: metrics.screenWidth * 0.15,
      width: metrics.screenWidth * 0.15,
      borderRadius: metrics.baseRadius,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: metrics.baseMargin,
      paddingHorizontal: metrics.doubleMargin,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    label: { fontSize: 14, color: '#555', flex: 1, lineHeight: 19.2 },
    value: {
      fontSize: 14,
      color: '#000',
      flex: 1,
      textAlign: 'right',
      fontFamily: Font_Medium,
      fontWeight: 'medium',
    },
  });
