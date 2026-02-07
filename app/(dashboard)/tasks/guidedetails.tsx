import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { guideService, Guide } from '../../../services/guideService';
import { useAuth } from '../../../context/AuthContext';
import VoteButtons from '../../../components/VoteButtons';
import CommentSection from '../../../components/CommentSection';

const DEFAULT_IMAGE_URL = 'https://i.ibb.co/HTq3q83z/steamquestdefault2.jpg';

const GuideDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await guideService.getGuideById(id);
      setGuide(fetchedGuide);
    } catch (error) { Alert.alert('Error', 'Failed to load guide details.'); } finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (!guide) return;
    try {
      await Share.share({
        message: `SteamQuest Guide: ${guide.gameTitle} - ${guide.achievementName}\n\n${guide.content.substring(0, 100)}...`,
        title: `${guide.gameTitle} Guide`,
      });
    } catch (error) { console.error(error); }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-steam-blue justify-center items-center">
        <ActivityIndicator size="large" color="#66c0f4" />
      </SafeAreaView>
    );
  }

  if (!guide) return null;

  return (
    <View className="flex-1 bg-steam-blue">
      {/* Custom Header Bar */}
      <SafeAreaView edges={['top']} className="absolute top-0 w-full z-10 flex-row justify-between p-4">
        <TouchableOpacity onPress={() => router.back()} className="bg-steam-blue/50 p-2 rounded-full backdrop-blur-sm">
            <MaterialIcons name="arrow-back" size={24} color="#white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} className="bg-steam-blue/50 p-2 rounded-full backdrop-blur-sm">
            <MaterialIcons name="share" size={24} color="#white" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View className="h-72 w-full relative">
            <Image 
                source={{ uri: guide.imageUrl && guide.imageUrl !== DEFAULT_IMAGE_URL ? guide.imageUrl : DEFAULT_IMAGE_URL }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" />
            <View className="absolute bottom-0 w-full bg-gradient-to-t from-steam-blue to-transparent h-32" />
            
            <View className="absolute bottom-6 left-4 right-4">
                <View className="flex-row items-center mb-2 space-x-2">
                    <View className="bg-steam-accent/80 px-2 py-1 rounded text-xs">
                        <Text className="text-white text-xs font-bold uppercase">{guide.platform?.[0] || 'PC'}</Text>
                    </View>
                    <View className="bg-black/50 px-2 py-1 rounded">
                         <Text className="text-white text-xs font-bold">{guide.difficulty}</Text>
                    </View>
                </View>
                <Text className="text-3xl font-extrabold text-white shadow-lg">{guide.achievementName}</Text>
                <Text className="text-steam-accent text-lg font-bold shadow-lg">{guide.gameTitle}</Text>
            </View>
        </View>

        {/* Content Body */}
        <View className="px-5 pb-10">
            {/* Meta Data Row */}
            <View className="flex-row items-center justify-between mb-6 border-b border-steam-light/30 pb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-steam-light rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-bold text-lg">{guide.authorName?.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text className="text-white font-semibold">By {guide.authorName}</Text>
                        <Text className="text-steam-gray text-xs">{new Date(guide.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                {guide.estimatedTime && (
                    <View className="items-end">
                        <Text className="text-steam-gray text-xs">Est. Time</Text>
                        <Text className="text-white font-semibold">{guide.estimatedTime}</Text>
                    </View>
                )}
            </View>

            {/* Voting */}
            <View className="mb-6 flex-row justify-between items-center">
                 <VoteButtons guide={guide} onVoteUpdate={setGuide} />
                 {user?.uid === guide.authorId && (
                     <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/(dashboard)/tasks/edit', params: { id: guide.id } } as any)}
                        className="bg-steam-light p-2 rounded-lg border border-steam-light/50"
                     >
                        <MaterialIcons name="edit" size={20} color="#66c0f4" />
                     </TouchableOpacity>
                 )}
            </View>

            {/* Main Content */}
            <View className="bg-steam-light/30 rounded-2xl p-5 mb-8 border border-steam-light/20">
                <Text className="text-white text-lg leading-8">{guide.content}</Text>
            </View>

            {/* Comments */}
            <CommentSection guideId={guide.id} />
        </View>
      </ScrollView>
    </View>
  );
};

export default GuideDetailScreen;