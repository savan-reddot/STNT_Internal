import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import React from 'react';
import { metrics } from '../../../utils/metrics';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
}

const KeyboardAwareContainer: React.FC<KeyboardAwareContainerProps> = ({
  children,
}) => {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.contentWrapper}>{children}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: metrics.doubleMargin,
  },
  contentWrapper: {
    padding: metrics.doubleMargin,
    paddingTop: 0,
  },
});

export default KeyboardAwareContainer;

