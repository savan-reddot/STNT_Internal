import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { MD3Theme, useTheme, TextInput } from 'react-native-paper';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { globalStyle } from '../../../utils/globalStyles';
import { PolicyFormData } from '../types';
import KeyboardAwareContainer from '../components/KeyboardAwareContainer';
import { format, parse } from 'date-fns';

const nationalityOptions = [
  { label: 'Singaporean', value: 'singaporean' },
  { label: 'Malaysian', value: 'malaysian' },
  { label: 'Others', value: 'others' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Handle ISO string (full timestamp) format
    if (
      dateString.includes('T') &&
      (dateString.includes('Z') || dateString.includes('+'))
    ) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy');
      }
    }
    // Parse YYYY-MM-DD format (legacy support)
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    if (!isNaN(date.getTime())) {
      return format(date, 'dd/MM/yyyy');
    }
    return dateString;
  } catch {
    return dateString;
  }
};

interface CustomerDetailsProps {
  control: Control<PolicyFormData>;
  errors: FieldErrors<PolicyFormData>;
  openDatePicker: (fieldName: string, index: number) => void;
  watch: UseFormWatch<PolicyFormData>;
  setValue: any;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  control,
  errors,
  openDatePicker,
  watch,
  setValue,
}) => {
  const theme = useTheme();
  const adults = watch('adults') || 0;
  const children = watch('children') || 0;
  const totalCustomers = adults + children;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'customers',
  });

  // Initialize or update customers array based on adults and children
  useEffect(() => {
    const currentCustomers = watch('customers') || [];
    const neededCustomers = totalCustomers;

    if (currentCustomers.length < neededCustomers) {
      // Add missing customers
      const toAdd = neededCustomers - currentCustomers.length;
      for (let i = 0; i < toAdd; i++) {
        const isChild = currentCustomers.length + i >= adults;
        append({
          fullName: __DEV__ ? 'Savan' : '',
          passportNumber: __DEV__ ? 'S5185801H' : '',
          nationality: __DEV__ ? 'Singaporean' : '',
          gender: __DEV__ ? 'Male' : '',
          dateOfBirth: __DEV__ ? '1990-01-01' : '',
          isChild: isChild,
        });
      }
    } else if (currentCustomers.length > neededCustomers) {
      // Remove excess customers
      const toRemove = currentCustomers.length - neededCustomers;
      for (let i = 0; i < toRemove; i++) {
        remove(currentCustomers.length - 1);
      }
    } else {
      // Update isChild flags for existing customers
      currentCustomers.forEach((customer, index) => {
        const shouldBeChild = index >= adults;
        if (customer.isChild !== shouldBeChild) {
          setValue(`customers.${index}.isChild`, shouldBeChild);
        }
      });
    }
  }, [adults, children, totalCustomers, append, remove, setValue, watch]);

  const renderCustomerForm = (index: number, isChild: boolean) => {
    const customerType = isChild ? 'Child' : 'Adult';
    const customerNumber = isChild ? index - adults + 1 : index + 1;

    return (
      <View key={index} style={styles(theme).customerSection}>
        <Text
          style={[
            fontStyle(theme).headingMedium,
            { marginBottom: metrics.baseMargin * 2 },
          ]}
        >
          {customerType} {customerNumber} Details
        </Text>

        <Controller
          control={control}
          name={`customers.${index}.fullName`}
          rules={{ required: `${customerType} full name is required` }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Full Name<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your full name"
                value={value || ''}
                onChangeText={onChange}
                style={{ height: metrics.screenWidth * 0.13 }}
                outlineStyle={{ borderRadius: metrics.baseRadius }}
                error={!!errors.customers?.[index]?.fullName}
              />
              {errors.customers?.[index]?.fullName && (
                <Text style={styles(theme).errorText}>
                  {errors.customers[index]?.fullName?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name={`customers.${index}.passportNumber`}
          rules={{ required: `${customerType} passport number is required` }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Passport Number<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your passport number"
                value={value || ''}
                onChangeText={onChange}
                style={{ height: metrics.screenWidth * 0.13 }}
                outlineStyle={{ borderRadius: metrics.baseRadius }}
                error={!!errors.customers?.[index]?.passportNumber}
              />
              {errors.customers?.[index]?.passportNumber && (
                <Text style={styles(theme).errorText}>
                  {errors.customers[index]?.passportNumber?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name={`customers.${index}.nationality`}
          rules={{ required: `${customerType} nationality is required` }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Nationality<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={nationalityOptions}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={value}
                onChange={item => onChange(item.value)}
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
                activeColor={theme.dark ? '#374151' : '#E6EBF1'}
              />
              {errors.customers?.[index]?.nationality && (
                <Text style={styles(theme).errorText}>
                  {errors.customers[index]?.nationality?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name={`customers.${index}.gender`}
          rules={{ required: `${customerType} gender is required` }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Gender<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={genderOptions}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={value}
                onChange={item => onChange(item.value)}
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
                activeColor={theme.dark ? '#374151' : '#E6EBF1'}
              />
              {errors.customers?.[index]?.gender && (
                <Text style={styles(theme).errorText}>
                  {errors.customers[index]?.gender?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name={`customers.${index}.dateOfBirth`}
          rules={{ required: `${customerType} date of birth is required` }}
          render={({ field: { value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Date of Birth<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => openDatePicker('dateOfBirth', index)}
                activeOpacity={0.7}
              >
                <TextInput
                  mode="outlined"
                  placeholder="DD/MM/YYYY"
                  value={formatDateForDisplay(value || '')}
                  editable={false}
                  pointerEvents="box-none"
                  style={{ height: metrics.screenWidth * 0.13 }}
                  outlineStyle={{ borderRadius: metrics.baseRadius }}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => openDatePicker('dateOfBirth', index)}
                    />
                  }
                  error={!!errors.customers?.[index]?.dateOfBirth}
                />
              </TouchableOpacity>
              {errors.customers?.[index]?.dateOfBirth && (
                <Text style={styles(theme).errorText}>
                  {errors.customers[index]?.dateOfBirth?.message}
                </Text>
              )}
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <KeyboardAwareContainer>
      <View>
        <Text
          style={[
            fontStyle(theme).headingMedium,
            { marginBottom: metrics.doubleMargin },
          ]}
        >
          Customer Details
        </Text>

        {totalCustomers === 0 ? (
          <View style={styles(theme).emptyState}>
            <Text style={styles(theme).emptyStateText}>
              Please go back and select the number of adults and children in
              Travel Details.
            </Text>
          </View>
        ) : (
          fields.map((field, index) => {
            const isChild = index >= adults;
            return renderCustomerForm(index, isChild);
          })
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
      color: theme.colors.onSurfaceVariant || '#999',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    dropdownContainer: {
      borderRadius: metrics.baseRadius,
      borderColor: theme.dark ? '#444' : '#E6EBF1',
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    customerSection: {
      marginBottom: metrics.doubleMargin * 2,
      paddingBottom: metrics.doubleMargin,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#444' : '#E0E0E0',
    },
    emptyState: {
      padding: metrics.doubleMargin,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  });

export default CustomerDetails;
