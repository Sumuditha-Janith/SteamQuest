import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const VerifyScreen = () => {
  const { user, refreshUser, resendVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const isVerified = await refreshUser();
      if (isVerified) {
        Alert.alert('Success', 'Email verified! Welcome to SteamQuest.', [
          { text: 'Let\'s Go', onPress: () => router.replace('/(dashboard)/home') }
        ]);
      } else {
        Alert.alert('Not Verified', 'We haven\'t received the verification yet. Please check your email and click the link.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      Alert.alert('Sent', 'A new verification email has been sent.');
    } catch (error: any) {
      Alert.alert('Error', 'Please wait a moment before trying again.');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = async () => {
    setLoggingOut(true);
    try {
      await logout();
      Alert.alert('Logged Out', 'You have been logged out successfully.', [
        { 
          text: 'OK', 
          onPress: () => router.replace('/(auth)/login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Logout Error', error.message || 'Failed to log out. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-steam-blue justify-center px-6">
      <View className="bg-steam-light/90 border border-steam-accent/10 rounded-3xl p-8 shadow-2xl shadow-black items-center">
        
        <View className="w-20 h-20 bg-steam-blue rounded-full items-center justify-center mb-6 border border-steam-accent/30">
          <MaterialIcons name="mark-email-unread" size={40} color="#66c0f4" />
        </View>

        <Text className="text-2xl font-bold text-white mb-2 text-center">
          Verify Your Email
        </Text>
        
        <Text className="text-steam-gray text-center mb-6 leading-6">
          We've sent a verification link to:
          {'\n'}
          <Text className="text-white font-bold">{user?.email}</Text>
          {'\n\n'}
          Please check your inbox (and spam folder) and click the link to activate your account.
        </Text>

        <TouchableOpacity
          onPress={handleCheckVerification}
          className="w-60 bg-steam-accent py-3 rounded-full shadow-lg shadow-steam-accent/20 active:opacity-90 mb-4"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg text-center font-bold tracking-wide">
              I've Verified My Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          className="py-2 mb-6"
        >
          <Text className="text-steam-accent font-medium">
            {resending ? 'Sending...' : 'Resend Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackToLogin}
          disabled={loggingOut}
          className="flex-row items-center bg-steam-blue/50 px-4 py-2 rounded-full border border-steam-blue active:opacity-80"
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#8b9cb3" />
          ) : (
            <>
              <MaterialIcons name="arrow-back" size={16} color="#8b9cb3" />
              <Text className="text-steam-gray ml-2 font-medium">Back to Login</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default VerifyScreen;