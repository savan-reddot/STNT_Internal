import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
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

const partneredTravelAgents = [
  'ABU BAKAR TRAVEL SERVICES PTE LTD',
  'AFANDI TRAVEL & SERVICES PTE LTD',
  "AFANA SERVICES PTE LTD",
  'AK TOURS & TRAVELS PTE LTD',
  'AL-FATTAH TRAVEL & TOURS PTE LTD',
  'AL FIRDAUS TRAVELS PTE LTD',
  'AL-MUNAWWARAH TRAVEL & TOURS PTE LTD',
  'AL-QURRO TRAVEL & TOURS PTE LTD',
  'AL-SALAMAH TRAVEL & SERVICES PTE LTD',
  'AQ TRAVEL & TOURS PTE LTD',
  'AR RAIYAN TOURS & TRAVEL PTE LTD',
  'AS-SOFI TRAVEL & SERVICES PTE LTD',
  'AZZA TRAVEL & TOURS PTE LTD',
  'DE HAYAT TRAVEL & SERVICES PTE LTD',
  'EL-HIJRAH TRAVEL PTE LTD',
  'EMERALD TOURS AND TRAVELS',
  'EVERSHINE TRAVEL & SERVICES PTE LTD',
  'FURSA TRAVEL PTE LTD',
  'HAGEL TRAVEL & TOURS PTE LTD',
  'HAMIDAH TRAVEL & TOURS PTE LTD',
  'HUSAINI TRAVELS & TOURS PTE LTD',
  'IMAN TRAVEL & SERVICES PTE LTD',
  'IMAAN TRAVEL & TOURS PTE LTD',
  'JALALUDDIN TRAVEL & SERVICES PTE LTD',
  'M3 OASIS PTE LTD',
  'NOOR MOHAMAD SERVICES & TRAVEL PTE LTD',
  'NURHIKMAH TRAVEL & TOURS PTE LTD',
  'POS TKI TRAVEL & TOURS PTE LTD',
  'RAFFLESIA TRAVEL & TOURS SERVICES PTE LTD',
  'RAFFLES HOLIDAYS PTE LTD',
  'SA AL-HABSYI TRAVEL PTE LTD',
  'SENYUM TRAVEL PTE LTD',
  'SHA TRAVEL & TOUR PTE LTD',
  'SHAHIDAH TRAVEL & TOURS PTE LTD',
  'SJ HOLIDAYS PTE LTD',
  'SMILING TRAVEL PTE LTD',
  'SINGAPORE TRAVEL HUB PTE LTD',
  'SUNNY ISLAND TRAVEL & TOURS PTE LTD',
  'TRAVEL WITH GLAMZ PTE LTD',
  'UMMI TRAVEL PTE LTD',
];

const ContactDetails: React.FC<ContactDetailsProps> = ({
  control,
  errors,
  watch,
}) => {
  const theme = useTheme();
  const travellingSaudiWith = watch('travellingSaudiWith');
  const isIndividual = travellingSaudiWith === 'individual';
  const isPartneredAgency = travellingSaudiWith === 'partnered_travel_agency';
  const isNonPartneredAgency = travellingSaudiWith === 'non_partnered_travel_agency';
  const showContactFields = isIndividual || isNonPartneredAgency;

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch((err) =>
      console.error('Failed to open phone:', err)
    );
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) =>
      console.error('Failed to open email:', err)
    );
  };

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
                containerStyle={styles(theme).dropdownContainer}
                itemTextStyle={styles(theme).dropdownItemText}
              />
              {errors.travellingSaudiWith && (
                <Text style={styles(theme).errorText}>
                  {errors.travellingSaudiWith.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Partnered Travel Agency - Show contact info and list */}
        {isPartneredAgency && (
          <View style={styles(theme).fieldContainer}>
            <Text style={[fontStyle(theme).headingSmall, { marginBottom: metrics.baseMargin }]}>
              Please contact us through{' '}
              <Text
                style={styles(theme).linkText}
                onPress={() => handlePhonePress('62950012')}
              >
                62950012
              </Text>
              {' / '}
              <Text
                style={styles(theme).linkText}
                onPress={() => handlePhonePress('91362973')}
              >
                91362973
              </Text>
              {' or '}
              <Text
                style={styles(theme).linkText}
                onPress={() => handleEmailPress('enquiry@stntinternational.com')}
              >
                enquiry@stntinternational.com
              </Text>
            </Text>

            <Text style={[fontStyle(theme).headingSmall, { marginTop: metrics.doubleMargin, marginBottom: metrics.baseMargin }]}>
              List of our partnered Travel Agents:
            </Text>

            <View style={styles(theme).agentsListContainer}>
              {partneredTravelAgents.map((agent, index) => (
                <Text key={index} style={styles(theme).agentItem}>
                  {index + 1}. {agent}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Individual or Non-Partnered Travel Agency - Show form fields */}
        {showContactFields && (
          <>
            {/* Name of Travel Agency - Only for Non-Partnered Travel Agency */}
            {isNonPartneredAgency && (
              <Controller
                control={control}
                name="travelAgencyName"
                rules={{ required: 'Name of Travel Agency is required' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles(theme).fieldContainer}>
                    <Text style={fontStyle(theme).headingSmall}>
                      Name of Travel Agency<Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Enter travel agency name"
                      value={value}
                      onChangeText={onChange}
                      style={{ height: metrics.screenWidth * 0.13 }}
                      outlineStyle={{ borderRadius: metrics.baseRadius }}
                      error={!!errors.travelAgencyName}
                    />
                    {errors.travelAgencyName && (
                      <Text style={styles(theme).errorText}>
                        {errors.travelAgencyName.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            )}

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
    dropdownContainer: {
      borderRadius: metrics.baseRadius,
      borderColor: '#E6EBF1',
      borderWidth: 1,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    linkText: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    agentsListContainer: {
      backgroundColor: '#F5F5F5',
      borderRadius: metrics.baseRadius,
      padding: metrics.doubleMargin,
    },
    agentItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 24,
      marginBottom: metrics.smallMargin,
    },
  });

export default ContactDetails;
