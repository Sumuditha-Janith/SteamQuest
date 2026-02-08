import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PrivacyPolicyScreen = () => {
  const handleGoHome = () => {
    router.replace('/(dashboard)/home');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@steamquest.com');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://google.com');
  };

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-2 border-b border-steam-light/30 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Privacy Policy</Text>
      </View>

      <ScrollView
        className="flex-1 p-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="bg-steam-light rounded-2xl p-5 mb-6 shadow-sm">
          <Text className="text-white text-2xl font-bold mb-6 text-center">
            SteamQuest Privacy Policy
          </Text>
          <Text className="text-steam-gray text-xs mb-1">Last Updated: February 2026</Text>
          
          {/* Introduction */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">Introduction</Text>
            <Text className="text-white leading-6">
              Welcome to SteamQuest! This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our mobile application.
            </Text>
          </View>

          {/* Data Collection */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">Information We Collect</Text>
            <Text className="text-white leading-6 mb-3">
              We may collect the following types of information:
            </Text>
            <View className="ml-4 space-y-2">
              <View className="flex-row items-start">
                <MaterialIcons name="check-circle" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold">Account Information:</Text> Email, display name, and authentication data
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="check-circle" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold">User Content:</Text> Achievement guides, comments, and uploaded images
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="check-circle" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold">Usage Data:</Text> App interactions, preferences, and settings
                </Text>
              </View>
            </View>
          </View>

          {/* Data Usage */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">How We Use Your Information</Text>
            <Text className="text-white leading-6 mb-3">
              Your information helps us to:
            </Text>
            <View className="ml-4 space-y-2">
              <View className="flex-row items-start">
                <MaterialIcons name="person" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Provide and maintain our services</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="security" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Secure and protect our platform</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="people" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Improve user experience and community features</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="notifications" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Communicate important updates</Text>
              </View>
            </View>
          </View>

          {/* User Tips */}
          <View className="mb-6 bg-steam-blue/30 p-4 rounded-xl">
            <Text className="text-steam-accent text-lg font-bold mb-2 flex-row items-center">
              <MaterialIcons name="tips-and-updates" size={20} color="#66c0f4" className="mr-2" />
              Privacy Tips & Best Practices
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-start">
                <MaterialIcons name="lock" size={16} color="#10B981" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold text-green-400">Use strong passwords</Text> and enable two-factor authentication if available
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="visibility-off" size={16} color="#10B981" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold text-green-400">Be mindful of personal information</Text> shared in public guides and comments
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="link" size={16} color="#10B981" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold text-green-400">Review permissions</Text> granted to the app in your device settings
                </Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="update" size={16} color="#10B981" className="mt-1 mr-2" />
                <Text className="text-white flex-1">
                  <Text className="font-bold text-green-400">Keep the app updated</Text> for the latest security patches
                </Text>
              </View>
            </View>
          </View>

          {/* Data Security */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">Data Security</Text>
            <Text className="text-white leading-6">
              We implement industry-standard security measures including encryption, 
              secure server infrastructure, and regular security audits. However, no 
              method of transmission over the Internet or electronic storage is 100% secure.
            </Text>
          </View>

          {/* Third-Party Services */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">Third-Party Services</Text>
            <Text className="text-white leading-6 mb-2">
              We use third-party services that have their own privacy policies:
            </Text>
            <View className="ml-4 space-y-2">
              <Text className="text-white">• Firebase for authentication and data storage</Text>
              <Text className="text-white">• ImgBB for image hosting</Text>
              <Text className="text-white">• Analytics tools for app improvement</Text>
            </View>
          </View>

          {/* Your Rights */}
          <View className="mb-6">
            <Text className="text-steam-accent text-lg font-bold mb-2">Your Rights</Text>
            <Text className="text-white leading-6 mb-3">
              You have the right to:
            </Text>
            <View className="ml-4 space-y-2">
              <View className="flex-row items-start">
                <MaterialIcons name="delete" size={16} color="#EF4444" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Delete your account and associated data</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="edit" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Update or correct your information</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="download" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Export your data</Text>
              </View>
              <View className="flex-row items-start">
                <MaterialIcons name="visibility-off" size={16} color="#66c0f4" className="mt-1 mr-2" />
                <Text className="text-white flex-1">Opt-out of certain data collection</Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <View className="mb-8">
            <Text className="text-steam-accent text-lg font-bold mb-2">Contact Us</Text>
            <Text className="text-white leading-6 mb-4">
              If you have questions about this Privacy Policy or our practices, please contact us:
            </Text>
            <TouchableOpacity
              onPress={handleContactSupport}
              className="flex-row items-center bg-steam-blue/50 p-3 rounded-xl mb-3 border border-steam-blue"
            >
              <MaterialIcons name="email" size={20} color="#66c0f4" />
              <Text className="text-white ml-3">Email: support@steamquest.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVisitWebsite}
              className="flex-row items-center bg-steam-blue/50 p-3 rounded-xl border border-steam-blue"
            >
              <MaterialIcons name="language" size={20} color="#66c0f4" />
              <Text className="text-white ml-3">Website: steamquest.com</Text>
            </TouchableOpacity>
          </View>

          {/* Final Note */}
          <View className="bg-steam-blue/20 p-4 rounded-xl border border-steam-blue/30">
            <Text className="text-steam-gray text-sm italic text-center">
              By using SteamQuest, you acknowledge that you have read and understood 
              this Privacy Policy and agree to its terms.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Go Home Button - Fixed at bottom */}
      <View className="p-5 border-t border-steam-light/30 bg-steam-blue/90">
        <TouchableOpacity
          onPress={handleGoHome}
          className="bg-steam-accent py-4 rounded-xl items-center shadow-lg shadow-steam-accent/20"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="home" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Go to Home Screen</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;