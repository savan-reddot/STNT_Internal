import { Text } from '../../components/common';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const Exclusions = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { data } = route.params || {};
  const listData = data || [];

  return (
    <AppLayout title="EXCLUSIONS" onBackPress={() => navigation.goBack()}>
      <View style={styles(theme).container}>
        <View style={styles(theme).card}>
          {listData.map((item: any, index: number) => (
            <View key={item.id || index} style={styles(theme).row}>
              <View style={styles(theme).iconContainer}>
                <Icon name="close-circle-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles(theme).text}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>
    </AppLayout>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.dark ? '#1F2937' : '#fff',
      borderRadius: 20,
      margin: 20,
      padding: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#374151' : '#F3F4F6',
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.dark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginLeft: 12,
    },
    text: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
  });

export default Exclusions;
