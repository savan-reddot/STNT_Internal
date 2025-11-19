import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { DatePickerModal } from 'react-native-paper-dates';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import fontStyle from '../../styles/fontStyle';
import { metrics } from '../../utils/metrics';
import UButton from '../../components/custombutton';
import { useAppSelector } from '../../redux/hooks';
import { getUser } from '../../redux/reducer';
import { format } from 'date-fns';
import { PaymentCompletionData, PolicyFormData } from './types';
import ContactDetails from './steps/contactDetails';
import TravelDetails from './steps/travelDetails';
import CustomerDetails from './steps/customerDetails';
import NoticeDeclaration from './steps/noticeDeclaration';
import Payment from './steps/payment';
import PaymentDetailsSummary from './steps/paymentDetailsSummary';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import { usePolicy_purchase_formMutation } from '../../redux/services';
import { Screens } from '../../common/screens';

const steps = [
  { id: 1, title: 'Contact Details' },
  { id: 2, title: 'Travel Details' },
  { id: 3, title: 'Customer Details' },
  { id: 4, title: 'Notice & Declaration' },
  { id: 5, title: 'Payment' },
  { id: 6, title: 'Payment Details' },
];

const getStepPercentage = (stepIndex: number) =>
  Math.round(((stepIndex + 1) / steps.length) * 100);

const BuyPolicy = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [datePickerVisible, setDatePickerVisible] = useState<string | null>(null);
  const [selectedDateField, setSelectedDateField] = useState<string>('');
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);
  const [paymentMeta, setPaymentMeta] = useState<PaymentCompletionData | null>(null);
  const [purchasePolicy, { isLoading: isPurchasingPolicy }] = usePolicy_purchase_formMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<PolicyFormData>({
    mode: 'onChange',
    defaultValues: {
      travellingSaudiWith: '',
      travelAgencyName: '',
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      phone: '',
      email: user?.email || '',
      nextOfKinName: '',
      nextOfKinPhone: '',
      nextOfKinEmail: '',
      departureDate: '',
      arrivalDate: '',
      numberOfDays: '',
      destination: '',
      umrahCoveragePlan: '',
      countryOfTravel: '',
      selectedPlanDisplayName: '',
      selectedPlanCode: '',
      coveragePlanDetailsText: '',
      selectedPlanDetails: null,
      planAdultPricing: null,
      planChildPricing: null,
      adults: 0,
      children: 0,
      customers: [],
      pdpaConsent: false,
      notDischargedWithin30Days: false,
      confirmInformationAccurate: false,
      referralCode: '',
      insuranceTotal: '',
      cardNumber: '',
      cardHolderName: '',
      expiryDate: '',
      cvv: '',
      billingAddress: '',
      transactionId: '',
    },
  });

  const goToStep = (nextStep: number) => {
    const boundedStep = Math.max(0, Math.min(nextStep, steps.length - 1));
    setCurrentStep(boundedStep);
    if (boundedStep <= 4) {
      setPaymentMeta(null);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 0: // Contact Details
        const travellingSaudiWith = watch('travellingSaudiWith');
        const contactFields: (keyof PolicyFormData)[] = ['travellingSaudiWith'];

        // Only validate other fields based on selection
        if (travellingSaudiWith === 'individual' || travellingSaudiWith === 'non_partnered_travel_agency') {
          contactFields.push(
            'name',
            'phone',
            'email',
            'nextOfKinName',
            'nextOfKinPhone',
            'nextOfKinEmail',
          );

          // Add travelAgencyName validation for non-partnered travel agency
          if (travellingSaudiWith === 'non_partnered_travel_agency') {
            contactFields.push('travelAgencyName');
          }
        }
        // For partnered_travel_agency, no additional fields to validate

        const contactResult = await trigger(contactFields);
        return contactResult;
      case 1: // Travel Details
        const travelFields: (keyof PolicyFormData)[] = [
          'departureDate',
          'arrivalDate',
          'numberOfDays',
          'destination',
          'umrahCoveragePlan',
        ];
        const travelResult = await trigger(travelFields);
        if (!travelResult) {
          return false;
        }

        const travelAdults = watch('adults') || 0;
        const travelChildren = watch('children') || 0;
        if (travelAdults === 0 && travelChildren === 0) {
          Alert.alert('Selection required', 'Please select at least one Adult or Child to proceed.');
          return false;
        }
        return true;
      case 2: // Customer Details
        const customers = watch('customers') || [];
        const adults = watch('adults') || 0;
        const children = watch('children') || 0;
        const totalCustomers = adults + children;

        if (customers.length !== totalCustomers || totalCustomers === 0) {
          return false;
        }

        // Validate all customer fields using trigger
        const customerFields: string[] = [];
        for (let i = 0; i < customers.length; i++) {
          customerFields.push(
            `customers.${i}.fullName`,
            `customers.${i}.passportNumber`,
            `customers.${i}.nationality`,
            `customers.${i}.gender`,
            `customers.${i}.dateOfBirth`,
          );
        }
        const customerResult = await trigger(customerFields as any);
        return customerResult;
      case 3: // Notice & Declaration
        const noticeFields: (keyof PolicyFormData)[] = [
          'pdpaConsent',
          'notDischargedWithin30Days',
          'confirmInformationAccurate',
        ];
        const noticeResult = await trigger(noticeFields);
        return noticeResult;
      case 4: // Payment
        if (!paymentMeta) {
          Alert.alert('Payment required', 'Please complete your payment before proceeding.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleHeaderBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const onDismiss = () => {
    setDatePickerVisible(null);
  };

  const onConfirm = (params: any) => {
    if (selectedDateField && params?.date) {
      const formattedDate = format(params.date, 'yyyy-MM-dd');

      // Handle customer details date fields
      if (selectedCustomerIndex !== null && selectedDateField === 'dateOfBirth') {
        setValue(`customers.${selectedCustomerIndex}.${selectedDateField}` as any, formattedDate);
      } else {
        setValue(selectedDateField as any, formattedDate);

        // Calculate numberOfDays when both dates are selected
        if (selectedDateField === 'departureDate' || selectedDateField === 'arrivalDate') {
          const departureDate = selectedDateField === 'departureDate'
            ? formattedDate
            : watch('departureDate');
          const arrivalDate = selectedDateField === 'arrivalDate'
            ? formattedDate
            : watch('arrivalDate');

          if (departureDate && arrivalDate) {
            const depDate = new Date(departureDate);
            const arrDate = new Date(arrivalDate);
            const diffTime = Math.abs(arrDate.getTime() - depDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setValue('numberOfDays', diffDays.toString());
          }
        }
      }
    }
    setDatePickerVisible(null);
    setSelectedDateField('');
    setSelectedCustomerIndex(null);
  };

  const openDatePicker = (fieldName: string, index?: number) => {
    setSelectedDateField(fieldName);
    setSelectedCustomerIndex(index !== undefined ? index : null);
    setDatePickerVisible('single');
  };

  const getDateValue = (fieldName: string): Date | undefined => {
    // Handle customer details date fields
    if (selectedCustomerIndex !== null && fieldName === 'dateOfBirth') {
      const customers = watch('customers') || [];
      const customer = customers[selectedCustomerIndex];
      if (customer && customer.dateOfBirth) {
        const date = new Date(customer.dateOfBirth);
        return isNaN(date.getTime()) ? undefined : date;
      }
      return undefined;
    }

    const value = watch(fieldName as keyof PolicyFormData);
    if (value && typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  };

  const getValidRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateField === 'departureDate') {
      // Disable past dates for departure
      return { startDate: today };
    } else if (selectedDateField === 'arrivalDate') {
      const departureDate = watch('departureDate');
      if (departureDate) {
        const depDate = new Date(departureDate);
        depDate.setHours(0, 0, 0, 0);
        // Add 6 days to departure date
        const minArrivalDate = new Date(depDate);
        minArrivalDate.setDate(depDate.getDate() + 7);
        return { startDate: minArrivalDate };
      }
      // If no departure date selected, disable past dates
      return { startDate: today };
    } else if (selectedDateField === 'dateOfBirth') {
      // Disable future dates for date of birth
      return { endDate: today };
    }
    return undefined;
  };

  const handlePaymentVerified = (data: PaymentCompletionData) => {
    setPaymentMeta(data);
    goToStep(5);
  };

  const handleFinalSubmit = () => {
    if (isPurchasingPolicy) {
      return;
    }
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: PolicyFormData) => {
    if (!paymentMeta) {
      showErrorToast('Complete your payment before submitting', 'Error !!');
      goToStep(4);
      return;
    }

    const planId = parseInt(data.umrahCoveragePlan || '0', 10);
    if (!planId) {
      showErrorToast('Please select a plan before proceeding', 'Error !!');
      goToStep(1);
      return;
    }

    const planDisplayName = data.selectedPlanDisplayName;
    const planAdultPricing = data.planAdultPricing;
    const planChildPricing = data.planChildPricing;
    const selectedPlanDetails = data.selectedPlanDetails;

    if (!planDisplayName || !planAdultPricing || !planChildPricing || !selectedPlanDetails) {
      showErrorToast('Plan details are missing. Please revisit Travel Details step.', 'Error !!');
      goToStep(1);
      return;
    }

    const customerInformation = (data.customers || []).map((customer) => {
      const dobDate = customer.dateOfBirth ? new Date(customer.dateOfBirth + 'T00:00:00') : new Date();
      const dobISO = dobDate.toISOString();
      const genderCapitalized = customer.gender
        ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1).toLowerCase()
        : '';

      return {
        id: `${customer.dateOfBirth}#${customer.passportNumber}`,
        full_name: customer.fullName,
        passport_number: customer.passportNumber,
        nationality: customer.nationality,
        gender: genderCapitalized,
        dob: dobISO,
        entry_type: customer.isChild ? 'CHILD' : 'ADULT',
      };
    });

    const policyPayload = {
      travel_type:
        data.travellingSaudiWith && data.travellingSaudiWith.toLowerCase() !== 'individual' ? 'group' : 'individual',
      name: data.name,
      phone: data.phone,
      email: data.email,
      ...(data.travelAgencyName && { travel_agency_name: data.travelAgencyName }),
      name_nok: data.nextOfKinName,
      phone_nok: data.nextOfKinPhone,
      email_nok: data.nextOfKinEmail,
      date_of_departure: data.departureDate ? new Date(data.departureDate + 'T00:00:00').toISOString() : '',
      date_of_arrival: data.arrivalDate ? new Date(data.arrivalDate + 'T00:00:00').toISOString() : '',
      number_of_days: parseInt(data.numberOfDays || '0', 10),
      destination_country: data.destination,
      coverage_plan: planDisplayName,
      coverage_plan_id: planId,
      number_of_adults: data.adults || 0,
      number_of_children: data.children || 0,
      customer_information: customerInformation,
      is_info_correct: data.confirmInformationAccurate,
      is_not_discharged_from_hospital: data.notDischargedWithin30Days,
      is_pdpa_consent_accepted: data.pdpaConsent,
      payment_details: {
        orderCreationId: paymentMeta.orderCreationId,
        razorpayPaymentId: paymentMeta.razorpayPaymentId,
        razorpayOrderId: paymentMeta.razorpayOrderId,
        discount_amount: paymentMeta.discountAmount,
        bill_amount: paymentMeta.billAmount,
        final_bill_amount: paymentMeta.finalBillAmount,
        referral_code: paymentMeta.referralCode || '',
      },
      plan_details: {
        plan: selectedPlanDetails,
        adultPricing: planAdultPricing,
        childPricing: planChildPricing,
      },
    };

    try {
      const response = await purchasePolicy(policyPayload).unwrap();
      if (response?.data?.success) {
        showSuccessToast('Policy purchased successfully!', 'Success !!');
        navigation.navigate(Screens.BuyPolicySuccess);
      } else {
        showErrorToast('Failed to purchase policy', 'Error !!');
      }
    } catch (error: any) {
      console.error('Policy purchase error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to purchase policy';
      showErrorToast(errorMessage, 'Error !!');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ContactDetails control={control} errors={errors} watch={watch} />;
      case 1:
        return (
          <TravelDetails
            control={control}
            errors={errors}
            openDatePicker={openDatePicker}
            watch={watch}
            setValue={setValue}
          />
        );
      case 2:
        return (
          <CustomerDetails
            control={control}
            errors={errors}
            openDatePicker={openDatePicker}
            watch={watch}
            setValue={setValue}
          />
        );
      case 3:
        return <NoticeDeclaration control={control} errors={errors} />;
      case 4:
        return (
          <Payment
            watch={watch}
            onPaymentVerified={handlePaymentVerified}
          />
        );
      case 5:
        return (
          <PaymentDetailsSummary
            watch={watch}
            paymentMeta={paymentMeta}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout
      title={steps[currentStep].title}
      onBackPress={handleHeaderBack}
      showHeader={true}
    >
      <View style={[globalStyle(theme).container, { flex: 1 }]}>
        <View style={{ padding: metrics.doubleMargin, paddingBottom: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: metrics.baseMargin,
            }}
          >
            <Text style={[fontStyle(theme).headingSmall, { marginTop: 0 }]}>
              Step {currentStep + 1}/{steps.length}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[fontStyle(theme).headingSmall, { marginTop: 0 }]}>
              {getStepPercentage(currentStep)}%
            </Text>
          </View>
          <View style={styles(theme).progressBarContainer}>
            <View
              style={[
                styles(theme).progressBar,
                { width: `${getStepPercentage(currentStep)}%` },
              ]}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {renderStep()}
        </View>

        <View style={[styles(theme).buttonRow, { padding: metrics.doubleMargin, paddingTop: metrics.baseMargin }]}>
          {currentStep === steps.length - 1 && (
            <Text style={[fontStyle(theme).bodySmall, { textAlign: 'center', marginBottom: metrics.smallMargin }]}>
              Review the details above and tap submit to purchase the policy.
            </Text>
          )}
          {isPurchasingPolicy && currentStep === steps.length - 1 && (
            <Text style={[fontStyle(theme).bodySmall, { textAlign: 'center', marginBottom: metrics.smallMargin }]}>
              Processing payment, please wait...
            </Text>
          )}
          <UButton
            title={
              currentStep === steps.length - 1
                ? (isPurchasingPolicy ? 'Submitting...' : 'Submit')
                : 'Next'
            }
            onPress={
              currentStep === steps.length - 1
                ? handleFinalSubmit
                : handleNext
            }
            style={styles(theme).buttonFull}
          />
        </View>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={datePickerVisible === 'single'}
          onDismiss={onDismiss}
          date={selectedDateField ? getDateValue(selectedDateField) : undefined}
          onConfirm={onConfirm}
          validRange={getValidRange()}
        />
      </View>
      {/* </TouchableWithoutFeedback> */}
    </AppLayout>
  );
};

export default BuyPolicy;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    progressBarContainer: {
      height: 4,
      backgroundColor: '#E0E0E0',
      borderRadius: 2,
      marginBottom: metrics.doubleMargin,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    buttonRow: {
      backgroundColor: theme.colors.background,
    },
    buttonHalf: {
      flex: 1,
    },
    buttonFull: {
      width: '100%',
    },
  });
