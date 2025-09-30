import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import AppLayout from '../components/safeareawrapper';
import { globalStyle } from '../utils/globalStyles';
import { useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import fontStyle from '../styles/fontStyle';

const Terms = ({ navigation }: any) => {
  const theme = useTheme();
  return (
    <AppLayout title="Terms & Condition" onBackPress={() => navigation.pop()}>
      <ScrollView style={globalStyle(theme).container}>
        <View
          style={[
            globalStyle(theme).container,
            { padding: metrics.doubleMargin },
          ]}
        >
          <Text
            style={[fontStyle(theme).headingMedium, { textAlign: 'center' }]}
          >
            Terms and Conditions
          </Text>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              { textAlign: 'center', fontSize: 12, fontWeight: 'regular' },
            ]}
          >
            Last Updated on 1 January 2025
          </Text>
          <Text
            style={[
              fontStyle(theme).headingSmall,
              {
                fontSize: 14,
                fontWeight: '400',
                margin: metrics.doubleMargin,
              },
            ]}
          >
            These terms and conditions (“agreement”) set forth the general terms
            and conditions of your use of the “Example App” mobile application
            (“mobile application”) and any of its related products and services.
              This agreement is legally binding between you (“user”, “you” or
            “your”) and this mobile application developer (“operator”, “we”,
            “us” or “our”). If you are entering into this agreement on behalf of
            a business or other legal entity, you represent that you have the
            authority to bind such entity to this agreement, in which case the
            terms “user”, “you” or “your” shall refer to such entity. If you do
            not have such authority, or if you do not agree with the terms of
            this agreement, you must not accept this agreement and may not
            access and use the mobile application. By accessing and using the
            mobile application, you acknowledge that you have read, understood,
            and agree to be bound by the terms of this agreement. You
            acknowledge that this agreement is a contract between you and the
            operator, even though it is electronic and is not physically signed
            by you, and it governs your use of the mobile application.
          </Text>
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default Terms;
