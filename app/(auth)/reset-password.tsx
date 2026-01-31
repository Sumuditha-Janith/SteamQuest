import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Password reset email has been sent. Please check your inbox.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 justify-center items-center bg-steam-blue p-6">
        <View className="w-full max-w-md bg-steam-light/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10"
          >
            <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
          </TouchableOpacity>
          
          <View className="items-center mb-6">
            <MaterialIcons name="lock-reset" size={60} color="#66c0f4" />
            <Text className="text-2xl font-bold mt-4 text-center text-white">
              Reset Password
            </Text>
            <Text className="text-steam-gray text-center mt-2">
              Enter your email to receive a password reset link
            </Text>
          </View>
          
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#8b9cb3"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="border border-steam-accent/30 bg-steam-blue p-4 mb-6 rounded-xl text-white"
            editable={!emailSent}
          />
          
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading || emailSent}
            className={`${
              loading || emailSent ? 'bg-steam-accent/50' : 'bg-steam-accent'
            } px-6 py-4 rounded-2xl`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : emailSent ? (
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="check-circle" size={20} color="white" />
                <Text className="text-white text-lg ml-2 text-center font-semibold">
                  Email Sent
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg text-center font-semibold">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6"
            disabled={loading}
          >
            <Text className="text-steam-gray text-center">
              Remember your password?{' '}
              <Text className="text-steam-accent font-semibold">Back to Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;