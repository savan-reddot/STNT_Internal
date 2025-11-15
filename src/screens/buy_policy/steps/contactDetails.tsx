import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { MD3Theme, useTheme, TextInput } from 'react-native-paper';
import { Control, Controller, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { globalStyle } from '../../../utils/globalStyles';
import { PolicyFormData } from '../types';
import KeyboardAwareContainer from '../components/KeyboardAwareContainer';

interface ContactDetailsProps {
  control: Control<PolicyFormData>;
  errors: FieldErrors<PolicyFormData>;
  watch: UseFormWatch<PolicyFormData>;
}

const travellingSaudiOptions = [
  { label: 'Individual', value: 'individual' },
  { label: 'Partenered Travel Agency', value: 'partnered_travel_agency' },
  { label: 'Non-Partenered Travel Agency', value: 'non_partnered_travel_agency' },
];

const ContactDetails: React.FC<ContactDetailsProps> = ({
  control,
  errors,
  watch,
}) => {
  const theme = useTheme();
  const travellingSaudiWith = watch('travellingSaudiWith');
  const showFields = !!travellingSaudiWith;

  return (
    <KeyboardAwareContainer>
      <View>
        <Text style={[fontStyle(theme).headingMedium, { marginBottom: metrics.doubleMargin }]}>
          Contact Details
        </Text>

        <Controller
          control={control}
          name="travellingSaudiWith"
          rules={{ required: 'Please select an option' }}
          render={({ field: { onChange, value } }) => (
            <View style={styles(theme).fieldContainer}>
              <Text style={fontStyle(theme).headingSmall}>
                Travelling Saudi with<Text style={{ color: 'red' }}>*</Text>
              </Text>
              <Dropdown
                style={globalStyle(theme).dropdown}
                placeholderStyle={styles(theme).placeholderStyle}
                selectedTextStyle={styles(theme).selectedTextStyle}
                data={travellingSaudiOptions}
                labelField="label"
                valueField="value"
                placeholder="Select"
                value={value}
                onChange={(item) => onChange(item.value)}
              />
              {errors.travellingSaudiWith && (
                <Text style={styles(theme).errorText}>
                  {errors.travellingSaudiWith.message}
                </Text>
              )}
            </View>
          )}
        />

        {showFields && (
          <>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Name<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter your name"
                    value={value}
                    onChangeText={onChange}
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <Text style={styles(theme).errorText}>{errors.name.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Phone number<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter your phone number"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.phone}
                  />
                  {errors.phone && (
                    <Text style={styles(theme).errorText}>{errors.phone.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Email<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter your email address"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <Text style={styles(theme).errorText}>{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nextOfKinName"
              rules={{ required: 'Next of Kin Name is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Next of Kin Name<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter NOK name"
                    value={value}
                    onChangeText={onChange}
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.nextOfKinName}
                  />
                  {errors.nextOfKinName && (
                    <Text style={styles(theme).errorText}>
                      {errors.nextOfKinName.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nextOfKinPhone"
              rules={{ required: 'Next of Kin Phone is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Next of Kin Phone<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter NOK phone number"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.nextOfKinPhone}
                  />
                  {errors.nextOfKinPhone && (
                    <Text style={styles(theme).errorText}>
                      {errors.nextOfKinPhone.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="nextOfKinEmail"
              rules={{
                required: 'Next of Kin Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles(theme).fieldContainer}>
                  <Text style={fontStyle(theme).headingSmall}>
                    Next of Kin Email<Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Enter NOK email address"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    style={{ height: metrics.screenWidth * 0.13 }}
                    outlineStyle={{ borderRadius: metrics.baseRadius }}
                    error={!!errors.nextOfKinEmail}
                  />
                  {errors.nextOfKinEmail && (
                    <Text style={styles(theme).errorText}>
                      {errors.nextOfKinEmail.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </>
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
  });

export default ContactDetails;
