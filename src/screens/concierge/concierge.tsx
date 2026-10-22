import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Text } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';
import MutawifTab from './components/MutawifTab';
import MeetGreetTab from './components/MeetGreetTab';
import SGMarketTab from './components/SGMarketTab';
import SpecialCareTab from './components/SpecialCareTab';
import AppLayout from '../../components/safeareawrapper';

const TABS = [
  { id: 'Mutawif', title: 'Mutawif', icon: 'compass-outline' },
  { id: 'MeetGreet', title: 'Meet & Greet', icon: 'airplane-outline' },
  { id: 'SGMarket', title: 'SG Market', icon: 'bag-handle-outline' },
  { id: 'SpecialCare', title: 'Special Care', icon: 'heart-outline' },
];

const ConciergeHub = ({ route, navigation }: any) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(
    route.params?.initialTab || 'Mutawif',
  );

  return (
    <AppLayout title="Concierge Hub" onBackPress={() => navigation.goBack()}>
      <View
        style={{
          flex: 1,
          paddingTop: 15,
          backgroundColor: '#F8FAFB',
        }}
      >
        {/* TABS */}
        <View style={styles.tabContainer}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Icon
                  name={tab.icon}
                  size={20}
                  color={isActive ? '#10B981' : '#9CA3AF'}
                />
                <Text
                  style={[
                    styles.tabText,
                    isActive ? styles.activeTabText : styles.inactiveTabText,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {activeTab === 'Mutawif' && <MutawifTab />}
          {activeTab === 'MeetGreet' && <MeetGreetTab />}
          {activeTab === 'SGMarket' && <SGMarketTab />}
          {activeTab === 'SpecialCare' && <SpecialCareTab />}
        </ScrollView>

        {/* FLOATING CHAT BUTTON */}
        <TouchableOpacity style={styles.fab}>
          <View style={styles.fabIcon}>
            <Icon name="chatbubble" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </AppLayout>
  );
};

export default ConciergeHub;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: '#F2F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabText: {
    color: '#10B981',
  },
  inactiveTabText: {
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabIcon: {
    backgroundColor: '#10B981',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
