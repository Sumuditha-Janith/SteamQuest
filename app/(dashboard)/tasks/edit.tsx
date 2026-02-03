import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import { guideService, Guide } from '../../../services/guideService';
import { useRouter, useLocalSearchParams } from 'expo-router';

const EditScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [guide, setGuide] = useState<Guide | null>(null);
  
  const [gameTitle, setGameTitle] = useState('');
  const [achievementName, setAchievementName] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Very Hard'>('Medium');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['PC']);
  
  const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Very Hard')[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];

  useEffect(() => {
    if (id) {
      fetchGuide();
    }
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await guideService.getGuideById(id);
      
      if (!fetchedGuide) {
        Alert.alert('Error', 'Guide not found');
        router.back();
        return;
      }
      
      if (fetchedGuide.authorId !== user?.uid) {
        Alert.alert('Error', 'You can only edit your own guides');
        router.back();
        return;
      }
      
      setGuide(fetchedGuide);
      setGameTitle(fetchedGuide.gameTitle);
      setAchievementName(fetchedGuide.achievementName);
      setDifficulty(fetchedGuide.difficulty);
      setContent(fetchedGuide.content);
      setImageUri(fetchedGuide.imageUrl || null);
      setEstimatedTime(fetchedGuide.estimatedTime || '');
      setPlatforms(fetchedGuide.platform || ['PC']);
    } catch (error) {
      Alert.alert('Error', 'Failed to load guide');
      console.error('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera access to take screenshots.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleSubmit = async () => {
    if (!gameTitle.trim() || !achievementName.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!user || !guide) {
      Alert.alert('Authentication Required', 'You need to be logged in to edit a guide.');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        gameTitle: gameTitle.trim(),
        achievementName: achievementName.trim(),
        content: content.trim(),
        difficulty,
        estimatedTime: estimatedTime.trim() || undefined,
        platform: platforms,
      };

      const newImageUri = imageUri === guide.imageUrl ? undefined : imageUri || undefined;
      
      await guideService.updateGuide(guide.id, updateData, newImageUri);
      
      Alert.alert(
        'Success!',
        'Your achievement guide has been updated.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update guide. Please try again.');
      console.error('Error updating guide:', error);
    } finally {
      setUpdating(false);
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

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <Text className="text-2xl font-bold text-white mb-2">Edit Guide</Text>
            <Text className="text-steam-gray">
              Update your achievement guide
            </Text>
          </View>

          {/* Game Title */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Game Title *</Text>
            <TextInput
              placeholder="e.g., Cyberpunk 2077, Elden Ring"
              placeholderTextColor="#8b9cb3"
              value={gameTitle}
              onChangeText={setGameTitle}
              className="bg-steam-light text-white p-4 rounded-xl"
            />
          </View>

          {/* Achievement Name */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Achievement Name *</Text>
            <TextInput
              placeholder="e.g., The World, Don't Fear the Reaper"
              placeholderTextColor="#8b9cb3"
              value={achievementName}
              onChangeText={setAchievementName}
              className="bg-steam-light text-white p-4 rounded-xl"
            />
          </View>

          {/* Difficulty */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Difficulty</Text>
            <View className="flex-row flex-wrap">
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    difficulty === diff ? 'bg-steam-accent' : 'bg-steam-light'
                  }`}
                >
                  <Text className={difficulty === diff ? 'text-white font-bold' : 'text-steam-gray'}>
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Platform */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Platform</Text>
            <View className="flex-row flex-wrap">
              {['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'].map((platform) => (
                <TouchableOpacity
                  key={platform}
                  onPress={() => togglePlatform(platform)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    platforms.includes(platform) ? 'bg-steam-accent' : 'bg-steam-light'
                  }`}
                >
                  <Text className={platforms.includes(platform) ? 'text-white font-bold' : 'text-steam-gray'}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Time */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Estimated Time</Text>
            <TextInput
              placeholder="e.g., 2-3 hours, 30 minutes"
              placeholderTextColor="#8b9cb3"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
              className="bg-steam-light text-white p-4 rounded-xl"
            />
          </View>

          {/* Screenshot Upload */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Screenshot</Text>
            <Text className="text-steam-gray text-sm mb-3">
              Update the screenshot (optional)
            </Text>

            {imageUri && imageUri !== 'https://i.ibb.co/HTq3q83z/steamquestdefault2.jpg' ? (
              <View className="mb-3">
                <Image 
                  source={{ uri: imageUri }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setImageUri('https://i.ibb.co/HTq3q83z/steamquestdefault2.jpg')}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-3">
                <View className="w-full h-48 bg-steam-blue justify-center items-center rounded-xl border-2 border-dashed border-steam-accent/50">
                  <MaterialIcons name="image" size={60} color="#2a475e" />
                  <Text className="text-steam-accent mt-2">Using default image</Text>
                </View>
              </View>
            )}

            <View className="flex-row">
              <TouchableOpacity
                onPress={handleSelectImage}
                className="flex-1 bg-steam-light p-4 rounded-xl mr-2 items-center"
              >
                <MaterialIcons name="photo-library" size={24} color="#66c0f4" />
                <Text className="text-steam-accent mt-2">Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-1 bg-steam-light p-4 rounded-xl ml-2 items-center"
              >
                <MaterialIcons name="camera-alt" size={24} color="#66c0f4" />
                <Text className="text-steam-accent mt-2">Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guide Content */}
          <View className="mb-6">
            <Text className="text-white font-bold mb-2">Guide Steps *</Text>
            <TextInput
              placeholder="Provide step-by-step instructions for unlocking this achievement..."
              placeholderTextColor="#8b9cb3"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-steam-light text-white p-4 rounded-xl min-h-[150px]"
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-steam-light p-4 rounded-xl mr-2 items-center"
            >
              <Text className="text-steam-gray font-bold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={updating}
              className={`flex-1 ${
                updating ? 'bg-steam-accent/50' : 'bg-steam-accent'
              } p-4 rounded-xl ml-2 items-center`}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Update Guide</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditScreen;