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
      <View className="flex-1 justify-center items-center bg-steam-blue px-6">
        <View className="w-full max-w-md bg-steam-light/90 border border-steam-accent/10 rounded-3xl p-8 shadow-2xl shadow-black relative">
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-6 left-6 z-10 p-2 bg-steam-blue rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
          </TouchableOpacity>
          
          <View className="items-center mb-8 mt-4">
            <View className="w-20 h-20 bg-steam-blue rounded-full items-center justify-center mb-4 border border-steam-accent/30">
                <MaterialIcons name="lock-reset" size={40} color="#66c0f4" />
            </View>
            <Text className="text-2xl font-bold mt-2 text-center text-white">
              Reset Password
            </Text>
            <Text className="text-steam-gray text-center mt-2 px-4 leading-5">
              Enter the email associated with your account and we'll send you a link to reset your password.
            </Text>
          </View>
          
          <View className="flex-row items-center bg-steam-blue border border-steam-light rounded-xl px-4 py-3 mb-8">
            <MaterialIcons name="email" size={20} color="#8b9cb3" />
            <TextInput
                placeholder="Email Address"
                placeholderTextColor="#8b9cb3"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-3 text-white text-base"
                editable={!emailSent}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading || emailSent}
            className={`${
              loading || emailSent ? 'bg-steam-accent/50' : 'bg-steam-accent'
            } w-full py-4 rounded-xl shadow-lg shadow-steam-accent/20 active:opacity-90`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : emailSent ? (
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="check-circle" size={20} color="white" />
                <Text className="text-white text-lg ml-2 text-center font-bold">
                  Email Sent
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg text-center font-bold tracking-wide">
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;