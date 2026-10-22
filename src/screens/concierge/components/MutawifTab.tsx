import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { DatePickerModal } from 'react-native-paper-dates';
import { Dropdown } from 'react-native-element-dropdown';

const MutawifTab = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(
    'Singapore to Jeddah (14 Nov - 28 Nov 2026)',
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date('2026-11-15T00:00:00Z')
  );
  const [service, setService] = useState('1');

  const services = [
    { label: 'Tawaf & Sai Step-by-Step Guidance', value: '1' },
    { label: 'Seerah & Holy Sites Walk', value: '2' },
    { label: "Du'a in Rawdah", value: '3' },
  ];

  const trips = [
    { label: 'All Trips (Admin Overview)', value: 'All Trips (Admin Overview)' },
    { label: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)', value: 'Singapore to Jeddah (14 Nov - 28 Nov 2026)' },
    { label: 'Singapore to Madinah (05 Dec - 19 Dec 2026)', value: 'Singapore to Madinah (05 Dec - 19 Dec 2026)' },
    { label: 'Dec School Holidays Deluxe (20 Dec 2026 - 03 Jan 2027)', value: 'Dec School Holidays Deluxe (20 Dec 2026 - 03 Jan 2027)' },
  ];

  return (
    <>
      <View style={styles.headerMutawif}>
        <View style={styles.mutawifHeaderRow}>
          <Text style={styles.mutawifHeaderTitle}>SELECT YOUR TRAVEL TRIP</Text>
          <View style={styles.badgeTrip}>
            <Text style={styles.badgeTripText}>Trip-Restricted Visibility</Text>
          </View>
        </View>
        <Dropdown
          style={styles.tripDropdown}
          placeholderStyle={styles.tripDropdownText}
          selectedTextStyle={styles.tripDropdownText}
          data={trips}
          labelField="label"
          valueField="value"
          value={selectedTrip}
          onChange={item => setSelectedTrip(item.value)}
          activeColor="#E5E7EB"
        />
        <Text style={styles.noteText}>
          *Note: Only Mutawifs made available and officially accredited for your
          selected trip will be visible below.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={40} color="#9CA3AF" />
          </View>
          <View style={styles.cardHeaderInfo}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Text style={styles.nameText}>Ustaz Dr. Tariq Al-Madani</Text>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>4.98 (142)</Text>
              </View>
            </View>
            <Text style={styles.roleText}>
              Senior Mutawif & Former Umm Al-Qura Lecturer
            </Text>
            <View style={styles.tagsRow}>
              <View style={styles.expBadge}>
                <Text style={styles.expText}>16 yrs experience</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Icon
                  name="checkmark-circle-outline"
                  size={12}
                  color="#10B981"
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dateBox}>
          <View style={styles.dateHeader}>
            <Icon name="calendar-outline" size={16} color="#047857" />
            <Text style={styles.dateTitle}>Available Travel Dates:</Text>
            <Text style={styles.dateValue}>14 Nov - 28 Nov 2026</Text>
          </View>
          <Text style={styles.dateDesc}>
            Available exclusively for Trip SG-Nov-26 pilgrims
          </Text>
        </View>

        <View style={styles.langBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="language-outline" size={18} color="#047857" />
            <Text style={styles.langTitle}>Languages Spoken:</Text>
          </View>
          <View style={styles.langRow}>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>English</Text>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>Malay</Text>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>Arabic</Text>
            </View>
          </View>
        </View>

        <Text style={styles.descText}>
          Dedicated to guiding Southeast Asian pilgrims through accurate rites
          of Tawaf, Sai, and profound spiritual reflections in Makkah & Madinah.
        </Text>

        <View style={styles.checkTagsRow}>
          <View style={styles.checkTag}>
            <Icon name="checkmark" size={12} color="#6B7280" />
            <Text style={styles.checkTagText}>
              Tawaf & Sai Step-by-Step Guidance
            </Text>
          </View>
          <View style={styles.checkTag}>
            <Icon name="checkmark" size={12} color="#6B7280" />
            <Text style={styles.checkTagText}>Seerah & Holy Sites Walk</Text>
          </View>
          <View style={styles.checkTag}>
            <Icon name="checkmark" size={12} color="#6B7280" />
            <Text style={styles.checkTagText}>Du'a in Rawdah</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowBookingModal(true)}>
            <Icon name="compass-outline" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Request to Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOOKING MODAL */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bookingModalContent}>
              <View style={styles.bookingModalHeader}>
                <View style={styles.bookingModalHeaderLeft}>
                  <View style={styles.bookingAvatarPlaceholder}>
                    <Icon name="person" size={24} color="#9CA3AF" />
                  </View>
                  <View>
                    <Text style={styles.bookingMutawifName}>Book Ustaz Dr. Tariq Al-Madani</Text>
                    <Text style={styles.bookingMutawifLangs}>Languages: English, Malay, Arabic</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Icon name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.bookingModalBody}>
                <Text style={styles.inputLabel}>Service / Guidance Required</Text>
                <Dropdown
                  style={styles.dropdownInput}
                  placeholderStyle={styles.inputText}
                  selectedTextStyle={styles.inputText}
                  data={services}
                  labelField="label"
                  valueField="value"
                  value={service}
                  onChange={item => setService(item.value)}
                  activeColor="#E5E7EB"
                />

                <Text style={styles.inputLabel}>Preferred Date during Trip</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => {
                    setShowBookingModal(false);
                    setTimeout(() => {
                      setDatePickerVisible(true);
                    }, 350);
                  }}
                >
                  <Text style={styles.inputText}>
                    {selectedDate 
                      ? selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.infoBoxGreen}>
                  <Text style={styles.infoBoxGreenText}>
                    Mutawif availability confirmed for travel period <Text style={{ fontWeight: '700' }}>14 Nov - 28 Nov 2026</Text>.
                  </Text>
                </View>
              </View>

              <View style={styles.bookingModalFooter}>
                <TouchableOpacity style={styles.btnConfirmBooking} onPress={() => setShowBookingModal(false)}>
                  <Text style={styles.btnConfirmBookingText}>Confirm Booking Request</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCancelBooking} onPress={() => setShowBookingModal(false)}>
                  <Text style={styles.btnCancelBookingText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={datePickerVisible}
        onDismiss={() => {
          setDatePickerVisible(false);
          setTimeout(() => setShowBookingModal(true), 350);
        }}
        date={selectedDate}
        onConfirm={({ date }) => {
          setDatePickerVisible(false);
          setSelectedDate(date as Date);
          setTimeout(() => setShowBookingModal(true), 350);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerMutawif: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mutawifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mutawifHeaderTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  badgeTrip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeTripText: { color: '#047857', fontSize: 11, fontWeight: '700' },
  tripDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F8A65',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tripDropdownText: { fontSize: 14, fontWeight: '600', color: '#064E3B' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  bookingModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 20,
  },
  bookingModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bookingAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingMutawifName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  bookingMutawifLangs: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F8A65',
  },
  bookingModalBody: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  inputText: {
    fontSize: 14,
    color: '#111827',
  },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    justifyContent: 'center',
  },
  infoBoxGreen: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
  },
  infoBoxGreenText: {
    color: '#047857',
    fontSize: 13,
    lineHeight: 20,
  },
  bookingModalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  btnConfirmBooking: {
    flex: 1,
    backgroundColor: '#0F8A65',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConfirmBookingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnCancelBooking: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelBookingText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  dateBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
    marginRight: 8,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  dateDesc: {
    fontSize: 12,
    color: '#047857',
    marginLeft: 22,
  },
  langBox: {
    marginBottom: 16,
  },
  langTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  langBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  descText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  checkTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  checkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  checkTagText: {
    fontSize: 11,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0F8A65',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default MutawifTab;
