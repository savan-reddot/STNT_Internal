import { configureFonts } from 'react-native-paper';

export const Font_Regular = "SF-Pro-Text-Regular";
export const Font_Medium = "SF-Pro-Text-Medium";
export const Font_Light = "SF-Pro-Text-Regular";
export const Font_Thin = "SF-Pro-Text-Light";
export const Font_Bold = "SF-Pro-Text-Medium";

const fontConfig = {
    ios: {
        regular: {
            fontFamily: 'SF-Pro-Text-Regular',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'SF-Pro-Text-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'SF-Pro-Text-Regular',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'SF-Pro-Text-Light',
            fontWeight: 'normal',
        },
    },
    android: {
        regular: {
            fontFamily: 'SF-Pro-Text-Regular',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'SF-Pro-Text-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'SF-Pro-Text-Regular',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'SF-Pro-Text-Light',
            fontWeight: 'normal',
        },
    },
} as const;

export default fontConfig;