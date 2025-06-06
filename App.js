import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import LoginScreen from './screens/Login';
import RegisterScreen from './screens/Register';
import ProfileScreen from './screens/Profile';
import NotificationScreen from './screens/Notification';
import AuthLoadingScreen from './screens/AuthLoading';
import AccountSettingsScreen from './screens/AccountSetting';
import ProductDetailScreen from './screens/Details';
import HomeScreen from './screens/home';
import CartScreen from './screens/Cart';


import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useEffect } from 'react';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Button Component
const CustomTabBarButton = ({ children, onPress, isFocused }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    onPress();
  };

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      style={{
        top: 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow,
      }}
      onPress={handlePress}
    >
      <Animated.View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: isFocused ? '#e32f45' : '#fff',
          transform: [{ scale }, { rotate: rotation }],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Bottom Tab Navigator
function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Person') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={focused ? '#fff' : color} />;
        },
        tabBarActiveTintColor: '#e32f45',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 10,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 35,
          height: 70,
          ...styles.shadow,
        },
        tabBarButton: (props) => <CustomTabBarButton {...props} isFocused={props.accessibilityState.selected} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Person" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='AuthLoading' screenOptions={{ headerShown: false }}>
        {/* AuthLoading Screen */}
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="AccountSetting" component={AccountSettingsScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
