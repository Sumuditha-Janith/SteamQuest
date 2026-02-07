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
import { MaterialIcons } from '@expo/vector-icons';

const Register = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !displayName || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (displayName.length < 3) {
      Alert.alert('Error', 'Display Name must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center items-center bg-steam-blue px-6">
        <View className="w-full max-w-md bg-steam-light/90 border border-steam-accent/10 rounded-3xl p-8 shadow-2xl shadow-black">
          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-white tracking-wider">
              SteamQuest
            </Text>
            <Text className="text-steam-gray mt-2 text-center">
              Join the Achievement Hunter Community
            </Text>
          </View>
          
          <Text className="text-xl font-bold mb-6 text-white self-start ml-1">
            Create Account
          </Text>
          
          <View className="space-y-4 mb-8">
            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-xl px-4 py-3">
              <MaterialIcons name="person" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Display Name"
                placeholderTextColor="#8b9cb3"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
                className="flex-1 ml-3 text-white text-base"
              />
            </View>

            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-xl px-4 py-3">
              <MaterialIcons name="email" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#8b9cb3"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-3 text-white text-base"
              />
            </View>
            
            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-xl px-4 py-3">
              <MaterialIcons name="lock" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8b9cb3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 ml-3 text-white text-base"
              />
            </View>
            
            <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-xl px-4 py-3">
              <MaterialIcons name="lock-outline" size={20} color="#8b9cb3" />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#8b9cb3"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                className="flex-1 ml-3 text-white text-base"
              />
            </View>
          </View>
          
          <Pressable
            className={`${loading ? 'bg-steam-accent/50' : 'bg-steam-accent'} w-full py-4 rounded-xl shadow-lg shadow-steam-accent/20 active:opacity-90`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg text-center font-bold tracking-wide">Sign Up</Text>
            )}
          </Pressable>
          
          <View className="flex-row justify-center mt-8">
            <Text className="text-steam-gray">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
              disabled={loading}
            >
              <Text className="text-steam-accent font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;