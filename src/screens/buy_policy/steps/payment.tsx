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
  useCreate_policy_purchase_draftMutation,
  useUpdate_policy_purchase_draftMutation,
  usePayment_ordersMutation,
  usePayment_successMutation,
  useComplete_policy_purchaseMutation,
  useReferral_code_usersMutation,
} from '../../../redux/services';
import { showErrorToast, showSuccessToast } from '../../../utils/toastUtils';
import { useAppSelector } from '../../../redux/hooks';
import { getUser } from '../../../redux/reducer';
import { Screens } from '../../../common/screens';

interface PaymentProps {
  watch: UseFormWatch<PolicyFormData>;
  policyId?: number | string | null;
  setPolicyId?: (id: number | string) => void;
  getPolicyPayload?: (paymentData?: any, status?: string) => any;
  navigation?: any;
  onPaymentVerified?: (data: PaymentCompletionData) => void;
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

const Payment: React.FC<PaymentProps> = ({
  watch,
  policyId,
  setPolicyId,
  getPolicyPayload,
  navigation,
  onPaymentVerified,
}) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [referralCodeValue, setReferralCodeValue] = useState('');
  const countryOfTravel = watch('countryOfTravel') || '';
  const [apply_referral_code, { isLoading: isApplyingCode }] =
    useApply_referral_codeMutation();
  const [create_policy_purchase_draft, { isLoading: isCreatingDraft }] =
    useCreate_policy_purchase_draftMutation();
  const [update_policy_purchase_draft, { isLoading: isUpdatingDraft }] =
    useUpdate_policy_purchase_draftMutation();
  const [payment_orders, { isLoading: isCreatingOrder }] =
    usePayment_ordersMutation();
  const [payment_success, { isLoading: isVerifyingPayment }] =
    usePayment_successMutation();
  const [complete_policy_purchase, { isLoading: isCompletingPolicy }] =
    useComplete_policy_purchaseMutation();
  const [referral_code_users] = useReferral_code_usersMutation();
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [isCodeApplied, setIsCodeApplied] = useState(false);

  const isProcessing =
    isCreatingDraft ||
    isUpdatingDraft ||
    isCreatingOrder ||
    isVerifyingPayment ||
    isCompletingPolicy;

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

    try {
      // Step 1: Ensure draft exists on server
      let currentPolicyId = policyId;
      if (!currentPolicyId) {
        const contactData = watch();
        console.log('Creating initial draft from payment step...');
        const draftResp = await create_policy_purchase_draft({
          travel_type:
            contactData.travellingSaudiWith &&
            contactData.travellingSaudiWith.toLowerCase() !== 'individual'
              ? 'group'
              : 'individual',
          name: contactData.name,
          phone: contactData.phone,
          phone_code: contactData.phone_code || '+65',
          email: contactData.email,
          ...(contactData.travelAgencyName && {
            travel_agency_name: contactData.travelAgencyName,
          }),
          name_nok: contactData.nextOfKinName,
          phone_nok: contactData.nextOfKinPhone,
          phone_code_nok: contactData.phone_code_nok || '+65',
          email_nok: contactData.nextOfKinEmail,
          referral_code_used: isCodeApplied
            ? referralCodeValue.trim()
            : contactData.referralCode || '',
        }).unwrap();

        currentPolicyId = draftResp?.data?.policyId;
        if (currentPolicyId && setPolicyId) {
          setPolicyId(currentPolicyId);
        }
      }

      if (!currentPolicyId) {
        showErrorToast(
          'Failed to create policy draft. Please try again.',
          'Error !!',
        );
        return;
      }

      // Step 2 (2nd API): PUT /api/policy-purchase-form-draft/:policyId
      // Save entire form before payment with status: "draft" and payment_details: null
      if (getPolicyPayload) {
        const draftBody = getPolicyPayload(null, 'draft');
        if (isCodeApplied && referralCodeValue.trim()) {
          draftBody.referral_code_used = referralCodeValue.trim();
        }
        console.log(
          'Updating full form draft before payment on policyId:',
          currentPolicyId,
        );
        await update_policy_purchase_draft({
          policyId: currentPolicyId,
          body: draftBody,
        }).unwrap();
      }

      // Step 3 (3rd API): POST /api/payment/orders with policyPurchaseId
      const amountInSGD = Math.round(amountToPay * 100);
      console.log('Creating payment order...', {
        amount: amountInSGD,
        currency: 'SGD',
        policyPurchaseId: currentPolicyId,
      });

      const orderResponse = await payment_orders({
        amount: amountInSGD,
        currency: 'SGD',
        policyPurchaseId: currentPolicyId,
      }).unwrap();

      console.log('Payment order response:', orderResponse);

      const orderData = orderResponse?.data;
      const orderId = orderData?.id;

      if (!orderId) {
        showErrorToast('Failed to create payment order', 'Error !!');
        return;
      }

      // Extract dynamic key_id from order response (preferred) or fallback
      const razorpayKey =
        orderData?.key_id ||
        orderData?.orderData?.key_id ||
        RAZORPAY_KEY_ID ||
        'rzp_live_sg_g264lawpXy1P8j';

      console.log('Using Razorpay key:', razorpayKey, 'orderId:', orderId);

      // Step 4: Open Razorpay checkout
      const options = {
        name: 'ST&T International',
        description: 'Policy Purchase',
        currency: 'SGD',
        key: razorpayKey,
        amount: amountInSGD,
        order_id: orderId,
        prefill: {
          email: email,
          contact: phone,
          name: name,
        },
        theme: { color: '#03989E' },
      };
      console.log("options==>>", options);
      
      let razorpayData: any;
      try {
        razorpayData = await RazorpayCheckout.open(options);
        console.log('Razorpay Payment Success:', razorpayData);
      } catch (checkoutError: any) {
        console.log('Razorpay checkout error / cancelled:', checkoutError);
        if (
          checkoutError?.code === 'Payment Cancelled' ||
          checkoutError?.description === 'Payment Cancelled'
        ) {
          return;
        }
        showErrorToast(
          checkoutError?.description || 'Payment cancelled or failed',
          'Error !!',
        );
        return;
      }

      // Step 5: Verify payment with /payment/success
      try {
        console.log('Verifying payment with /payment/success...');
        await payment_success({
          orderCreationId: orderId,
          razorpayPaymentId: razorpayData?.razorpay_payment_id,
          razorpayOrderId: razorpayData?.razorpay_order_id,
          razorpaySignature: razorpayData?.razorpay_signature,
        }).unwrap();
      } catch (verifyError: any) {
        console.warn('Payment success verification warning:', verifyError);
      }

      // If referral code was applied, call referral-code-users API
      if (isCodeApplied && referralCodeValue.trim()) {
        try {
          await referral_code_users({
            referral_code: referralCodeValue.trim(),
            name: name,
            email: email,
            bill_amount: billAmount,
            discount_amount: discountInfo?.discountAmount ?? 0,
            final_bill_amount: amountToPay,
          }).unwrap();
        } catch (referralError) {
          console.warn('Referral code user save failed:', referralError);
        }
      }

      // Step 6 (4th API): PUT /api/complete-policy-purchase/:policyId
      const paymentDetails = {
        orderCreationId: orderId,
        razorpayOrderId: razorpayData?.razorpay_order_id,
        razorpayPaymentId: razorpayData?.razorpay_payment_id,
        bill_amount: billAmount,
        discount_amount: discountInfo?.discountAmount ?? 0,
        final_bill_amount: amountToPay,
        referral_code: isCodeApplied ? referralCodeValue.trim() : '',
      };

      console.log('Calling complete-policy-purchase on policyId:', currentPolicyId);
      if (getPolicyPayload) {
        const completeBody = getPolicyPayload(paymentDetails);
        console.log("complete_policy_purchase completeBody==>>", completeBody);
        
        await complete_policy_purchase({
          policyId: currentPolicyId,
          body: completeBody,
        }).unwrap();
      }

      if (onPaymentVerified) {
        onPaymentVerified({
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
        });
      }

      showSuccessToast('Policy purchased successfully!', 'Success !!');
      if (navigation) {
        navigation.navigate(Screens.BuyPolicySuccess);
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      const errorMessage =
        error?.data?.errorMessage ||
        error?.data?.message ||
        error?.message ||
        'Failed to process payment';
      showErrorToast(errorMessage, 'Error !!');
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
              isProcessing && styles(theme).makePaymentButtonDisabled,
            ]}
            disabled={isProcessing}
          >
            {isProcessing ? (
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
