import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';

const LiveBriefing = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconWrapper}>
            <Icon name="radio-outline" size={20} color="#9333EA" />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>Live Ground Briefing Room</Text>
            <Text style={styles.subtitle}>
              Broadcast audio announcements or host live video Q&A with all 7
              pilgrims.
            </Text>
          </View>
        </View>

        {/* Audio Card */}
        <View style={styles.subCard}>
          <View style={styles.subCardHeader}>
            <Icon name="call-outline" size={18} color="#9333EA" />
            <Text style={styles.subCardTitle}>Live Voice Broadcast</Text>
          </View>
          <Text style={styles.subCardDesc}>
            Ideal for walking between hotels and Haram, bus transfers, and
            assembly call-outs with low bandwidth usage.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#9333EA' }]}
          >
            <Icon name="radio-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Start Live Audio Call</Text>
          </TouchableOpacity>
        </View>

        {/* Video Card */}
        <View style={styles.subCard}>
          <View style={styles.subCardHeader}>
            <Icon name="videocam-outline" size={18} color="#0F8A65" />
            <Text style={styles.subCardTitle}>Group Video Briefing</Text>
          </View>
          <Text style={styles.subCardDesc}>
            Ideal for evening hotel lobby fiqh lectures, Rawdah permit
            instructions, and interactive Mutawif demonstrations.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#0F8A65' }]}
          >
            <Icon name="videocam-outline" size={16} color="#fff" />
            <Text style={styles.btnText}>Start Group Video Briefing</Text>
          </TouchableOpacity>
        </View>

        {/* Alert Box */}
        <View style={styles.alertBox}>
          <Icon
            name="information-circle-outline"
            size={20}
            color="#9333EA"
            style={{ marginTop: 2 }}
          />
          <Text style={styles.alertText}>
            <Text style={{ fontWeight: '700' }}>Leader Broadcast Rights: </Text>
            You can mute all pilgrim microphones with one tap at any time to
            make urgent safety announcements.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  subCard: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  subCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#6B21A8',
    lineHeight: 20,
  },
});

export default LiveBriefing;
