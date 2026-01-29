import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation is handled by AuthContext in _layout.tsx
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center items-center bg-steam-blue p-6">
        <View className="w-full max-w-md bg-steam-light/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <Text className="text-3xl font-bold mb-2 text-center text-steam-accent">
            SteamQuest
          </Text>
          <Text className="text-lg mb-6 text-center text-steam-gray">
            Your Community Achievement Guide
          </Text>
          
          <Text className="text-xl font-bold mb-6 text-center text-white">
            Login
          </Text>
          
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8b9cb3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-4 rounded-xl text-white"
          />
          
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8b9cb3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-6 rounded-xl text-white"
          />
          
          <Pressable
            className={`${loading ? 'bg-steam-accent/50' : 'bg-steam-accent'} px-6 py-4 rounded-2xl`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg text-center font-semibold">Login</Text>
            )}
          </Pressable>
          
          <View className="flex-row justify-center mt-6">
            <Text className="text-steam-gray">Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/register');
              }}
              disabled={loading}
            >
              <Text className="text-steam-accent font-semibold">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;