import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
const { useNavigation } = require("@react-navigation/native");

const { width, height } = Dimensions.get("window");

// Responsive Design Helpers
const guidelineBaseWidth = 375; // iPhone X design width
const guidelineBaseHeight = 812; // iPhone X design height

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Get status bar height
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 20 : StatusBar.currentHeight;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDataa=");
        const parsedUserData = JSON.parse(userData);
        const token = parsedUserData?.token;

        if (!token) {
          Alert.alert("Lỗi", "Không tìm thấy token đăng nhập.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "http://192.168.1.17:5000/products/api/list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          Alert.alert(
            "Lỗi",
            `Lỗi khi tải dữ liệu sản phẩm: ${response.status}`
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setProducts(data);
        setFilteredProducts(data); // Initialize filtered products with all products
      } catch (error) {
        console.error("Error fetching products:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải dữ liệu sản phẩm.");
      } finally {
        setIsLoading(false);
        // Start animations after data is loaded
        Animated.parallel([
          Animated.timing(searchBarOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(listOpacity, {
            toValue: 1,
            duration: 800,
            delay: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Function to format price to VND
  const formatPriceToVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleProductPress = (item) => {
    navigation.navigate("ProductDetail", { productId: item._id });
  };

  const renderProductItem = ({ item }) => {
    // Lấy URL của hình ảnh đầu tiên trong mảng, hoặc null nếu mảng rỗng
    const firstImageUrl =
      item.images && item.images.length > 0 ? item.images[0] : null;


    return (
      <TouchableOpacity style={styles.productItemTouchable} onPress={() => handleProductPress(item)}>
        <View style={styles.productItem}>
          {/* Kiểm tra xem có URL hình ảnh hay không */}
          {firstImageUrl ? (
            <Image
              source={{ uri: firstImageUrl }}
              style={styles.productImage}
            />
          ) : (
            // Nếu không có hình ảnh, hiển thị placeholder
            <View
              style={[
                styles.productImage,
                {
                  backgroundColor: "#eee",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text>No Image</Text>
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              {formatPriceToVND(item.price)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust if needed
    >
      <View style={styles.container}>
        {/* Search Bar */}
        <Animated.View
          style={[styles.searchBarWrapper, { opacity: searchBarOpacity }]}
        >
          <View style={styles.searchBarContainer}>
            <Ionicons
              name="search"
              size={moderateScale(20)}
              color="#333"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => {
              // kiểm tra đăng nhập nếu cần, rồi chuyển trang giỏ hàng
              Alert.alert("Chuyển đến giỏ hàng");
              // navigation.navigate('Cart');
            }}
          >
            <Ionicons name="cart-outline" size={24} color="#333" />
          </TouchableOpacity>
        </Animated.View>

        {/* Product List */}
        <Animated.View style={{ opacity: listOpacity, flex: 1 }}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productListContainer}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: STATUS_BAR_HEIGHT - 10, // Adjust paddingTop
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: moderateScale(10),
  },
  searchBar: {
    flex: 1,
    height: moderateScale(40),
    fontSize: moderateScale(16),
  },
  productListContainer: {
    paddingHorizontal: moderateScale(5),
    paddingBottom: moderateScale(10),
  },
  productItem: {
    flex: 1 / 2,
    margin: moderateScale(5),
    backgroundColor: "#fff",
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: verticalScale(120),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  productInfo: {
    alignItems: "center",
  },
  productName: {
    fontSize: moderateScale(15),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: moderateScale(5),
  },
  productPrice: {
    fontSize: moderateScale(14),
    color: "green",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(5),
    backgroundColor: "#fff",
  },

  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: moderateScale(10),
    marginBottom: moderateScale(10),
  },

  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  cartButton: {
    marginLeft: moderateScale(10),
    backgroundColor: "#fff",
    padding: moderateScale(8),
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  productItemTouchable:{
    flex: 1/2,
    margin: moderateScale(5),
  }
});

export default HomeScreen;
