import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MD3Theme, useTheme } from 'react-native-paper';
import { UseFormWatch } from 'react-hook-form';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { PolicyFormData } from '../types';

interface PaymentDetailsSummaryProps {
  watch: UseFormWatch<PolicyFormData>;
}

const PaymentDetailsSummary: React.FC<PaymentDetailsSummaryProps> = ({
  watch,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const values: any = watch();
  console.log('values', values);
  const formatCurrency = (value?: number) => {
    if (!value || Number.isNaN(value)) {
      return '$ 0.00';
    }
    return `$ ${value.toFixed(2)}`;
  };

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const renderRow = (label: string, value?: string | number) => (
    <View style={styles.row} key={label}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '-'}</Text>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader} key={`${title}-header`}>
      <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>{title}</Text>
    </View>
  );

  const adultFee =
    values?.planAdultPricing?.pricing_details.find(
      (item: any) => item.age_band === 'ADULT',
    )?.base_premium * (values.adults || 0);

  const childFee =
    values?.planChildPricing?.pricing_details.find(
      (item: any) => item.age_band === 'CHILD',
    )?.base_premium * (values.children || 0);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ flexGrow: 0 }}
    >
      <View style={styles.section}>
        {renderSectionHeader('Contact Details')}
        {renderRow('Travelling to Saudi with', values.travellingSaudiWith)}
        {renderRow('Name', values.name)}
        {renderRow(
          'Phone Number',
          `${values.phone_code || '+65'}${values.phone}`,
        )}
        {renderRow('Email ID', values.email)}
        {renderRow('Next of Kin Name', values.nextOfKinName)}
        {renderRow(
          'Next of Kin Phone Number',
          `${values.phone_code_nok || '+65'}${values.nextOfKinPhone}`,
        )}
        {renderRow('Next of Kin Email ID', values.nextOfKinEmail)}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Travel Details')}
        {renderRow(
          'Date of departure',
          formatDateForDisplay(values.departureDate),
        )}
        {renderRow('Date of arrival', formatDateForDisplay(values.arrivalDate))}
        {renderRow('No of days', values.numberOfDays)}
        {renderRow('Umrah coverage plan', values.selectedPlanDisplayName)}
        {renderRow('Country of travel', values.destination)}
        {renderRow('Adults', values.adults)}
        {renderRow('Children', values.children)}
      </View>

      {values.customers && values.customers.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('Customer Details')}
          {values.customers.map((customer, index) => {
            const customerType = customer.isChild ? 'Child' : 'Adult';
            const customerNumber = customer.isChild
              ? index - (values.adults || 0) + 1
              : index + 1;
            const genderCapitalized = customer.gender
              ? customer.gender.charAt(0).toUpperCase() +
                customer.gender.slice(1).toLowerCase()
              : '-';
            const isLastCustomer = index === values.customers.length - 1;
            const documentUrl = customer.documentUrl;
            const documentName = customer.documentName;

            return (
              <View
                key={index}
                style={[
                  styles.customerBlock,
                  isLastCustomer && styles.customerBlockLast,
                ]}
              >
                <Text
                  style={[fontStyle(theme).headingSmall, styles.customerTitle]}
                >
                  {customerType} {customerNumber}
                </Text>
                {renderRow('Full Name', customer.fullName)}
                {renderRow('Passport Number', customer.passportNumber)}
                {renderRow('Nationality', customer.nationality)}
                {renderRow('Gender', genderCapitalized)}
                {renderRow(
                  'Date of Birth',
                  formatDateForDisplay(customer.dateOfBirth),
                )}
                {customer.visaType && renderRow('Visa Type', customer.visaType)}
                {customer.visaNumber &&
                  renderRow('Visa Number', customer.visaNumber)}
                {documentUrl && (
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Supporting Document</Text>
                    <Text
                      style={[
                        styles.rowValue,
                        { color: '#2196F3', textDecorationLine: 'underline' },
                      ]}
                      numberOfLines={1}
                      onPress={() => {}}
                    >
                      {documentName || 'View Document'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        {renderSectionHeader('Notice & Declaration')}
        <Text style={styles.noticeText}>
          This insurance must be purchased before departure from Singapore and
          the journey must include return to Singapore within the period of
          insurance.
        </Text>
        <Text style={styles.noticeText}>
          We hereby declare that I/we are in good health and are aware and agree
          to abide by the policy’s terms, conditions and obligations.
        </Text>
        {renderRow(
          'Not discharged within 30 days',
          values.notDischargedWithin30Days ? 'Yes' : 'No',
        )}
        {renderRow(
          'Information accurate',
          values.confirmInformationAccurate ? 'Yes' : 'No',
        )}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('PDPA Consent')}
        {renderRow(
          'Residing in Singapore',
          values.residingInSingapore ? 'Yes' : 'No',
        )}
        {renderRow(
          'Purchasing before trip',
          values.purchasingBeforeTrip ? 'Yes' : 'No',
        )}
        {renderRow(
          'Not traveling against advice',
          values.notTravelingAgainstAdvice ? 'Yes' : 'No',
        )}
        {renderRow(
          'Acknowledge privacy notice',
          values.acknowledgePrivacyNotice ? 'Yes' : 'No',
        )}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Order')}
        {renderRow(
          `Adult Fees × ${values.adults || 0}`,
          formatCurrency(adultFee),
        )}
        {renderRow(
          `Child Fees × ${values.children || 0}`,
          formatCurrency(childFee),
        )}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.rowLabel, styles.totalLabel]}>Total Price</Text>
          <Text style={[styles.rowValue, styles.totalValue]}>
            {formatCurrency(adultFee + childFee)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      padding: metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin * 2,
      gap: metrics.doubleMargin,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: metrics.baseRadius,
      padding: metrics.doubleMargin,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: metrics.baseMargin,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: metrics.baseMargin / 2,
    },
    rowLabel: {
      flex: 1,
      color: theme.dark ? '#CAC4D0' : '#4A4A4A',
    },
    rowValue: {
      flex: 1,
      textAlign: 'right',
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    totalRow: {
      marginTop: metrics.baseMargin,
      borderTopWidth: 1,
      borderTopColor: theme.dark ? '#49454F' : '#ECECEC',
      paddingTop: metrics.baseMargin,
    },
    totalLabel: {
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    totalValue: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    discountText: {
      color: theme.colors.error,
    },
    noticeText: {
      color: theme.dark ? '#CAC4D0' : '#4A4A4A',
      marginBottom: metrics.baseMargin,
      lineHeight: 20,
    },
    placeholderContainer: {
      flex: 1,
      padding: metrics.doubleMargin,
      justifyContent: 'center',
      alignItems: 'center',
    },
    customerBlock: {
      marginBottom: metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#49454F' : '#ECECEC',
    },
    customerBlockLast: {
      marginBottom: 0,
      paddingBottom: 0,
      borderBottomWidth: 0,
    },
    customerTitle: {
      marginBottom: metrics.baseMargin,
      color: theme.colors.primary,
    },
  });

export default PaymentDetailsSummary;
