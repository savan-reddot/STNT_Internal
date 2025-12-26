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
import Icon from 'react-native-vector-icons/MaterialIcons';

const mapType = (val: any) => {
  if (val === 'string') return 'text';
  if (val === 'number') return 'number';
  if (val === 'boolean') return 'boolean';
  if (val === 'YYYY-MM-DD') return 'date';
  if (val === 'HH/MM (AM/PM)') return 'time';
  if (Array.isArray(val)) return 'array';
  return 'text';
};

const generateFormSchema = (obj: any): any[] => {
  const schema = [];

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Check if it has a 'status' property (boolean field)
      if (Object.keys(value).includes('status') && typeof value.status === 'string') {
        // Extract all nested fields (excluding 'status')
        const nestedFields = { ...value };
        delete nestedFields.status;

        // If there are nested fields, create the nested structure
        if (Object.keys(nestedFields).length > 0) {
          schema.push({
            title: key,
            type: 'boolean',
            nested: {
              title: key, // Use the same key as the parent
              type: 'group',
              fields: generateFormSchema(nestedFields),
            },
          });
        } else {
          // Simple boolean without nested fields
          schema.push({
            title: key,
            type: 'boolean',
          });
        }
      } else {
        // it's a regular group field
        schema.push({
          title: key,
          type: 'group',
          fields: generateFormSchema(value),
        });
      }
    } else if (Array.isArray(value)) {
      // Handle array fields - assume first element defines the structure
      const arrayItemSchema = value.length > 0 ? generateFormSchema(value[0]) : [];
      schema.push({
        title: key,
        type: 'array',
        itemSchema: arrayItemSchema,
      });
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
    } else if (field.type === 'array') {
      defaults[field.title] = [generateDefaultValues(field.itemSchema)]; // Start with one default item
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
    // console.log('structure -----> ', structure);
    const formSchema = useMemo(
      () => generateFormSchema(structure),
      [structure],
    );
    // console.log('formSchema -----> ', formSchema);
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
        } else if (field.type === 'array') {
          // Handle array data for edit mode
          const arrayData = val || [];
          result[key] = arrayData.map((item: any) => mapEditValuesToForm(field.itemSchema, item));
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

      const formatValue = (value: any, type: string, fieldTitle?: string) => {
        if (type === 'date' && value) {
          return moment(value).format('DD-MM-YYYY');
        } else if (type === 'time' && value) {
          return moment(value, ['hh:mm A', 'HH:mm']).format('HH:mm');
        } else if (type === 'number' && value) {
          // Handle currency formatting for purchase price
          if (fieldTitle?.toLowerCase().includes('price')) {
            const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
            return `$${numericValue}`;
          }
          return typeof value === 'string' ? value : String(value);
        }
        return value;
      };

      schema.forEach((field: any) => {
        const key = field.title;

        if (field.type === 'group') {
          const groupData: any = {};
          field.fields.forEach((subField: any) => {
            const value = data?.[key]?.[subField.title];
            groupData[subField.title] = formatValue(value, subField.type, subField.title);
          });
          output[key] = groupData;
        } else if (field.type === 'array') {
          const arrayData = data[key] || [];
          output[key] = arrayData.map((item: any) => transformData(item, field.itemSchema));
        } else if (field.type === 'boolean') {
          output[key] = { status: !!data[key] };

          if (data[key] && field.nested) {
            const nestedKey = field.nested.title;
            const nestedData = data[nestedKey] || {};
            output[key][nestedKey] = transformData(nestedData, field.nested.fields);
          }
        } else {
          output[key] = formatValue(data[key], field.type, field.title);
        }
      });

      return output;
    };

    const openPicker = (name: string) => {
      setVisiblePickers((prev: any) => ({ ...prev, [name]: true }));
    };

    const closePicker = (name: string) => {
      setVisiblePickers((prev: any) => ({ ...prev, [name]: false }));
    };

    const renderListField = (field: any, parent = '') => {
      const name = parent ? `${parent}.${field.title}` : field.title;
      const value = watch(name) || [];

      const addItem = () => {
        const newItem = generateDefaultValues(field.itemSchema);
        setValue(name, [...value, newItem]);
      };

      const removeItem = (index: number) => {
        // Don't allow removing the first item (index 0)
        if (index === 0) return;
        const newValue = value.filter((_: any, i: number) => i !== index);
        setValue(name, newValue);
      };

      return (
        <View key={name} style={styles(theme).parent_view}>
          <View style={styles(theme).listHeader}>
            <Text style={styles(theme).listTitle}>
              {field.title}
            </Text>
            <TouchableOpacity
              onPress={addItem}
              style={styles(theme).addButton}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {value.map((item: any, index: number) => (
            <View key={index} style={styles(theme).itemCard}>
              <View style={styles(theme).itemHeader}>
                <Text style={styles(theme).itemTitle}>
                  Item {index + 1}
                </Text>
                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={styles(theme).deleteButton}
                  >
                    <Icon name="delete" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {field.itemSchema.map((subField: any) => {
                const subName = `${name}.${index}.${subField.title}`;
                return renderField(subField, `${name}.${index}`);
              })}
            </View>
          ))}
        </View>
      );
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
                  <Text style={styles(theme).errorText}>
                    {String(errors[name]?.message || 'This field is required')}
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
                    setVisiblePickers((prev: any) => ({ ...prev, [name]: true }))
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
                    setVisiblePickers((p: any) => ({ ...p, [name]: false }))
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
                />
                {errors[name] && (
                  <Text style={styles(theme).errorText}>
                    {String(errors[name]?.message || 'This field is required')}
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
                setVisiblePickers((prev: any) => ({ ...prev, [name]: true }))
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
                setVisiblePickers((p: any) => ({ ...p, [name]: false }))
              }
              onConfirm={({ hours, minutes }) => {
                const isPM = hours >= 12;
                const formatted = `${(hours % 12 || 12)
                  .toString()
                  .padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'
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
            {watch(name) && field.nested && field.nested.fields &&
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

      if (field.type === 'array') {
        return renderListField(field, parent);
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
    parent_view: {
      margin: metrics.baseMargin,
      marginHorizontal: 0
    },
    keyboard_container: {
      backgroundColor: theme.colors.background,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: metrics.baseMargin,
    },
    listTitle: {
      ...fontStyle(theme).headingMedium,
      fontSize: metrics.moderateScale(17),
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemCard: {
      marginBottom: metrics.baseMargin,
      padding: metrics.baseMargin,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: metrics.smallMargin,
    },
    itemTitle: {
      ...fontStyle(theme).headingSmall,
      fontSize: 14,
      fontWeight: '500',
    },
    deleteButton: {
      backgroundColor: '#ff4444',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: metrics.smallMargin,
    },
  });
