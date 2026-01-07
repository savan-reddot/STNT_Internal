import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import AppLayout from '../../components/safeareawrapper';
import { MD3Theme, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Screens } from '../../common/screens';
import Claim from '../claim/claim';
import { useLazyGet_policyQuery } from '../../redux/services';
import ScreenLoader from '../../components/loader';
import fontStyle from '../../styles/fontStyle';

interface POLICY_DATA {
  policies: any[];
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
}

const Policies = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { initialTab } = route.params || {};
  const [activeTab, setActiveTab] = useState<'policy' | 'claims'>('policy');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Data State for Policy Card (copied from Home logic)
  const [get_policy, { isLoading }] = useLazyGet_policyQuery();
  const initPolicyData: POLICY_DATA = {
    policies: [],
    totalPolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
  };
  const [policy_data, setPolicy_Data] = useState<POLICY_DATA>(initPolicyData);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const resp = await get_policy({ category: 'all' });
    if (resp?.data?.status && resp?.data?.data) {
      setPolicy_Data(resp?.data?.data);
    }
  };

  const isExpired = policy_data?.policies?.[0]?.isExpired;
  const currentPlan = policy_data?.policies?.[0]?.manifest?.type
    ? `${policy_data?.policies?.[0]?.manifest?.type} ${policy_data?.policies?.[0]?.manifest?.package}`
    : '';

  return (
    <AppLayout
      title="INSURANCE"
      right={
        activeTab === 'claims'
          ? [
              <TouchableOpacity
                onPress={() => navigation.navigate(Screens.DraftClaims)}
              >
                <Text
                  style={[
                    fontStyle(theme).headingSmall,
                    { margin: 0, color: '#fff' },
                  ]}
                >
                  Draft
                </Text>
              </TouchableOpacity>,
            ]
          : undefined
      }
      titleExtraStyle={{ marginLeft: activeTab === 'claims' ? 40 : 0 }}
    >
      <View style={[styles(theme).container]}>
        <ScreenLoader visible={isLoading} />

        {/* Toggle Tabs */}
        <View style={styles(theme).tabContainer}>
          <TouchableOpacity
            style={[
              styles(theme).tabButton,
              activeTab === 'policy' && styles(theme).activeTabButton,
            ]}
            onPress={() => setActiveTab('policy')}
          >
            <Text
              style={[
                styles(theme).tabText,
                activeTab === 'policy' && styles(theme).activeTabText,
              ]}
            >
              POLICY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(theme).tabButton,
              activeTab === 'claims' && styles(theme).activeTabButton,
            ]}
            onPress={() => setActiveTab('claims')}
          >
            <Text
              style={[
                styles(theme).tabText,
                activeTab === 'claims' && styles(theme).activeTabText,
              ]}
            >
              CLAIMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'policy' ? (
          <ScrollView
            contentContainerStyle={styles(theme).scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* PLAN CARD (Reused logic) */}
            {currentPlan ? (
              <View
                style={[
                  styles(theme).planCard,
                  styles(theme).planCardBackground,
                ]}
              >
                <View style={styles(theme).planHeader}>
                  <View style={styles(theme).activeBadge}>
                    <Text
                      style={[
                        styles(theme).activeText,
                        isExpired && styles(theme).expiredText,
                      ]}
                    >
                      {isExpired ? 'EXPIRED' : 'ACTIVE PROTECTION'}
                    </Text>
                  </View>
                  <Icon
                    name="shield-checkmark-outline"
                    size={32}
                    color="#10B981"
                  />
                </View>

                <View style={styles(theme).policyNumberContainer}>
                  <View style={styles(theme).policyNumberRow}>
                    <View style={styles(theme).policyNumberBadge}>
                      <Text style={styles(theme).policyNumberText}>
                        {policy_data?.policies?.[0]?.policyNumber ||
                          'STNT-0000'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles(theme).planName}>{currentPlan}</Text>
                </View>

                {/* Feature Icons */}
                <View style={styles(theme).featureIconsContainer}>
                  {['heart', 'airplane', 'briefcase', 'car', 'person'].map(
                    (icon, index) => (
                      <View
                        key={icon}
                        style={[
                          styles(theme).featureIconWrapper,
                          {
                            borderColor: index < 3 ? '#10B981' : '#374151',
                            backgroundColor:
                              index < 3
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'transparent',
                          },
                        ]}
                      >
                        <Icon
                          name={`${icon}-outline`}
                          size={18}
                          color={index < 3 ? '#10B981' : '#4B5563'}
                        />
                      </View>
                    ),
                  )}
                </View>

                <View style={styles(theme).divider} />

                <View style={styles(theme).coverageRow}>
                  <View>
                    <Text style={styles(theme).coverageLabel}>
                      COVERAGE LIMIT
                    </Text>
                    <Text style={styles(theme).coverageAmount}>
                      SGD 100,000
                    </Text>
                  </View>

                  <Icon
                    name="document-text-outline"
                    size={24}
                    color="#6B7280"
                  />
                </View>
              </View>
            ) : (
              <View style={styles(theme).noPolicyContainer}>
                <Text>No Active Policy Found</Text>
              </View>
            )}

            {/* Action Buttons Row */}
            <View style={styles(theme).actionButtonsRow}>
              <TouchableOpacity
                style={styles(theme).actionButton}
                onPress={() => navigation.navigate(Screens.Exclusions)}
              >
                <Icon name="close-circle-outline" size={24} color="#9CA3AF" />
                <View>
                  <Text style={styles(theme).actionNumber}>5</Text>
                  <Text style={styles(theme).actionLabel}>EXCLUSIONS</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles(theme).actionButton}
                onPress={() => navigation.navigate(Screens.Benefits)}
              >
                <Icon
                  name="checkmark-circle-outline"
                  size={24}
                  color="#9CA3AF"
                />
                <View>
                  <Text style={styles(theme).actionNumber}>12</Text>
                  <Text style={styles(theme).actionLabel}>BENEFITS</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* View Policy History Button */}
            <TouchableOpacity
              style={styles(theme).historyButton}
              onPress={() => navigation.navigate(Screens.PolicyHistory)}
            >
              <Icon
                name="time-outline"
                size={20}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />
              <Text style={styles(theme).historyButtonText}>
                VIEW POLICY HISTORY
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles(theme).claimsContainer}>
            <Claim navigation={navigation} showHeader={false} />
          </View>
        )}
      </View>
    </AppLayout>
  );
};

export default Policies;

const styles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      marginHorizontal: 20,
      marginVertical: 5,
      borderRadius: 12,
      padding: 4,
      height: 50,
      alignItems: 'center',
      gap: 10,
    },
    tabButton: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      backgroundColor: theme.dark ? '#374151' : '#fff',
    },
    activeTabButton: {
      backgroundColor: '#10B981', // Green
    },
    tabText: {
      fontWeight: '700',
      color: theme.dark ? '#9CA3AF' : '#9CA3AF',
      fontSize: 13,
      letterSpacing: 0.5,
    },
    activeTabText: {
      color: '#fff',
    },
    planCard: {
      borderRadius: 24,
      padding: 24,
      marginTop: 10,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    activeBadge: {
      backgroundColor: '#1F3D36',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    activeText: {
      color: '#10B981',
      fontWeight: '700',
      fontSize: 12,
      textTransform: 'uppercase',
    },
    expiredText: {
      color: '#EF4444',
    },
    planName: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
      textTransform: 'uppercase',
    },
    divider: {
      height: 1,
      backgroundColor: '#1F2937',
      marginVertical: 24,
    },
    coverageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coverageLabel: {
      color: '#9CA3AF',
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4,
    },
    coverageAmount: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '800',
    },
    actionButton: {
      flex: 1,
      backgroundColor: theme.dark ? '#374151' : '#fff',
      borderRadius: 20,
      padding: 20,
      height: 100,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    actionNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.onSurface,
    },
    actionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#9CA3AF',
      marginTop: 2,
    },
    historyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.dark ? '#1F2937' : '#F3F4F6',
      borderRadius: 24,
      paddingVertical: 16,
      marginTop: 24,
    },
    historyButtonText: {
      fontWeight: '800',
      color: theme.dark ? '#9CA3AF' : '#6B7280',
      fontSize: 13,
      letterSpacing: 0.5,
    },
    scrollViewContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    planCardBackground: {
      backgroundColor: theme.dark ? '#111827' : '#0A1120',
    },
    policyNumberContainer: {
      marginTop: 20,
    },
    policyNumberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 5,
    },
    policyNumberBadge: {
      backgroundColor: '#1F2937',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    policyNumberText: {
      color: '#9CA3AF',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    featureIconsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    featureIconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noPolicyContainer: {
      alignItems: 'center',
      marginVertical: 40,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 24,
    },
    claimsContainer: {
      flex: 1,
    },
  });
