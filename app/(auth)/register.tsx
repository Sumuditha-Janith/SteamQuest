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
      <View className="flex-1 justify-center items-center bg-steam-blue p-6">
        <View className="w-full max-w-md bg-steam-light/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <Text className="text-3xl font-bold mb-2 text-center text-steam-accent">
            SteamQuest
          </Text>
          <Text className="text-lg mb-6 text-center text-steam-gray">
            Join the Achievement Community
          </Text>
          
          <Text className="text-xl font-bold mb-6 text-center text-white">
            Register
          </Text>
          
          <TextInput
            placeholder="Display Name"
            placeholderTextColor="#8b9cb3"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="none"
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-4 rounded-xl text-white"
          />
          
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
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-4 rounded-xl text-white"
          />
          
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#8b9cb3"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-6 rounded-xl text-white"
          />
          
          <Pressable
            className={`${loading ? 'bg-steam-accent/50' : 'bg-steam-accent'} px-6 py-4 rounded-2xl`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg text-center font-semibold">Create Account</Text>
            )}
          </Pressable>
          
          <View className="flex-row justify-center mt-6">
            <Text className="text-steam-gray">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
              disabled={loading}
            >
              <Text className="text-steam-accent font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;