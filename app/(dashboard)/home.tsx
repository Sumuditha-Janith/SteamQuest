import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { guideService, Guide } from '../../services/guideService';
import GuideCard from '../../components/GuideCard';
import { router, useRouter } from 'expo-router';

const SearchBar = React.memo(({
  searchQuery,
  setSearchQuery,
  onClear,
}: {
  searchQuery: string,
  setSearchQuery: (text: string) => void,
  onClear: () => void,
}) => {
  return (
    <View className="bg-steam-light/80 border border-steam-light rounded-full px-5 py-1 flex-row items-center mb-6 shadow-sm">
      <MaterialIcons name="search" size={24} color="#66c0f4" />
      <TextInput
        placeholder="Search games or achievements..."
        placeholderTextColor="#8b9cb3"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="flex-1 ml-3 text-white text-lg"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="bg-steam-blue/50 rounded-full p-1"
        >
          <MaterialIcons name="close" size={24} color="#c7d5e0" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const TrendingGames = React.memo(({ onSelectGame }: { onSelectGame: (game: string) => void }) => {
  const popularGames = ['Red Dead Redemption 2', 'Assasin\'s Creed', 'Fallout: New Vegas', 'Tomb Raider', 'Grand Theft Auto', 'Far Cry'];
  
  return (
    <View className="mb-6">
      <Text className="text-white font-bold mb-3 text-lg">Trending Games</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
        {popularGames.map((game, index) => (
          <TouchableOpacity
            key={index}
            className="bg-steam-light border border-steam-light/50 px-4 py-2 rounded-full mr-3 active:bg-steam-light/80"
            onPress={() => onSelectGame(game)}
          >
            <Text className="text-steam-accent font-medium">{game}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const CommunityStats = React.memo(({ guides }: { guides: Guide[] }) => {
  const stats = { Easy: 0, Medium: 0, Hard: 0, 'Very Hard': 0 };
  
  if (guides) {
    guides.forEach(guide => {
      if (stats[guide.difficulty] !== undefined) {
        stats[guide.difficulty]++;
      }
    });
  }

  return (
    <View className="bg-steam-light/50 border border-steam-light rounded-3xl p-4 mb-6 flex-row justify-between items-center shadow-lg">
      <View className="items-center flex-1 border-r border-steam-blue/30">
        <Text className="text-3xl font-bold text-white">{guides.length}</Text>
        <Text className="text-steam-gray text-xs uppercase tracking-wider mt-1">Total Guides</Text>
      </View>
      <View className="flex-[2] flex-row justify-around">
        <View className="items-center">
          <View className="w-2 h-2 rounded-full bg-green-400 mb-1" />
          <Text className="text-white font-bold">{stats.Easy}</Text>
          <Text className="text-steam-gray text-[10px]">Easy</Text>
        </View>
        <View className="items-center">
          <View className="w-2 h-2 rounded-full bg-yellow-400 mb-1" />
          <Text className="text-white font-bold">{stats.Medium}</Text>
          <Text className="text-steam-gray text-[10px]">Med</Text>
        </View>
        <View className="items-center">
          <View className="w-2 h-2 rounded-full bg-red-400 mb-1" />
          <Text className="text-white font-bold">{stats.Hard}</Text>
          <Text className="text-steam-gray text-[10px]">Hard</Text>
        </View>
        <View className="items-center">
          <View className="w-2 h-2 rounded-full bg-purple-400 mb-1" />
          <Text className="text-white font-bold">{stats['Very Hard']}</Text>
          <Text className="text-steam-gray text-[10px]">Very H.</Text>
        </View>
      </View>
    </View>
  );
});

const HomeHeader = ({
  searchQuery,
  setSearchQuery,
  onClearSearch,
  guides
}: {
  searchQuery: string,
  setSearchQuery: (text: string) => void,
  onClearSearch: () => void,
  guides: Guide[]
}) => {
  return (
    <View className="pt-2 px-4 pb-2">
      <View className="mb-6">
        {/* Title Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-extrabold text-white">
            Steam<Text className="text-steam-accent">Quest</Text>
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/tasks/settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-2 rounded-full"
          >
            <MaterialIcons name="settings" size={26} color="#c7d5e0" />
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text className="text-steam-gray text-base mt-1">
          Master every achievement.
        </Text>
      </View>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onClear={onClearSearch}
      />

      {!searchQuery && (
        <>
          <CommunityStats guides={guides} />
          <TrendingGames onSelectGame={setSearchQuery} />
          <Text className="text-white font-bold mb-4 text-xl">Recent Guides</Text>
        </>
      )}
    </View>
  );
};

const HomeScreen = () => {
  const router = useRouter();
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGuides();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleVoteUpdate = useCallback((guideId: string, updatedGuide: Guide) => {
    setGuides(prev =>
      prev.map(guide => guide.id === guideId ? updatedGuide : guide)
    );
    setFilteredGuides(prev =>
      prev.map(guide => guide.id === guideId ? updatedGuide : guide)
    );
  }, []);

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-6">
      <View className="w-24 h-24 bg-steam-light rounded-full items-center justify-center mb-6">
        <MaterialIcons name="sports-esports" size={48} color="#66c0f4" />
      </View>
      <Text className="text-white text-xl font-bold text-center">
        {searchQuery ? 'No matching guides found' : 'No Guides Yet'}
      </Text>
      <Text className="text-steam-gray text-center mt-3 leading-6 max-w-xs">
        {searchQuery
          ? 'Try adjusting your search terms or look for a different game.'
          : 'Be the first legend to contribute a guide to the community!'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          className="bg-steam-accent px-8 py-3 rounded-xl mt-8 shadow-lg shadow-steam-accent/20"
          onPress={() => router.push('/(dashboard)/create')}
        >
          <Text className="text-white font-bold text-lg">Create First Guide</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View className="px-4 pb-2">
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
        <Text className="text-steam-accent mt-4 font-medium">Loading quests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <FlatList
        data={filteredGuides}
        renderItem={renderGuideItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <HomeHeader
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            onClearSearch={handleClearSearch}
            guides={guides}
          />
        }
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
};

export default HomeScreen;