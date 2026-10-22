import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';

export const manifestsData = [
  {
    id: '1',
    title: 'Singapore to Jeddah (14 Nov – 28 Nov 2026)',
    status: 'ACTIVE',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    btnBg: '#ECFDF5',
    info: '14 Nov - 28 Nov 2026 • 42 Pilgrims Enrolled',
    pilgrims: 7,
    flights: [
      {
        id: 'f1',
        type: 'outbound',
        title: 'Outbound Flight: SQ 452 (Changi T3 16:30 → Jeddah 21:15)',
        desc: 'Singapore Changi (SIN) → Jeddah King Abdulaziz (JED). Meeqat announcement 30 min before Yalamlam.',
      },
      {
        id: 'f2',
        type: 'return',
        title: 'Return Flight: SV 837 (Jeddah 01:20 → Changi T3 15:40)',
        desc: 'Madinah Prince Mohammad Bin Abdulaziz (MED) → Singapore Changi (SIN). Zamzam 5L included.',
      },
    ],
    hotels: [
      {
        id: 'h1',
        label: 'MAKKAH (SWISSOTEL CLOCK TOWER)',
        value: 'Swissotel Makkah Clock Tower (Days 1–8)',
      },
      {
        id: 'h2',
        label: 'MADINAH (PULLMAN ZAMZAM)',
        value: 'Pullman Zamzam Madinah (Days 8–14)',
      },
    ],
    team: [
      {
        id: 't1',
        name: 'Ustaz Haji\nFarhan Al-Hadi',
        avatar: 'https://i.pravatar.cc/150?img=11',
      },
      {
        id: 't2',
        name: 'Sheikh\nAhmad Al-Makki',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      {
        id: 't3',
        name: 'Bro\nYasin Al-Zahrani',
        avatar: 'https://i.pravatar.cc/150?img=13',
      },
    ],
  },
  {
    id: '2',
    title: 'Dec School Holidays Deluxe (20 Dec 2026 – 03 Jan 2027)',
    status: 'UPCOMING',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    btnBg: '#ECFDF5',
    info: '20 Dec 2026 - 03 Jan 2027 • 46 Pilgrims Enrolled',
    pilgrims: 0,
    flights: [],
    hotels: [],
    team: [],
  },
];

const AssignedTrips = ({ onExpandMembers }: any) => {
  const [expandedId, setExpandedId] = useState('1');
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ASSIGNED TRIP MANIFESTS (2)</Text>
        <Text style={styles.sectionSubtitle}>
          Staff ID: <Text style={{ fontWeight: '700' }}>staff_lead_1</Text>
        </Text>
      </View>

      {manifestsData.map(manifest => {
        const isExpanded = expandedId === manifest.id;
        return (
          <TouchableOpacity
            key={manifest.id}
            style={
              isExpanded ? styles.manifestCardExpanded : styles.manifestCard
            }
            onPress={() => setExpandedId(isExpanded ? '' : manifest.id)}
            activeOpacity={0.8}
          >
            <View style={styles.manifestHeader}>
              <Text style={styles.manifestTitle}>{manifest.title}</Text>
              <View
                style={[
                  styles.manifestBadgeActive,
                  { backgroundColor: manifest.badgeBg },
                ]}
              >
                <Text
                  style={[
                    styles.manifestBadgeActiveText,
                    { color: manifest.badgeText },
                  ]}
                >
                  {manifest.status}
                </Text>
              </View>
            </View>
            <View style={styles.manifestInfoRow}>
              <Icon name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.manifestInfoText}>{manifest.info}</Text>
            </View>
            <View style={styles.manifestActions}>
              <TouchableOpacity
                style={[
                  styles.btnViewPilgrims,
                  { backgroundColor: manifest.btnBg },
                ]}
                onPress={onExpandMembers}
              >
                <Text style={styles.btnViewPilgrimsText}>
                  View Pilgrims ({manifest.pilgrims})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOpenBroadcast}>
                <Text style={styles.btnOpenBroadcastText}>Open Broadcast</Text>
              </TouchableOpacity>
            </View>

            {isExpanded && (
              <View style={styles.expandedDetails}>
                {manifest.flights.map(flight => (
                  <View key={flight.id} style={styles.detailCard}>
                    <View style={styles.detailCardHeader}>
                      <Icon
                        name="airplane-outline"
                        size={16}
                        color="#0F8A65"
                        style={{
                          marginTop: 2,
                          transform:
                            flight.type === 'return'
                              ? [{ rotate: '180deg' }]
                              : [],
                        }}
                      />
                      <Text style={styles.detailCardTitle}>{flight.title}</Text>
                    </View>
                    <Text style={styles.detailCardDesc}>{flight.desc}</Text>
                  </View>
                ))}

                {manifest.hotels.length > 0 && (
                  <View style={styles.hotelCard}>
                    <View style={styles.detailCardHeader}>
                      <Icon
                        name="business-outline"
                        size={16}
                        color="#D97706"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.detailCardTitle}>
                        Official Accommodations & Hotel Key Manifest
                      </Text>
                    </View>

                    {manifest.hotels.map(hotel => (
                      <View key={hotel.id} style={styles.hotelItem}>
                        <Text style={styles.hotelLabel}>{hotel.label}</Text>
                        <Text style={styles.hotelValue}>{hotel.value}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {manifest.team.length > 0 && (
                  <View style={styles.teamRow}>
                    <Text style={styles.teamLabel}>
                      Trip{'\n'}Staff{'\n'}Team:
                    </Text>

                    {manifest.team.map(member => (
                      <View key={member.id} style={styles.teamPill}>
                        <Image
                          source={{ uri: member.avatar }}
                          style={styles.teamAvatar}
                        />
                        <Text style={styles.teamName}>{member.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
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
  manifestCardExpanded: {
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

  expandedDetails: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  detailCard: {
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  detailCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 24,
    lineHeight: 18,
  },
  hotelCard: {
    backgroundColor: '#F8FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  hotelItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hotelLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  hotelValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  teamLabel: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  teamPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderRadius: 8,
    gap: 8,
  },
  teamAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
});

export default AssignedTrips;
