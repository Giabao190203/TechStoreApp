import { ActivityIndicator, StyleSheet, Text, View, StatusBar } from 'react-native'
import React, {useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'


const AuthLoading = ({navigation}) => {

    useEffect(() => {
        const bootstrapAsync = async () => {
            let userDataString;
            try {
                userDataString = await AsyncStorage.getItem('userDataa=')
                //thêm logic kiểm tra token
                if(userDataString){
                    const userDataa = JSON.parse(userDataString);
                    //kiểm tra token có tồn tại
                    if(userDataa && userDataa.token){
                        //chuyển đến màn hình chính
                        navigation.replace('Main');
                    }else{
                        //Dữ liệu không hợp lệ => Chuyển đến login
                        navigation.replace('Login');
                    }
                }else{
                    //chưa đăng nhập => chuyển đến Login
                    navigation.replace('Login');
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra đăng nhập:", error);
                navigation.replace('Login');
            }
        };

        bootstrapAsync();
    },[navigation])



  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="e32f45" />
      <StatusBar barStyle="default"/>
    </View>
  )
}

export default AuthLoading

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
})