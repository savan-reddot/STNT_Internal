import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Modal, KeyboardAvoidingView, Platform, TextInput, ScrollView, Image } from 'react-native';
import { Text } from '../../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';

const SGMarketTab = () => {
  const [showCartModal, setShowCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'collection' | 'delivery'>('collection');
  const [pickupPoint, setPickupPoint] = useState('1');
  const [deliveryAddress, setDeliveryAddress] = useState('Blk 412 Tampines St 41, #08-112, Singapore 520412');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const pickupPoints = [
    { label: 'Changi Airport T3 Departure Row 8 (SG Umrah Desk)', value: '1' },
    { label: 'STNT Geylang Serai Hub (Wisma Geylang Serai #02-14)', value: '2' },
  ];
  const activeOrders = [
    {
      id: '1',
      orderNo: 'ord_7195',
      desc: 'SGD 38 • SG Collection',
      status: 'Ready at T3',
    },
    {
      id: '2',
      orderNo: 'ord_0191',
      desc: 'SGD 38 • SG Collection',
      status: 'Ready at T3',
    },
  ];

  const products = [
    {
      id: '1',
      category: 'SIM CARDS & TECH',
      rating: '4.9',
      title: 'Saudi STC 5G Unlimited eSIM (30 Days)',
      desc: 'Instant QR code delivery or physical SIM collection in Singapore. 5G speed across Makkah, Madinah, and J...',
      chips: ['Instant eSIM QR activation', 'Works on all unlocked phones'],
      price: 'SGD 38',
      oldPrice: 'SGD 45',
      isBestSeller: true,
      stock: 'SG Stock',
      icon: 'hardware-chip-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.sgBadge}>
          <Text style={styles.sgBadgeText}>SINGAPORE UMRAH STORE</Text>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Pilgrimage Essentials</Text>
          <Text style={styles.bannerDesc}>
            Get Saudi 5G eSIMs, certified emergency medical kits, and bamboo
            ihrams. Pick up at Changi Airport T3 or deliver within Singapore.
          </Text>
        </View>
        <Icon
          name="bag-handle"
          size={100}
          color="rgba(255,255,255,0.1)"
          style={styles.bannerIcon}
        />
      </View>

      <View style={styles.activeOrdersContainer}>
        <View style={styles.activeOrdersHeader}>
          <Icon name="cube-outline" size={20} color="#065F46" />
          <Text style={styles.activeOrdersTitle}>
            ACTIVE MARKETPLACE ORDERS (2)
          </Text>
        </View>

        <FlatList
          data={activeOrders}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.orderBox,
                index === activeOrders.length - 1 && { marginBottom: 0 },
              ]}
            >
              <View>
                <Text style={styles.orderNumber}>Order #{item.orderNo}</Text>
                <Text style={styles.orderDesc}>{item.desc}</Text>
              </View>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {/* Placeholder for product image */}
              <View style={styles.imagePlaceholder}>
                <Icon name={item.icon} size={60} color="#9CA3AF" />
              </View>
              {item.isBestSeller && (
                <View style={styles.badgeBestSeller}>
                  <Text style={styles.badgeBestSellerText}>BEST SELLER</Text>
                </View>
              )}
              {item.stock && (
                <View style={styles.badgeStock}>
                  <Text style={styles.badgeStockText}>{item.stock}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardBody}>
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{item.category}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>

              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productDesc}>{item.desc}</Text>

              <View style={styles.chipsRow}>
                {item.chips.map((chip, idx) => (
                  <View key={idx} style={styles.chip}>
                    <View style={styles.chipDot} />
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.priceCol}>
                  <Text style={styles.priceCurrent}>{item.price}</Text>
                  {item.oldPrice && (
                    <Text style={styles.priceOld}>{item.oldPrice}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.btnAdd} onPress={() => {
                  setSelectedProduct(item);
                  setShowCartModal(true);
                }}>
                  <Icon name="add" size={16} color="#fff" />
                  <Text style={styles.btnAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={showCartModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleRow}>
                <Icon name="bag-handle-outline" size={24} color="#065F46" />
                <Text style={styles.modalTitle}>Your Cart (1 items)</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCartModal(false)}>
                <Icon name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.cartItemRow}>
                <View style={styles.cartItemImage}>
                  <Icon name={selectedProduct?.icon || 'hardware-chip-outline'} size={32} color="#9CA3AF" />
                </View>
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemTitle}>{selectedProduct?.title || 'Saudi STC 5G Unlimited eSIM (30 Days)'}</Text>
                  <Text style={styles.cartItemPrice}>{selectedProduct?.price || 'SGD 38'}</Text>
                </View>
                <View style={styles.quantityRow}>
                  <TouchableOpacity style={styles.btnQuantity} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Icon name="remove" size={16} color="#374151" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity style={styles.btnQuantity} onPress={() => setQuantity(quantity + 1)}>
                    <Icon name="add" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fulfillmentSection}>
                <Text style={styles.fulfillmentLabel}>FULFILLMENT METHOD (WITHIN SINGAPORE)</Text>
                <View style={styles.fulfillmentCardsRow}>
                  <TouchableOpacity 
                    style={[styles.fulfillmentCard, fulfillmentMethod === 'collection' && styles.fulfillmentCardActive]}
                    onPress={() => setFulfillmentMethod('collection')}
                  >
                    <View style={styles.fulfillmentCardTitleRow}>
                      <Icon name="business-outline" size={16} color={fulfillmentMethod === 'collection' ? '#065F46' : '#6B7280'} />
                      <Text style={[styles.fulfillmentCardTitle, fulfillmentMethod === 'collection' && styles.fulfillmentCardTitleActive]}>Collection in SG</Text>
                    </View>
                    <Text style={styles.fulfillmentCardDesc}>Changi T3 or Geylang</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.fulfillmentCard, fulfillmentMethod === 'delivery' && styles.fulfillmentCardActive]}
                    onPress={() => setFulfillmentMethod('delivery')}
                  >
                    <View style={styles.fulfillmentCardTitleRow}>
                      <Icon name="car-outline" size={16} color={fulfillmentMethod === 'delivery' ? '#065F46' : '#6B7280'} />
                      <Text style={[styles.fulfillmentCardTitle, fulfillmentMethod === 'delivery' && styles.fulfillmentCardTitleActive]}>Delivery in SG</Text>
                    </View>
                    <Text style={styles.fulfillmentCardDesc}>Home or office</Text>
                  </TouchableOpacity>
                </View>

                {fulfillmentMethod === 'collection' ? (
                  <View style={styles.fulfillmentInputContainer}>
                    <Text style={styles.inputLabel}>Choose Pickup Point:</Text>
                    <Dropdown
                      style={styles.dropdownInput}
                      placeholderStyle={styles.inputText}
                      selectedTextStyle={styles.inputText}
                      data={pickupPoints}
                      labelField="label"
                      valueField="value"
                      value={pickupPoint}
                      onChange={item => setPickupPoint(item.value)}
                      activeColor="#E5E7EB"
                    />
                  </View>
                ) : (
                  <View style={styles.fulfillmentInputContainer}>
                    <Text style={styles.inputLabel}>Singapore Delivery Address:</Text>
                    <TextInput 
                      style={styles.textInput} 
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                    />
                  </View>
                )}
              </View>

              <View style={styles.dividerModal} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Payable:</Text>
                <Text style={styles.totalAmount}>{selectedProduct?.price || 'SGD 38'}</Text>
              </View>

              <TouchableOpacity style={styles.btnConfirm} onPress={() => setShowCartModal(false)}>
                <Icon name="checkmark" size={20} color="#fff" />
                <Text style={styles.btnConfirmText}>Confirm & Complete Purchase</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    backgroundColor: '#065F46',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  sgBadge: {
    backgroundColor: '#34D399',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  sgBadgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
  bannerContent: { zIndex: 2 },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 20,
    paddingRight: 40,
  },
  bannerIcon: { position: 'absolute', right: -20, bottom: -20, zIndex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBestSeller: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeBestSellerText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  badgeStock: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeStockText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 16 },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  productDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  chipDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#9CA3AF' },
  chipText: { fontSize: 11, color: '#6B7280' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceCurrent: { fontSize: 18, fontWeight: '800', color: '#0F8A65' },
  priceOld: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F8A65',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  btnAddText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  activeOrdersContainer: {
    backgroundColor: '#fff',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  activeOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  activeOrdersTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  orderBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 4,
  },
  orderDesc: {
    fontSize: 13,
    color: '#047857',
  },
  orderBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
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
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
    paddingRight: 12,
  },
  cartItemTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cartItemPrice: { fontSize: 14, fontWeight: '600', color: '#0F8A65' },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnQuantity: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  fulfillmentSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  fulfillmentLabel: { fontSize: 12, fontWeight: '700', color: '#4B5563', marginBottom: 12 },
  fulfillmentCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fulfillmentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  fulfillmentCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  fulfillmentCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  fulfillmentCardTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  fulfillmentCardTitleActive: { color: '#065F46' },
  fulfillmentCardDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  fulfillmentInputContainer: { marginTop: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputText: { fontSize: 14, color: '#111827' },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  dividerModal: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#4B5563' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#0F8A65' },
  btnConfirm: {
    flexDirection: 'row',
    backgroundColor: '#0F8A65',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default SGMarketTab;
