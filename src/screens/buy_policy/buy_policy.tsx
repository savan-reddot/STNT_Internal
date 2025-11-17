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
import { PolicyFormData } from './types';
import ContactDetails from './steps/contactDetails';
import TravelDetails from './steps/travelDetails';
import CustomerDetails from './steps/customerDetails';
import NoticeDeclaration from './steps/noticeDeclaration';
import Payment from './steps/payment';

const steps = [
  { id: 1, title: 'Contact Details', percentage: 20 },
  { id: 2, title: 'Travel Details', percentage: 40 },
  { id: 3, title: 'Customer Details', percentage: 60 },
  { id: 4, title: 'Notice & Declaration', percentage: 80 },
  { id: 5, title: 'Payment', percentage: 100 },
];

const BuyPolicy = ({ navigation }: any) => {
  const theme = useTheme();
  const user = useAppSelector(getUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [datePickerVisible, setDatePickerVisible] = useState<string | null>(null);
  const [selectedDateField, setSelectedDateField] = useState<string>('');
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<PolicyFormData>({
    mode: 'onChange',
    defaultValues: {
      travellingSaudiWith: 'Individual',
      travelAgencyName: '',
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      phone: '7698533947',
      email: user?.email || '',
      nextOfKinName: 'test',
      nextOfKinPhone: '7698533947',
      nextOfKinEmail: 'savan@gmail.com',
      departureDate: '15/11/2025',
      arrivalDate: '25/11/2025',
      numberOfDays: '0',
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
      importantNoticeDeclaration: false,
      pdpaConsent: false,
      freeIndependentTraveller: false,
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
          'importantNoticeDeclaration',
          'pdpaConsent',
          'freeIndependentTraveller',
          'notDischargedWithin30Days',
          'confirmInformationAccurate',
        ];
        const noticeResult = await trigger(noticeFields);
        return noticeResult;
      case 4: // Payment
        // Payment step doesn't require validation - referral code is optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleHeaderBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  const onSubmit = (data: PolicyFormData) => {
    console.log('Policy Form Data:', data);
    // TODO: Submit to API when available
    Alert.alert(
      'Success',
      'Policy form submitted successfully! (API integration pending)',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
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
        return <Payment control={control} errors={errors} watch={watch} getValues={getValues} />;
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
              {steps[currentStep].percentage}%
            </Text>
          </View>
          <View style={styles(theme).progressBarContainer}>
            <View
              style={[
                styles(theme).progressBar,
                { width: `${steps[currentStep].percentage}%` },
              ]}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {renderStep()}
        </View>

        <View style={[styles(theme).buttonRow, { padding: metrics.doubleMargin, paddingTop: metrics.baseMargin }]}>
          <UButton
            title={currentStep === steps.length - 1 ? 'Submit' : 'Next'}
            onPress={
              currentStep === steps.length - 1
                ? handleSubmit(onSubmit)
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
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
    },
    buttonHalf: {
      flex: 1,
    },
    buttonFull: {
      width: '100%',
    },
  });
