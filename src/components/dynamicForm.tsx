import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, useTheme } from 'react-native-paper';
import { metrics } from '../utils/metrics';
import { globalStyle } from '../utils/globalStyles';
import fontStyle from '../styles/fontStyle';

const DynamicForm = ({ structure, control, parentKey = '' }: any) => {
  const theme = useTheme();
  console.log('structure : ', JSON.stringify(structure));

  return (
    <View style={globalStyle(theme).container}>
      {Object.entries(structure).map(([key, value]) => {
        const name = parentKey ? `${parentKey}.${key}` : key;

        if (typeof value === 'string') {
          if (value === 'YYYY-MM-DD' || value.includes('Time')) {
            return (
              <Controller
                key={name}
                control={control}
                name={name}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <View style={styles.field}>
                    <Text style={fontStyle(theme).headingSmall}>{key}</Text>
                    <TextInput
                      placeholder={
                        value.includes('Time') ? 'HH/MM' : 'YYYY-MM-DD'
                      }
                      value={value}
                      mode="outlined"
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  </View>
                )}
              />
            );
          } else {
            return (
              <Controller
                key={name}
                control={control}
                name={name}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <View style={styles.field}>
                    <Text style={fontStyle(theme).headingSmall}>{key}</Text>
                    <TextInput
                      placeholder={key}
                      value={value}
                      mode="outlined"
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  </View>
                )}
              />
            );
          }
        }

        if (typeof value === 'object' && value.status === 'boolean') {
          // Handle boolean with nested fields
          return (
            <View key={name} style={styles.section}>
              <Controller
                control={control}
                name={`${name}.status`}
                defaultValue={false}
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.field]}>
                    <Text
                      style={[fontStyle(theme).headingSmall, { flex: 0.8 }]}
                    >
                      {key}
                    </Text>
                    <Switch
                      style={{ flex: 0.2 }}
                      value={value}
                      onValueChange={() => {
                        onChange(value);
                      }}
                    />
                  </View>
                )}
              />
              {value.status && value['Details of other insurance'] && (
                <DynamicForm
                  structure={value['Details of other insurance']}
                  control={control}
                  parentKey={`${name}.Details of other insurance`}
                />
              )}
            </View>
          );
        }

        if (typeof value === 'object') {
          // Handle nested section
          return (
            <View key={name} style={styles.section}>
              <Text style={styles.sectionTitle}>{key}</Text>
              <DynamicForm
                structure={value}
                control={control}
                parentKey={name}
              />
            </View>
          );
        }

        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: metrics.baseMargin,
    flex: 1,
    // backgroundColor: 'red',
  },
  input: {
    borderWidth: 1,
    backgroundColor: '#FBFBFB',
    borderColor: '#E6EBF1',
    borderRadius: metrics.baseRadius,
    padding: metrics.baseMargin,
    height: metrics.screenWidth * 0.08,
  },
  section: {
    // marginBottom: 16,
    paddingVertical: metrics.baseMargin,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default DynamicForm;
