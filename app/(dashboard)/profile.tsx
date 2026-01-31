import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { guideService, Guide } from '../../services/guideService';
import GuideCard from '../../components/GuideCard';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userGuides, setUserGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserGuides();
    }
  }, [user]);

  const fetchUserGuides = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const guides = await guideService.getMyGuides(user.uid);
      setUserGuides(guides);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your guides.');
      console.error('Error fetching user guides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserGuides();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteGuide = (guideId: string) => {
    Alert.alert(
      'Delete Guide',
      'Are you sure you want to delete this guide? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await guideService.deleteGuide(guideId);
              
              setUserGuides(prev => prev.filter(guide => guide.id !== guideId));
              Alert.alert('Success', 'Guide deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete guide. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditGuide = (guideId: string) => {
    router.push({
      pathname: '/(dashboard)/tasks/edit',
      params: { id: guideId }
    } as any);
  };

  const renderHeader = () => (
    <View className="p-4 bg-steam-blue">
      <View className="items-center mb-6">
        <View className="w-24 h-24 bg-steam-accent rounded-full justify-center items-center mb-4">
          <MaterialIcons name="person" size={50} color="white" />
        </View>
        <Text className="text-white text-2xl font-bold">
          {user?.displayName || user?.displayName|| 'Gamer'}
        </Text>
        <Text className="text-steam-gray">{user?.email}</Text>
        <TouchableOpacity
        onPress={() => router.push('../settings')}
        className="mt-4 bg-steam-accent/20 px-4 py-2 rounded-xl flex-row items-center"
      >
        <MaterialIcons name="settings" size={16} color="#66c0f4" />
        <Text className="text-steam-accent ml-2 font-semibold">Account Settings</Text>
      </TouchableOpacity>
    </View>

      <View className="bg-steam-light rounded-xl p-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-bold text-lg">Your Stats</Text>
          <TouchableOpacity onPress={() => fetchUserGuides()}>
            <MaterialIcons name="refresh" size={24} color="#66c0f4" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-3xl font-bold text-steam-accent">{userGuides.length}</Text>
            <Text className="text-steam-gray">Guides Created</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-green-400">
              {userGuides.filter(g => g.difficulty === 'Easy').length}
            </Text>
            <Text className="text-steam-gray">Easy Guides</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-yellow-400">
              {userGuides.filter(g => g.difficulty === 'Medium').length}
            </Text>
            <Text className="text-steam-gray">Medium Guides</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500/20 p-4 rounded-xl flex-row justify-center items-center mb-4"
      >
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text className="text-red-400 ml-2 font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View className="px-4">
      <GuideCard 
        guide={item} 
        showActions 
        onDelete={() => handleDeleteGuide(item.id)} 
        onEdit={() => handleEditGuide(item.id)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <MaterialIcons name="library-books" size={80} color="#2a475e" />
      <Text className="text-white text-xl font-bold mt-4">No Guides Yet</Text>
      <Text className="text-steam-gray text-center mt-2">
        You haven't created any guides yet. Start sharing your achievement knowledge!
      </Text>
      <TouchableOpacity
        className="bg-steam-accent px-6 py-3 rounded-xl mt-4"
        onPress={() => router.push('/(dashboard)/create')}
      >
        <Text className="text-white font-bold">Create Your First Guide</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-steam-blue justify-center items-center">
        <ActivityIndicator size="large" color="#66c0f4" />
        <Text className="text-steam-accent mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <FlatList
        data={userGuides}
        renderItem={renderGuideItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#66c0f4"
            colors={['#66c0f4']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;