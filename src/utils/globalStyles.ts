import { StyleSheet } from "react-native";
import { MD3Theme } from "react-native-paper";
import { metrics } from "./metrics";

export const globalStyle = (theme: MD3Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.onBackground,
            fontSize: 16,
            // fontFamily: theme.fonts.,
        },
        button: {
            backgroundColor: theme.colors.primary,
            padding: 12,
            borderRadius: 4,
            alignItems: 'center',
        },
        dropdown: {
            borderWidth: 1,
            padding: metrics.baseMargin * 2,
            marginTop: metrics.baseMargin,
            backgroundColor: '#FBFBFB',
            borderColor: '#E6EBF1',
            borderRadius: metrics.baseRadius,
        },
        textinput: {
            borderWidth: 1,
            backgroundColor: theme.colors.background,
            borderColor: 'rgb(190,190,190)',
            borderRadius: metrics.baseRadius,
            // height: metrics.screenWidth * 0.13,
            alignItems: 'center',
            justifyContent: 'center'
        }
    });

export const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360); // hue between 0-359
    return `hsl(${hue}, 70%, 85%)`; // pastel-like saturation and lightness
};