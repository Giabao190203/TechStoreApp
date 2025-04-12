import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../src/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// --- Constants ---
const COLORS = {
  primary: "#e32f45",
  white: "#FFFFFF",
  lightGray: "#f8f8f8",
  gray: "#adb5bd",
  darkGray: "#495057",
  black: "#343a40",
  border: "#dee2e6",
  placeholder: "#6c757d",
  green: "#28a745",
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

const { width, height } = Dimensions.get("window");

// --- Component con cho thông số kỹ thuật ---
const SpecRow = ({ label, value }) => (
  <View style={styles.specRowContainer}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value || "Không có"}</Text>
  </View>
);

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef();
  const [userId, setUserId] = useState(null); // State để lưu userId
  const [token, setToken] = useState(null); // State để lưu token


  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const DESCRIPTION_LINE_LIMIT = 10;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userDataa=');
        if(storedData){
          const parsedData = JSON.parse(storedData);
          setUserId(parsedData?.user?._id);
          setToken(parsedData?.token);
        }else{
          console.log("Không có dữ liệu người dùng");
          
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };
    getUserData();
  },[]);

  //Gọi API chi tiết sản phẩm
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/products/api/details/${productId}`
        );
        const data = await response.json();
        if (response.ok) {
          setProductData(data);
        } else {
          Alert.alert("Lỗi", data.message || "Không thể tải sản phẩm.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Lỗi gọi API:", error);
        Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    } else {
      Alert.alert("Lỗi", "Thiếu mã sản phẩm.");
      navigation.goBack();
    }
  }, [productId]);

  const formatPriceToVND = (price) => {
    if (price === undefined || price === null) return "Không có";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  //thêm vào giỏ hàng
  const handleAddToCart = async () => {
    //kiểm tra login
    if(!userId || !token){
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tiếp tục',
        [
          {text: "Để sau"},
          {text:"Đăng nhập", onPress: () => navigation.navigate('Login')}
        ]
      );
      return;
    }

    //kiểm tra dữ liệu sp
    if(!productData || !productData._id){
      Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
      return;
    }

    setLoading(true);

    try {
      //gọi api
      const response = await fetch(`${API_BASE_URL}/carts/api/add-items`,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productData._id,
          quantity: 1,//mặc định thêm 1 mỗi khi ấn nút
        }),
      });

      const data = await response.json();
      //xử lý kq
      if(response.ok){
        //BE trả về giỏ hàng đã cập nhật
        console.log("Add to cart", data);
        Alert.alert('Thành công', 'Thêm vào giỏ hàng thành công');
      }else{
        //xử lý token hết hạn
        if(response.status === 401){
          Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          await AsyncStorage.removeItem('userDataa=');
          navigation.replace('Login')
          return;
        }
        console.error("Add to cart error", data);
        Alert.alert('Lỗi', data.message || data.error || 'Thêm vào giỏ hàng thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }

  }

  //xử lý mua hàng
  const handleBuyNow = () => {
    console.log(`Buy now`);
  }

  const toggleDescriptionExplainion = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  }
  const handleTextLayout = (even) => {
    if(!isDescriptionLong && even.nativeEvent.lines.length > DESCRIPTION_LINE_LIMIT) {
      setIsDescriptionLong(true);
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderImageItem = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.carouselImage}
      resizeMode="contain"
    />
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {productData?.images?.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentImageIndex ? styles.paginationDotActive : {},
          ]}
        />
      ))}
    </View>
  );

  //Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  //render giao diện chi tiết
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor={COLORS.primary}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Chi tiết sản phẩm
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            Alert.alert("Chức năng", "Chia sẻ sản phẩm (chưa cài đặt)")
          }
        >
          <Ionicons
            name="share-social-outline"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          {productData?.images?.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={productData.images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => `img-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
              />
              {renderPagination()}
            </>
          ) : (
            <View style={[styles.carouselImage, styles.noImagePlaceholder]}>
              <Ionicons name="image-outline" size={60} color={COLORS.gray} />
              <Text style={{ color: COLORS.gray }}>Không có ảnh</Text>
            </View>
          )}
        </View>

        {/* thông tin sản phẩm */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>
            {productData.name || "Không có tên"}
          </Text>
          <Text style={styles.productPrice}>
            {formatPriceToVND(productData.price)}
          </Text>
        </View>

        {/* mô tả */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={isDescriptionExpanded ? undefined : DESCRIPTION_LINE_LIMIT} // Giới hạn dòng hoặc hiển thị tất cả
            onTextLayout={handleTextLayout} // Đo layout text
          >
            {productData?.description || "Không có mô tả"}
          </Text>
          {/* Chỉ hiển thị nút nếu mô tả dài */}
          {isDescriptionLong && (
            <TouchableOpacity
              onPress={toggleDescriptionExplainion}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Các thông số kỹ thuật */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>


          {/* --- Hiển thị có điều kiện --- */}
          {/* Chỉ render SpecRow nếu productData có giá trị tương ứng và không rỗng */}
          {productData.screen && <SpecRow label="Màn hình" value={productData.screen} />}
          {productData.screen_resolution && <SpecRow label="Độ phân giải" value={productData.screen_resolution} />}
          {productData.color_coverage && <SpecRow label="Độ phủ màu" value={productData.color_coverage} />}
          {productData.cpu && <SpecRow label="CPU" value={productData.cpu} />}
          {productData.cpu_speed && <SpecRow label="Tốc độ CPU" value={productData.cpu_speed} />}
          {productData.max_speed && <SpecRow label="Tốc độ tối đa (CPU)" value={productData.max_speed} />}
          {/* Các thông số thường có ở Laptop, sẽ không hiển thị nếu điện thoại không có */}
          {productData.cores && <SpecRow label="Số nhân" value={productData.cores} />}
          {productData.threads && <SpecRow label="Số luồng" value={productData.threads} />}
          {productData.gpu && <SpecRow label="GPU (Card đồ họa)" value={productData.gpu} />}
          {/* RAM */}
          {productData.ram && <SpecRow label="RAM" value={productData.ram} />}
          {productData.ram_type && <SpecRow label="Loại RAM" value={productData.ram_type} />}
          {productData.bus_ram && <SpecRow label="Bus RAM" value={productData.bus_ram} />}
          {productData.ram_max && <SpecRow label="RAM tối đa" value={productData.ram_max} />}
          {/* Lưu trữ */}
          {productData.storage && <SpecRow label="Bộ nhớ trong / Ổ cứng" value={productData.storage} />}
          {/* Camera/Webcam */}
          {productData.camera && <SpecRow label="Webcam / Camera" value={productData.camera} />}
          {/* Pin & Sạc */}
          {productData.pin && <SpecRow label="Pin" value={productData.pin} />}
          {productData.max_charging && <SpecRow label="Công nghệ sạc" value={productData.max_charging} />}
          {/* Hệ điều hành */}
          {productData.operating_system && <SpecRow label="Hệ điều hành" value={productData.operating_system} />}
          {/* Kiểm tra xem có ít nhất một thông số có giá trị không */}
          {!Object.values(productData).some(value =>
              value !== null && value !== undefined && value !== '' &&
              ['screen', 'cpu', 'ram', 'storage', 'camera', 'pin', 'operating_system', 'gpu', 'screen_resolution', 'color_coverage', 'cpu_speed', 'max_speed', 'cores', 'threads', 'max_charging', 'ram_type', 'bus_ram', 'ram_max' ].includes(Object.keys(productData).find(key => productData[key] === value)) // Chỉ kiểm tra các key quan trọng
            ) && (
             <Text style={styles.noSpecsText}>Không có thông số kỹ thuật chi tiết.</Text>
            )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Nút Thêm vào giỏ hàng */}
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        {/* Nút Mua ngay */}
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
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
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "android" ? SIZES.base : SIZES.padding / 2,
    paddingBottom: SIZES.padding / 1.5,
    paddingHorizontal: SIZES.padding,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.white,
    flex: 1, // Cho phép title co giãn
    textAlign: "center", // Căn giữa title
    marginHorizontal: SIZES.base, // Khoảng cách với nút
  },
  // ScrollView Styles
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Khoảng trống cho bottom bar
  },
  // Image Carousel Styles
  carouselContainer: {
    height: height * 0.4, // Chiều cao carousel
    backgroundColor: COLORS.white,
    marginBottom: SIZES.base,
  },
  carouselImage: {
    width: width, // Chiều rộng bằng màn hình
    height: "100%",
  },
  noImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
  },
  paginationContainer: {
    position: "absolute",
    bottom: SIZES.padding,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 10, // Chấm active to hơn chút
    height: 10,
    borderRadius: 5,
  },
  // Info Section (Name, Price)
  infoSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
  },
  productName: {
    fontSize: SIZES.h3,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: SIZES.base,
  },
  productPrice: {
    fontSize: SIZES.h2,
    fontWeight: "bold",
    color: COLORS.primary, // Giá màu nổi bật
  },
  productBrand: {
    fontSize: SIZES.font,
    color: COLORS.darkGray,
    marginTop: SIZES.base / 2,
  },
  // Description Section
  descriptionSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: SIZES.padding / 2,
  },
  descriptionText: {
    fontSize: SIZES.font,
    color: COLORS.darkGray,
    lineHeight: SIZES.font * 1.5, // Giãn dòng cho dễ đọc
  },
  // Specifications Section
  specsSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
  },
  specRowContainer: {
    flexDirection: "row",
    paddingVertical: SIZES.padding / 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "flex-start", // Căn trên nếu text dài
  },
  specLabel: {
    fontSize: SIZES.font,
    color: COLORS.darkGray,
    fontWeight: "500",
    width: "40%", // Chiều rộng cố định cho label
    marginRight: SIZES.base,
  },
  specValue: {
    fontSize: SIZES.font,
    color: COLORS.black,
    flex: 1, // Chiếm phần còn lại
  },
  // Bottom Action Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    flex: 0.5, // Chiếm 50%
    backgroundColor: '#fff', // Nền trắng hoặc màu nhẹ
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", // Icon và text cùng hàng
    borderRightWidth: 1, // Thêm đường kẻ giữa 2 nút
    borderRightColor: COLORS.border,
  },
  addToCartText: {
    fontSize: SIZES.font - 2, // Có thể giảm cỡ chữ
    color: COLORS.primary, // Màu chữ trùng màu chính
    fontWeight: "600",
    marginLeft: SIZES.base / 2,
  },
  buyNowButton: {
    flex: 0.5, // Chiếm 50%
    backgroundColor: COLORS.primary, // Nền màu chính
    justifyContent: "center",
    alignItems: "center",
  },
  buyNowText: {
    fontSize: SIZES.h4 - 2,
    color: COLORS.white,
    fontWeight: "bold",
  },
});
