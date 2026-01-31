import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guideService, Guide } from '../../../services/guideService';

const GuideDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGuide();
    }
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await guideService.getGuideById(id);
      setGuide(fetchedGuide);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guide details.');
      console.error('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!guide) return;
    
    try {
      await Share.share({
        message: `Check out this achievement guide for ${guide.gameTitle}: ${guide.achievementName}\n\n${guide.content}`,
        title: `${guide.gameTitle} - ${guide.achievementName}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      case 'Very Hard': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-steam-blue justify-center items-center">
        <ActivityIndicator size="large" color="#66c0f4" />
        <Text className="text-steam-accent mt-4">Loading guide...</Text>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView className="flex-1 bg-steam-blue justify-center items-center p-4">
        <MaterialIcons name="error" size={80} color="#EF4444" />
        <Text className="text-white text-xl font-bold mt-4">Guide Not Found</Text>
        <Text className="text-steam-gray text-center mt-2">
          The guide you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          className="bg-steam-accent px-6 py-3 rounded-xl mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View className="p-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare}>
            <MaterialIcons name="share" size={24} color="#66c0f4" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Game and Achievement */}
          <Text className="text-2xl font-bold text-white mb-2">
            {guide.gameTitle}
          </Text>
          <Text className="text-steam-accent text-xl font-semibold mb-4">
            {guide.achievementName}
          </Text>

          {/* Difficulty and Platform */}
          <View className="flex-row flex-wrap items-center mb-6">
            <View 
              className="px-3 py-1 rounded-full mr-2 mb-2"
              style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
            >
              <Text className="text-white font-bold">
                {guide.difficulty}
              </Text>
            </View>
            
            {guide.platform?.map((platform) => (
              <View key={platform} className="px-3 py-1 bg-steam-light rounded-full mr-2 mb-2">
                <Text className="text-steam-gray">{platform}</Text>
              </View>
            ))}
            
            {guide.estimatedTime && (
              <View className="px-3 py-1 bg-steam-light rounded-full mr-2 mb-2">
                <MaterialIcons name="access-time" size={14} color="#66c0f4" />
                <Text className="text-steam-accent ml-1">{guide.estimatedTime}</Text>
              </View>
            )}
          </View>

          {/* Author Info */}
          <View className="bg-steam-light rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="person" size={20} color="#66c0f4" />
              <Text className="text-steam-accent ml-2 font-bold">
                {guide.authorName}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="calendar-today" size={20} color="#8b9cb3" />
              <Text className="text-steam-gray ml-2">
                Posted on {new Date(guide.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {guide.updatedAt && (
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="update" size={20} color="#8b9cb3" />
                <Text className="text-steam-gray ml-2">
                  Updated on {new Date(guide.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Guide Content */}
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">Guide Steps</Text>
            <View className="bg-steam-light rounded-xl p-4">
              <Text className="text-white leading-6">
                {guide.content}
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4 flex-row items-center">
              <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
              <Text className="ml-2">Pro Tips</Text>
            </Text>
            <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <Text className="text-yellow-300">
                • Make sure to save your game before attempting difficult sections{'\n'}
                • Some achievements may require specific character builds or items{'\n'}
                • Check for any time-sensitive requirements{'\n'}
                • Consider playing on easier difficulties if available
              </Text>
            </View>
          </View>

          {/* Community Notes */}
          <View className="mb-8">
            <Text className="text-white text-lg font-bold mb-4">Community Notes</Text>
            <View className="bg-steam-light rounded-xl p-4">
              <Text className="text-steam-gray text-center">
                No comments yet. Be the first to share your experience!
              </Text>
              <TouchableOpacity className="bg-steam-accent py-3 rounded-lg mt-4">
                <Text className="text-white text-center font-bold">Add Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuideDetailScreen;