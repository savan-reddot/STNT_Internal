import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const BENEFITS_DATA = [
  'Emergency Medical Evacuation (Unlimited)',
  'Overseas Hospitalization Expenses',
  'Trip Cancellation & Curtailment',
  'Lost Baggage Reimbursement',
  'Personal Liability Coverage',
  'Travel Delay Allowance',
  'Emergency Dental Care',
  'Repatriation of Remains',
  'COVID-19 Diagnosis & Treatment',
  '24/7 Global Assistance Hotline',
  'Compassionate Visit',
  'Accidental Death & Disablement',
];

const Benefits = ({ navigation }: any) => {
  const theme = useTheme();

  return (
    <AppLayout title="BENEFITS" onBackPress={() => navigation.goBack()}>
      <ScrollView
        style={styles(theme).container}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={styles(theme).card}>
          {BENEFITS_DATA.map((item, index) => (
            <View key={index} style={styles(theme).row}>
              <View style={styles(theme).iconContainer}>
                <Icon name="checkmark" size={16} color="#10B981" />
              </View>
              <Text style={styles(theme).text}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
      borderStyle: 'solid',
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.dark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
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

export default Benefits;
