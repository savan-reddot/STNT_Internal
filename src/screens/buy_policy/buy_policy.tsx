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
  { id: 5, title: 'Preview Submission' },
  { id: 6, title: 'Payment' },
];

const getStepPercentage = (stepIndex: number) =>
  Math.round(((stepIndex + 1) / steps.length) * 100);

const convertDateToISO = (value?: string) => {
  if (!value) {
    return '';
  }
  // If already an ISO string (full timestamp), return as is
  if (value.includes('T') && value.includes('Z')) {
    return value;
  }
  // If it's an ISO string without Z, try to parse it
  if (value.includes('T')) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  // Handle YYYY-MM-DD format (legacy support)
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  // expect DD/MM/YYYY (legacy support)
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const isoDate = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }
  }
  const fallback = new Date(value);
  return isNaN(fallback.getTime()) ? '' : fallback.toISOString();
};

const BuyPolicy = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [datePickerVisible, setDatePickerVisible] = useState<string | null>(null);
  const [selectedDateField, setSelectedDateField] = useState<string>('');
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);
  const [selectedFlightIndex, setSelectedFlightIndex] = useState<number | 'new' | null>(null);
  const [newFlightDate, setNewFlightDate] = useState<string>('');
  const [currentFlightModalDate, setCurrentFlightModalDate] = useState<string>('');
  const [paymentMeta, setPaymentMeta] = useState<PaymentCompletionData | null>(null);
  const [policy_purchase_form, { isLoading: isPurchasingPolicy }] = usePolicy_purchase_formMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PolicyFormData>({
    mode: 'onChange',
    defaultValues: {
      travellingSaudiWith: __DEV__ ? 'individual' : '',
      travelAgencyName: '',
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      phone_code: '+65',
      phone: __DEV__ ? '7698533947' : '',
      email: user?.email || '',
      nextOfKinName: __DEV__ ? 'test' : '',
      phone_code_nok: '+65',
      nextOfKinPhone: __DEV__ ? '7698533944' : '',
      nextOfKinEmail: __DEV__ ? 'savan@gmail.com' : '',
      departureDate: __DEV__ ? '25/11/2025' : '',
      arrivalDate: __DEV__ ? '26/11/2025' : '',
      numberOfDays: __DEV__ ? "2" : '',
      destination: __DEV__ ? 'Saudi Arabia' : '',
      umrahCoveragePlan: '',
      countryOfTravel: '',
      selectedPlanDisplayName: '',
      selectedPlanCode: '',
      coveragePlanDetailsText: '',
      selectedPlanDetails: null,
      planAdultPricing: null,
      planChildPricing: null,
      adults: __DEV__ ? 1 : 0,
      children: 0,
      flightNumberDeparture: __DEV__ ? '111' : '',
      flightDepartureDateDeparture: __DEV__ ? '25/11/2025' : '',
      flightNumberArrival: __DEV__ ? '222' : '',
      flightDepartureDateArrival: __DEV__ ? '26/11/2025' : '',
      additionalFlights: __DEV__ ? [{ flight_number: '123', departure_date: '25/11/2025' }] : [],
      customers: [],
      pdpaConsent: __DEV__ ? true : false,
      notDischargedWithin30Days: __DEV__ ? true : false,
      confirmInformationAccurate: __DEV__ ? true : false,
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
    if (boundedStep <= 3) {
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

        const passportRegex = /^[A-Za-z]\d{7}[A-Za-z]?$/;
        let hasInvalidPassport = false;
        customers.forEach((customer, index) => {
          const passport = (customer?.passportNumber || '').trim();
          if (!passportRegex.test(passport)) {
            setError(`customers.${index}.passportNumber` as any, {
              type: 'manual',
              message: 'Passport number format is incorrect',
            });
            hasInvalidPassport = true;
          } else {
            clearErrors && clearErrors(`customers.${index}.passportNumber` as any);
          }
        });
        if (hasInvalidPassport) {
          return false;
        }
        return customerResult;
      case 3: // Notice & Declaration
        const noticeFields: (keyof PolicyFormData)[] = [
          'pdpaConsent',
          'notDischargedWithin30Days',
          'confirmInformationAccurate',
        ];
        const noticeResult = await trigger(noticeFields);
        return noticeResult;
      case 4: // Payment Details Summary
        // No validation needed for summary step
        return true;
      case 5: // Payment
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
      // Get selected date components
      const selectedYear = params.date.getFullYear();
      const selectedMonth = params.date.getMonth();
      const selectedDay = params.date.getDate();

      // Get current time components
      const now = new Date();
      const currentHours = now.getUTCHours();
      const currentMinutes = now.getUTCMinutes();
      const currentSeconds = now.getUTCSeconds();
      const currentMilliseconds = now.getUTCMilliseconds();

      // Combine selected date with current time in UTC
      const combinedTimestamp = Date.UTC(
        selectedYear,
        selectedMonth,
        selectedDay,
        currentHours,
        currentMinutes,
        currentSeconds,
        currentMilliseconds
      );
      const combinedDate = new Date(combinedTimestamp);
      const fullTimestampISO = combinedDate.toISOString();
      const formattedDate = fullTimestampISO;

      // Handle customer details date fields
      if (selectedCustomerIndex !== null && selectedDateField === 'dateOfBirth') {
        setValue(`customers.${selectedCustomerIndex}.${selectedDateField}` as any, formattedDate);
      } else if (selectedFlightIndex !== null && selectedDateField.startsWith('additionalFlightDate')) {
        // Handle additional flight date - update the flight in the array
        if (selectedFlightIndex === 'new') {
          // For new flights, store the date in state to be picked up by travelDetails
          setNewFlightDate(formattedDate);
        } else if (typeof selectedFlightIndex === 'number') {
          // For editing existing flights, also update via newFlightDate so travelDetails can pick it up
          setNewFlightDate(formattedDate);
          // Also update directly in the array
          const currentFlights = watch('additionalFlights') || [];
          const updatedFlights = [...currentFlights];
          if (updatedFlights[selectedFlightIndex]) {
            updatedFlights[selectedFlightIndex] = {
              ...updatedFlights[selectedFlightIndex],
              departure_date: formattedDate,
            };
            setValue('additionalFlights', updatedFlights);
          }
        }
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
            // Parse the ISO timestamps and extract just the date part (UTC)
            const depDate = new Date(departureDate);
            const arrDate = new Date(arrivalDate);

            // Extract UTC date components to calculate days difference
            const depUTC = Date.UTC(
              depDate.getUTCFullYear(),
              depDate.getUTCMonth(),
              depDate.getUTCDate()
            );
            const arrUTC = Date.UTC(
              arrDate.getUTCFullYear(),
              arrDate.getUTCMonth(),
              arrDate.getUTCDate()
            );

            const diff = arrUTC - depUTC;
            const dayInMs = 1000 * 60 * 60 * 24;
            const inclusiveDays = Math.floor(Math.max(0, diff) / dayInMs) + 1;
            setValue('numberOfDays', inclusiveDays.toString());
          }
        }
      }
    }
    setDatePickerVisible(null);
    setSelectedDateField('');
    setSelectedCustomerIndex(null);
    setSelectedFlightIndex(null);
    setCurrentFlightModalDate('');
  };

  const openDatePicker = (fieldName: string, index?: number, flightIndex?: number | 'new', currentDate?: string) => {
    setSelectedDateField(fieldName);
    setSelectedCustomerIndex(index !== undefined ? index : null);
    setSelectedFlightIndex(flightIndex !== undefined ? flightIndex : null);
    if (currentDate) {
      setCurrentFlightModalDate(currentDate);
    }
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

    // Handle additional flight date fields
    if (selectedFlightIndex !== null && fieldName.startsWith('additionalFlightDate')) {
      if (selectedFlightIndex === 'new') {
        // For new flights, use newFlightDate if available, otherwise use currentFlightModalDate
        if (newFlightDate) {
          const date = new Date(newFlightDate);
          return isNaN(date.getTime()) ? undefined : date;
        }
        if (currentFlightModalDate) {
          const date = new Date(currentFlightModalDate);
          return isNaN(date.getTime()) ? undefined : date;
        }
        // Return today's date as default for new flights
        return new Date();
      } else if (typeof selectedFlightIndex === 'number') {
        // First check if we have a currentFlightModalDate (from the modal)
        if (currentFlightModalDate) {
          const date = new Date(currentFlightModalDate);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
        // Otherwise, get from the flights array
        const flights = watch('additionalFlights') || [];
        const flight = flights[selectedFlightIndex];
        if (flight && flight.departure_date) {
          const date = new Date(flight.departure_date);
          return isNaN(date.getTime()) ? undefined : date;
        }
        // If editing but no date exists, return today's date
        return new Date();
      }
      return undefined;
    }

    const value = watch(fieldName as keyof PolicyFormData);
    if (value && typeof value === 'string') {
      // Handle ISO string (full timestamp) format
      if (value.includes('T') && (value.includes('Z') || value.includes('+'))) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      }
      // Handle YYYY-MM-DD format (legacy support)
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
      }
      // Fallback to direct parsing
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
        return { startDate: depDate };
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
    handleFinalSubmit(data);
  };

  const handleFinalSubmit = (paymentData?: PaymentCompletionData) => {
    if (isPurchasingPolicy) {
      return;
    }
    // Use paymentData if provided, otherwise use paymentMeta from state
    const finalPaymentData = paymentData || paymentMeta;
    if (!finalPaymentData) {
      showErrorToast('Complete your payment before submitting', 'Error !!');
      return;
    }
    handleSubmit((formData) => onSubmit(formData, finalPaymentData))();
  };

  const onSubmit = async (data: PolicyFormData, paymentData: PaymentCompletionData) => {
    if (!paymentData?.razorpayPaymentId || !paymentData?.orderCreationId || !paymentData?.razorpayOrderId) {
      showErrorToast('Complete your payment before submitting', 'Error !!');
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
      const dobISO = convertDateToISO(customer.dateOfBirth);
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

    // Format additional flights for backend
    const additionalFlightDetails = (data.additionalFlights || []).map((flight) => ({
      flight_number: flight.flight_number,
      departure_date: convertDateToISO(flight.departure_date),
    }));

    const policyPayload = {
      travel_type:
        data.travellingSaudiWith && data.travellingSaudiWith.toLowerCase() !== 'individual' ? 'group' : 'individual',
      name: data.name,
      phone: data.phone,
      phone_code: data.phone_code || '+65',
      email: data.email,
      ...(data.travelAgencyName && { travel_agency_name: data.travelAgencyName }),
      name_nok: data.nextOfKinName,
      phone_nok: data.nextOfKinPhone,
      phone_code_nok: data.phone_code_nok || '+65',
      email_nok: data.nextOfKinEmail,
      date_of_departure: convertDateToISO(data.departureDate),
      date_of_arrival: convertDateToISO(data.arrivalDate),
      number_of_days: parseInt(data.numberOfDays || '0', 10),
      destination_country: data.destination,
      coverage_plan: planDisplayName,
      coverage_plan_id: planId,
      number_of_adults: data.adults || 0,
      number_of_children: data.children || 0,
      departure_flight_number: data.flightNumberDeparture || null,
      departure_flight_date: data.flightDepartureDateDeparture ? convertDateToISO(data.flightDepartureDateDeparture) : null,
      arrival_flight_number: data.flightNumberArrival || null,
      arrival_flight_date: data.flightDepartureDateArrival ? convertDateToISO(data.flightDepartureDateArrival) : null,
      additional_flight_details: additionalFlightDetails.length > 0 ? additionalFlightDetails : null,
      customer_information: customerInformation,
      is_info_correct: data.confirmInformationAccurate,
      is_not_discharged_from_hospital: data.notDischargedWithin30Days,
      is_pdpa_consent_accepted: data.pdpaConsent,
      payment_details: {
        orderCreationId: paymentData?.orderCreationId,
        razorpayPaymentId: paymentData?.razorpayPaymentId,
        razorpayOrderId: paymentData?.razorpayOrderId,
        discount_amount: paymentData?.discountAmount,
        bill_amount: paymentData?.billAmount,
        final_bill_amount: paymentData?.finalBillAmount,
        referral_code: paymentData?.referralCode || '',
      },
      plan_details: {
        plan: selectedPlanDetails,
        adultPricing: planAdultPricing,
        childPricing: planChildPricing,
      },
    };

    console.log('policyPayload ----> ', policyPayload);
    try {
      const response = await policy_purchase_form(policyPayload).unwrap();
      console.log('response ----> ', response);
      if (response?.success) {
        showSuccessToast('Policy purchased successfully!', 'Success !!');
        navigation.navigate(Screens.BuyPolicySuccess);
      } else {
        showErrorToast('Failed to purchase policy', 'Error !!');
      }
    } catch (error: any) {
      console.error('Policy purchase error:', error);
      const errorMessage = error?.data?.errorMessage || error?.message || 'Failed to purchase policy';
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
            newFlightDate={newFlightDate}
            onNewFlightDateUsed={() => setNewFlightDate('')}
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
          <PaymentDetailsSummary watch={watch} />
        );
      case 5:
        return (
          <Payment
            watch={watch}
            onPaymentVerified={handlePaymentVerified}
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

