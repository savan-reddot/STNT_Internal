import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import AssignedTrips, { manifestsData } from './components/assigned_trips';
import TripMembers from './components/trip_members';
import BroadcastChat from './components/broadcast_chat';
import LiveBriefing from './components/live_briefing';

const tripsData = manifestsData.map(trip => ({
  label: trip.title,
  value: trip.id,
}));

const staffTilesData = [
  {
    id: 'assigned_trips',
    title: 'Assigned Trips',
    desc: 'Flights, hotels & schedules',
    iconName: 'airplane-outline',
    iconColor: '#fff',
    iconBg: '#0F8A65',
    badgeText: '2 Active',
    badgeColor: '#0F8A65',
    badgeBg: '#ECFDF5',
    route: null,
  },
  {
    id: 'trip_members',
    title: 'Trip Members',
    desc: '7 Pilgrims & care flags',
    iconName: 'people-outline',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
    badgeText: '7 Special Care',
    badgeColor: '#E11D48',
    badgeBg: '#FFF1F2',
    route: null,
  },
  {
    id: 'broadcast_chat',
    title: 'Broadcast & Chat',
    desc: 'Announcements & permissions',
    iconName: 'megaphone-outline',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    badgeText: 'Discussion',
    badgeColor: '#0F8A65',
    badgeBg: '#ECFDF5',
    route: null,
  },
  {
    id: 'live_briefing',
    title: 'Live Briefing',
    desc: 'Audio/Video to 42 pilgrims',
    iconName: 'radio-outline',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
    badgeText: 'Voice & Video',
    badgeColor: '#9333EA',
    badgeBg: '#FAF5FF',
    route: null,
  },
];
const StaffHome = ({ navigation }: any) => {
  const [selectedTrip, setSelectedTrip] = useState(tripsData[0].value);
  const [activeTile, setActiveTile] = useState('assigned_trips');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Ustaz Haji Farhan Al-Hadi</Text>
              <Icon name="chevron-down" size={16} color="#6B7280" />
            </View>
            <View style={styles.badgeChief}>
              <Text style={styles.badgeChiefText}>CHIEF LEADER</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.btnProfile}>
            <Icon name="person-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnLogOut}>
            <Icon name="log-out-outline" size={20} color="#E11D48" />
            <Text style={styles.btnLogOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip Selector */}
      <View style={styles.tripSection}>
        <Text style={styles.tripLabel}>TRIP :</Text>
        <View
          style={{ position: 'relative', zIndex: 10, flex: 1, marginRight: 12 }}
        >
          <Dropdown
            style={styles.tripDropdown}
            placeholderStyle={styles.tripDropdownText}
            selectedTextStyle={styles.tripDropdownText}
            containerStyle={styles.dropdownMenu}
            itemTextStyle={styles.dropdownItemText}
            data={tripsData}
            labelField="label"
            valueField="value"
            value={selectedTrip}
            onChange={item => setSelectedTrip(item.value)}
            activeColor="#6B7280"
            renderRightIcon={() => (
              <Icon name="chevron-down" size={20} color="#111827" />
            )}
          />
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Active</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Command Tiles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STAFF COMMAND TILES</Text>
          <Text style={styles.sectionSubtitle}>
            Select a tile to view details
          </Text>
        </View>

        <View style={styles.grid}>
          {staffTilesData.map(tile => {
            const isActive = tile.id === activeTile;
            return (
              <TouchableOpacity
                key={tile.id}
                style={[styles.tile, isActive && styles.tileActive]}
                onPress={() => setActiveTile(tile.id)}
              >
                <View style={styles.tileHeader}>
                  <View
                    style={[
                      styles.tileIconWrapper,
                      { backgroundColor: tile.iconBg },
                    ]}
                  >
                    <Icon
                      name={tile.iconName}
                      size={20}
                      color={tile.iconColor}
                    />
                  </View>
                  <View
                    style={[
                      styles.tileBadge,
                      { backgroundColor: tile.badgeBg },
                    ]}
                  >
                    <Text
                      style={[styles.tileBadgeText, { color: tile.badgeColor }]}
                    >
                      {tile.badgeText}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tileTitle}>{tile.title}</Text>
                <Text style={styles.tileDesc}>{tile.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTile === 'assigned_trips' && (
          <AssignedTrips
            onExpandMembers={() => setActiveTile('trip_members')}
          />
        )}
        {activeTile === 'trip_members' && <TripMembers />}
        {activeTile === 'broadcast_chat' && <BroadcastChat />}
        {activeTile === 'live_briefing' && <LiveBriefing />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB', paddingTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F8A65',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginRight: 4 },
  badgeChief: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeChiefText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLogOut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnLogOutText: { color: '#E11D48', fontSize: 13, fontWeight: '700' },
  tripSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  tripLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginRight: 8,
  },
  tripDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  tripDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
    flexShrink: 1,
  },
  dropdownMenu: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItemText: { color: '#fff', fontSize: 13, flexShrink: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0F8A65' },
  liveText: { fontSize: 13, fontWeight: '700', color: '#0F8A65' },
  content: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  sectionSubtitle: { fontSize: 12, color: '#9CA3AF' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  tileActive: {
    borderColor: '#0F8A65',
    backgroundColor: '#fff',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tileIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tileBadgeText: { fontSize: 10, fontWeight: '700' },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  tileDesc: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  manifestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  manifestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  manifestBadgeActive: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  manifestBadgeActiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  manifestInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  manifestInfoText: { fontSize: 13, color: '#6B7280' },
  manifestActions: { flexDirection: 'row', gap: 12 },
  btnViewPilgrims: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnViewPilgrimsText: { color: '#0F8A65', fontSize: 13, fontWeight: '700' },
  btnOpenBroadcast: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnOpenBroadcastText: { color: '#374151', fontSize: 13, fontWeight: '600' },
});

export default StaffHome;
