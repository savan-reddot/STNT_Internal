import { Text } from './';
import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

export interface ActionSheetOption {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface NativeActionSheetProps {
  title?: string;
  options: ActionSheetOption[];
}

export type NativeActionSheetRef = BottomSheetModal;

const NativeActionSheet = forwardRef<
  NativeActionSheetRef,
  NativeActionSheetProps
>(({ title, options }, ref) => {
  const theme = useTheme();

  const snapPoints = useMemo(() => ['40%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.dark ? '#1E293B' : '#fff',
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.dark ? '#475569' : '#CBD5E1',
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {title && (
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: theme.dark ? '#F8FAFC' : '#1E293B' },
              ]}
            >
              {title}
            </Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                index === options.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                // @ts-ignore
                ref?.current?.dismiss();
                option.onPress();
              }}
            >
              <Icon
                name={option.icon}
                size={24}
                color={
                  option.destructive
                    ? '#EF4444'
                    : theme.dark
                    ? '#F8FAFC'
                    : '#64748B'
                }
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: option.destructive
                      ? '#EF4444'
                      : theme.dark
                      ? '#F8FAFC'
                      : '#1E293B',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F933', // Subtle border
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
});

export default NativeActionSheet;
