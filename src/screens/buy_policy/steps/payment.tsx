import { Text, TextInput } from '../../../components/common';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import React, { useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { UseFormWatch } from 'react-hook-form';
import RazorpayCheckout from 'react-native-razorpay';
import { RAZORPAY_KEY_ID } from '@env';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { PaymentCompletionData, PolicyFormData } from '../types';
import KeyboardAwareContainer from '../components/KeyboardAwareContainer';
import {
  useApply_referral_codeMutation,
  usePayment_ordersMutation,
  usePayment_successMutation,
  useReferral_code_usersMutation,
} from '../../../redux/services';
import { showErrorToast, showSuccessToast } from '../../../utils/toastUtils';
import { useAppSelector } from '../../../redux/hooks';
import { getUser } from '../../../redux/reducer';

interface PaymentProps {
  watch: UseFormWatch<PolicyFormData>;
  onPaymentVerified: (data: PaymentCompletionData) => void;
}

interface DiscountInfo {
  discountAmount: number;
  finalBillAmount: number;
  referralData?: {
    code?: string;
    influencer_name?: string;
    discount_type?: string;
    discount_percentage?: string;
    maximum_discount?: string;
  };
}

const Payment: React.FC<PaymentProps> = ({ watch, onPaymentVerified }) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [referralCodeValue, setReferralCodeValue] = useState('');
  const countryOfTravel = watch('countryOfTravel') || '';
  const [apply_referral_code, { isLoading: isApplyingCode }] =
    useApply_referral_codeMutation();
  const [payment_orders, { isLoading: isCreatingOrder }] =
    usePayment_ordersMutation();
  const [payment_success, { isLoading: isVerifyingPayment }] =
    usePayment_successMutation();
  const [referral_code_users] = useReferral_code_usersMutation();
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [isCodeApplied, setIsCodeApplied] = useState(false);

  // Get form data for payment
  const name = watch('name') || user?.firstName || '';
  const email = watch('email') || user?.email || '';
  const phone = watch('phone') || user?.phone || '';

  const formatCurrency = (value: number) => {
    const numericValue = Number.isFinite(value) ? value : 0;
    return `$ ${numericValue.toFixed(2)}`;
  };

  // Extract the price from countryOfTravel (format: "$140.00")
  let billAmount = 0;
  if (countryOfTravel.includes('$')) {
    // Remove $ and add space, e.g., "$140.00" -> "$ 140.00"
    const price = countryOfTravel.replace('$', '').trim();
    // Extract numeric value for API (e.g., "140.00" -> 140)
    billAmount = parseFloat(price) || 0;
  }
  const insuranceTotal = formatCurrency(billAmount);
  const amountToPay = discountInfo?.finalBillAmount ?? billAmount;
  const formattedDiscountAmount = formatCurrency(
    discountInfo?.discountAmount ?? 0,
  );
  const formattedAmountToPay = formatCurrency(amountToPay);
  const formatOptionalNumber = (value?: string) => {
    if (!value) {
      return null;
    }
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return Number.isInteger(parsed) ? parsed.toFixed(0) : parsed.toFixed(2);
  };
  const referralMessage = isCodeApplied
    ? (() => {
        const influencerName = discountInfo?.referralData?.influencer_name;
        const percentage = formatOptionalNumber(
          discountInfo?.referralData?.discount_percentage,
        );
        const maximum = formatOptionalNumber(
          discountInfo?.referralData?.maximum_discount,
        );
        if (influencerName && percentage && maximum) {
          return `Referral code by ${influencerName} gets you ${percentage}% extra discount (Upto $${maximum})`;
        }
        return 'Referral code applied successfully.';
      })()
    : '';

  const handleApplyCode = async () => {
    if (isCodeApplied) {
      setDiscountInfo(null);
      setIsCodeApplied(false);
      setReferralCodeValue('');
      showSuccessToast('Referral code removed', 'Success !!');
      return;
    }

    if (!referralCodeValue.trim()) {
      showErrorToast('Please enter a referral code', 'Error !!');
      return;
    }

    if (billAmount === 0) {
      showErrorToast('Invalid bill amount', 'Error !!');
      return;
    }

    try {
      const response = await apply_referral_code({
        referral_code: referralCodeValue.trim(),
        bill_amount: billAmount,
      }).unwrap();

      const responseData = response?.data;
      console.log('applyReferralCode ----> ', responseData);
      if (!responseData) {
        showErrorToast('Invalid response from server', 'Error !!');
        return;
      }

      setDiscountInfo({
        discountAmount: parseFloat(responseData.discount_amount) || 0,
        finalBillAmount:
          parseFloat(responseData.final_bill_amount) || billAmount,
        referralData: responseData.referral_data || undefined,
      });
      setIsCodeApplied(true);
      showSuccessToast('Referral code applied successfully', 'Success !!');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to apply referral code';
      showErrorToast(errorMessage, 'Error !!');
    }
  };

  const handleMakePayment = async () => {
    console.log('billAmount', billAmount);
    if (amountToPay === 0) {
      showErrorToast('Invalid payment amount', 'Error !!');
      return;
    }

    // Convert amount to smallest currency unit (cents for SGD)
    const amountInSGD = Math.round(amountToPay * 100);

    try {
      // Step 1: Create payment order via API
      console.log('Creating payment order...', {
        amount: amountInSGD,
        currency: 'SGD',
      });
      const orderResponse = await payment_orders({
        amount: amountInSGD,
        currency: 'SGD',
      });

      console.log('Payment order created:', orderResponse);

      // Check for errors first
      if (orderResponse.error) {
        const errorMessage =
          (orderResponse.error as any)?.data?.message ||
          'Failed to create payment order';
        showErrorToast(errorMessage, 'Error !!');
        return;
      }

      const orderData = orderResponse?.data?.data;
      const orderId = orderData?.id;

      if (!orderId) {
        console.error('Order ID not found in response:', orderResponse);
        showErrorToast('Failed to create payment order', 'Error !!');
        return;
      }

      console.log('Using order_id:', orderId);

      // Step 2: Open Razorpay checkout with order_id
      const options = {
        currency: 'SGD',
        key: __DEV__ ? 'rzp_test_sg_jTyhhA2UxKAEaT' : RAZORPAY_KEY_ID,
        amount: amountInSGD,
        order_id: orderId,
        prefill: {
          email: email,
          contact: phone,
          name: name,
        },
      };
      console.log('options ----> ', options);
      const razorpayData = await RazorpayCheckout.open(options);

      // Payment successful from Razorpay SDK
      console.log('Razorpay Payment Success:', razorpayData);

      // Step 3: Verify payment with backend API
      try {
        console.log('Verifying payment with backend...');
        const verificationResponse = await payment_success({
          orderCreationId: orderId,
          razorpayPaymentId: razorpayData?.razorpay_payment_id,
          razorpayOrderId: razorpayData?.razorpay_order_id,
          razorpaySignature: razorpayData?.razorpay_signature,
        }).unwrap();

        console.log('Payment verification response:', verificationResponse);

        // Check if verification was successful
        if (verificationResponse?.success) {
          // If referral code was applied, call referral-code-users API
          if (isCodeApplied && referralCodeValue.trim()) {
            try {
              console.log('Calling referral-code-users API...');
              const referralUserResponse = await referral_code_users({
                referral_code: referralCodeValue.trim(),
                name: name,
                email: email,
                bill_amount: billAmount,
                discount_amount: discountInfo?.discountAmount ?? 0,
                final_bill_amount: amountToPay,
              }).unwrap();

              console.log('Referral code user saved:', referralUserResponse);
            } catch (referralError: any) {
              console.error('Error saving referral code user:', referralError);
              // Don't block payment completion if referral user save fails
              const errorMessage =
                referralError?.data?.message ||
                referralError?.message ||
                'Failed to save referral code user';
              console.warn('Referral code user save failed:', errorMessage);
            }
          }

          const completionPayload: PaymentCompletionData = {
            orderCreationId: orderId,
            razorpayPaymentId: razorpayData?.razorpay_payment_id ?? '',
            razorpayOrderId: razorpayData?.razorpay_order_id ?? '',
            razorpaySignature: razorpayData?.razorpay_signature ?? '',
            discountAmount: discountInfo?.discountAmount ?? 0,
            billAmount,
            finalBillAmount: amountToPay,
            referralCode: isCodeApplied ? referralCodeValue.trim() : '',
            referralDetails: discountInfo?.referralData,
            paymentTimestamp: new Date().toISOString(),
          };

          onPaymentVerified(completionPayload);
          showSuccessToast('Payment verified successfully', 'Success !!');
        } else {
          showErrorToast('Payment verification failed', 'Error !!');
        }
      } catch (verifyError: any) {
        console.error('Payment verification error:', verifyError);
        const errorMessage =
          verifyError?.data?.message ||
          verifyError?.message ||
          'Payment verification failed';
        showErrorToast(errorMessage, 'Error !!');
      }
    } catch (error: any) {
      // Handle errors
      console.log('Payment Error:', error);

      // Check if it's an order creation error
      if (error?.data || error?.error) {
        const errorMessage =
          error?.data?.message ||
          error?.error?.message ||
          error?.message ||
          'Failed to process payment';
        showErrorToast(errorMessage, 'Error !!');
        return;
      }

      // Handle Razorpay checkout errors
      if (error.code === 'BAD_REQUEST_ERROR') {
        showErrorToast('Invalid payment request', 'Error !!');
      } else if (error.code === 'NETWORK_ERROR') {
        showErrorToast(
          'Network error. Please check your connection',
          'Error !!',
        );
      } else if (error.code !== 'Payment Cancelled') {
        // Don't show error for user cancellation
        showErrorToast(error.description || 'Payment failed', 'Error !!');
      }
    }
  };

  return (
    <KeyboardAwareContainer>
      <View>
        {/* Referral Code Section */}
        <View style={styles(theme).fieldContainer}>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              { marginBottom: metrics.baseMargin },
            ]}
          >
            Referral Code
          </Text>
          <View style={styles(theme).referralCodeContainer}>
            <TextInput
              mode="outlined"
              placeholder="Code"
              value={referralCodeValue}
              onChangeText={setReferralCodeValue}
              style={styles(theme).referralCodeInput}
              outlineStyle={{ borderRadius: metrics.baseRadius }}
              editable={!isCodeApplied}
            />
            <TouchableOpacity
              onPress={handleApplyCode}
              style={[
                styles(theme).applyButton,
                isCodeApplied && styles(theme).removeButton,
                isApplyingCode && styles(theme).applyButtonDisabled,
              ]}
              disabled={isApplyingCode}
            >
              {isApplyingCode ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles(theme).applyButtonText}>
                  {isCodeApplied ? 'Remove Code' : 'Apply Code'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {!!referralMessage && (
            <Text style={styles(theme).referralSuccessText}>
              {referralMessage}
            </Text>
          )}
        </View>

        {/* Bill Summary Section */}
        <View style={styles(theme).billSummaryContainer}>
          <Text
            style={[
              fontStyle(theme).headingMedium,
              { marginBottom: metrics.doubleMargin },
            ]}
          >
            Bill summary
          </Text>
          <View style={styles(theme).billSummaryRow}>
            <Text style={fontStyle(theme).headingSmall}>Insurance Total</Text>
            <Text
              style={[fontStyle(theme).headingSmall, { fontWeight: 'bold' }]}
            >
              {insuranceTotal}
            </Text>
          </View>
          {discountInfo && (
            <View
              style={[
                styles(theme).billSummaryRow,
                { marginTop: metrics.baseMargin },
              ]}
            >
              <Text style={fontStyle(theme).headingSmall}>Discount</Text>
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  styles(theme).discountValueText,
                ]}
              >
                - {formattedDiscountAmount}
              </Text>
            </View>
          )}
          <View
            style={[
              styles(theme).billSummaryRow,
              { marginTop: metrics.baseMargin },
            ]}
          >
            <Text
              style={[fontStyle(theme).headingSmall, { fontWeight: 'bold' }]}
            >
              To Pay
            </Text>
            <Text
              style={[
                fontStyle(theme).headingSmall,
                styles(theme).amountToPayText,
              ]}
            >
              {formattedAmountToPay}
            </Text>
          </View>
        </View>

        {/* Make Payment Button */}
        <View style={styles(theme).makePaymentContainer}>
          <TouchableOpacity
            onPress={handleMakePayment}
            style={[
              styles(theme).makePaymentButton,
              (isCreatingOrder || isVerifyingPayment) &&
                styles(theme).makePaymentButtonDisabled,
            ]}
            disabled={isCreatingOrder || isVerifyingPayment}
          >
            {isCreatingOrder || isVerifyingPayment ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles(theme).makePaymentButtonText}>
                Make Payment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareContainer>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    fieldContainer: {
      marginBottom: metrics.doubleMargin * 2,
    },
    referralCodeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: metrics.baseMargin,
    },
    referralCodeInput: {
      flex: 1,
      height: metrics.screenWidth * 0.13,
    },
    applyButton: {
      backgroundColor: '#4CAF50', // Green color
      paddingVertical: metrics.baseMargin * 1.5,
      paddingHorizontal: metrics.doubleMargin,
      borderRadius: metrics.baseRadius,
      justifyContent: 'center',
      alignItems: 'center',
      width: 130,
    },
    applyButtonDisabled: {
      opacity: 0.6,
    },
    removeButton: {
      backgroundColor: theme.colors.error,
    },
    applyButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    referralSuccessText: {
      color: '#4CAF50',
      marginTop: metrics.baseMargin / 2,
    },
    billSummaryContainer: {
      marginBottom: metrics.doubleMargin * 2,
      padding: metrics.doubleMargin,
      backgroundColor: theme.dark ? '#1F2937' : '#F5F5F5',
      borderRadius: metrics.baseRadius,
    },
    billSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    discountValueText: {
      color: theme.colors.error,
      fontWeight: 'bold',
    },
    amountToPayText: {
      color: '#1976D2',
      fontWeight: 'bold',
    },
    makePaymentContainer: {
      marginTop: metrics.doubleMargin,
    },
    makePaymentButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: metrics.doubleMargin,
      paddingHorizontal: metrics.doubleMargin,
      borderRadius: metrics.baseRadius,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    makePaymentButtonDisabled: {
      opacity: 0.6,
    },
    makePaymentButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default Payment;
