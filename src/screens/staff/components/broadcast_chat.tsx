import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';

const presets = [
  {
    id: '1',
    icon: '📢',
    title: 'Rawdah Appointment Alert',
    desc: 'Assalamu alaikum pilgrims! Please assemble at Hotel Lo...',
  },
  {
    id: '2',
    icon: '🕋',
    title: 'Tawaf Guidance Briefing',
    desc: 'Tawaf guidance will commence tonight at 11:30 PM. Me...',
  },
  {
    id: '3',
    icon: '🧳',
    title: 'Luggage Collection Alert',
    desc: 'Hotel Checkout Notice: Please label your large luggag...',
  },
  {
    id: '4',
    icon: '✈️',
    title: 'Meeqat & Ihram on Flight',
    desc: 'Attention pilgrims: The flight captain will announce Qar...',
  },
];

const groupMembers = [
  {
    id: '1',
    name: 'Noorfazella Sujud',
    memberId: 'PLG-8821',
    desc: 'Female • 46 yrs • Swissotel #1402',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '2',
    name: 'Hjh Zainab Binte Abdullah',
    memberId: 'PLG-4402',
    desc: 'Female • 56 yrs • Swissotel #1408',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: '3',
    name: 'Hj Razak Bin Othman',
    memberId: 'PLG-9104',
    desc: 'Male • 64 yrs • Swissotel #1210',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: '4',
    name: 'Noorfazella Sujud',
    memberId: 'PLG-8821',
    desc: 'Female • 46 yrs • Swissotel #1402',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '5',
    name: 'Hjh Zainab Binte Abdullah',
    memberId: 'PLG-4402',
    desc: 'Female • 56 yrs • Swissotel #1408',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
  {
    id: '6',
    name: 'Hj Razak Bin Othman',
    memberId: 'PLG-9104',
    desc: 'Male • 64 yrs • Swissotel #1210',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
];

const BroadcastChat = () => {
  const [isAnnouncementOnly, setIsAnnouncementOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [allowPilgrims, setAllowPilgrims] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Permission Card */}
      <View style={styles.card}>
        <View style={styles.permissionHeader}>
          <Icon name="shield-checkmark-outline" size={20} color="#0F8A65" />
          <Text style={styles.permissionTitle}>
            Chat Posting Permission Control
          </Text>
          <Switch
            value={isAnnouncementOnly}
            onValueChange={setIsAnnouncementOnly}
            trackColor={{ false: '#D1D5DB', true: '#0F8A65' }}
            thumbColor={isAnnouncementOnly ? '#fff' : '#fff'}
            style={{ marginLeft: 'auto' }}
          />
        </View>
        <Text style={styles.permissionDesc}>
          Announcement Only: Only authorized staff (Leaders & Mutawifs) can
          broadcast messages.
        </Text>

        <View style={styles.divider} />

        <View style={styles.membersRow}>
          <View>
            <View style={styles.membersCount}>
              <Text style={styles.membersLabel}>Group Members:</Text>
              <Icon
                name="person-add-outline"
                size={14}
                color="#0F8A65"
                style={{ marginLeft: 8 }}
              />
            </View>
            <Text style={styles.membersCountText}>7 / 7</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.manageBtnText}>
              Manage Member Access{'\n'}(Add/Remove)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Presets Card */}
      <View style={styles.card}>
        <View style={styles.presetHeaderRow}>
          <Icon name="flash-outline" size={20} color="#D97706" />
          <Text style={styles.presetTitle}>
            1-Tap Official Broadcast Presets
          </Text>
        </View>

        {presets.map(preset => (
          <TouchableOpacity key={preset.id} style={styles.presetItem}>
            <Text style={styles.presetItemTitle}>{preset.title}</Text>
            <Text style={styles.presetItemDesc} numberOfLines={1}>
              {preset.icon} {preset.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat Input Card */}
      <View style={styles.card}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.chatTitle}>
            Official SG Nov-26 Pilgrims Group
          </Text>
          <View style={styles.feedBadge}>
            <Text style={styles.feedBadgeText}>Official Feed</Text>
          </View>
        </View>
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type an announcement to all 42 p"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.postBtn}>
            <Icon name="paper-plane-outline" size={16} color="#fff" />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manage Members Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.shieldIconWrapper}>
                    <Icon name="shield-outline" size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Chat Group Controls</Text>
                    <Text style={styles.modalSubtitle}>
                      Official SG Nov-26 Pilgrims Group
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.modalBody}
              >
                {/* Toggle Section */}
                <View style={styles.toggleCard}>
                  <View style={styles.toggleHeader}>
                    <Icon name="chatbubble-outline" size={20} color="#0F8A65" />
                    <Text style={styles.toggleTitle}>
                      Allow Pilgrims to Post Messages
                    </Text>
                    <Switch
                      value={allowPilgrims}
                      onValueChange={setAllowPilgrims}
                      trackColor={{ false: '#D1D5DB', true: '#0F8A65' }}
                      thumbColor="#fff"
                      style={{ marginLeft: 'auto' }}
                    />
                  </View>
                  <Text style={styles.toggleDesc}>
                    All enrolled pilgrims can send text and replies in the group
                    chat.
                  </Text>
                  <View style={styles.infoBox}>
                    <Icon
                      name="checkmark-circle-outline"
                      size={16}
                      color="#0F8A65"
                    />
                    <Text style={styles.infoBoxText}>
                      Discussion Mode: Everyone can participate.
                    </Text>
                  </View>
                </View>

                {/* Add Member */}
                <View style={styles.sectionHeader}>
                  <Icon name="person-add-outline" size={16} color="#0F8A65" />
                  <Text style={styles.sectionTitle}>
                    ADD MEMBER USING MEMBER ID
                  </Text>
                </View>
                <View style={styles.addMemberRow}>
                  <View style={styles.addInputWrapper}>
                    <Icon name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.addInput}
                      placeholder="ENTER MEMBER ID (E.G. P"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <TouchableOpacity style={styles.btnAddGroup}>
                    <Text style={styles.btnAddGroupText}>Add to Group</Text>
                  </TouchableOpacity>
                </View>

                {/* Active Members */}
                <View style={styles.sectionHeaderBetween}>
                  <View style={styles.sectionHeaderLeft}>
                    <Icon name="people-outline" size={16} color="#4B5563" />
                    <Text style={[styles.sectionTitle, { color: '#111827' }]}>
                      ACTIVE GROUP MEMBERS (7)
                    </Text>
                  </View>
                  <Text style={styles.staffModerateText}>
                    Staff can moderate
                  </Text>
                </View>

                {groupMembers.map(member => (
                  <View key={member.id} style={styles.memberListItem}>
                    <Image
                      source={{ uri: member.avatar }}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <View style={styles.memberIdBadge}>
                          <Text style={styles.memberIdText}>
                            {member.memberId}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.memberDesc}>{member.desc}</Text>
                    </View>
                    <TouchableOpacity>
                      <Icon
                        name="person-remove-outline"
                        size={20}
                        color="#E11D48"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.btnDone}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24, gap: 16 },
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
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  permissionTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  permissionDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  membersCount: { flexDirection: 'row', alignItems: 'center' },
  membersCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    fontStyle: 'italic',
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F8A65',
    textAlign: 'center',
  },

  presetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  presetTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  presetItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 8,
  },
  presetItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  presetItemDesc: { fontSize: 13, color: '#9CA3AF' },

  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  feedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feedBadgeText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  chatInputRow: { flexDirection: 'row', gap: 12 },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F8A65',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  postBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F8A65',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shieldIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: 20 },
  toggleCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  toggleDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoBoxText: { fontSize: 13, fontWeight: '600', color: '#065F46' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F8A65',
    letterSpacing: 0.5,
  },
  addMemberRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  addInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  addInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#111827' },
  btnAddGroup: {
    backgroundColor: '#0F8A65',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 16,
  },
  btnAddGroupText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staffModerateText: { fontSize: 11, color: '#9CA3AF' },
  memberListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  memberInfo: { flex: 1 },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  memberIdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberIdText: { fontSize: 10, fontWeight: '700', color: '#4B5563' },
  memberDesc: { fontSize: 12, color: '#9CA3AF' },

  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'flex-end',
  },
  btnDone: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  btnDoneText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default BroadcastChat;
