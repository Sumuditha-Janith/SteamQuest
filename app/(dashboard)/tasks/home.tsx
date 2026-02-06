import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { guideService, Guide } from '../../../services/guideService';
import GuideCard from '../../../components/GuideCard';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';

const HomeScreen = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter(guide =>
        guide.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.achievementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGuides(filtered);
    }
  }, [searchQuery, guides]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const fetchedGuides = await guideService.getAllGuides();
      setGuides(fetchedGuides);
      setFilteredGuides(fetchedGuides);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guides. Please try again.');
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuides();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleVoteUpdate = (guideId: string, updatedGuide: Guide) => {
    setGuides(prev => 
      prev.map(guide => guide.id === guideId ? updatedGuide : guide)
    );
    setFilteredGuides(prev =>
      prev.map(guide => guide.id === guideId ? updatedGuide : guide)
    );
  };

  const getDifficultyStats = useMemo(() => {
    const stats = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      'Very Hard': 0,
    };

    guides.forEach(guide => {
      stats[guide.difficulty]++;
    });

    return stats;
  }, [guides]);

  const renderHeader = () => (
    <View className="p-4 bg-steam-blue">
      <Text className="text-2xl font-bold text-white mb-2">
        Welcome to SteamQuest
      </Text>
      <Text className="text-steam-gray mb-4">
        Browse community guides for your favorite game achievements
      </Text>
      
      {/* Search Bar */}
      <View className="bg-steam-light rounded-xl px-4 py-3 flex-row items-center mb-4">
        <MaterialIcons name="search" size={20} color="#8b9cb3" />
        <TextInput
          placeholder="Search guides by game or achievement..."
          placeholderTextColor="#8b9cb3"
          value={searchQuery}
          onChangeText={handleSearch}
          className="flex-1 ml-3 text-white"
          style={{ fontSize: 16 }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#8b9cb3" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View className="bg-steam-light rounded-xl p-4 mb-4">
        <Text className="text-white font-bold mb-2">Community Stats</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-steam-accent">{guides.length}</Text>
            <Text className="text-steam-gray text-xs">Total Guides</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-400">{getDifficultyStats.Easy}</Text>
            <Text className="text-steam-gray text-xs">Easy</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-yellow-400">{getDifficultyStats.Medium}</Text>
            <Text className="text-steam-gray text-xs">Medium</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-red-400">{getDifficultyStats.Hard}</Text>
            <Text className="text-steam-gray text-xs">Hard</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View className="mb-4">
        <Text className="text-white font-bold mb-2">Popular Games</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {['Cyberpunk 2077', 'Elden Ring', 'Baldur\'s Gate 3', 'The Witcher 3', 'Red Dead Redemption 2'].map((game, index) => (
              <TouchableOpacity
                key={index}
                className="bg-steam-light px-4 py-2 rounded-full mr-2"
                onPress={() => setSearchQuery(game)}
              >
                <Text className="text-steam-accent">{game}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <MaterialIcons name="sports-esports" size={80} color="#2a475e" />
      <Text className="text-white text-xl font-bold mt-4">No Guides Yet</Text>
      <Text className="text-steam-gray text-center mt-2">
        Be the first to create a guide for your favorite game!
      </Text>
      <TouchableOpacity
        className="bg-steam-accent px-6 py-3 rounded-xl mt-4"
        onPress={() => router.push('/(dashboard)/create')}
      >
        <Text className="text-white font-bold">Create First Guide</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View className="px-4">
      <GuideCard 
        guide={item} 
        onVoteUpdate={(updatedGuide) => handleVoteUpdate(item.id, updatedGuide)}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-steam-blue justify-center items-center">
        <ActivityIndicator size="large" color="#66c0f4" />
        <Text className="text-steam-accent mt-4">Loading guides...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <FlatList
        data={filteredGuides}
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

export default HomeScreen;