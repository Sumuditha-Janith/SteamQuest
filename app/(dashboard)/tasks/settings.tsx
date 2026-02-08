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
    if (!displayName.trim()) return;
    setUpdatingName(true);
    try {
      await updateDisplayName(displayName.trim());
      Alert.alert('Success', 'Display name updated');
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdatingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords mismatch');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed');
      setShowPasswordFields(false);
      Keyboard.dismiss();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
        {/* Header */}
        <View className="px-4 py-2 border-b border-steam-light/30 flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/(dashboard)/home')} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Settings</Text>
        </View>

        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account Info */}
          <View className="bg-steam-light rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4 border-b border-steam-blue/20 pb-4">
              <View className="w-12 h-12 bg-steam-blue rounded-full items-center justify-center mr-3">
                <MaterialIcons name="person" size={24} color="#c7d5e0" />
              </View>
              <View>
                <Text className="text-white font-bold text-lg">
                  {user?.displayName || 'User'}
                </Text>
                <Text className="text-steam-gray">{user?.email}</Text>
              </View>
            </View>

            <Text className="text-steam-gray text-xs uppercase mb-2">
              Display Name
            </Text>

            <View className="flex-row gap-2">
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                className="flex-1 bg-steam-blue/50 text-white p-3 rounded-xl border border-steam-blue"
              />

              <TouchableOpacity
                onPress={handleUpdateDisplayName}
                disabled={updatingName || displayName === user?.displayName}
                className="bg-steam-accent px-4 justify-center rounded-xl disabled:opacity-50"
              >
                {updatingName ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Security */}
          <View className="bg-steam-light rounded-2xl p-5 mb-6">
            <Text className="text-white font-bold text-lg mb-4">
              Security
            </Text>

            {!showPasswordFields ? (
              <TouchableOpacity
                onPress={() => setShowPasswordFields(true)}
                className="flex-row items-center justify-between bg-steam-blue/30 p-4 rounded-xl border border-steam-blue"
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="lock" size={20} color="#66c0f4" />
                  <Text className="text-white ml-3 font-medium">
                    Change Password
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#8b9cb3"
                />
              </TouchableOpacity>
            ) : (
              <View className="bg-steam-blue/30 p-4 rounded-xl border border-steam-blue">
                <TextInput
                  placeholder="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholderTextColor="#8b9cb3"
                  className="bg-steam-blue text-white p-3 rounded-xl mb-3"
                />

                <TextInput
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#8b9cb3"
                  className="bg-steam-blue text-white p-3 rounded-xl mb-3"
                />

                <TextInput
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#8b9cb3"
                  className="bg-steam-blue text-white p-3 rounded-xl mb-4"
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowPasswordFields(false)}
                    className="flex-1 bg-steam-blue p-3 rounded-xl items-center"
                  >
                    <Text className="text-steam-gray">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleChangePassword}
                    disabled={changingPassword}
                    className="flex-1 bg-steam-accent p-3 rounded-xl items-center"
                  >
                    {changingPassword ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-bold">Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SettingsScreen;
