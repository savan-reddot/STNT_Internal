import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import { Screens } from '../../common/screens';
import { useChatConversationsQuery } from '../../redux/services';

const chatsData = [
  {
    id: '1',
    avatar: 'https://i.pravatar.cc/150?img=33',
    title: 'SG Pilgrims Nov 2026 ...',
    role: 'Official Group',
    isOfficial: true,
    time: '11:42 AM',
    message: 'Ustaz Farhan: Reminder luggage drop off at Chan...',
    unread: 3,
  },
  {
    id: '2',
    avatar: 'https://i.pravatar.cc/150?img=11',
    title: 'Ustaz Haji Farhan Al-Hadi',
    role: 'Travel Leader',
    isOfficial: false,
    time: 'Yesterday',
    message: 'Wa alaikum salam Sister Noorfazella. Noted on your insu...',
    unread: 0,
  },
];

const initialRequestsData = [
  {
    id: '1',
    name: 'Siti Maryam Binte Kassim',
    time: '10 mins ago',
    ageGender: '63 yrs • Female',
    trip: 'Singapore to Jeddah (14...',
    message:
      '"Salam Sister Noorfazella! I saw we are both in the Nov 14 group. Would love to connect and keep each other company during transit."',
    status: 'pending',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
];

const ChatsRequests = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [requests, setRequests] = useState(initialRequestsData);

  const handleAccept = (id: string) => {
    setRequests(reqs =>
      reqs.map(req => (req.id === id ? { ...req, status: 'accepted' } : req)),
    );
  };

  const handleDecline = (id: string) => {
    setRequests(reqs =>
      reqs.map(req => (req.id === id ? { ...req, status: 'declined' } : req)),
    );
  };

  const {
    data: convResp,
    isLoading: isConvLoading,
    refetch: refetchConv,
    isFetching: isConvFetching,
  } = useChatConversationsQuery(undefined, {
    pollingInterval: 10000,
  });

  const apiConversations = convResp?.data?.rows || [];

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const conversationsToRender =
    apiConversations.length > 0
      ? apiConversations.map((c: any) => ({
          id: String(c.id),
          conversationId: c.id,
          avatar:
            c.type === 'trip_group'
              ? 'https://ui-avatars.com/api/?name=Group&background=0F8A65&color=fff'
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  c.title || 'User',
                )}&background=3B82F6&color=fff`,
          title: c.title,
          role: c.type === 'trip_group' ? 'Official Group' : c.role || 'Direct Chat',
          isOfficial: c.type === 'trip_group',
          time: formatTime(c.lastMessage?.createdAt),
          message: c.lastMessage
            ? c.lastMessage.kind === 'broadcast'
              ? `📢 ${c.lastMessage.text}`
              : `${c.lastMessage.senderName ? `${c.lastMessage.senderName}: ` : ''}${c.lastMessage.text}`
            : 'No messages yet',
          unread: c.unreadCount ?? 0,
          canPost: c.canPost,
          tripId: c.tripId,
          type: c.type,
        }))
      : chatsData.map(c => ({
          ...c,
          conversationId: c.id,
          canPost: true,
          tripId: 1,
          type: c.isOfficial ? 'trip_group' : 'direct',
        }));

  return (
    <AppLayout title="CHATS & GROUPS" onBackPress={() => navigation.goBack()}>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chats' && styles.tabActive]}
            onPress={() => setActiveTab('chats')}
          >
            <Icon
              name="chatbubble-outline"
              size={16}
              color={activeTab === 'chats' ? '#0F8A65' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'chats' && styles.tabTextActive,
              ]}
            >
              Chats & Groups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Icon
              name="person-add-outline"
              size={16}
              color={activeTab === 'requests' ? '#0F8A65' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.tabTextActive,
              ]}
            >
              Requests
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'chats' ? (
          isConvLoading && apiConversations.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#0F8A65"
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={conversationsToRender}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.content}
              refreshControl={
                <RefreshControl
                  refreshing={isConvFetching}
                  onRefresh={refetchConv}
                  colors={['#0F8A65']}
                />
              }
              ListHeaderComponent={
                <View style={styles.infoBanner}>
                  <View style={styles.infoIconWrapper}>
                    <Icon name="people-outline" size={20} color="#0F8A65" />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Trip Communications</Text>
                    <Text style={styles.infoDesc}>
                      Official announcements, broadcast briefings, and direct 1-on-1 chat channels for your Umrah trip.
                    </Text>
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatCard}
                  onPress={() =>
                    navigation.navigate(Screens.Conversation, {
                      conversationId: item.conversationId,
                      title: item.title,
                      role: item.role,
                      type: item.type,
                      canPost: item.canPost,
                      tripId: item.tripId,
                    })
                  }
                >
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.chatAvatar}
                  />
                  <View style={styles.chatContent}>
                    <View style={styles.chatHeaderRow}>
                      <Text style={styles.chatTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View
                        style={
                          item.isOfficial
                            ? styles.roleBadgeOfficial
                            : styles.roleBadgeLeader
                        }
                      >
                        <Text
                          style={
                            item.isOfficial
                              ? styles.roleBadgeOfficialText
                              : styles.roleBadgeLeaderText
                          }
                        >
                          {item.role}
                        </Text>
                      </View>
                      <Text style={styles.chatTime}>{item.time}</Text>
                    </View>
                    <View style={styles.chatMessageRow}>
                      <Text style={styles.chatMessage} numberOfLines={1}>
                        {item.message}
                      </Text>
                      {item.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {item.unread}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        ) : (
          <FlatList
            data={requests}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.content}
            ListHeaderComponent={
              <View style={styles.testBanner}>
                <Text style={styles.testBannerText}>
                  <Text style={styles.testBannerTextBold}>
                    Test Notification Flow:
                  </Text>{' '}
                  Click button to trigger an incoming connection request.
                </Text>
                <TouchableOpacity style={styles.btnSimulate}>
                  <Icon name="sparkles-outline" size={14} color="#fff" />
                  <Text style={styles.btnSimulateText}>Simulate</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  {item.status === 'accepted' ? (
                    <Image
                      source={{ uri: item.avatar }}
                      style={styles.avatarUnblurred}
                    />
                  ) : (
                    <View style={styles.avatarBlurred}>
                      <Icon name="lock-closed-outline" size={20} color="#fff" />
                    </View>
                  )}
                  <View style={styles.requestHeaderInfo}>
                    <View style={styles.requestHeaderRow}>
                      <Text style={styles.requestName}>{item.name}</Text>
                      <Text style={styles.requestTime}>{item.time}</Text>
                    </View>
                    <View style={styles.tagsRow}>
                      <View style={styles.ageGenderPill}>
                        <Text style={styles.ageGenderText}>
                          {item.ageGender}
                        </Text>
                      </View>
                      <View style={styles.tripPill}>
                        <Text style={styles.tripPillText}>{item.trip}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.messageQuoteBox}>
                  <Text style={styles.messageQuoteText}>{item.message}</Text>
                </View>

                <View style={styles.divider} />

                {item.status === 'pending' && (
                  <View style={styles.requestActionRow}>
                    <TouchableOpacity
                      style={styles.btnAccept}
                      onPress={() => handleAccept(item.id)}
                    >
                      <Icon name="checkmark" size={16} color="#fff" />
                      <Text style={styles.btnAcceptText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDecline}
                      onPress={() => handleDecline(item.id)}
                    >
                      <Text style={styles.btnDeclineText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'accepted' && (
                  <View style={styles.requestAcceptedRow}>
                    <View style={styles.acceptedRowLeft}>
                      <Icon name="checkmark" size={16} color="#0F8A65" />
                      <Text style={styles.acceptedRowText}>
                        Connected! Profile unblurred.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.btnOpenChat}
                      onPress={() => navigation.navigate(Screens.Conversation)}
                    >
                      <Text style={styles.btnOpenChatText}>Open Chat</Text>
                      <Icon name="arrow-forward" size={16} color="#064E3B" />
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'declined' && (
                  <View style={styles.requestDeclinedRow}>
                    <Text style={styles.declinedRowText}>
                      Request was declined
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    margin: 16,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#0F8A65' },
  badge: {
    backgroundColor: '#0F8A65',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoIconWrapper: { marginRight: 12, marginTop: 2 },
  infoTextContainer: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 4,
  },
  infoDesc: { fontSize: 12, color: '#065F46', lineHeight: 18 },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  chatContent: { flex: 1, justifyContent: 'center' },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  roleBadgeOfficial: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  roleBadgeOfficialText: { fontSize: 10, color: '#4B5563', fontWeight: '600' },
  roleBadgeLeader: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  roleBadgeLeaderText: { fontSize: 10, color: '#B45309', fontWeight: '600' },
  chatTime: { fontSize: 11, color: '#9CA3AF' },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatMessage: { fontSize: 13, color: '#6B7280', flex: 1, marginRight: 16 },
  unreadBadge: {
    backgroundColor: '#0F8A65',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  testBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  testBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    marginRight: 12,
    lineHeight: 18,
  },
  testBannerTextBold: { fontWeight: '700' },
  btnSimulate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnSimulateText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  requestCard: {
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
  requestHeader: { flexDirection: 'row', marginBottom: 12 },
  avatarBlurred: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3730A3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestHeaderInfo: { flex: 1, justifyContent: 'center' },
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  requestTime: { fontSize: 11, color: '#9CA3AF' },
  tagsRow: { flexDirection: 'row', gap: 8 },
  ageGenderPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ageGenderText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  tripPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tripPillText: { fontSize: 10, color: '#4B5563' },
  messageQuoteBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  messageQuoteText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  requestActionRow: { flexDirection: 'row', gap: 12 },
  btnAccept: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#0F8A65',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  btnAcceptText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnDecline: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnDeclineText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  avatarUnblurred: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -16,
    marginBottom: 16,
  },
  requestAcceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  acceptedRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptedRowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F8A65',
  },
  btnOpenChat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  btnOpenChatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
  },
  requestDeclinedRow: {
    paddingVertical: 8,
  },
  declinedRowText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default ChatsRequests;
