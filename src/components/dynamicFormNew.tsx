import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Switch,
  Text,
  Provider as PaperProvider,
  useTheme,
  MD3Theme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import fontStyle from '../styles/fontStyle';
import { globalStyle } from '../utils/globalStyles';
import { metrics } from '../utils/metrics';
import { Font_Medium } from '../theme/fonts';
import moment from 'moment';
import { format } from 'date-fns';
import UButton from './custombutton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const mapType = (val: any) => {
  if (val === 'string') return 'text';
  if (val === 'number') return 'number';
  if (val === 'boolean') return 'boolean';
  if (val === 'YYYY-MM-DD') return 'date';
  if (val === 'HH/MM (AM/PM)') return 'time';
  return 'text';
};

const generateFormSchema = (obj: any) => {
  const schema = [];

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'object' && !Array.isArray(value)) {
      if (
        Object.keys(value).includes('status') &&
        typeof value.status === 'string'
      ) {
        // it's a boolean with nested fields
        schema.push({
          title: key,
          type: 'boolean',
          nested: {
            title: Object.keys(value).find(k => k !== 'status'),
            type: 'group',
            fields: generateFormSchema(
              value[Object.keys(value).find(k => k !== 'status')],
            ),
          },
        });
      } else {
        // it's a group field
        schema.push({
          title: key,
          type: 'group',
          fields: generateFormSchema(value),
        });
      }
    } else {
      schema.push({
        title: key,
        type: mapType(value),
      });
    }
  }

  return schema;
};

// const structure = {
//   'Full name of all Insured Name(s)': 'string',
//   'Date of the Incident': 'YYYY-MM-DD',
//   'Reason for delay': 'string',
//   'Flight Departure': {
//     Date: 'YYYY-MM-DD',
//     Time: 'HH/MM (AM/PM)',
//   },
//   'Flight Arrival': {
//     Date: 'YYYY-MM-DD',
//     Time: 'HH/MM (AM/PM)',
//   },
//   'Are there any other insurance policies in force covering you in respect of this event?':
//     {
//       status: 'boolean',
//       'Details of other insurance': {
//         'Name of the insurer': 'string',
//         'Amount compensated': 'number',
//         Remarks: 'string',
//       },
//     },
// };

const generateDefaultValues = (schema: any) => {
  let defaults: any = {};
  schema.forEach((field: any) => {
    if (field.type === 'group' && field.fields) {
      defaults[field.title] = generateDefaultValues(field.fields);
    } else if (field.type === 'boolean') {
      defaults[field.title] = false;
    } else {
      defaults[field.title] = ''; // empty string for text inputs
    }
  });
  return defaults;
};

interface FormTypes {
  structure: any;
  onSave: (output: any) => void;
  ref: any;
  claim_form: any[];
  form_index: number;
  isEdit?: boolean;
  editClaim?: any;
}

const DynamicFormNew = forwardRef(
  (
    {
      structure,
      onSave,
      claim_form,
      form_index,
      isEdit = false,
      editClaim = null,
    }: any,
    ref,
  ) => {
    const formSchema = useMemo(
      () => generateFormSchema(structure),
      [structure],
    );
    const theme = useTheme();
    const {
      control,
      handleSubmit,
      watch,
      setValue,
      getValues,
      reset,
      formState: { errors },
    } = useForm({
      defaultValues: generateDefaultValues(formSchema), // empty initially
    });

    const [visiblePickers, setVisiblePickers] = useState<any>({});

    // expose methods to parent
    useImperativeHandle(ref, () => ({
      submit: () => handleSubmit(onSubmit)(),
      getValues, // in case you just want raw values without validation
    }));

    useEffect(() => {
      reset(generateDefaultValues(formSchema)); // clears all values
    }, [form_index]);

    const onSubmit = (data: any) => {
      const output = transformData(data);
      console.log('Form Schema:', formSchema);
      console.log('Form data:', data);
      console.log('Form Output:', output);
      reset(generateDefaultValues(formSchema));
      onSave(output);
    };

    useEffect(() => {
      console.log('parsed edit data', editClaim);
      if (isEdit && editClaim?.claimForm) {
        try {
          const parsed = JSON.parse(editClaim?.claimForm?.claimFormData);
          console.log('parsed edit data', parsed);
          const mappedDefaults = mapEditValuesToForm(formSchema, parsed);
          console.log('mappedDefaults', mappedDefaults);
          reset(mappedDefaults); // pre-fill the form
        } catch (err) {
          console.error('Invalid claimFormData', err);
        }
      }
    }, [isEdit, editClaim, reset, formSchema]);

    // utility to map the saved claimFormData to your form schema
    const mapEditValuesToForm = (schema: any[], data: any) => {
      const result: any = {};

      schema.forEach(field => {
        const key = field.title;
        const val = data?.[key];

        if (field.type === 'group') {
          result[key] = mapEditValuesToForm(field.fields, val || {});
        } else if (field.type === 'boolean') {
          // boolean with optional nested group
          result[key] = val?.status ?? false;

          if (val?.status && field.nested) {
            result[field.nested.title] = mapEditValuesToForm(
              field.nested.fields,
              val[field.nested.title] || {},
            );
          }
        } else if (field.type === 'date') {
          // convert "DD-MM-YYYY" or ISO to Date object
          if (typeof val === 'string' && val) {
            const d = val.includes('-')
              ? moment(val, ['DD-MM-YYYY', 'YYYY-MM-DD']).toDate()
              : new Date(val);
            result[key] = d;
          } else {
            result[key] = undefined;
          }
        } else if (field.type === 'time') {
          // keep as string for TimePicker
          result[key] = val || '';
        } else {
          result[key] = val ?? '';
        }
      });

      return result;
    };

    const transformData = (data: any, schema: any[] = formSchema): any => {
      const output: any = {};

      const formatValue = (value: any, type: string) => {
        if (type === 'date' && value) {
          return moment(value).format('DD-MM-YYYY');
        } else if (type === 'time' && value) {
          return moment(value, ['hh:mm A', 'HH:mm']).format('HH:mm');
        }
        return value;
      };

      schema.forEach((field: any) => {
        const key = field.title;
        const title = field.title;

        if (field.type === 'group') {
          // Recursively transform nested group
          const groupData: any = {};
          field.fields.forEach((subField: any) => {
            const value =
              data?.[title]?.[subField.title] ??
              data?.[`${title}.${subField.title}`];
            groupData[subField.title] = formatValue(value, subField.type);
          });
          output[title] = groupData;
        } else if (field.type === 'boolean') {
          // Handle boolean with optional nested group
          output[key] = { status: !!data[key] };

          if (data[key] && field.nested) {
            const nestedKey = field.nested.title;
            output[key][nestedKey] = transformData(
              data,
              field.nested.fields.map((nested: any) => ({
                ...nested,
                title: `${nestedKey}.${nested.title}`,
              })),
            );
          }
        } else {
          // Normal field
          output[key] = data[key];
        }
      });

      return output;
    };

    const openPicker = name => {
      setVisiblePickers(prev => ({ ...prev, [name]: true }));
    };

    const closePicker = name => {
      setVisiblePickers(prev => ({ ...prev, [name]: false }));
    };

    const renderField = (field: any, parent = '') => {
      const name = parent ? `${parent}.${field.title}` : field.title;
      const value = watch(name);

      if (field.type === 'text' || field.type === 'number') {
        return (
          <Controller
            key={name}
            control={control}
            name={name}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View key={name} style={styles(theme).parent_view}>
                <Text style={fontStyle(theme).headingSmall}>{field.title}</Text>
                <TextInput
                  label=""
                  value={value}
                  placeholder={field.title}
                  onChangeText={onChange}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  mode="outlined"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  outlineStyle={globalStyle(theme).textinput}
                  style={{ height: metrics.screenWidth * 0.13 }}
                  error={!!errors[name]}
                />
                {errors[name] && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      marginTop: metrics.smallMargin,
                    }}
                  >
                    This field is required
                  </Text>
                )}
              </View>
            )}
          />
        );
      }

      if (field.type === 'date') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return (
          <Controller
            key={name}
            control={control}
            name={name}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View key={name} style={styles(theme).parent_view}>
                <Text style={fontStyle(theme).headingSmall}>{field.title}</Text>
                {/* <Button
            style={[
              globalStyle(theme).textinput,
              {
                padding: metrics.baseMargin / 2,
                paddingLeft: 0,
                width: '100%',

                alignItems: 'flex-start',
              },
            ]}
            mode="outlined"
            onPress={() => openPicker(name)}
            theme={theme}
            labelStyle={{
              color: 'rgb(100,100,100)',
              textTransform: 'none',
              fontFamily: Font_Medium,
            }}
          >
            {value || 'Select date'}
          </Button> */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setVisiblePickers(prev => ({ ...prev, [name]: true }))
                  }
                >
                  <TextInput
                    label={''}
                    placeholder={field.title}
                    value={value ? format(value, 'dd-MM-yyyy') : ''}
                    editable={false}
                    pointerEvents="none"
                    mode="outlined"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    outlineStyle={globalStyle(theme).textinput}
                    style={{ height: metrics.screenWidth * 0.13 }}
                    error={!!errors[name]}
                  />
                </TouchableOpacity>
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={!!visiblePickers[name]}
                  onDismiss={() =>
                    setVisiblePickers(p => ({ ...p, [name]: false }))
                  }
                  date={value || undefined}
                  onConfirm={({ date }) => {
                    console.log('selected date : ', date);
                    //   if (date) {
                    //     const formatted = format(date, 'dd-MM-yyyy');
                    //     setValue(name, date);
                    //   }
                    onChange(date); // raw Date object
                    closePicker(name);
                  }}
                  validRange={{ endDate: today }}
                  saveLabel="Save" // 🖊️ custom text
                  saveLabelDisabled={false}
                  theme={{
                    colors: {
                      primary: theme.colors.primary,
                      onPrimary: theme.colors.onPrimary,
                    },
                    fonts: {
                      labelLarge: {
                        fontFamily: Font_Medium,
                        fontSize: 16,
                      },
                    },
                  }}
                />
                {errors[name] && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      marginTop: metrics.smallMargin,
                    }}
                  >
                    This field is required
                  </Text>
                )}
              </View>
            )}
          />
        );
      }

      if (field.type === 'time') {
        return (
          <View key={name} style={styles(theme).parent_view}>
            <Text style={fontStyle(theme).headingSmall}>{field.title}</Text>
            {/* <Button mode="outlined" onPress={() => openPicker(name)}>
            {value || 'Pick a time'}
          </Button> */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                setVisiblePickers(prev => ({ ...prev, [name]: true }))
              }
            >
              <TextInput
                label={''}
                placeholder={field.title}
                value={value}
                editable={false}
                pointerEvents="none"
                mode="outlined"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                outlineStyle={globalStyle(theme).textinput}
                style={{ height: metrics.screenWidth * 0.13 }}
                error={!!errors[name]}
              />
            </TouchableOpacity>
            <TimePickerModal
              visible={!!visiblePickers[name]}
              onDismiss={() =>
                setVisiblePickers(p => ({ ...p, [name]: false }))
              }
              onConfirm={({ hours, minutes }) => {
                const isPM = hours >= 12;
                const formatted = `${(hours % 12 || 12)
                  .toString()
                  .padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${
                  isPM ? 'PM' : 'AM'
                }`;
                setValue(name, `${hours}:${minutes}`);
                closePicker(name);
              }}
            />
            {errors[name] && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  marginTop: metrics.smallMargin,
                }}
              >
                This field is required
              </Text>
            )}
          </View>
        );
      }

      if (field.type === 'boolean') {
        return (
          <>
            <View
              key={name}
              style={{
                margin: metrics.baseMargin,
                marginHorizontal: 0,
                marginTop: 0,
                flexDirection: 'row',
                width: '80%',
              }}
            >
              <Text
                style={[
                  fontStyle(theme).headingSmall,
                  {
                    width: '90%',
                    marginEnd: metrics.doubleMargin * 2,
                    marginTop: 0,
                  },
                ]}
              >
                {field.title}
              </Text>
              <Controller
                control={control}
                name={name}
                rules={{ required: false }}
                render={({ field: { onChange, value } }) => (
                  <Switch
                    color={theme.colors.primary}
                    value={value}
                    onValueChange={onChange}
                  />
                )}
              />
            </View>
            {watch(name) &&
              field.nested.fields.map((nestedField: any) =>
                renderField(nestedField, field.nested.title),
              )}
          </>
        );
      }

      if (field.type === 'group') {
        return (
          <View key={name} style={styles(theme).parent_view}>
            <Text
              style={[
                fontStyle(theme).headingMedium,
                { fontSize: metrics.moderateScale(17) },
              ]}
            >
              {field.title}
            </Text>
            {field.fields.map((subField: any) =>
              renderField(subField, field.title),
            )}
            {errors[name] && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  marginTop: metrics.smallMargin,
                }}
              >
                This field is required
              </Text>
            )}
          </View>
        );
      }

      return null;
    };

    return (
      <PaperProvider theme={theme}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles(theme).keyboard_container}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
        >
          <View style={globalStyle(theme).container}>
            <Text
              style={[
                fontStyle(theme).headingMedium,
                {
                  marginVertical: metrics.baseMargin,
                  fontSize: metrics.moderateScale(18),
                },
              ]}
            >{`Claim Request ${form_index + 1}`}</Text>
            {formSchema.map((field: any) => renderField(field))}
            <UButton
              title={
                isEdit
                  ? 'Update'
                  : claim_form && claim_form?.length - 1 > form_index
                  ? 'Next'
                  : 'Submit'
              }
              onPress={handleSubmit(onSubmit)}
              style={{ marginBottom: metrics.doubleMargin * 3 }}
            />
          </View>
        </KeyboardAwareScrollView>
      </PaperProvider>
    );
  },
);

export default DynamicFormNew;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    parent_view: { margin: metrics.baseMargin, marginHorizontal: 0 },
    keyboard_container: {
      // fle: 1,
      backgroundColor: theme.colors.background,
    },
  });
