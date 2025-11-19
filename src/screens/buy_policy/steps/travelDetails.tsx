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
import { useLazyCountriesQuery, useLazyGetplansQuery, useLazyPlanPricingQuery } from '../../../redux/services';

interface TravelDetailsProps {
  control: Control<PolicyFormData>;
  errors: FieldErrors<PolicyFormData>;
  openDatePicker: (fieldName: string) => void;
  watch: UseFormWatch<PolicyFormData>;
  setValue: any;
}

// Plan pricing interface
interface PlanPricingData {
  adultPrice: number;
  childPrice: number;
  extraPerDay: number;
  maxDays: number;
  pricingString: string;
  adultPricingRaw?: any;
  childPricingRaw?: any;
}

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
  const [getplans] = useLazyGetplansQuery();
  const [planPricing] = useLazyPlanPricingQuery();

  const [destinationOptions, setDestinationOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [umrahCoverageOptions, setUmrahCoverageOptions] = useState<Array<{
    label: string;
    value: string;
    id: number;
    plan_code?: string;
    trip_days_cap?: number;
    rawPlan?: any;
  }>>([]);
  const [planPricingData, setPlanPricingData] = useState<Record<string, PlanPricingData>>({});
  const [hasFetchedPlans, setHasFetchedPlans] = useState(false);
  const [hasFetchedPricing, setHasFetchedPricing] = useState(false);
  const [previousDestination, setPreviousDestination] = useState<string>('');

  const selectedDestination = watch('destination');
  const selectedPlan = watch('umrahCoveragePlan');
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const numberOfDays = parseInt(watch('numberOfDays') || '0', 10);

  // Get selected plan details
  const selectedPlanOption = umrahCoverageOptions.find((plan: any) => plan.value === selectedPlan);
  const planName = selectedPlanOption?.label || '';
  const currentPlanPricing = selectedPlan ? planPricingData[selectedPlan] : null;

  // Calculate pricing
  let adultFeePerPerson = 0;
  let childFeePerPerson = 0;

  if (currentPlanPricing) {
    if (numberOfDays <= currentPlanPricing.maxDays) {
      adultFeePerPerson = currentPlanPricing.adultPrice;
      childFeePerPerson = currentPlanPricing.childPrice;
    } else {
      const extraDays = numberOfDays - currentPlanPricing.maxDays;
      adultFeePerPerson = currentPlanPricing.adultPrice + (extraDays * currentPlanPricing.extraPerDay);
      childFeePerPerson = currentPlanPricing.childPrice + (extraDays * currentPlanPricing.extraPerDay);
    }
  }

  const adultFee = adults * adultFeePerPerson;
  const childFee = children * childFeePerPerson;
  const totalPrice = adultFee + childFee;

  // Fetch countries on mount
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

  // Reset plans and pricing when destination changes
  useEffect(() => {
    if (selectedDestination && selectedDestination !== previousDestination && previousDestination !== '') {
      // Reset flags and data when destination changes (not on initial set)
      setHasFetchedPlans(false);
      setHasFetchedPricing(false);
      setUmrahCoverageOptions([]);
      setPlanPricingData({});
      setValue('umrahCoveragePlan', '');
      setValue('countryOfTravel', '');
    }
    setPreviousDestination(selectedDestination || '');
  }, [selectedDestination, previousDestination, setValue]);

  const normalizeString = (value?: string) => (value || '').trim().toLowerCase();

  // Fetch plans when destination is selected (only once per destination)
  useEffect(() => {
    const fetchPlans = async () => {
      if (selectedDestination && !hasFetchedPlans) {
        try {
          const resp = await getplans(0);
          console.log('fetchPlans', resp?.data?.data?.rows);
          if (resp?.data?.success) {
            const plansList = resp?.data?.data?.rows;
            if (Array.isArray(plansList) && plansList.length > 0) {
              const normalizedDestination = normalizeString(selectedDestination);
              const filteredPlans = plansList.filter((plan: any) => {
                const coverage = normalizeString(plan?.destination_coverage);
                if (!coverage || coverage === 'worldwide') {
                  return true;
                }
                return coverage === normalizedDestination;
              });

              const options = filteredPlans
                .map((plan: any) => ({
                  label: plan.display_name,
                  value: plan.id?.toString(),
                  id: plan.id,
                  plan_code: plan.plan_code,
                  trip_days_cap: plan.trip_days_cap,
                  rawPlan: plan,
                }))
                .sort((a, b) => a.id - b.id); // Sort by ID in ascending order
              setUmrahCoverageOptions(options);
              setHasFetchedPlans(true);
            }
          }
        } catch (error) {
          console.error('Error fetching plans:', error);
        }
      }
    };
    fetchPlans();
  }, [selectedDestination, hasFetchedPlans, getplans]);

  // Fetch pricing for all plans when plans are loaded (only once)
  useEffect(() => {
    const fetchAllPricing = async () => {
      if (umrahCoverageOptions.length > 0 && !hasFetchedPricing) {
        try {
          // Fetch all pricings at once
          const resp = await planPricing(0);
          console.log('fetchAllPricing', resp?.data?.data?.rows);
          if (resp?.data?.success) {
            const allPricings = resp?.data?.data?.rows || [];
            // Process pricing for each plan
            const pricingMap: Record<string, PlanPricingData> = {};

            umrahCoverageOptions.forEach((plan: any) => {
              // Filter pricings by plan_id
              const planPricings = allPricings.filter((p: any) =>
                p.plan_id === plan.id
              );

              if (planPricings.length > 0) {
                // Filter ADULT and CHILD pricing
                const adultPricing = planPricings.find((p: any) =>
                  p.age_band === 'ADULT' || p.age_band === 'adult'
                );
                const childPricing = planPricings.find((p: any) =>
                  p.age_band === 'CHILD' || p.age_band === 'child'
                );

                if (adultPricing && childPricing) {
                  const maxDays = plan.trip_days_cap || 0;
                  const adultPrice = adultPricing.base_premium;
                  const childPrice = childPricing.base_premium;
                  const extraPerDay = adultPricing.per_extra_day_rate || childPricing.per_extra_day_rate;

                  // Generate pricing string
                  const pricingString = `Duration of Travel: CHILD - Up to ${maxDays} days (Below 18 years old): $${childPrice.toFixed(0)} ADULT- Up to ${maxDays} days (Above 18 years old): $${adultPrice.toFixed(0)} Additional Days: $${extraPerDay.toFixed(0)}/Day`;

                  pricingMap[plan.value] = {
                    adultPrice,
                    childPrice,
                    extraPerDay,
                    maxDays,
                    pricingString,
                    adultPricingRaw: adultPricing,
                    childPricingRaw: childPricing,
                  };
                }
              }
            });

            setPlanPricingData(pricingMap);
            setHasFetchedPricing(true);
          }
        } catch (error) {
          console.error('Error fetching pricing:', error);
        }
      }
    };
    fetchAllPricing();
  }, [umrahCoverageOptions, selectedPlan, hasFetchedPricing, planPricing]);

  // Update pricing when plan, adults, children, or days change
  useEffect(() => {
    if (selectedPlan && currentPlanPricing) {
      const pricing = `$${totalPrice.toFixed(2)}`;
      setValue('countryOfTravel', pricing);
    } else {
      setValue('countryOfTravel', '');
    }
  }, [selectedPlan, adults, children, numberOfDays, totalPrice, currentPlanPricing, setValue]);

  // Store selected plan metadata in form
  useEffect(() => {
    if (selectedPlanOption && currentPlanPricing) {
      setValue('selectedPlanDisplayName', selectedPlanOption.label || '');
      setValue('selectedPlanCode', selectedPlanOption.plan_code || '');
      setValue('coveragePlanDetailsText', currentPlanPricing.pricingString);
      setValue('selectedPlanDetails', selectedPlanOption.rawPlan || null);
      setValue('planAdultPricing', currentPlanPricing.adultPricingRaw || null);
      setValue('planChildPricing', currentPlanPricing.childPricingRaw || null);
    } else {
      setValue('selectedPlanDisplayName', '');
      setValue('selectedPlanCode', '');
      setValue('coveragePlanDetailsText', '');
      setValue('selectedPlanDetails', null);
      setValue('planAdultPricing', null);
      setValue('planChildPricing', null);
    }
  }, [selectedPlanOption, currentPlanPricing, setValue]);

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
                placeholder="Select Destination"
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
                style={[
                  globalStyle(theme).dropdown,
                  !selectedDestination && styles(theme).dropdownDisabled,
                ]}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={umrahCoverageOptions}
                labelField="label"
                valueField="value"
                placeholder={selectedDestination ? "Select plan" : "Please select destination first"}
                value={value}
                onChange={(item) => {
                  onChange(item.value);
                }}
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
                disable={!selectedDestination}
              />
              {errors.umrahCoveragePlan && (
                <Text style={styles(theme).errorText}>
                  {errors.umrahCoveragePlan.message}
                </Text>
              )}
            </View>
          )}
        />

        {selectedPlan && currentPlanPricing && (
          <View style={styles(theme).fieldContainer}>
            <Text style={fontStyle(theme).headingSmall}>
              {planName} Plan Pricing
            </Text>
            <View style={styles(theme).pricingContainer}>
              <Text style={styles(theme).pricingText}>
                {currentPlanPricing.pricingString}
              </Text>
            </View>

            <View style={styles(theme).feeDetailsContainer}>
              <View style={styles(theme).feeRow}>
                <Text style={styles(theme).feeLabel}>Adult Fees</Text>
                <View style={styles(theme).feeValues}>
                  <Text style={styles(theme).feeText}>Price: $ {currentPlanPricing.adultPrice.toFixed(2)}</Text>
                  <Text style={styles(theme).feeText}>Extra: $ {currentPlanPricing.extraPerDay.toFixed(2)}/Day</Text>
                </View>
              </View>

              <View style={styles(theme).feeRow}>
                <Text style={styles(theme).feeLabel}>Child Fees</Text>
                <View style={styles(theme).feeValues}>
                  <Text style={styles(theme).feeText}>Price: $ {currentPlanPricing.childPrice.toFixed(2)}</Text>
                  <Text style={styles(theme).feeText}>Extra: $ {currentPlanPricing.extraPerDay.toFixed(2)}/Day</Text>
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
    dropdownDisabled: {
      opacity: 0.5,
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
