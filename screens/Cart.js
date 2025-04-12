// screens/CartScreen.js
import React, { useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../src/config';

// --- Constants ---
const COLORS = {
    primary: '#e32f45',
    white: '#FFFFFF',
    lightGray: '#f8f8f8',
    gray: '#adb5bd',
    darkGray: '#495057',
    black: '#343a40',
    border: '#dee2e6',
    green: '#28a745',
    red: '#dc3545',
  };
  
  const SIZES = {
    padding: 15,
    base: 8,
    font: 14,
    h1: 30,
    h2: 22,
    h3: 18,
    h4: 16,
  };

//Hàm định dạng tiền tệ
const formatPriceToVND = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userId, setUserId] = useState(null); // State để lưu userId
  const [token, setToken] = useState(null); // State để lưu token

  //Lấy userId và token từ AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userDataa=');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Giả sử userId nằm trong parsedData.user._id và token trong parsedData.token
          setUserId(parsedData?.user?._id);
          setToken(parsedData?.token);
        } else {
          // Xử lý nếu không có dữ liệu người dùng (ví dụ: quay lại login)
          Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng.');
        navigation.goBack(); // Hoặc quay lại màn hình trước đó
      }
    };
    getUserData();
  }, [navigation]);

  // --- Fetch Cart Data từ API ---
  const loadCartData = useCallback(async () => {
    if (!userId || !token) {
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API để lấy giỏ hàng theo userId
      const response = await fetch(`${API_BASE_URL}/carts/api/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Gửi token để xác thực
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const formattedCart = data.items.map(item => ({
          id: item.productId._id, // Sử dụng _id của sản phẩm làm id trong giỏ hàng
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          image: item.productId.images && item.productId.images.length > 0 ? item.productId.images[0] : null, // Lấy ảnh đầu tiên
        }));
        setCartItems(formattedCart);
      } else {
        console.error('API Error:', data);
        Alert.alert('Lỗi', data.message || 'Không thể tải dữ liệu giỏ hàng từ server.');
        setCartItems([]); // Đặt giỏ hàng thành rỗng nếu có lỗi
      }
    } catch (error) {
      console.error('Error loading cart data from API:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server để tải giỏ hàng.');
      setCartItems([]); // Đặt giỏ hàng thành rỗng nếu có lỗi
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]); // Dependency là userId và token

  // Gọi loadCartData khi userId hoặc token có giá trị
  useEffect(() => {
    loadCartData();
  }, [loadCartData]); // Sử dụng useCallback nên dependency là chính hàm đó

  // tính tổng giá tiền
  useEffect(() => {
    const calculateTotal = () => {
      const total = cartItems.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }, 0);
      setTotalPrice(total);
    };
    calculateTotal();
  }, [cartItems]);

  //Hàm cập nhật giỏ hàng trên Server
  const updateCartOnServer = async (productId, quantity) => {
    if (!userId || !token) return; // Cần userId và token

    const currentItem = cartItems.find(item => item.id === productId);
    const currentPrice = currentItem?.price;

    //kiểm tra có lấy đc price ko
    if(currentPrice === undefined || currentPrice === null){
        console.error(`Không tìm thấy giá cho sản phẩm ID: ${productId}`);
        Alert.alert('Lỗi', `Không tìm thấy giá cho sản phẩm`);
        loadCartData();
        return;
    }

    try {
        
        
      const body = JSON.stringify({userId, productId, quantity, priceAtAddition: currentPrice});

      const response = await fetch(`${API_BASE_URL}/carts/api/update-items`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error updating cart:', data);
        if(response.status === 401){
            Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            await AsyncStorage.removeItem('userDataa=');
            navigation.replace('Login');
            return;
        }
        Alert.alert('Lỗi', data.message || 'Không thể cập nhật giỏ hàng trên server.');
        loadCartData(); // Tải lại dữ liệu từ server để đồng bộ
      } else {
        console.log('Cart updated on server:', data);
      }
    } catch (error) {
      console.error('Error updating cart on server:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server để cập nhật giỏ hàng.');
      loadCartData(); 
    }
  };


  // --- Handlers (Cập nhật state local và gọi API) ---
  const handleIncreaseQuantity = (itemId) => {
    let newQuantity = 0;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          newQuantity = item.quantity + 1;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
    // Gọi API sau khi state đã cập nhật (hoặc trước đó tùy logic)
    if (newQuantity > 0) {
        updateCartOnServer(itemId, newQuantity);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    let newQuantity = 0;
    let shouldRemove = false;

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          newQuantity = item.quantity - 1;
          if (newQuantity < 1) {
            newQuantity = 1; // Giữ lại ở mức 1c
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    // Gọi API cập nhật số lượng (nếu không xóa)
    if (!shouldRemove && newQuantity >= 1) {
        updateCartOnServer(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => {
            // Cập nhật state local trước
            setCartItems((prevItems) =>
              prevItems.filter((item) => item.id !== itemId)
            );
            // Gọi API để xóa trên server
            updateCartOnServer(itemId, 0); // Gửi quantity = 0 để server hiểu là xóa
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống.');
      return;
    }
    Alert.alert('Chức năng', 'Chuyển đến màn hình Thanh toán (chưa cài đặt)');
  };

  // --- Render Item ---
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemContainer}>
      {/* Sử dụng ảnh từ item.image, có fallback */}
      <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPriceToVND(item.price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.quantityButton} disabled={item.quantity <= 1}>
            {/* Ẩn nút giảm nếu số lượng là 1 */}
            <Ionicons name="remove-circle-outline" size={24} color={item.quantity <= 1 ? COLORS.gray : COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)} style={styles.quantityButton}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={24} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  );

  // render giao diện giỏ hàng trống
  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={80} color={COLORS.gray} />
      {/* Giữ nguyên hoặc thay đổi text theo yêu cầu */}
      <Text style={styles.emptyCartText}>không có sản phẩm</Text>
      <TouchableOpacity style={styles.shoppingButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.shoppingButtonText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  // loading
  if (isLoading && cartItems.length === 0) { // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // render giao diện giỏ hàng
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor={COLORS.primary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        {/* Nút làm mới (tùy chọn) */}
        <TouchableOpacity onPress={loadCartData} style={styles.headerButton}>
            <Ionicons name="refresh-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {isLoading && cartItems.length > 0 && (
          <ActivityIndicator style={styles.inlineLoading} size="small" color={COLORS.primary} />
      )}

      {!isLoading && cartItems.length === 0 ? ( // Chỉ hiển thị giỏ hàng trống khi không loading và không có item
        renderEmptyCart()
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Footer (Tổng tiền & thanh toán) */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>{formatPriceToVND(totalPrice)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

// --- Styles ---
const styles = StyleSheet.create({

  inlineLoading: {
    paddingVertical: SIZES.padding,
  },
  // Cập nhật headerButton nếu cần để chứa nút refresh
  headerButton: {
    padding: SIZES.base,
    minWidth: 40,
    alignItems: 'center',
  },
  // Cập nhật headerTitle để căn giữa tốt hơn khi có nút refresh
  headerTitle: {
    flex: 1, // Cho phép co giãn
    textAlign: 'center', // Căn giữa
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
    marginHorizontal: SIZES.base, // Khoảng cách với các nút
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? SIZES.base : SIZES.padding / 2,
    paddingBottom: SIZES.base,
    paddingHorizontal: SIZES.padding,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: SIZES.base,
    minWidth: 40, // Đảm bảo nút có kích thước tối thiểu
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  // List Styles
  listContentContainer: {
    padding: SIZES.padding,
    paddingBottom: 100, // Khoảng trống cho footer
  },
  // Cart Item Styles
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.padding / 1.5,
    marginBottom: SIZES.padding,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center', // Căn giữa các thành phần theo chiều dọc
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.base / 2,
    marginRight: SIZES.padding,
    resizeMode: 'contain', // Hoặc 'cover' tùy ảnh
    backgroundColor: '#eee', // Màu nền tạm thời
  },
  itemDetails: {
    flex: 1, // Chiếm không gian còn lại
    justifyContent: 'space-between', // Phân bố không gian dọc
  },
  itemName: {
    fontSize: SIZES.h4,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SIZES.base / 2,
  },
  itemPrice: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base / 2,
  },
  quantityButton: {
    padding: SIZES.base / 2,
  },
  quantityText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.black,
    marginHorizontal: SIZES.padding, // Khoảng cách giữa nút và số lượng
    minWidth: 20, // Đảm bảo số lượng có không gian
    textAlign: 'center',
  },
  removeButton: {
    padding: SIZES.base,
    marginLeft: SIZES.base, // Khoảng cách với phần details
  },
  // Empty Cart Styles
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyCartText: {
    fontSize: SIZES.h3,
    color: COLORS.gray,
    marginTop: SIZES.padding,
    textAlign: 'center',
  },
  shoppingButton: {
    marginTop: SIZES.padding * 2,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding / 1.5,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.base * 3,
  },
  shoppingButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SIZES.padding / 1.5,
    paddingHorizontal: SIZES.padding,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flex: 1, // Chiếm phần lớn không gian bên trái
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Căn trái
  },
  totalLabel: {
    fontSize: SIZES.font,
    color: COLORS.darkGray,
  },
  totalPrice: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SIZES.base,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.base * 3,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
});
