import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MD3Theme, useTheme, TextInput } from 'react-native-paper';
import { Control, Controller, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { globalStyle } from '../../../utils/globalStyles';
import { PolicyFormData } from '../types';
import KeyboardAwareContainer from '../components/KeyboardAwareContainer';
import { format, parse } from 'date-fns';
import { useLazyCountriesQuery } from '../../../redux/services';

interface TravelDetailsProps {
  control: Control<PolicyFormData>;
  errors: FieldErrors<PolicyFormData>;
  openDatePicker: (fieldName: string) => void;
  watch: UseFormWatch<PolicyFormData>;
  setValue: any;
}

const umrahCoverageOptions = [
  { label: 'UMRAH EMA', value: 'umrah_ema' },
  { label: 'Basic Plan', value: 'basic' },
  { label: 'Standard Plan', value: 'standard' },
  { label: 'Premium Plan', value: 'premium' },
];

// Dummy pricing data for plans
const planPricingData: Record<string, {
  adultPrice: number;
  childPrice: number;
  extraPerDay: number;
  maxDays: number;
}> = {
  umrah_ema: {
    adultPrice: 140.0,
    childPrice: 115.0,
    extraPerDay: 15.0,
    maxDays: 16,
  },
  basic: {
    adultPrice: 100.0,
    childPrice: 80.0,
    extraPerDay: 10.0,
    maxDays: 14,
  },
  standard: {
    adultPrice: 150.0,
    childPrice: 120.0,
    extraPerDay: 20.0,
    maxDays: 18,
  },
  premium: {
    adultPrice: 200.0,
    childPrice: 160.0,
    extraPerDay: 25.0,
    maxDays: 21,
  },
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Parse YYYY-MM-DD format
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(date, 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
};

const Counter: React.FC<{
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}> = ({ value, onIncrement, onDecrement, disabled = false }) => {
  const theme = useTheme();
  return (
    <View style={styles(theme).counterContainer}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={disabled || value <= 0}
        style={[
          styles(theme).counterButton,
          (disabled || value <= 0) && styles(theme).counterButtonDisabled,
        ]}
      >
        <Icon
          name="remove"
          size={20}
          color={disabled || value <= 0 ? '#ccc' : theme.colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles(theme).counterValue}>{value}</Text>
      <TouchableOpacity
        onPress={onIncrement}
        style={styles(theme).counterButton}
      >
        <Icon name="add" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const TravelDetails: React.FC<TravelDetailsProps> = ({
  control,
  errors,
  openDatePicker,
  watch,
  setValue,
}) => {
  const theme = useTheme();
  const [countries] = useLazyCountriesQuery();
  const [destinationOptions, setDestinationOptions] = useState<Array<{ label: string; value: string }>>([]);
  const selectedPlan = watch('umrahCoveragePlan');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const numberOfDays = parseInt(watch('numberOfDays') || '0', 10);

  // Get selected plan details
  const selectedPlanOption = umrahCoverageOptions.find(plan => plan.value === selectedPlan);
  const planName = selectedPlanOption?.label || '';
  const planPricing = selectedPlan ? planPricingData[selectedPlan] : null;

  // Calculate pricing
  let adultFeePerPerson = 0;
  let childFeePerPerson = 0;
  let adultExtraDays = 0;
  let childExtraDays = 0;

  if (planPricing) {
    if (numberOfDays <= planPricing.maxDays) {
      adultFeePerPerson = planPricing.adultPrice;
      childFeePerPerson = planPricing.childPrice;
    } else {
      const extraDays = numberOfDays - planPricing.maxDays;
      adultFeePerPerson = planPricing.adultPrice + (extraDays * planPricing.extraPerDay);
      childFeePerPerson = planPricing.childPrice + (extraDays * planPricing.extraPerDay);
      adultExtraDays = extraDays;
      childExtraDays = extraDays;
    }
  }

  const adultFee = adults * adultFeePerPerson;
  const childFee = children * childFeePerPerson;
  const totalPrice = adultFee + childFee;

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const resp = await countries(0);
        if (resp?.data) {
          const { countries: countriesList } = resp.data;
          if (countriesList?.length > 0) {
            setDestinationOptions(
              countriesList.map((country: string) => ({
                label: country,
                value: country,
              })),
            );
          }
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, [countries]);

  // Update pricing when plan, adults, children, or days change
  useEffect(() => {
    if (selectedPlan && planPricing) {
      const pricing = `$${totalPrice.toFixed(2)}`;
      setValue('countryOfTravel', pricing);
    } else {
      setValue('countryOfTravel', '');
    }
  }, [selectedPlan, adults, children, numberOfDays, totalPrice, planPricing, setValue]);

  return (
    <KeyboardAwareContainer>
      <View>
        <Text style={[fontStyle(theme).headingMedium, { marginBottom: metrics.doubleMargin }]}>
          Travel Details
        </Text>

        <Controller
          control={control}
          name="departureDate"
          rules={{ required: 'Departure date is required' }}
          render={({ field: { value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Date of departure (from Singapore)<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker('departureDate')}
                activeOpacity={0.7}
              >
                <TextInput
                  mode="outlined"
                  placeholder="DD/MM/YYYY"
                  value={formatDateForDisplay(value)}
                  editable={false}
                  pointerEvents="box-none"
                  style={{ height: metrics.screenWidth * 0.13 }}
                  outlineStyle={{ borderRadius: metrics.baseRadius }}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => openDatePicker('departureDate')}
                    />
                  }
                  error={!!errors.departureDate}
                />
              </TouchableOpacity>
              {errors.departureDate && (
                <Text style={styles(theme).errorText}>{errors.departureDate.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="arrivalDate"
          rules={{ required: 'Arrival date is required' }}
          render={({ field: { value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Date of arrival (in Singapore)<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker('arrivalDate')}
                activeOpacity={0.7}
              >
                <TextInput
                  mode="outlined"
                  placeholder="DD/MM/YYYY"
                  value={formatDateForDisplay(value)}
                  editable={false}
                  pointerEvents="box-none"
                  style={{ height: metrics.screenWidth * 0.13 }}
                  outlineStyle={{ borderRadius: metrics.baseRadius }}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => openDatePicker('arrivalDate')}
                    />
                  }
                  error={!!errors.arrivalDate}
                />
              </TouchableOpacity>
              {errors.arrivalDate && (
                <Text style={styles(theme).errorText}>{errors.arrivalDate.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="numberOfDays"
          rules={{ required: 'Number of days is required' }}
          render={({ field: { value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Number of days<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="0"
                value={value || '0'}
                editable={false}
                style={{ height: metrics.screenWidth * 0.13 }}
                outlineStyle={{ borderRadius: metrics.baseRadius }}
                error={!!errors.numberOfDays}
              />
              {errors.numberOfDays && (
                <Text style={styles(theme).errorText}>{errors.numberOfDays.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="destination"
          rules={{ required: 'Destination is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Destination<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={destinationOptions}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={value}
                onChange={(item) => onChange(item.value)}
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
              />
              {errors.destination && (
                <Text style={styles(theme).errorText}>
                  {errors.destination.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="umrahCoveragePlan"
          rules={{ required: 'Umrah coverage plan is required' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Umrah coverage plan<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={umrahCoverageOptions}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={value}
                onChange={(item) => {
                  onChange(item.value);
                }}
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
              />
              {errors.umrahCoveragePlan && (
                <Text style={styles(theme).errorText}>
                  {errors.umrahCoveragePlan.message}
                </Text>
              )}
            </View>
          )}
        />

        {selectedPlan && planPricing && (
          <View style={styles(theme).fieldContainer}>
            <Text style={fontStyle(theme).headingSmall}>
              {planName} Plan Pricing
            </Text>
            <View style={styles(theme).pricingContainer}>
              <Text style={styles(theme).pricingText}>
                Duration of Travel: CHILD - Up to {planPricing.maxDays} days (Below 18 years old): ${planPricing.childPrice.toFixed(0)} ADULT- Up to {planPricing.maxDays} days (Above 18 years old): ${planPricing.adultPrice.toFixed(0)} Additional Days: ${planPricing.extraPerDay.toFixed(0)}/Day
              </Text>
            </View>

            <View style={styles(theme).feeDetailsContainer}>
              <View style={styles(theme).feeRow}>
                <Text style={styles(theme).feeLabel}>Adult Fees</Text>
                <View style={styles(theme).feeValues}>
                  <Text style={styles(theme).feeText}>Price: $ {planPricing.adultPrice.toFixed(2)}</Text>
                  <Text style={styles(theme).feeText}>Extra: $ {planPricing.extraPerDay.toFixed(2)}/Day</Text>
                </View>
              </View>

              <View style={styles(theme).feeRow}>
                <Text style={styles(theme).feeLabel}>Child Fees</Text>
                <View style={styles(theme).feeValues}>
                  <Text style={styles(theme).feeText}>Price: $ {planPricing.childPrice.toFixed(2)}</Text>
                  <Text style={styles(theme).feeText}>Extra: $ {planPricing.extraPerDay.toFixed(2)}/Day</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles(theme).fieldContainer}>
          <View style={styles(theme).counterRow}>
            <Text style={fontStyle(theme).headingSmall}>Adults</Text>
            <Controller
              control={control}
              name="adults"
              render={({ field: { value } }) => (
                <Counter
                  value={value || 0}
                  onIncrement={() => setValue('adults', (value || 0) + 1)}
                  onDecrement={() => setValue('adults', Math.max(0, (value || 0) - 1))}
                />
              )}
            />
          </View>
        </View>

        <View style={styles(theme).fieldContainer}>
          <View style={styles(theme).counterRow}>
            <View style={styles(theme).childrenLabelContainer}>
              <Text style={fontStyle(theme).headingSmall}>Children</Text>
              <Text style={styles(theme).childrenHint}>0 - 17 years old</Text>
            </View>
            <Controller
              control={control}
              name="children"
              render={({ field: { value } }) => (
                <Counter
                  value={value || 0}
                  onIncrement={() => setValue('children', (value || 0) + 1)}
                  onDecrement={() => setValue('children', Math.max(0, (value || 0) - 1))}
                />
              )}
            />
          </View>
        </View>

        {/* Price Summary */}
        {selectedPlan && (
          <View style={styles(theme).priceSummary}>
            <View style={styles(theme).totalRow}>
              <Text style={styles(theme).totalLabel}>
                Total price based on number of Adults and Children selected
              </Text>
              <Text style={styles(theme).totalValue}>$ {totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAwareContainer>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    fieldContainer: {
      marginBottom: metrics.baseMargin * 2,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: metrics.smallMargin,
      marginHorizontal: metrics.baseMargin,
    },
    placeholderStyle: {
      fontSize: 14,
      color: '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: theme.colors.onBackground,
    },
    dropdownContainer: {
      borderRadius: metrics.baseRadius,
      borderColor: '#E6EBF1',
      borderWidth: 1,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    childrenLabelContainer: {
      flex: 1,
    },
    counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    counterButton: {
      width: 36,
      height: 36,
      borderRadius: 0,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    counterButtonDisabled: {
      borderColor: '#ccc',
      backgroundColor: 'transparent',
    },
    counterValue: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: metrics.doubleMargin,
      minWidth: 30,
      textAlign: 'center',
      color: theme.colors.onBackground,
    },
    childrenHint: {
      fontSize: 12,
      color: '#999',
      marginTop: 2,
    },
    pricingContainer: {
      backgroundColor: '#f9f9f9',
      padding: metrics.baseMargin * 2,
      borderRadius: metrics.baseRadius,
      marginTop: metrics.baseMargin,
    },
    pricingText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    feeDetailsContainer: {
      marginTop: metrics.baseMargin * 2,
    },
    feeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: metrics.baseMargin * 2,
    },
    feeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      flex: 1,
    },
    feeValues: {
      flex: 1,
      alignItems: 'flex-end',
    },
    feeText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      marginBottom: metrics.smallMargin,
    },
    priceSummary: {
      backgroundColor: '#F5F5DC',
      borderRadius: metrics.baseRadius,
      padding: metrics.doubleMargin,
      marginTop: metrics.baseMargin * 2,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
      flex: 1,
      marginRight: metrics.baseMargin,
    },
    totalValue: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '600',
    },
  });

export default TravelDetails;
