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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

const SettingsScreen = () => {
  const router = useRouter();
  const { user, updateDisplayName, changePassword } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [updatingName, setUpdatingName] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (displayName === user?.displayName) {
      Alert.alert('No Changes', 'Display name is the same as current');
      return;
    }

    setUpdatingName(true);
    try {
      await updateDisplayName(displayName.trim());
      Alert.alert('Success', 'Display name updated successfully');
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update display name');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setShowPasswordFields(false);
              Keyboard.dismiss();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email found for your account');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset email to ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              const { resetPassword } = useAuth();
              await resetPassword(user.email!);
              Alert.alert(
                'Email Sent',
                'Password reset email has been sent to your email address'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send reset email');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white ml-4">Account Settings</Text>
          </View>

          {/* Account Info Card */}
          <View className="bg-steam-light rounded-xl p-4 mb-6">
            <Text className="text-white font-bold text-lg mb-2">Account Information</Text>
            <View className="space-y-3">
              <View>
                <Text className="text-steam-gray text-sm">Email</Text>
                <Text className="text-white font-semibold">{user?.email}</Text>
              </View>
              
              <View>
                <Text className="text-steam-gray text-sm">User ID</Text>
                <Text className="text-white font-semibold text-xs">{user?.uid}</Text>
              </View>
              
              <View>
                <Text className="text-steam-gray text-sm">Account Created</Text>
                <Text className="text-white font-semibold">
                  {user?.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'N/A'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Change Display Name */}
          <View className="bg-steam-light rounded-xl p-4 mb-6">
            <Text className="text-white font-bold text-lg mb-4">Display Name</Text>
            <TextInput
              placeholder="Enter your display name"
              placeholderTextColor="#8b9cb3"
              value={displayName}
              onChangeText={setDisplayName}
              className="bg-steam-blue text-white p-4 rounded-xl mb-4"
            />
            <TouchableOpacity
              onPress={handleUpdateDisplayName}
              disabled={updatingName || !displayName.trim() || displayName === user?.displayName}
              className={`${
                updatingName || !displayName.trim() || displayName === user?.displayName
                  ? 'bg-steam-accent/50' 
                  : 'bg-steam-accent'
              } p-3 rounded-xl items-center`}
            >
              {updatingName ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Update Display Name</Text>
              )}
            </TouchableOpacity>
            <Text className="text-steam-gray text-sm mt-2">
              This name will appear on your guides
            </Text>
          </View>

          {/* Change Password */}
          <View className="bg-steam-light rounded-xl p-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-bold text-lg">Password</Text>
              {!showPasswordFields && (
                <TouchableOpacity
                  onPress={() => setShowPasswordFields(true)}
                  className="flex-row items-center"
                >
                  <Text className="text-steam-accent mr-2">Change Password</Text>
                  <MaterialIcons name="edit" size={18} color="#66c0f4" />
                </TouchableOpacity>
              )}
            </View>

            {showPasswordFields ? (
              <View className="space-y-3">
                <TextInput
                  placeholder="Current Password"
                  placeholderTextColor="#8b9cb3"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  className="bg-steam-blue text-white p-4 rounded-xl"
                />
                
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor="#8b9cb3"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  className="bg-steam-blue text-white p-4 rounded-xl"
                />
                
                <TextInput
                  placeholder="Confirm New Password"
                  placeholderTextColor="#8b9cb3"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  className="bg-steam-blue text-white p-4 rounded-xl mb-3"
                />
                
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordFields(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 bg-steam-blue p-3 rounded-xl items-center"
                  >
                    <Text className="text-steam-gray font-bold">Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleChangePassword}
                    disabled={changingPassword}
                    className={`flex-1 ${
                      changingPassword ? 'bg-steam-accent/50' : 'bg-steam-accent'
                    } p-3 rounded-xl items-center`}
                  >
                    {changingPassword ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold">Update Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResetPassword}
                className="bg-steam-accent/20 p-4 rounded-xl flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="email" size={20} color="#66c0f4" />
                  <Text className="text-steam-accent ml-3">Reset Password via Email</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#66c0f4" />
              </TouchableOpacity>
            )}
          </View>

          {/* Security Information */}
          <View className="bg-steam-light rounded-xl p-4">
            <Text className="text-white font-bold text-lg mb-4">Security Tips</Text>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <MaterialIcons name="lock" size={16} color="#10B981" style={{ marginTop: 2 }} />
                <Text className="text-steam-gray ml-2 flex-1">
                  Use a strong password with letters, numbers, and special characters
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <MaterialIcons name="warning" size={16} color="#F59E0B" style={{ marginTop: 2 }} />
                <Text className="text-steam-gray ml-2 flex-1">
                  Never share your password with anyone
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <MaterialIcons name="check-circle" size={16} color="#66c0f4" style={{ marginTop: 2 }} />
                <Text className="text-steam-gray ml-2 flex-1">
                  Your password is encrypted and securely stored
                </Text>
              </View>
            </View>
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SettingsScreen;