import { Text } from '../../../components/common';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking
} from 'react-native';
import React from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import fontStyle from '../../../styles/fontStyle';
import { metrics } from '../../../utils/metrics';
import { PolicyFormData } from '../types';
import KeyboardAwareContainer from '../components/KeyboardAwareContainer';

interface NoticeDeclarationProps {
  control: Control<PolicyFormData>;
  errors: FieldErrors<PolicyFormData>;
}

const NoticeDeclaration: React.FC<NoticeDeclarationProps> = ({
  control,
  errors,
}) => {
  const theme = useTheme();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(err =>
      console.error('Failed to open URL:', err),
    );
  };

  return (
    <KeyboardAwareContainer>
      <View>
        {/* Important notice & declaration section */}
        <View style={styles(theme).sectionContainer}>
          <Text style={styles(theme).bodyText}>
            Important notice & declaration
          </Text>
          <View style={styles(theme).textContainer}>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              This insurance must be purchased before departure from Singapore
              and the journey/trip shall involve return to Singapore within the
              period of insurance.
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              I/We declare that I/we am/are in good health and agree to the
              Policy's Terms, Conditions and Exclusions. I/We understand that
              the policy will be issued based on the complete and true
              information provided in this application.
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              I/We acknowledge that I/we can seek advice from a qualified
              advisor. If I/we do not, I/we take sole responsibility for
              ensuring that the product is appropriate to my/our financial
              needs.
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              I/We acknowledge and agree for UOI to collect, use, disclose and
              transfer my/our personal data for the purposes as stated in UOI's
              Privacy Notice. For more information, please visit{' '}
              <Text
                style={styles(theme).linkText}
                onPress={() => handleLinkPress('https://www.uoi.com.sg')}
              >
                www.uoi.com.sg
              </Text>
              .
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              I/We acknowledge that by providing third party personal data
              (e.g., dependent, spouse, children, parents, employees), I/we
              warrant that consent has been obtained from such third party for
              the collection, use and disclosure of their personal data.
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              I/We are aware that UOI may disclose my/our personal data to third
              party service providers or agents (including lawyers/law firms),
              which may be located outside Singapore, for processing in
              connection with the purposes stated above, including disclosure to
              industry associations.
            </Text>
          </View>
        </View>

        {/* PDPA Consent section */}
        <View style={styles(theme).sectionContainer}>
          <Text
            style={[styles(theme).bodyText, { color: theme.colors.onSurface }]}
          >
            PDPA Consent <Text style={{ color: 'red' }}>*</Text>
          </Text>

          <Controller
            control={control}
            name="residingInSingapore"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  styles(theme).fieldContainer,
                  { marginTop: metrics.baseMargin },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I am/ We are residing in Singapore and possessing a valid
                      NRIC or FIN. <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.residingInSingapore && (
                  <Text style={styles(theme).errorText}>
                    {errors.residingInSingapore.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="purchasingBeforeTrip"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles(theme).fieldContainer}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I am/ We are purchasing this travel insurance before
                      my/our trip has commenced.{' '}
                      <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.purchasingBeforeTrip && (
                  <Text style={styles(theme).errorText}>
                    {errors.purchasingBeforeTrip.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="notTravelingAgainstAdvice"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles(theme).fieldContainer}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I am/ We are not traveling against medical advice.{' '}
                      <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.notTravelingAgainstAdvice && (
                  <Text style={styles(theme).errorText}>
                    {errors.notTravelingAgainstAdvice.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="acknowledgePrivacyNotice"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles(theme).fieldContainer}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I/We acknowledge and agree to the collection, use and
                      disclosure of my/our personal data in accordance with
                      UOI's Privacy Notice.{' '}
                      <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.acknowledgePrivacyNotice && (
                  <Text style={styles(theme).errorText}>
                    {errors.acknowledgePrivacyNotice.message}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={{ marginLeft: metrics.baseMargin * 3 }}>
            <Text style={styles(theme).bodyText}>Dear customer,</Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              We will collect your personal data (name, NRIC/FIN/Passport
              number, address, age, date of birth, telephone number and medical
              records) when you provide services to us, including disclosure to
              third party insurance companies and/or intermediaries like ST&T
              INTERNATIONAL PTE LTD (Singapore UEN: 199803720H).
            </Text>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              Your personal data will be collected, used, disclosed and/or
              processed for the following purposes:
            </Text>
            <View style={styles(theme).bulletList}>
              <Text style={styles(theme).bulletItem}>
                (a) confirming identity
              </Text>
              <Text style={styles(theme).bulletItem}>
                (b) offering and providing services/products (including
                insurance)
              </Text>
              <Text style={styles(theme).bulletItem}>
                (c) responding to queries, complaints, feedback, suggestions,
                requests
              </Text>
              <Text style={styles(theme).bulletItem}>
                (d) evaluating, underwriting, pricing application, assessing
                insurance risk
              </Text>
              <Text style={styles(theme).bulletItem}>
                (e) insuring or reinsuring risks
              </Text>
              <Text style={styles(theme).bulletItem}>
                (f) administering, dealing, managing claim
                notification/submission
              </Text>
              <Text style={styles(theme).bulletItem}>
                (g) processing/dealing with claims, settlement, investigations
              </Text>
              <Text style={styles(theme).bulletItem}>
                (h) carrying out due diligence/screening activities (including
                background checks)
              </Text>
              <Text style={styles(theme).bulletItem}>
                (i) carrying out instructions or responding to inquiries
              </Text>
              <Text style={styles(theme).bulletItem}>
                (j) investigating fraud, misconduct, unlawful action/omission
              </Text>
              <Text style={styles(theme).bulletItem}>
                (k) complying with applicable law in administering/managing
                claims
              </Text>
              <Text style={styles(theme).bulletItem}>
                (l) delegating, assisting, enabling Insurers for purposes
                aforesaid
              </Text>
              <Text style={styles(theme).bulletItem}>
                (m) any other directly incidental purposes.
              </Text>
            </View>
            <Text
              style={[
                styles(theme).bodyText,
                { marginTop: metrics.baseMargin },
              ]}
            >
              Your consent is hereby sought for the collection, use, and
              disclosure of your Personal Data for the abovementioned purposes.
            </Text>
          </View>
        </View>

        {/* Additional Checkboxes */}
        <View style={styles(theme).sectionContainer}>
          <Controller
            control={control}
            name="notDischargedWithin30Days"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles(theme).fieldContainer}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I/We hereby affirm that I/we have not been discharged
                      within 30 days from hospitalisation prior to the departure
                      of my/our umrah trip.
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.notDischargedWithin30Days && (
                  <Text style={styles(theme).errorText}>
                    {errors.notDischargedWithin30Days.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmInformationAccurate"
            rules={{ required: 'This field is required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles(theme).fieldContainer}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                >
                  <View
                    style={[
                      styles(theme).checkbox,
                      value && styles(theme).checkboxSelected,
                      {
                        marginEnd: metrics.baseMargin,
                        marginTop: metrics.baseMargin,
                      },
                    ]}
                  >
                    {value && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[fontStyle(theme).headingSmall, { flex: 1 }]}>
                      I/We confirm that the information provided to ST&T
                      International is accurate and correct.
                      <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.confirmInformationAccurate && (
                  <Text style={styles(theme).errorText}>
                    {errors.confirmInformationAccurate.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </KeyboardAwareContainer>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    sectionContainer: {
      marginBottom: metrics.doubleMargin * 2,
    },
    fieldContainer: {
      marginBottom: metrics.baseMargin * 2,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: metrics.smallMargin,
      marginHorizontal: metrics.baseMargin,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    textContainer: {
      marginTop: metrics.baseMargin,
      marginLeft: metrics.baseMargin * 3, // Align with checkbox text
    },
    bodyText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    linkText: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    bulletList: {
      marginTop: metrics.baseMargin,
      marginLeft: metrics.baseMargin,
    },
    bulletItem: {
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
      marginBottom: metrics.smallMargin,
    },
  });

export default NoticeDeclaration;
