import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

const Text: React.FC<TextProps> = ({ children, style, ...props }) => {
  return (
    <RNText
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={style}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
