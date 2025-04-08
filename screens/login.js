import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Easing,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';



const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(height)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
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
    if (isKeyboardVisible) {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    Animated.timing(formTranslateY, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.14:5000/users/login', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password})
      });

      const data = await response.json();

      if(response.ok){
        //đăng nhập thành công
        Alert.alert('Thành công', 'Đăng nhập thành công')
        await AsyncStorage.setItem('userDataa=', JSON.stringify(data));
        navigation.navigate('Main');
        console.log("data", data);
      }else{
        Alert.alert('Thất bại', 'Tài khoản hoặc mật khẩu không chính xác')
        console.log("Lỗi đăng nhập", data);
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập", error);
      Alert.alert('Lỗi đăng nhập', 'Đã có lỗi xảy ra trong quá trình đăng nhập xin vui lòng thử lại.');
      
    }
  };

  const handleRegister = () => {
    // Navigate to the register screen
    navigation.navigate('Register');
  };

  const handleFacebookLogin = () => {
    // Handle Facebook login logic here
    console.log('Logging in with Facebook');
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log('Logging in with Google');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Ionicons name="desktop" size={80} color="white" />
          <Text style={styles.logoText}>Thế giới đồ công nghệ</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formContainer,
            { transform: [{ translateY: formTranslateY }] },
          ]}
        >
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={24} color="white" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="white" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: buttonOpacity }}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register Text and Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Bạn không có tài khoản? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Đăng kí ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialLoginContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={handleFacebookLogin}>
              <Ionicons name="logo-facebook" size={24} color="white" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color="white" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: 'white',
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#3b5998',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: 'white',
  },
  registerLink: {
    color: 'white',
    fontWeight: 'bold',
  },
  socialLoginContainer: {
    marginTop: 20,
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  socialButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
