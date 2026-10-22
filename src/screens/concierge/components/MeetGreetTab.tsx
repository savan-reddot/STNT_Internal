import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import { TimePickerModal } from 'react-native-paper-dates';

const MeetGreetTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [airport, setAirport] = useState('1');
  const airports = [
    { label: 'Jeddah King Abdulaziz (JED)', value: '1' },
    { label: 'Prince Mohammad Bin Abdulaziz (MED)', value: '2' },
  ];
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [arrivalTime, setArrivalTime] = useState({ hours: 17, minutes: 45 });
  const [wheelchair, setWheelchair] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.headerMeetGreet}>
        <View style={styles.mgHeaderIconWrapper}>
          <Icon name="business" color="#B45309" size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mgHeaderTitle}>STNT ADMIN CONSOLE DISPATCH</Text>
          <Text style={styles.mgHeaderDesc}>
            Meet & Greet bookings are directly dispatched to the STNT
            administrative operations desk. Our Singapore and Saudi airport
            teams will arrange escorts offline and update real-time status here.
          </Text>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>YOUR AIRPORT ESCORT REQUESTS (1)</Text>
        <TouchableOpacity
          style={styles.btnNewRequest}
          onPress={() => setShowModal(true)}
        >
          <Icon name="add" size={16} color="#fff" />
          <Text style={styles.btnNewRequestText}>New Airport Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reqIdText}>REQUEST ID: MG_101</Text>
          <View style={styles.badgeOrange}>
            <Text style={styles.badgeOrangeText}>ARRANGING OFFLINE</Text>
          </View>
        </View>

        <Text style={styles.airportName}>Jeddah King Abdulaziz (JED)</Text>
        <Text style={styles.flightInfo}>
          Flight SV837 (Saudia) • Arrival: 14 Nov 2026, 17:45
        </Text>

        <View style={styles.progressTracker}>
          <View style={styles.progressStep}>
            <View style={styles.stepCircleActive}>
              <Icon name="checkmark" size={14} color="#fff" />
            </View>
            <Text style={styles.stepTextActive}>Received</Text>
          </View>
          <View style={styles.progressLineActive} />
          <View style={styles.progressStep}>
            <View style={styles.stepCircleActive}>
              <Icon name="hourglass-outline" size={14} color="#fff" />
            </View>
            <Text style={styles.stepTextActive}>Arranging</Text>
          </View>
          <View style={styles.progressLineInactive} />
          <View style={styles.progressStep}>
            <View style={styles.stepCircleInactive}>
              <Icon name="checkmark" size={14} color="#9CA3AF" />
            </View>
            <Text style={styles.stepTextInactive}>Confirmed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailsCol}>
            <Text style={styles.detailsLabel}>Signboard Name:</Text>
            <Text style={styles.detailsValue}>
              NOORFAZELLA SUJUD (SG GROUP ALPHA)
            </Text>
          </View>
          <View style={styles.detailsCol}>
            <Text style={styles.detailsLabel}>Baggage / Wheelchair:</Text>
            <Text style={styles.detailsValue}>3 Bags • Wheelchair Yes</Text>
          </View>
        </View>

        <View style={styles.logBox}>
          <Text style={styles.logBoxTitle}>STNT Ground Log:</Text>
          <Text style={styles.logBoxText}>
            STNT Admin received request. Jeddah airport ground liaison Bro Yasin
            dispatched to manage wheelchair and private van transfer.
          </Text>
        </View>

        <View style={styles.assignBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.assignLabel}>ASSIGNED GROUND ESCORT:</Text>
            <Text style={styles.assignName}>Bro Yasin Al-Zahrani</Text>
            <Text style={styles.assignLocation}>
              Jeddah Airport Terminal 1 Gate 4 Arrivals Lobby
            </Text>
          </View>
          <TouchableOpacity style={styles.btnCall}>
            <Text style={styles.btnCallText}>Call Rep</Text>
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
                <Text style={styles.modalTitle}>Book Airport Meet & Greet</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Airport</Text>
                <Dropdown
                  style={styles.dropdownInput}
                  placeholderStyle={styles.inputText}
                  selectedTextStyle={styles.inputText}
                  data={airports}
                  labelField="label"
                  valueField="value"
                  value={airport}
                  onChange={item => setAirport(item.value)}
                  activeColor="#E5E7EB"
                />

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.inputLabel}>Flight Number</Text>
                    <TextInput style={styles.input} value="SV837 (Saudia)" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Arrival Time</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => {
                        setShowModal(false);
                        setTimeout(() => setTimePickerVisible(true), 350);
                      }}
                    >
                      <Text style={styles.inputText}>
                        {arrivalTime.hours.toString().padStart(2, '0')}:
                        {arrivalTime.minutes.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Name on Signboard</Text>
                <TextInput
                  style={styles.input}
                  value="NOORFAZELLA SUJUD (SG GROUP ALPHA)"
                />

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setWheelchair(!wheelchair)}
                >
                  <Text style={styles.checkboxLabel}>
                    Require Wheelchair at Baggage Claim?
                  </Text>
                  <Icon
                    name={wheelchair ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={wheelchair ? '#0F8A65' : '#9CA3AF'}
                  />
                </TouchableOpacity>

                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerText}>
                    Dispatches immediately to STNT Admin Console. You can track
                    status in real-time.
                  </Text>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    style={styles.btnSubmit}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.btnSubmitText}>Submit Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnCancel}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={() => {
          setTimePickerVisible(false);
          setTimeout(() => setShowModal(true), 350);
        }}
        onConfirm={({ hours, minutes }) => {
          setTimePickerVisible(false);
          setArrivalTime({ hours, minutes });
          setTimeout(() => setShowModal(true), 350);
        }}
        hours={arrivalTime.hours}
        minutes={arrivalTime.minutes}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerMeetGreet: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  mgHeaderIconWrapper: {
    backgroundColor: '#FDE68A',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  mgHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#78350F',
    marginBottom: 4,
  },
  mgHeaderDesc: { fontSize: 12, color: '#92400E', lineHeight: 18 },
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reqIdText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  badgeOrange: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOrangeText: { fontSize: 10, fontWeight: '700', color: '#D97706' },
  airportName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  flightInfo: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  progressTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressStep: { alignItems: 'center', flex: 1 },
  stepCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepTextActive: { fontSize: 11, fontWeight: '600', color: '#111827' },
  stepTextInactive: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  progressLineActive: {
    flex: 1,
    height: 2,
    backgroundColor: '#10B981',
    marginHorizontal: 8,
    marginTop: -15,
  },
  progressLineInactive: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginTop: -15,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsCol: { flex: 1 },
  detailsLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  detailsValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    paddingRight: 10,
  },
  logBox: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  logBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 4,
  },
  logBoxText: { fontSize: 12, color: '#065F46', lineHeight: 18 },
  assignBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  assignLabel: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginBottom: 4,
  },
  assignName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  assignLocation: { fontSize: 11, color: '#10B981' },
  btnCall: {
    backgroundColor: '#0F8A65',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnCallText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputText: { fontSize: 14, color: '#111827' },
  row: { flexDirection: 'row', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: { fontSize: 14, color: '#374151' },
  infoBanner: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoBannerText: { fontSize: 12, color: '#B45309', lineHeight: 18 },
  modalActionRow: { flexDirection: 'row', gap: 12 },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#0F8A65',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnSubmitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnCancel: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnCancelText: { color: '#374151', fontWeight: '700', fontSize: 14 },
});

export default MeetGreetTab;
