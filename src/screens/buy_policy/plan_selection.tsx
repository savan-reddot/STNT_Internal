import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import AppLayout from '../../components/safeareawrapper';
import { metrics } from '../../utils/metrics';
import { Screens } from '../../common/screens';
import {
  useLazyCountriesQuery,
  useLazyGetplansQuery,
  useLazyPlanPricingQuery,
} from '../../redux/services';
import ScreenLoader from '../../components/loader';

interface PlanPricingData {
  adultPrice: number;
  childPrice: number;
  extraPerDay: number;
  maxDays: number;
  pricingString: string;
  adultPricingRaw?: any;
  childPricingRaw?: any;
}

const PlanSelection = ({ navigation }: any) => {
  const theme = useTheme();

  // API Queries
  const [countries] = useLazyCountriesQuery();
  const [getplans] = useLazyGetplansQuery();
  const [planPricing] = useLazyPlanPricingQuery();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState<string>('Saudi Arabia');
  const [plans, setPlans] = useState<any[]>([]);
  const [planPricingData, setPlanPricingData] = useState<
    Record<string, PlanPricingData>
  >({});

  // Fetch Countries & Initialize
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch Countries (to ensure valid destination, though we default to Saudi Arabia)
        const countryResp = await countries(0);
        let validDestination = 'Saudi Arabia';

        if (countryResp?.data?.countries) {
          const hasSaudi = countryResp.data.countries.some(
            (c: string) => c.toLowerCase() === 'saudi arabia',
          );
          if (hasSaudi) validDestination = 'Saudi Arabia';
        }

        setDestination(validDestination);

        // 2. Fetch Plans
        const plansResp = await getplans(0);
        if (plansResp?.data?.success && plansResp?.data?.data?.rows) {
          const allPlans = plansResp.data.data.rows;
          const filteredPlans = allPlans.filter((plan: any) => {
            const coverage = (plan?.destination_coverage || '')
              .trim()
              .toLowerCase();
            return (
              !coverage ||
              coverage === 'worldwide' ||
              coverage === validDestination.toLowerCase()
            );
          });

          const formattedPlans = filteredPlans
            .map((plan: any) => ({
              label: plan.display_name,
              value: plan.id?.toString(),
              id: plan.id,
              plan_code: plan.plan_code,
              trip_days_cap: plan.trip_days_cap,
              rawPlan: plan,
            }))
            .sort((a: any, b: any) => a.id - b.id);

          setPlans(formattedPlans);

          // 3. Fetch Pricing
          const priceResp = await planPricing(0);
          if (priceResp?.data?.success && priceResp?.data?.data?.rows) {
            const allPricings = priceResp.data.data.rows;
            const pricingMap: Record<string, PlanPricingData> = {};

            formattedPlans.forEach((plan: any) => {
              const planPricings = allPricings.filter(
                (p: any) => p.plan_id === plan.id,
              );
              if (planPricings.length > 0) {
                const adultPricing = planPricings.find(
                  (p: any) => p.age_band?.toUpperCase() === 'ADULT',
                );
                const childPricing = planPricings.find(
                  (p: any) => p.age_band?.toUpperCase() === 'CHILD',
                );

                if (adultPricing && childPricing) {
                  const maxDays = plan.trip_days_cap || 0;
                  const adultPrice = adultPricing.base_premium;
                  const childPrice = childPricing.base_premium;
                  const extraPerDay =
                    adultPricing.per_extra_day_rate ||
                    childPricing.per_extra_day_rate;

                  const pricingString = `Duration of Travel: CHILD - Up to ${maxDays} days (Below 18 years old): $${childPrice.toFixed(
                    0,
                  )} ADULT- Up to ${maxDays} days (Above 18 years old): $${adultPrice.toFixed(
                    0,
                  )} Additional Days: $${extraPerDay.toFixed(0)}/Day`;

                  pricingMap[plan.value] = {
                    adultPrice,
                    childPrice,
                    extraPerDay,
                    maxDays,
                    pricingString,
                    adultPricingRaw: adultPricing,
                    childPricingRaw: childPricing,
                  };
                }
              }
            });
            setPlanPricingData(pricingMap);
          }
        }
      } catch (err) {
        console.error('Error in PlanSelection init:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleSelectPlan = (plan: any) => {
    // Navigate to BuyPolicy with selected details
    const pricing = planPricingData[plan.value];
    if (!pricing) return;

    navigation.navigate(Screens.BuyPolicy, {
      selectedPlan: plan,
      pricingData: pricing,
      destination: destination,
    });
  };

  const renderFeatureItem = (
    text: string,
    customStyle?: any,
    badgeColor?: string,
    buttonText?: string,
  ) => (
    <View style={styles(theme).featureRow}>
      <View
        style={[
          styles(theme).checkIconBadge,
          badgeColor ? { backgroundColor: badgeColor } : null,
        ]}
      >
        <Icon name="check" size={12} color={buttonText} />
      </View>
      <Text
        style={[
          styles(theme).featureTextBold,
          customStyle,
          { marginBottom: 0 },
        ]}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <AppLayout
      title="Select Plan"
      showHeader
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles(theme).container}>
        <ScreenLoader visible={isLoading} />

        <ScrollView contentContainerStyle={styles(theme).scrollContent}>
          {plans.map((plan, index) => {
            const pricing = planPricingData[plan.value];
            if (!pricing) {
              return null;
            }

            // Uniform Styling (removed Deluxe distinction)
            const cardStyle = styles(theme).cardLight;
            const textStyle = styles(theme).textDark;
            const buttonStyle = styles(theme).buttonBlue;
            const buttonText = '#fff';

            // Get age from pricing raw data or default to 18
            const minAge = pricing?.adultPricingRaw?.min_age || 18;
            const badgeColor = '#3B82F6';

            return (
              <View
                key={plan.id}
                style={[
                  styles(theme).card,
                  theme.dark ? { backgroundColor: '#1F2937' } : cardStyle,
                ]}
              >
                <View style={styles(theme).headerRow}>
                  <Text
                    style={[
                      styles(theme).planName,
                      theme.dark ? { color: '#fff' } : textStyle,
                    ]}
                  >
                    {plan.label}
                  </Text>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: '#EFF6FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IonIcon
                      name="shield-outline"
                      size={26}
                      color="#2563EB"
                      style={{ opacity: 1 }}
                    />
                  </View>
                </View>

                <View style={styles(theme).priceContainer}>
                  <Text
                    style={[
                      styles(theme).priceValue,
                      theme.dark ? { color: '#fff' } : textStyle,
                    ]}
                  >
                    SGD {pricing?.adultPrice || '--'}
                  </Text>
                  <Text
                    style={[
                      styles(theme).priceUnit,
                      theme.dark ? { color: '#fff' } : textStyle,
                    ]}
                  >
                    {' '}
                    / PERSON
                  </Text>
                </View>

                {/* Simulated Features - Ideally these come from API */}
                <View style={styles(theme).featuresContainer}>
                  {renderFeatureItem(
                    `$${pricing?.childPrice?.toFixed(
                      0,
                    )} (Below ${minAge} years old)`,
                    theme.dark ? { color: '#fff' } : textStyle,
                    badgeColor,
                    buttonText,
                  )}
                  {renderFeatureItem(
                    `$${pricing?.adultPrice?.toFixed(
                      0,
                    )} (Above ${minAge} years old)`,
                    theme.dark ? { color: '#fff' } : textStyle,
                    badgeColor,
                    buttonText,
                  )}
                  {renderFeatureItem(
                    `Up to ${pricing?.maxDays} days`,
                    theme.dark ? { color: '#fff' } : textStyle,
                    badgeColor,
                    buttonText,
                  )}
                  {renderFeatureItem(
                    `$${pricing?.extraPerDay?.toFixed(
                      0,
                    )} for each additional day`,
                    theme.dark ? { color: '#fff' } : textStyle,
                    badgeColor,
                    buttonText,
                  )}
                  {renderFeatureItem(
                    `${destination} Coverage`,
                    theme.dark ? { color: '#fff' } : textStyle,
                    badgeColor,
                    buttonText,
                  )}
                </View>

                <View style={styles(theme).actionRow}>
                  <TouchableOpacity
                    style={[
                      styles(theme).outlineBtn,
                      {
                        borderColor: '#E5E7EB',
                      },
                    ]}
                    onPress={() =>
                      Linking.openURL(plan?.rawPlan?.brochure_url)
                    }
                  >
                    <Text
                      style={{
                        color: theme.dark ? '#fff' : '#374151',
                        fontWeight: '600',
                        fontSize: 13,
                      }}
                    >
                      BROCHURE
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles(theme).selectBtn, buttonStyle]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <Text
                      style={{
                        color: buttonText,
                        fontWeight: '700',
                        fontSize: 13,
                      }}
                    >
                      SELECT PLAN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </AppLayout>
  );
};

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: metrics.doubleMargin,
      paddingBottom: metrics.doubleMargin * 2,
    },
    card: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      position: 'relative',
      overflow: 'hidden',
    },
    cardLight: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    cardDark: {
      backgroundColor: '#0F172A',
    },
    textLight: {
      color: '#FFFFFF',
    },
    textDark: {
      color: '#111827',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    planName: {
      flex: 1,
      fontSize: 28,
      fontWeight: '800',
      lineHeight: 32,
      maxWidth: '80%',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 24,
    },
    priceValue: {
      fontSize: 28,
      fontWeight: '600',
    },
    priceUnit: {
      fontSize: 14,
      fontWeight: '600',
      opacity: 0.6,
      marginLeft: 4,
    },
    featuresContainer: {
      marginBottom: 10,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    checkIconBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    featureText: {
      fontSize: 15,
      fontWeight: '500',
      color: '#9CA3AF', // Default gray
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    outlineBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectBtn: {
      flex: 1.5,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonBlue: {
      backgroundColor: '#2563EB',
    },
    buttonGold: {
      backgroundColor: '#F59E0B',
    },
    featureTextBold: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 12,
    },
    featureTextSame: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
  });

export default PlanSelection;
