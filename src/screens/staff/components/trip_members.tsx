import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';

const membersData = [
  {
    id: '1',
    name: 'Noorfazella Sujud',
    memberId: 'PLG-8821',
    status: 'Checked In',
    room: 'Swissotel #1402',
    passport: 'K6148390D',
    phone: '+65 9876 5432',
    emergency: 'Encik Sujud (Brother) • +65 9111 2233',
    flags: ['Medical: Insulin Chilling Required', 'First-Time Traveler'],
    avatar: 'https://i.pravatar.cc/150?img=5',
    categories: ['all', 'special'],
    showAddGroup: false,
  },
  {
    id: '2',
    name: 'Hjh Zainab Binte Abdullah',
    memberId: 'PLG-4482',
    status: 'Checked In',
    room: 'Swissotel #1408',
    passport: 'E4319801C',
    phone: '+65 9234 5678',
    emergency: 'Taufiq (Son) • +65 9222 3344',
    flags: ['Elderly Support', 'Wheelchair Required for Tawaf & Sai'],
    avatar: 'https://i.pravatar.cc/150?img=9',
    categories: ['all', 'special'],
    showAddGroup: false,
  },
  {
    id: '4',
    name: 'Nurul Huda Binte Sulaiman',
    memberId: 'PLG-7712',
    status: 'Checked In',
    room: 'Swissotel #1602',
    passport: 'E9981245G',
    phone: '+65 9789 0123',
    emergency: 'Danial (Spouse) • +65 9777 8899',
    flags: ['Traveling with Infant'],
    avatar: 'https://i.pravatar.cc/150?img=31',
    categories: ['all', 'not_in_chat'],
    showAddGroup: true,
  },
];

const TripMembers = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredMembers = membersData.filter(m =>
    m.categories.includes(activeFilter),
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pilgrim name, Member ID (e.g. PLG-8821), or"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All Pilgrims (7)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChipAlert,
            activeFilter === 'special' && styles.filterChipAlertActive,
          ]}
          onPress={() => setActiveFilter('special')}
        >
          <Icon
            name="warning-outline"
            size={14}
            color={activeFilter === 'special' ? '#fff' : '#E11D48'}
          />
          <Text
            style={[
              styles.filterChipAlertText,
              activeFilter === 'special' && styles.filterChipAlertTextActive,
            ]}
          >
            Special Care / Medical (7)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChipWarning,
            activeFilter === 'not_in_chat' && styles.filterChipWarningActive,
          ]}
          onPress={() => setActiveFilter('not_in_chat')}
        >
          <Text
            style={[
              styles.filterChipWarningText,
              activeFilter === 'not_in_chat' &&
                styles.filterChipWarningTextActive,
            ]}
          >
            Not in Chat Group (1)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContent}>
        {filteredMembers.map(member => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              <View style={styles.memberInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{member.name}</Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>{member.memberId}</Text>
                  </View>
                  <Text style={styles.statusText}>{member.status}</Text>
                </View>
                <Text style={styles.detailsText}>
                  {member.room} • Passport: {member.passport} •
                </Text>
                <Text style={styles.detailsText}>{member.phone}</Text>
                <Text style={styles.emergencyText}>
                  Emergency: {member.emergency}
                </Text>

                <View style={styles.flagsContainer}>
                  {member.flags.map((flag, index) => (
                    <View key={index} style={styles.flagBadge}>
                      <Icon name="warning-outline" size={12} color="#E11D48" />
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View
              style={[styles.actionsRow, { gap: member.showAddGroup ? 5 : 12 }]}
            >
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="call-outline" size={16} color="#0F8A65" />
                <Text style={styles.actionBtnText}>Audio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="videocam-outline" size={16} color="#0F8A65" />
                <Text style={styles.actionBtnText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <Icon name="chatbubble-outline" size={16} color="#374151" />
                <Text style={[styles.actionBtnText, { color: '#374151' }]}>
                  Chat
                </Text>
              </TouchableOpacity>

              {member.showAddGroup && (
                <TouchableOpacity style={styles.actionBtnAddGroup}>
                  <Text style={styles.actionBtnAddGroupText}>
                    + Add to Group
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#111827',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: { backgroundColor: '#0F8A65' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#fff' },
  filterChipAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  filterChipAlertActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  filterChipAlertText: { fontSize: 12, fontWeight: '700', color: '#E11D48' },
  filterChipAlertTextActive: { color: '#fff' },
  filterChipWarning: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  filterChipWarningActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  filterChipWarningText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  filterChipWarningTextActive: { color: '#fff' },
  listContent: { paddingBottom: 24 },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  memberHeader: { flexDirection: 'row', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  memberInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#0F8A65' },
  detailsText: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  emergencyText: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  flagsContainer: { gap: 6, alignItems: 'flex-start' },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  flagText: { fontSize: 11, fontWeight: '600', color: '#E11D48' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#0F8A65' },
  actionBtnAddGroup: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnAddGroupText: { fontSize: 12, fontWeight: '700', color: '#854D0E' },
});

export default TripMembers;
