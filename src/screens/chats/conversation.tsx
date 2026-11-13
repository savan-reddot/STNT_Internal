import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common';
import AppLayout from '../../components/safeareawrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useChatMessagesQuery,
  useChatSendMessageMutation,
  useChatMarkReadMutation,
} from '../../redux/services';
import { showErrorToast } from '../../utils/toastUtils';

const Conversation = ({ navigation, route }: any) => {
  const params = route?.params || {};
  const conversationId = params.conversationId || 1;
  const conversationTitle = params.title || 'Conversation';
  const role = params.role || (params.type === 'trip_group' ? 'Trip Group' : 'Direct Chat');

  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPadding = isKeyboardVisible
    ? (Platform.OS === 'ios' ? 8 : 10)
    : Math.max(insets.bottom, 12);

  const {
    data: messagesResp,
    isLoading,
    refetch,
  } = useChatMessagesQuery(
    { conversationId },
    {
      pollingInterval: 3000,
      skip: !conversationId,
    },
  );

  const [sendMessage, { isLoading: isSending }] = useChatSendMessageMutation();
  const [markRead] = useChatMarkReadMutation();

  const messagesData = messagesResp?.data?.messages || [];
  const canPost = messagesResp?.data?.canPost ?? (params.canPost ?? true);

  // Mark conversation as read when latest messages arrive
  useEffect(() => {
    if (messagesData.length > 0) {
      const lastMsg = messagesData[messagesData.length - 1];
      if (lastMsg?.id) {
        markRead({
          conversationId,
          lastReadMessageId: lastMsg.id,
        }).catch(() => {});
      }
    }
  }, [messagesData.length, conversationId]);

  const handleSend = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setInputText('');
    try {
      await sendMessage({
        conversationId,
        text: textToSend,
      }).unwrap();
      refetch();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || 'Failed to send message';
      showErrorToast(msg, 'Message Error');
      setInputText(textToSend); // Restore unsent text
    }
  };

  const formatMessageTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMine = item.isMine;
    const isBroadcast = item.kind === 'broadcast';

    if (isBroadcast) {
      return (
        <View style={styles.broadcastCard}>
          <View style={styles.broadcastHeader}>
            <View style={styles.broadcastIconBadge}>
              <Icon name="megaphone" size={14} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.broadcastTitle}>OFFICIAL BROADCAST</Text>
              <Text style={styles.broadcastSender}>
                {item.senderName}
                {item.senderRole ? ` (${item.senderRole})` : ''}
              </Text>
            </View>
            <Text style={styles.broadcastTime}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.broadcastText}>{item.text}</Text>
        </View>
      );
    }

    if (isMine) {
      return (
        <View style={styles.mineMessageContainer}>
          <View style={styles.mineBubble}>
            <Text style={styles.mineMessageText}>{item.text}</Text>
            <Text style={styles.mineMessageTime}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.otherMessageContainer}>
        <View style={styles.senderHeader}>
          <Text style={styles.otherSenderName}>{item.senderName}</Text>
          {item.senderRole && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{item.senderRole}</Text>
            </View>
          )}
        </View>
        <View style={styles.otherBubble}>
          <Text style={styles.otherMessageText}>{item.text}</Text>
          <Text style={styles.otherMessageTime}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <AppLayout
      title={conversationTitle.toUpperCase()}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        {/* Custom Header Bar */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.btnBack}
          >
            <Icon name="chevron-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                conversationTitle,
              )}&background=0F8A65&color=fff`,
            }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {conversationTitle}
              </Text>
            </View>
            <View style={styles.headerSubtitleRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{role}</Text>
              </View>
              <Text style={styles.onlineText}>• Active Channel</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        {isLoading && messagesData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F8A65" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messagesData}
            keyExtractor={item => String(item.id)}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios' ? 'interactive' : 'on-drag'
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            ListHeaderComponent={
              <View style={styles.systemPill}>
                <Text style={styles.systemPillText}>
                  Official ST&T Trip Channel • End-to-End Managed
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="chatbubbles-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyText}>
                  No messages yet. Send a message to start the conversation!
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar or Announcement-Only Notice */}
        {!canPost ? (
          <View
            style={[
              styles.disabledBar,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <Icon name="lock-closed" size={16} color="#92400E" />
            <Text style={styles.disabledBarText}>
              Only trip leaders and staff can post in this group right now.
            </Text>
          </View>
        ) : (
          <View style={[styles.inputBar, { paddingBottom: bottomPadding }]}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              onFocus={() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
              }}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon
                  name="paper-plane"
                  size={18}
                  color={!inputText.trim() || isSending ? '#9CA3AF' : '#FFFFFF'}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
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
    borderColor: '#E5E7EB',
  },
  btnBack: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 6 },
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#065F46', fontSize: 10, fontWeight: '600' },
  onlineText: { fontSize: 11, color: '#0F8A65', fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 24 },
  systemPill: {
    alignSelf: 'center',
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  systemPillText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
  },
  // Broadcast card
  broadcastCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  broadcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  broadcastIconBadge: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 12,
  },
  broadcastTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  broadcastSender: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
  },
  broadcastTime: {
    fontSize: 11,
    color: '#92400E',
  },
  broadcastText: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 20,
    fontWeight: '500',
  },
  // Mine messages
  mineMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  mineBubble: {
    backgroundColor: '#0F8A65',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  mineMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  mineMessageTime: {
    fontSize: 10,
    color: '#D1FAE5',
    textAlign: 'right',
    marginTop: 4,
  },
  // Other messages
  otherMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 6,
    gap: 6,
  },
  otherSenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  roleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  otherMessageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  otherMessageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    color: '#111827',
    textAlignVertical: 'center',
  },
  sendBtn: {
    backgroundColor: '#0F8A65',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F8A65',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  disabledBarText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
});

export default Conversation;
