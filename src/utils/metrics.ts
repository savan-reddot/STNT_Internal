import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('screen');


const guidelineBaseWidth = 375;  // base iPhone 11 width
const guidelineBaseHeight = 812;
export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

export const metrics = {
    baseMargin: 8,
    smallMargin: 4,
    doubleMargin: 16,
    baseRadius: 10,
    screenHeight: Dimensions.get("screen").height,
    screenWidth: Dimensions.get("screen").width,
    isTablet: Math.min(width, height) >= 600,
    scale,
    moderateScale,
};
