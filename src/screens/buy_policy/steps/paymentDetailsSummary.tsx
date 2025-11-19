import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MD3Theme, useTheme } from 'react-native-paper';
import { UseFormWatch } from 'react-hook-form';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { PaymentCompletionData, PolicyFormData } from '../types';

interface PaymentDetailsSummaryProps {
  watch: UseFormWatch<PolicyFormData>;
  paymentMeta: PaymentCompletionData | null;
}

const PaymentDetailsSummary: React.FC<PaymentDetailsSummaryProps> = ({
  watch,
  paymentMeta,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const values = watch();

  const formatCurrency = (value?: number) => {
    if (!value || Number.isNaN(value)) {
      return '$ 0.00';
    }
    return `$ ${value.toFixed(2)}`;
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

  if (!paymentMeta) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={fontStyle(theme).headingSmall}>
          Complete the payment in Step 5 to review your policy details.
        </Text>
      </View>
    );
  }

  const adultFee = (values.planAdultPricing?.base_premium || 0) * (values.adults || 0);
  const childFee = (values.planChildPricing?.base_premium || 0) * (values.children || 0);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ flexGrow: 0 }}>
      <View style={styles.section}>
        {renderSectionHeader('Contact Details')}
        {renderRow('Travelling to Saudi with', values.travellingSaudiWith)}
        {renderRow('Name', values.name)}
        {renderRow('Phone Number', values.phone)}
        {renderRow('Email ID', values.email)}
        {renderRow('Next of Kin Name', values.nextOfKinName)}
        {renderRow('Next of Kin Phone Number', values.nextOfKinPhone)}
        {renderRow('Next of Kin Email ID', values.nextOfKinEmail)}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Travel Details')}
        {renderRow('Date of departure', values.departureDate)}
        {renderRow('Date of arrival', values.arrivalDate)}
        {renderRow('No of days', values.numberOfDays)}
        {renderRow('Umrah coverage plan', values.selectedPlanDisplayName)}
        {renderRow('Country of travel', values.destination)}
        {renderRow('Adults', values.adults)}
        {renderRow('Children', values.children)}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Notice & Declaration')}
        <Text style={styles.noticeText}>
          This insurance must be purchased before departure from Singapore and the journey must
          include return to Singapore within the period of insurance.
        </Text>
        <Text style={styles.noticeText}>
          We hereby declare that I/we are in good health and are aware and agree to abide by the
          policy’s terms, conditions and obligations.
        </Text>
        {renderRow('Not discharged within 30 days', values.notDischargedWithin30Days ? 'Yes' : 'No')}
        {renderRow('Information accurate', values.confirmInformationAccurate ? 'Yes' : 'No')}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('PDPA Consent')}
        {renderRow('PDPA Accepted', values.pdpaConsent ? 'Yes' : 'No')}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Payment Details')}
        {renderRow('Order ID', paymentMeta.orderCreationId)}
        {renderRow('Razorpay Payment ID', paymentMeta.razorpayPaymentId)}
        {renderRow('Payment Method', 'Razorpay')}
        {renderRow('Referral Code', paymentMeta.referralCode || 'Not applied')}
        {renderRow('Discount Amount', formatCurrency(paymentMeta.discountAmount))}
        {renderRow('Final Bill Amount', formatCurrency(paymentMeta.finalBillAmount))}
      </View>

      <View style={styles.section}>
        {renderSectionHeader('Order')}
        {renderRow(`Adult Fees × ${values.adults || 0}`, formatCurrency(adultFee))}
        {renderRow(`Child Fees × ${values.children || 0}`, formatCurrency(childFee))}
        {paymentMeta.discountAmount > 0 && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Discount</Text>
            <Text style={[styles.rowValue, styles.discountText]}>
              - {formatCurrency(paymentMeta.discountAmount)}
            </Text>
          </View>
        )}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.rowLabel, styles.totalLabel]}>Total Price</Text>
          <Text style={[styles.rowValue, styles.totalValue]}>
            {formatCurrency(paymentMeta.finalBillAmount)}
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
      backgroundColor: '#FFFFFF',
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
      color: '#4A4A4A',
    },
    rowValue: {
      flex: 1,
      textAlign: 'right',
      color: '#1F1F1F',
      fontWeight: '500',
    },
    totalRow: {
      marginTop: metrics.baseMargin,
      borderTopWidth: 1,
      borderTopColor: '#ECECEC',
      paddingTop: metrics.baseMargin,
    },
    totalLabel: {
      fontWeight: '700',
    },
    totalValue: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    discountText: {
      color: '#D32F2F',
    },
    noticeText: {
      color: '#4A4A4A',
      marginBottom: metrics.baseMargin,
      lineHeight: 20,
    },
    placeholderContainer: {
      flex: 1,
      padding: metrics.doubleMargin,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default PaymentDetailsSummary;


