import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ImageBackground
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
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { try { await logout(); } catch (e) {} } },
    ]);
  };

  const handleDeleteGuide = (guideId: string) => {
    Alert.alert('Delete Guide', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await guideService.deleteGuide(guideId);
            setUserGuides(prev => prev.filter(guide => guide.id !== guideId));
          
            // Show success alert after deletion
            Alert.alert(
              'Success', 
              'Guide deleted successfully!',
              [{ text: 'OK' }]
            );
          } catch (error) { 
            Alert.alert('Error', 'Failed to delete guide.'); 
          }
        }
      },
    ]);
  };

  const handleEditGuide = (guideId: string) => {
    router.push({ pathname: '/(dashboard)/tasks/edit', params: { id: guideId } } as any);
  };

  const renderHeader = () => (
    <View className="mb-6">
      <View className="bg-steam-light items-center pt-8 pb-6 px-4 rounded-b-3xl border-b border-steam-light/50 shadow-xl mb-4">
        <View className="w-24 h-24 bg-gradient-to-br from-steam-accent to-steam-blue rounded-full justify-center items-center mb-4 border-4 border-steam-blue shadow-lg">
            <MaterialIcons name="person" size={64} color="#66c0f4" />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">
          {user?.displayName || 'Adventurer'}
        </Text>
        <Text className="text-steam-gray text-sm mb-4">{user?.email}</Text>
        
        <View className="flex-row space-x-3 w-full justify-center">
            <TouchableOpacity
              onPress={() => router.replace('/(dashboard)/tasks/settings')}
              className="bg-steam-blue/50 px-5 py-2 rounded-full flex-row items-center border border-steam-blue"
            >
              <MaterialIcons name="settings" size={16} color="#c7d5e0" />
              <Text className="text-steam-gray ml-2 font-semibold">Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-500/10 px-5 py-2 rounded-full flex-row items-center border border-red-500/20"
            >
                <MaterialIcons name="logout" size={16} color="#EF4444" />
                <Text className="text-red-400 ml-2 font-semibold">Logout</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View className="px-4">
        <View className="flex-row bg-steam-light/50 rounded-2xl p-4 justify-between border border-steam-light/30 shadow-lg">
            <View className="items-center flex-1 border-r border-steam-gray/10">
                <Text className="text-2xl font-bold text-white">{userGuides.length}</Text>
                <Text className="text-steam-gray text-xs mt-1">Guides</Text>
            </View>
            <View className="items-center flex-1 border-r border-steam-gray/10">
                <Text className="text-2xl font-bold text-green-400">
                    {userGuides.reduce((acc, g) => acc + (g.upvotes?.length || 0), 0)}
                </Text>
                <Text className="text-steam-gray text-xs mt-1">Upvotes</Text>
            </View>
            <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-steam-accent">
                    {userGuides.reduce((acc, g) => acc + (g.commentCount || 0), 0)}
                </Text>
                <Text className="text-steam-gray text-xs mt-1">Comments</Text>
            </View>
        </View>
        <Text className="text-white font-bold text-xl mt-6 mb-2 ml-1">My Contributions</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#66c0f4" className="mt-10" />
      ) : (
        <FlatList
            data={userGuides}
            renderItem={({ item }) => (
                <View className="px-4">
                    <GuideCard 
                        guide={item} 
                        showActions 
                        onDelete={() => handleDeleteGuide(item.id)} 
                        onEdit={() => handleEditGuide(item.id)}
                    />
                </View>
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={() => (
                <View className="items-center py-10 px-6">
                    <Text className="text-steam-gray text-center mb-4">You haven't posted any guides yet.</Text>
                    <TouchableOpacity
                        className="bg-steam-accent px-6 py-3 rounded-xl"
                        onPress={() => router.push('/(dashboard)/create')}
                    >
                        <Text className="text-white font-bold">Start Writing</Text>
                    </TouchableOpacity>
                </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#66c0f4" />}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;