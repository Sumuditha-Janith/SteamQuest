import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center items-center bg-steam-blue px-6">
        
        <View className="w-full max-w-md bg-steam-light/90 border border-steam-accent/10 rounded-3xl p-8 shadow-2xl shadow-black">
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-steam-blue rounded-full items-center justify-center mb-4 border border-steam-accent/30">
               <MaterialIcons name="workspace-premium" size={32} color="#66c0f4" />
            </View>
            <Text className="text-3xl font-bold text-white tracking-wider">
              SteamQuest
            </Text>
            <Text className="text-steam-gray mt-2 text-center">
              Your Community Achievement Guide
            </Text>
          </View>
          
          <Text className="text-xl font-bold mb-6 text-white text-center">
            Welcome Back
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-3xl px-5 py-1 mb-2">
              <MaterialIcons name="email" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#8b9cb3"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-3 text-white text-lg"
              />
            </View>
            
            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-3xl px-5 py-1 mb-3">
              <MaterialIcons name="lock" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8b9cb3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="flex-1 ml-3 text-white text-lg"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#8b9cb3" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Pressable
            className={`${loading ? 'bg-steam-accent/50' : 'bg-steam-accent'} w-full py-4 rounded-full shadow-lg shadow-steam-accent/20 active:opacity-90`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg text-center font-bold tracking-wide">Login</Text>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-6">
            <Text className="text-steam-gray">New to SteamQuest? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/register');
              }}
              disabled={loading}
            >
              <Text className="text-steam-accent font-bold">Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center justify-center mt-2">
            <View className="flex-1 h-[1px] bg-steam-gray/30" />
            <Text className="text-steam-gray/60 mx-4 text-sm">OR</Text>
            <View className="flex-1 h-[1px] bg-steam-gray/30" />
          </View>

          <View className="flex-row justify-center mt-2">
            <Text className="text-steam-gray">Forgot Password? </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('../reset-password');
              }}
              disabled={loading}
            >
              <Text className="text-steam-accent font-bold">Click Here</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;