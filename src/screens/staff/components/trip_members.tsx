import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useStaffTripMembersQuery,
  useStaffUpdateMemberChatMutation,
  useChatCreateDirectMutation,
} from '../../../redux/services';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { useNavigation } from '@react-navigation/native';
import { Screens } from '../../../common/screens';

const TripMembers = ({ selectedTripId, trips }: any) => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'not_in_group'>('all');
  const [searchKey, setSearchKey] = useState('');

  const tripId = selectedTripId || (trips && trips[0]?.id) || 1;

  const {
    data: membersResp,
    isLoading,
    refetch,
  } = useStaffTripMembersQuery(
    {
      tripId,
      searchKey: searchKey.trim() || undefined,
      filter: activeFilter === 'not_in_group' ? 'not_in_group' : 'all',
    },
    { skip: !tripId },
  );

  const [updateMemberChat, { isLoading: isUpdatingChat }] =
    useStaffUpdateMemberChatMutation();
  const [createDirectChat] = useChatCreateDirectMutation();

  const membersList = membersResp?.data?.rows || [];
  const totalCount = membersResp?.data?.count ?? membersList.length;

  const handleToggleGroup = async (member: any, inGroup: boolean) => {
    try {
      const resp = await updateMemberChat({
        tripId,
        memberId: member.memberId || member.uidNo,
        inGroup,
      }).unwrap();
      showSuccessToast(
        resp.message ||
          (inGroup ? 'Member added to group' : 'Member removed from group'),
        'Success',
      );
      refetch();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to update member';
      showErrorToast(msg, 'Error');
    }
  };

  const handleOpenDirectChat = async (member: any) => {
    try {
      const resp = await createDirectChat({
        tripId,
        memberId: member.memberId,
      }).unwrap();
      if (resp?.data?.id) {
        navigation.navigate(Screens.Conversation, {
          conversationId: resp.data.id,
          title: resp.data.title || member.name,
          role: resp.data.role,
          type: resp.data.type,
          canPost: resp.data.canPost,
        });
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to open chat';
      showErrorToast(msg, 'Chat Error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pilgrim name, UID, or room"
          placeholderTextColor="#9CA3AF"
          value={searchKey}
          onChangeText={setSearchKey}
        />
        {searchKey ? (
          <TouchableOpacity onPress={() => setSearchKey('')}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
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
            All Pilgrims ({totalCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChipWarning,
            activeFilter === 'not_in_group' && styles.filterChipWarningActive,
          ]}
          onPress={() => setActiveFilter('not_in_group')}
        >
          <Text
            style={[
              styles.filterChipWarningText,
              activeFilter === 'not_in_group' &&
                styles.filterChipWarningTextActive,
            ]}
          >
            Not in Chat Group
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#0F8A65"
          style={{ marginVertical: 32 }}
        />
      ) : membersList.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>
            No pilgrims found for this trip.
          </Text>
        </View>
      ) : (
        <View style={styles.listContent}>
          {membersList.map((member: any) => {
            const emergencyStr =
              typeof member.emergencyContact === 'string'
                ? member.emergencyContact
                : member.emergencyContact
                ? `${member.emergencyContact.name || ''} • ${
                    member.emergencyContact.phone || ''
                  }`
                : 'Not Provided';

            return (
              <View key={member.memberId || member.uidNo} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Image
                    source={{
                      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name || 'Pilgrim',
                      )}&background=0F8A65&color=fff`,
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.memberInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{member.name}</Text>
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>
                          {member.uidNo || `ID-${member.memberId}`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.statusText,
                          { color: member.inChatGroup ? '#0F8A65' : '#D97706' },
                        ]}
                      >
                        {member.inChatGroup ? 'In Group' : 'No Chat'}
                      </Text>
                    </View>
                    <Text style={styles.detailsText}>
                      Room: {member.hotelRoom || 'TBA'} • Passport:{' '}
                      {member.passportNo || '—'}
                    </Text>
                    <Text style={styles.detailsText}>
                      Phone: {member.phone || '—'}
                    </Text>
                    <Text style={styles.emergencyText}>
                      Emergency: {emergencyStr}
                    </Text>
                  </View>
                </View>

                <View style={[styles.actionsRow, { gap: 8 }]}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleOpenDirectChat(member)}
                  >
                    <Icon
                      name="chatbubble-outline"
                      size={16}
                      color="#0F8A65"
                    />
                    <Text style={[styles.actionBtnText, { color: '#0F8A65' }]}>
                      Direct Chat
                    </Text>
                  </TouchableOpacity>

                  {!member.inChatGroup ? (
                    <TouchableOpacity
                      style={styles.actionBtnAddGroup}
                      onPress={() => handleToggleGroup(member, true)}
                    >
                      <Text style={styles.actionBtnAddGroupText}>
                        + Add to Group
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionBtnAddGroup,
                        { backgroundColor: '#FEE2E2' },
                      ]}
                      onPress={() => handleToggleGroup(member, false)}
                    >
                      <Text
                        style={[
                          styles.actionBtnAddGroupText,
                          { color: '#B91C1C' },
                        ]}
                      >
                        Remove from Group
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
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
