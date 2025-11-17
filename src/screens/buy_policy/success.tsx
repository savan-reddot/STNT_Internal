import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import AppLayout from '../../components/safeareawrapper';
import { useTheme } from 'react-native-paper';
import { globalStyle } from '../../utils/globalStyles';
import fontStyle from '../../styles/fontStyle';
import { metrics } from '../../utils/metrics';
import UButton from '../../components/custombutton';
import { Screens } from '../../common/screens';
import { CommonActions } from '@react-navigation/native';

const BuyPolicySuccess = ({ navigation }: any) => {
    const theme = useTheme();

    return (
        <AppLayout showHeader={false}>
            <View
                style={[
                    globalStyle(theme).container,
                    {
                        backgroundColor: '#05544B',
                        paddingBottom: metrics.doubleMargin,
                    },
                ]}
            >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ marginTop: metrics.doubleMargin }}>
                        <Image
                            source={require('../../../assets/images/success.png')}
                            style={{
                                height: metrics.screenWidth * 0.5,
                                width: metrics.screenWidth * 0.5,
                            }}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles(theme).textContainer}>
                        <View style={{ marginBottom: metrics.baseMargin }}>
                            <Text style={styles(theme).title}>Your policy has been purchased successfully.</Text>
                        </View>
                        <Text style={styles(theme).subtitle}>
                            We’ve received your payment and your policy is now active. A confirmation email with your policy details has been sent. You can access your documents anytime from the app.
                        </Text>
                    </View>
                </View>

                <UButton
                    title="Close"
                    onPress={() =>
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: Screens.BottomTab }],
                            }),
                        )
                    }
                    textStyle={{ color: '#000', fontWeight: '400', fontSize: 16 }}
                    style={{
                        flex: 0,
                        width: '90%',
                        marginHorizontal: metrics.doubleMargin,
                        marginTop: metrics.doubleMargin * 2,
                        backgroundColor: '#fff',
                    }}
                />
            </View>
        </AppLayout>
    );
};

const styles = (theme: any) =>
    StyleSheet.create({
        textContainer: {
            alignItems: 'center',
            paddingHorizontal: metrics.doubleMargin,
        },
        title: {
            ...fontStyle(theme).headingMedium,
            color: '#fff',
            textAlign: 'center',
        },
        subtitle: {
            ...fontStyle(theme).headingSmall,
            color: '#fff',
            fontWeight: '400',
            textAlign: 'center',
            fontSize: 14,
            marginTop: metrics.doubleMargin,
            marginHorizontal: metrics.baseMargin,
        },
    });

export default BuyPolicySuccess;

