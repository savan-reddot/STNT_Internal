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

import { ActivityIndicator, Alert } from 'react-native';
import {
  useStaffBroadcastPresetsQuery,
  useStaffSendBroadcastMutation,
  useStaffUpdateChatSettingsMutation,
  useStaffTripMembersQuery,
  useStaffUpdateMemberChatMutation,
  useStaffTripByIdQuery,
} from '../../../redux/services';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const BroadcastChat = ({ selectedTripId, trips }: any) => {
  const tripId = selectedTripId || (trips && trips[0]?.id) || 1;
  const currentTrip = (trips || []).find((t: any) => t.id === tripId);

  const { data: tripDetailResp, refetch: refetchTrip } =
    useStaffTripByIdQuery(tripId, { skip: !tripId });
  const tripData = tripDetailResp?.data || currentTrip;

  const { data: presetsResp } = useStaffBroadcastPresetsQuery();
  const presetsList = presetsResp?.data || [];

  const { data: membersResp, refetch: refetchMembers } =
    useStaffTripMembersQuery({ tripId }, { skip: !tripId });
  const membersList = membersResp?.data?.rows || [];
  const activeMembersInGroup = membersList.filter((m: any) => m.inChatGroup);

  const [updateChatSettings, { isLoading: isUpdatingSettings }] =
    useStaffUpdateChatSettingsMutation();
  const [sendBroadcast, { isLoading: isSendingBroadcast }] =
    useStaffSendBroadcastMutation();
  const [updateMemberChat] = useStaffUpdateMemberChatMutation();

  const [broadcastText, setBroadcastText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState('');

  // membersCanPost: true means discussion mode, false means announcement-only
  const membersCanPost = tripData?.membersCanPost ?? true;
  const isAnnouncementOnly = !membersCanPost;

  const handleToggleChatPermission = async (val: boolean) => {
    // val is isAnnouncementOnly -> membersCanPost = !val
    const newMembersCanPost = !val;
    try {
      const resp = await updateChatSettings({
        tripId,
        membersCanPost: newMembersCanPost,
      }).unwrap();
      showSuccessToast(
        resp.message ||
          (newMembersCanPost
            ? 'Members can now post in the group'
            : 'Announcement only mode activated'),
        'Updated',
      );
      refetchTrip();
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to update settings';
      showErrorToast(msg, 'Error');
    }
  };

  const handleSendPreset = (preset: any) => {
    Alert.alert(
      'Send Broadcast',
      `Send "${preset.title}" to all pilgrims in ${tripData?.name || 'this group'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now',
          style: 'default',
          onPress: async () => {
            try {
              const resp = await sendBroadcast({
                tripId,
                body: { presetId: preset.id },
              }).unwrap();
              showSuccessToast(
                resp?.message || 'Broadcast announcement sent!',
                'Broadcast Sent',
              );
            } catch (err: any) {
              const msg =
                err?.data?.message || err?.message || 'Failed to send broadcast';
              showErrorToast(msg, 'Error');
            }
          },
        },
      ],
    );
  };

  const handleSendCustomBroadcast = async () => {
    if (!broadcastText.trim()) {
      showErrorToast('Please enter an announcement text.', 'Input Required');
      return;
    }
    try {
      const resp = await sendBroadcast({
        tripId,
        body: { text: broadcastText.trim() },
      }).unwrap();
      showSuccessToast(
        resp?.message || 'Broadcast announcement sent!',
        'Broadcast Sent',
      );
      setBroadcastText('');
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to send broadcast';
      showErrorToast(msg, 'Error');
    }
  };

  const handleToggleMember = async (member: any, inGroup: boolean) => {
    try {
      const resp = await updateMemberChat({
        tripId,
        memberId: member.memberId || member.uidNo,
        inGroup,
      }).unwrap();
      showSuccessToast(
        resp.message || (inGroup ? 'Member added' : 'Member removed'),
        'Success',
      );
      refetchMembers();
      refetchTrip();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Update failed';
      showErrorToast(msg, 'Error');
    }
  };

  const handleAddMemberById = async () => {
    if (!addMemberInput.trim()) {
      showErrorToast('Please enter a member ID or UID', 'Input Required');
      return;
    }
    try {
      const resp = await updateMemberChat({
        tripId,
        memberId: addMemberInput.trim(),
        inGroup: true,
      }).unwrap();
      showSuccessToast(resp.message || 'Member added to group', 'Success');
      setAddMemberInput('');
      refetchMembers();
      refetchTrip();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to add member';
      showErrorToast(msg, 'Error');
    }
  };

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
            onValueChange={handleToggleChatPermission}
            disabled={isUpdatingSettings}
            trackColor={{ false: '#D1D5DB', true: '#0F8A65' }}
            thumbColor="#fff"
            style={{ marginLeft: 'auto' }}
          />
        </View>
        <Text style={styles.permissionDesc}>
          {isAnnouncementOnly
            ? 'Announcement Only: Only authorized staff (Leaders & Mutawifs) can post in this group.'
            : 'Discussion Mode: All enrolled pilgrims can post messages and replies in the group chat.'}
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
            <Text style={styles.membersCountText}>
              {tripData?.chatMemberCount ?? activeMembersInGroup.length} /{' '}
              {tripData?.memberCount ?? membersList.length}
            </Text>
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

        {presetsList.map((preset: any) => (
          <TouchableOpacity
            key={preset.id}
            style={styles.presetItem}
            onPress={() => handleSendPreset(preset)}
          >
            <Text style={styles.presetItemTitle}>{preset.title}</Text>
            <Text style={styles.presetItemDesc} numberOfLines={2}>
              📢 {preset.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat Input Card */}
      <View style={styles.card}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {tripData?.name || 'Official Pilgrims Group'}
          </Text>
          <View style={styles.feedBadge}>
            <Text style={styles.feedBadgeText}>Official Broadcast</Text>
          </View>
        </View>
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder={`Announcement to all ${
              tripData?.chatMemberCount ?? activeMembersInGroup.length
            } pilgrims...`}
            placeholderTextColor="#9CA3AF"
            value={broadcastText}
            onChangeText={setBroadcastText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.postBtn,
              isSendingBroadcast && { opacity: 0.6 },
            ]}
            onPress={handleSendCustomBroadcast}
            disabled={isSendingBroadcast}
          >
            {isSendingBroadcast ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="paper-plane-outline" size={16} color="#fff" />
                <Text style={styles.postBtnText}>Post</Text>
              </>
            )}
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
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalTitle}>Chat Group Controls</Text>
                    <Text style={styles.modalSubtitle} numberOfLines={1}>
                      {tripData?.name || 'Official Pilgrims Group'}
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
                      value={membersCanPost}
                      onValueChange={val => handleToggleChatPermission(!val)}
                      trackColor={{ false: '#D1D5DB', true: '#0F8A65' }}
                      thumbColor="#fff"
                      style={{ marginLeft: 'auto' }}
                    />
                  </View>
                  <Text style={styles.toggleDesc}>
                    {membersCanPost
                      ? 'All enrolled pilgrims can send text and replies in the group chat.'
                      : 'Only leaders and coordinators can post messages.'}
                  </Text>
                  <View style={styles.infoBox}>
                    <Icon
                      name="checkmark-circle-outline"
                      size={16}
                      color="#0F8A65"
                    />
                    <Text style={styles.infoBoxText}>
                      {membersCanPost
                        ? 'Discussion Mode: Everyone can participate.'
                        : 'Announcement Mode: Pilgrim replies are blocked.'}
                    </Text>
                  </View>
                </View>

                {/* Add Member */}
                <View style={styles.sectionHeader}>
                  <Icon name="person-add-outline" size={16} color="#0F8A65" />
                  <Text style={styles.sectionTitle}>
                    ADD MEMBER USING MEMBER ID / UID
                  </Text>
                </View>
                <View style={styles.addMemberRow}>
                  <View style={styles.addInputWrapper}>
                    <Icon name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                      style={styles.addInput}
                      placeholder="ENTER UID OR MEMBER ID"
                      placeholderTextColor="#9CA3AF"
                      value={addMemberInput}
                      onChangeText={setAddMemberInput}
                      autoCapitalize="characters"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.btnAddGroup}
                    onPress={handleAddMemberById}
                  >
                    <Text style={styles.btnAddGroupText}>Add to Group</Text>
                  </TouchableOpacity>
                </View>

                {/* Active Members */}
                <View style={styles.sectionHeaderBetween}>
                  <View style={styles.sectionHeaderLeft}>
                    <Icon name="people-outline" size={16} color="#4B5563" />
                    <Text style={[styles.sectionTitle, { color: '#111827' }]}>
                      ALL TRIP MEMBERS ({membersList.length})
                    </Text>
                  </View>
                  <Text style={styles.staffModerateText}>
                    In Group: {activeMembersInGroup.length}
                  </Text>
                </View>

                {membersList.map((member: any) => (
                  <View key={member.memberId || member.uidNo} style={styles.memberListItem}>
                    <Image
                      source={{
                        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.name || 'Pilgrim',
                        )}&background=0F8A65&color=fff`,
                      }}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <View style={styles.memberIdBadge}>
                          <Text style={styles.memberIdText}>
                            {member.uidNo || `ID-${member.memberId}`}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.memberDesc}>
                        {member.hotelRoom ? `Room ${member.hotelRoom} • ` : ''}
                        {member.phone || 'No phone'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleToggleMember(member, !member.inChatGroup)
                      }
                    >
                      <Icon
                        name={
                          member.inChatGroup
                            ? 'person-remove-outline'
                            : 'person-add-outline'
                        }
                        size={20}
                        color={member.inChatGroup ? '#E11D48' : '#0F8A65'}
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
