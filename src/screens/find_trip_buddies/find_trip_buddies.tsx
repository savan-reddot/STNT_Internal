import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { Text } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

const buddies = [
  {
    id: '1',
    name: 'Ustaz Haji Farhan Al-H...',
    role: 'Travel Leader',
    isLeader: true,
    ageGender: '49 yrs • Male',
    photoUnlocked: true,
    tripDates: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)',
    desc: 'Official Tour Lead & Religious Director for SG Group Alpha. 14 years leading Hajj & Umrah groups.',
    tags: ['#Fiqh of Umrah', '#Ziyarah Guide', '#Group Coordination'],
    image: 'https://i.pravatar.cc/150?img=11', // Placeholder
    connected: true,
    status: 'connected',
  },
  {
    id: '2',
    name: 'Fatimah Zahra Binte Rahim',
    role: 'Pilgrim',
    isLeader: false,
    ageGender: '44 yrs • Female',
    photoUnlocked: false,
    tripDates: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)',
    desc: 'Traveling from Tampines, Singapore with my elder sister. Looking for sisterly companions for early morning Tahajjud at Haram.',
    tags: [],
    image: null,
    connected: false,
    status: 'connected',
  },
  {
    id: '3',
    name: 'Siti Maryam Binte Kassim',
    role: 'Pilgrim',
    isLeader: false,
    ageGender: '63 yrs • Female',
    photoUnlocked: false,
    tripDates: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)',
    desc: 'Elderly pilgrim seeking a slow-paced walking buddy for wheelchair-assisted Tawaf and Rawdah visit.',
    tags: ['#Elderly Care', '#Gentle Pacing', "#Du'a Sharing"],
    image: null,
    connected: false,
    status: 'received_request',
  },
  {
    id: '4',
    name: 'Siti Maryam Binte Kassim',
    role: 'Pilgrim',
    isLeader: false,
    ageGender: '63 yrs • Female',
    photoUnlocked: false,
    tripDates: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)',
    desc: 'Elderly pilgrim seeking a slow-paced walking buddy for wheelchair-assisted Tawaf and Rawdah visit.',
    tags: ['#Elderly Care', '#Gentle Pacing', "#Du'a Sharing"],
    image: null,
    connected: false,
    status: 'sent_request',
  },
];

const FindTripBuddies = ({ navigation }: any) => {
  const [trip, setTrip] = useState('1');
  const [gender, setGender] = useState('1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const trips = [
    { label: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)', value: '1' },
  ];

  const genders = [
    { label: 'All Genders', value: '1' },
    { label: 'Male Only', value: '2' },
    { label: 'Female Only', value: '3' },
  ];

  return (
    <AppLayout
      title="FIND TRIP BUDDIES"
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.label}>TRIP GROUP</Text>
          <Dropdown
            style={styles.dropdownTrip}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={trips}
            labelField="label"
            valueField="value"
            value={trip}
            onChange={item => setTrip(item.value)}
          />

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Icon name="search-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, interests..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Dropdown
              style={styles.dropdownGender}
              placeholderStyle={styles.dropdownGenderText}
              selectedTextStyle={styles.dropdownGenderText}
              data={genders}
              labelField="label"
              valueField="value"
              value={gender}
              onChange={item => setGender(item.value)}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'All' && styles.filterChipActive,
              ]}
              onPress={() => setFilter('All')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'All' && styles.filterChipTextActive,
                ]}
              >
                All Companions (6)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'Leaders' && styles.filterChipActive,
              ]}
              onPress={() => setFilter('Leaders')}
            >
              <Icon
                name="shield-checkmark-outline"
                size={14}
                color={filter === 'Leaders' ? '#fff' : '#4B5563'}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'Leaders' && styles.filterChipTextActive,
                ]}
              >
                Travel Leaders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filter === 'Pilgrims' && styles.filterChipActive,
              ]}
              onPress={() => setFilter('Pilgrims')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'Pilgrims' && styles.filterChipTextActive,
                ]}
              >
                Pilgrims Only
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={buddies}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.privacyBanner}>
              <View style={styles.privacyIconWrapper}>
                <Icon name="lock-closed-outline" size={20} color="#065F46" />
              </View>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyTitle}>
                  Pilgrim Privacy Protection
                </Text>
                <Text style={styles.privacyDesc}>
                  Profile photos remain safely blurred until you both mutually
                  accept a buddy request. Travel leaders are verified by the
                  agency.
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {item.image && item.photoUnlocked ? (
                  <Image source={{ uri: item.image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarBlurred}>
                    <Icon name="lock-closed-outline" size={20} color="#fff" />
                    <Text style={styles.blurredText}>BLURRED</Text>
                  </View>
                )}
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={styles.tagsRow}>
                    <View style={styles.ageGenderPill}>
                      <Text style={styles.ageGenderText}>{item.ageGender}</Text>
                    </View>
                    {item.photoUnlocked && (
                      <View style={styles.photoUnlockedRow}>
                        <Icon
                          name="checkmark-circle-outline"
                          size={14}
                          color="#0F8A65"
                        />
                        <Text style={styles.photoUnlockedText}>
                          Photo Unlocked
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    item.isLeader
                      ? styles.roleBadgeLeader
                      : styles.roleBadgePilgrim,
                  ]}
                >
                  {item.isLeader && (
                    <Icon
                      name="shield-checkmark-outline"
                      size={12}
                      color="#B45309"
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.roleBadgeText,
                      item.isLeader
                        ? styles.roleBadgeTextLeader
                        : styles.roleBadgeTextPilgrim,
                    ]}
                  >
                    {item.role}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDateRow}>
                <Icon name="calendar-outline" size={14} color="#9CA3AF" />
                <Text style={styles.tripDateText}>{item.tripDates}</Text>
              </View>

              <View style={styles.descBox}>
                <Text style={styles.descText}>{item.desc}</Text>
              </View>

              {item.tags.length > 0 && (
                <View style={styles.hashtagsRow}>
                  {item.tags.map((tag, idx) => (
                    <View key={idx} style={styles.hashtagPill}>
                      <Text style={styles.hashtagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {item.status === 'connected' && (
                <TouchableOpacity style={styles.btnAction}>
                  <Icon name="chatbubble-outline" size={16} color="#fff" />
                  <Text style={styles.btnActionText}>
                    Connected • Open Chat
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === 'received_request' && (
                <View style={styles.receivedRequestContainer}>
                  <Text style={styles.receivedRequestText}>
                    They sent you a request!
                  </Text>
                  <TouchableOpacity style={styles.btnAccept}>
                    <Text style={styles.btnAcceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'sent_request' && (
                <View style={styles.sentRequestContainer}>
                  <View style={styles.sentRequestLeft}>
                    <Icon name="sparkles-outline" size={16} color="#B45309" />
                    <Text style={styles.sentRequestText}>
                      Request Sent (Awaiting Acceptance)
                    </Text>
                  </View>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  topSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  label: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  dropdownTrip: {
    borderWidth: 1,
    borderColor: '#0F8A65',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dropdownText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
  },
  dropdownGender: {
    width: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  dropdownGenderText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  filtersScroll: { flexDirection: 'row' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#0F8A65', borderColor: '#0F8A65' },
  filterIcon: { marginRight: 6 },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterChipTextActive: { color: '#fff' },
  listContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 12, position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  avatarBlurred: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3730A3',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurredText: { color: '#fff', fontSize: 8, fontWeight: '700', marginTop: 4 },
  cardHeaderInfo: { flex: 1, justifyContent: 'center' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingRight: 80,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  roleBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeLeader: { backgroundColor: '#FEF3C7' },
  roleBadgePilgrim: { backgroundColor: '#F3F4F6' },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  roleBadgeTextLeader: { color: '#B45309' },
  roleBadgeTextPilgrim: { color: '#4B5563' },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageGenderPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ageGenderText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  photoUnlockedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoUnlockedText: { fontSize: 11, fontWeight: '600', color: '#0F8A65' },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tripDateText: { fontSize: 12, color: '#6B7280' },
  descBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  descText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hashtagPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashtagText: { fontSize: 11, color: '#4B5563' },
  btnAction: {
    flexDirection: 'row',
    backgroundColor: '#0F8A65',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  privacyBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  privacyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyTextContainer: { flex: 1 },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  receivedRequestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  receivedRequestText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  btnAccept: {
    backgroundColor: '#0F8A65',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAcceptText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  sentRequestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sentRequestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentRequestText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    textDecorationLine: 'underline',
  },
});

export default FindTripBuddies;
