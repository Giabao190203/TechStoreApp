// d:\Mobile\Technology\TechApp\screens\AccountSetting.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView, // Sử dụng SafeAreaView cho iOS
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// --- Constants for Styling ---
const COLORS = {
  primary: "#e32f45", // Màu chủ đạo
  white: "#FFFFFF",
  lightGray: "#f8f8f8",
  gray: "#adb5bd",
  darkGray: "#495057",
  black: "#343a40",
  border: "#dee2e6",
  placeholder: "#6c757d",
};

const SIZES = {
  padding: 15,
  base: 8,
  font: 16,
  h1: 30,
  h2: 22,
  h3: 18,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
};

// --- Component Con cho từng dòng thông tin ---
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRowContainer}>
    <View style={styles.infoRowLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={COLORS.primary}
        style={styles.infoIcon}
      />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
      {value || (
        <Text style={styles.placeholderText}>Chưa cập nhật</Text>
      )}
    </Text>
  </View>
);

// --- Màn hình chính ---
const AccountSetting = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const storedData = await AsyncStorage.getItem("userDataa=");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData.user || {});
        } else {
          setUserData({});
          Alert.alert("Lỗi", "Không tìm thấy dữ liệu người dùng.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching user data for settings:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu người dùng.");
        setUserData({});
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor={COLORS.primary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        {/* Nút Edit ở Header */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert("Chức năng", "Chỉnh sửa thông tin (chưa cài đặt)")}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="Tên đăng nhập"
            value={userData?.username}
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={userData?.email}
          />
          <InfoRow
            icon="call-outline"
            label="Số điện thoại"
            value={userData?.phone}
          />
          <InfoRow
            icon="location-outline"
            label="Địa chỉ"
            value={userData?.address}
          />
          {/* Thêm các trường thông tin khác nếu cần */}
        </View>

        {/* Có thể thêm các Card khác ở đây cho các nhóm thông tin khác */}
        {/* Ví dụ:
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bảo mật</Text>
          <InfoRow icon="lock-closed-outline" label="Đổi mật khẩu" value="********" />
        </View>
        */}

      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSetting;

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray, // Màu nền chung nhẹ nhàng
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary, // Màu nền header nổi bật
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 10, // Khoảng cách với status bar
    paddingBottom: SIZES.padding / 1.5,
    paddingHorizontal: SIZES.padding,
    elevation: 4, // Shadow cho Android
    shadowColor: '#000', // Shadow cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: SIZES.base, // Tăng vùng bấm
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.white, // Chữ trắng trên nền đậm
  },
  // ScrollView Styles
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2, // Thêm padding dưới
  },
  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base * 1.5,
    marginBottom: SIZES.padding,
    paddingVertical: SIZES.padding / 2, // Giảm padding dọc trong card
    elevation: 2, // Shadow nhẹ cho Card (Android)
    shadowColor: '#000', // Shadow cho iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.black,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SIZES.padding / 2,
  },
  // Info Row Styles
  infoRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.padding * 0.8, // Giữ nguyên padding dọc bên trong
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    // Thêm dòng này để tạo khoảng cách dưới mỗi dòng
    marginBottom: SIZES.base / 2, // Ví dụ: thêm 4px khoảng cách dưới
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Cho phép phần trái co giãn
    marginRight: SIZES.base, // Khoảng cách với giá trị bên phải
  },
  infoIcon: {
    marginRight: SIZES.padding, // Khoảng cách giữa icon và label
  },
  infoLabel: {
    fontSize: SIZES.font,
    color: COLORS.darkGray, // Màu label dịu hơn
    fontWeight: "500",
  },
  infoValue: {
    fontSize: SIZES.font,
    color: COLORS.black, // Màu giá trị rõ ràng
    textAlign: "right",
    flexShrink: 1, // Cho phép thu nhỏ nếu cần
  },
  placeholderText: {
    color: COLORS.placeholder, // Màu riêng cho placeholder
    fontStyle: 'italic',
  },
  // Edit Button (đã chuyển lên header)
  // editButton: { ... },
  // editButtonText: { ... },
});
