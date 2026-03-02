import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInputPaper,
  TextInputProps,
} from 'react-native-paper';

// Define the component type with subcomponents
export type TextInputComponent = React.ForwardRefExoticComponent<
  TextInputProps & React.RefAttributes<any>
> & {
  Icon: typeof RNTextInputPaper.Icon;
  Affix: typeof RNTextInputPaper.Affix;
};

// Properly typed wrapper with ref support
const TextInput = forwardRef<any, TextInputProps>((props, ref) => {
  return (
    <RNTextInputPaper
      ref={ref}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...props}
    />
  );
}) as TextInputComponent;

// 🔥 Preserve static subcomponents
TextInput.Icon = RNTextInputPaper.Icon;
TextInput.Affix = RNTextInputPaper.Affix;

// Optional but good practice
TextInput.displayName = 'TextInput';

export default TextInput;
