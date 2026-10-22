import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Text } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import Icon from 'react-native-vector-icons/Ionicons';

const Conversation = ({ navigation }: any) => {
  return (
    <AppLayout title="CONVERSATION" onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.btnBack}
          >
            <Icon name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>Siti Maryam Binte Kassim</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Pilgrim Buddy</Text>
              </View>
            </View>
            <Text style={styles.onlineText}>Online now</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.systemPill}>
            <Text style={styles.systemPillText}>
              End-to-End Encrypted Umrah Travel Channel
            </Text>
          </View>

          <View style={styles.connectedBanner}>
            <Text style={styles.connectedBannerText}>
              You and Siti Maryam Binte Kassim are now connected. Profile photos
              unblurred.
            </Text>
            <Text style={styles.connectedTimeText}>Just now</Text>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageSender}>Siti Maryam Binte Kassim</Text>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                Salam Sister Noorfazella! I saw we are both in the Nov 14 group.
                Would love to connect and keep each other company during
                transit.
              </Text>
              <Text style={styles.messageTime}>Just now</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  btnBack: { marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827', marginRight: 8 },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#065F46', fontSize: 10, fontWeight: '600' },
  onlineText: { fontSize: 12, color: '#0F8A65' },
  content: { padding: 16, alignItems: 'center' },
  systemPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  systemPillText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  connectedBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  connectedBannerText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  connectedTimeText: { fontSize: 11, color: '#D97706', textAlign: 'right' },
  messageContainer: { width: '100%', alignItems: 'flex-start' },
  messageSender: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    marginLeft: 12,
  },
  messageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  messageTime: { fontSize: 11, color: '#9CA3AF', textAlign: 'right' },
});

export default Conversation;
