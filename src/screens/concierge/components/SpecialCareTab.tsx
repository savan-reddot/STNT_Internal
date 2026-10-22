import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

const SpecialCareTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('1');

  const categories = [
    { label: 'Medical / Medication (e.g. Insulin)', value: '1' },
    { label: 'Handicapped / Mobility (Wheelchair)', value: '2' },
    { label: 'Elderly Support & Slow Pacing', value: '3' },
    { label: 'First-Time Traveler Guide', value: '4' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerSpecialCare}>
         <View style={styles.scHeaderIconWrapper}>
            <Icon name="person-outline" color="#0F8A65" size={20} />
         </View>
         <View style={{flex: 1}}>
            <Text style={styles.scHeaderTitle}>YOUR PROFILE CARE BADGES</Text>
            <Text style={styles.scHeaderDesc}>Configured for Trip SG-Nov-26</Text>
         </View>
         <TouchableOpacity><Text style={styles.scHeaderEdit}>Edit in Profile →</Text></TouchableOpacity>
      </View>

      <View style={styles.badgesSection}>
        <View style={styles.badgesRow}>
          <View style={[styles.badge, styles.badgeMedical]}>
            <Text style={styles.badgeMedicalText}>Medical / Medication: </Text>
            <Text style={[styles.badgeMedicalText, { fontWeight: '700' }]}>Yes</Text>
          </View>
          <View style={[styles.badge, styles.badgeFirstTime]}>
            <Text style={styles.badgeFirstTimeText}>First-Time Traveler: </Text>
            <Text style={[styles.badgeFirstTimeText, { fontWeight: '700' }]}>Yes</Text>
          </View>
        </View>
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>
            <Text style={{ fontWeight: '700', fontStyle: 'italic' }}>Medical notes: </Text>
            <Text style={{ fontStyle: 'italic' }}>"Requires regular hydration and cool bag storage for insulin pens."</Text>
          </Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>TRACK SUPPORT REQUESTS & REPLIES (2)</Text>
        <TouchableOpacity style={styles.btnNewRequest} onPress={() => setShowModal(true)}>
          <Icon name="add" size={16} color="#fff" />
          <Text style={styles.btnNewRequestText}>New Care Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeGray}>
            <Text style={styles.badgeGrayText}>Medical / Medication</Text>
          </View>
          <Text style={styles.dateText}>11 Sep 2026</Text>
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeGreenText}>Confirmed &{'\n'}Active</Text>
          </View>
        </View>

        <Text style={styles.reqTitle}>Insulin Cold-Chain Refrigerator Request in Makkah Hotel</Text>
        <Text style={styles.reqDesc}>
          Pilgrim requires a dedicated mini-fridge or medical cooling block in the hotel room for 4 boxes of Novorapid & Lantus insulin.
        </Text>

        <View style={styles.assignBox}>
          <Icon name="checkmark-circle-outline" size={16} color="#059669" />
          <Text style={styles.assignText}>Assigned Staff: Nurse Halimah (SG Medical Liaison)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.commentsHeader}>
          <View style={styles.commentsHeaderLeft}>
            <Icon name="chatbubble-outline" size={16} color="#4B5563" />
            <Text style={styles.commentsTitle}>Comments & Replies (3)</Text>
          </View>
          <TouchableOpacity style={styles.btnSimulate}>
            <Text style={styles.btnSimulateText}>+ Simulate Staff Reply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatList}>
          {/* Chat 1 */}
          <View style={styles.chatBubble}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>Noorfazella Sujud (Pilgrim)</Text>
              <Text style={styles.chatDate}>11 Sep 2026, 09:30 AM</Text>
            </View>
            <Text style={styles.chatMessage}>
              Assalamu alaikum. My mother and I have 4 boxes of daily insulin pens that cannot exceed 8 degrees Celsius. Please verify the hotel room will have a functioning mini-fridge upon check-in.
            </Text>
          </View>
          {/* Chat 2 */}
          <View style={styles.chatBubbleAdmin}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatNameAdmin}>STNT Medical Desk (Admin)</Text>
              <Text style={styles.chatDate}>11 Sep 2026, 11:15 AM</Text>
            </View>
            <Text style={styles.chatMessageAdmin}>
              Wa alaikum salam Sister Noorfazella. We have logged this request with Swissotel Al Maqam Makkah management. A verified medical chiller is reserved...
            </Text>
          </View>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment or follow-up note..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.btnSend}>
            <Icon name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>New Special Support Request</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Category</Text>
                <Dropdown
                  style={styles.dropdownInput}
                  placeholderStyle={styles.inputText}
                  selectedTextStyle={styles.inputText}
                  data={categories}
                  labelField="label"
                  valueField="value"
                  value={category}
                  onChange={item => setCategory(item.value)}
                  activeColor="#E5E7EB"
                />

                <Text style={styles.inputLabel}>Request Summary Title</Text>
                <TextInput style={styles.textInput} placeholder="e.g. Mini-fridge for insulin storage" placeholderTextColor="#9CA3AF" />

                <Text style={styles.inputLabel}>Specific Details & Room/Trip needs</Text>
                <TextInput
                  style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Provide details for our medical and ground liaisons..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                />

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.btnSubmit} onPress={() => setShowModal(false)}>
                    <Text style={styles.btnSubmitText}>Create Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnCancel} onPress={() => setShowModal(false)}>
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSpecialCare: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scHeaderIconWrapper: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 20, marginRight: 12 },
  scHeaderTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 2 },
  scHeaderDesc: { fontSize: 12, color: '#6B7280' },
  scHeaderEdit: { fontSize: 13, fontWeight: '700', color: '#0F8A65' },
  badgesSection: { marginBottom: 24 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  badgeMedical: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  badgeMedicalText: { color: '#047857', fontSize: 13 },
  badgeFirstTime: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  badgeFirstTimeText: { color: '#1D4ED8', fontSize: 13 },
  notesBox: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 },
  notesText: { color: '#4B5563', fontSize: 13, lineHeight: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 12, fontWeight: '700', color: '#4B5563', flex: 1 },
  btnNewRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F8A65',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnNewRequestText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGray: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeGrayText: { fontSize: 11, color: '#374151', fontWeight: '600' },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  badgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  badgeGreenText: { fontSize: 10, color: '#047857', fontWeight: '700', textAlign: 'center' },
  reqTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  reqDesc: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
  assignBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  assignText: { fontSize: 12, color: '#059669', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 16 },
  commentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  commentsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentsTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  btnSimulate: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  btnSimulateText: { fontSize: 11, color: '#10B981', fontWeight: '700' },
  chatList: { marginBottom: 16, gap: 12 },
  chatBubble: {
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 12,
  },
  chatBubbleAdmin: {
    borderLeftWidth: 3,
    borderLeftColor: '#0F8A65',
    paddingLeft: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 12, fontWeight: '700', color: '#374151' },
  chatNameAdmin: { fontSize: 12, fontWeight: '700', color: '#0F8A65' },
  chatDate: { fontSize: 10, color: '#9CA3AF' },
  chatMessage: { fontSize: 12, color: '#4B5563', lineHeight: 18 },
  chatMessageAdmin: { fontSize: 12, color: '#374151', lineHeight: 18 },
  inputArea: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  btnSend: {
    backgroundColor: '#0F8A65',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  inputText: { fontSize: 14, color: '#111827' },
  textInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827', marginBottom: 16 },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnSubmit: { flex: 1, backgroundColor: '#0F8A65', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnSubmitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnCancel: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  btnCancelText: { color: '#374151', fontWeight: '700', fontSize: 14 },
});

export default SpecialCareTab;
