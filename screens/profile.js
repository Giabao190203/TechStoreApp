import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Thêm ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native'; // Bỏ comment nếu cần

const ProfileScreen = ({ navigation }) => {
  // const navigation = useNavigation(); // Sử dụng nếu không truyền navigation qua props
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const storedData = await AsyncStorage.getItem('userDataa=');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Giả sử dữ liệu user nằm trong key 'user'
          // Lấy tên và email, không cần avatar
          setUserData(parsedData.user || { name: 'Guest User', email: '' });
        } else {
          // Xử lý trường hợp không có dữ liệu người dùng (chưa đăng nhập)
          setUserData({ name: 'Guest User', email: '' });
          // Có thể điều hướng về màn hình Login nếu cần
          // navigation.replace('Login');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu người dùng.");
        setUserData({ name: 'Error Loading', email: '' }); // Hiển thị lỗi
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []); // Fetch dữ liệu khi component mount

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userDataa=');
              // Điều hướng về màn hình Login sau khi đăng xuất
              navigation.replace('Login'); // Sử dụng replace để không quay lại màn Profile
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng xuất.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Placeholder functions cho các hành động
  const handleMyOrders = () => Alert.alert('Chức năng', 'Xem đơn hàng của tôi');
  const handleWishlist = () => Alert.alert('Chức năng', 'Xem danh sách yêu thích');
  const handleAddresses = () => Alert.alert('Chức năng', 'Quản lý địa chỉ');
  const handleAccountSettings = () => {
    navigation.navigate('AccountSetting')
  }
  const handleNotifications = () => Alert.alert('Chức năng', 'Cài đặt thông báo');
  const handleHelpCenter = () => Alert.alert('Chức năng', 'Trung tâm trợ giúp');
  const handleSetting = () => Alert.alert('Chức năng', 'Cài đặt');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Sử dụng ActivityIndicator cho đẹp hơn */}
        <ActivityIndicator size="large" color="#e32f45" />
        <Text style={{ marginTop: 10 }}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Xin Chào,{userData?.username || '...'}</Text>
        </View>
      </View>

      {/* Phần chức năng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
        <ProfileOption icon="receipt-outline" text="Đơn hàng của tôi" onPress={handleMyOrders} />
        <ProfileOption icon="heart-outline" text="Danh sách yêu thích" onPress={handleWishlist} />
        <ProfileOption icon="location-outline" text="Địa chỉ nhận hàng" onPress={handleAddresses} />
        <ProfileOption icon="person-circle-outline" text="Thiết lập tài khoản" onPress={handleAccountSettings} />
      </View>

      {/* Phần Cài đặt & Hỗ trợ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt & Hỗ trợ</Text>
        <ProfileOption icon="settings-outline" text="Cài đặt" onPress={handleSetting} />
        <ProfileOption icon="notifications-outline" text="Cài đặt thông báo" onPress={handleNotifications} />
        <ProfileOption icon="help-circle-outline" text="Trung tâm trợ giúp" onPress={handleHelpCenter} />
        {/* Thêm các mục khác nếu cần */}
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Khoảng trống dưới cùng để không bị che bởi Tab Bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Component con cho mỗi mục lựa chọn trong Profile (giữ nguyên)
const ProfileOption = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#555" style={styles.optionIcon} />
    <Text style={styles.optionText}>{text}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8', // Thêm màu nền cho loading
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 25, // Tăng padding dọc một chút
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 40, // Giữ khoảng cách với top
  },
  // Avatar đã bị xóa
  userInfo: {
    flex: 1, // Chiếm hết không gian còn lại bên trái nút edit
    // Không cần marginLeft vì không có avatar
  },
  userName: {
    fontSize: 20, // Có thể tăng cỡ chữ tên
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 15, // Có thể tăng cỡ chữ email
    color: '#666',
    marginTop: 5, // Tăng khoảng cách giữa tên và email
  },
  editButton: {
    padding: 8, // Tăng vùng bấm cho dễ hơn
    marginLeft: 10, // Thêm khoảng cách với text user
  },
  section: {
    marginTop: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 15,
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  logoutButtonText: {
    color: '#ff4d4f',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
