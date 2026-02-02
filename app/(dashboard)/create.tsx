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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { guideService } from '../../services/guideService';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const initialFormState = {
    gameTitle: '',
    achievementName: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Very Hard',
    content: '',
    imageUri: null as string | null,
    estimatedTime: '',
    platforms: ['PC' as string],
  };
  
  const [formState, setFormState] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allGameTitles, setAllGameTitles] = useState<string[]>([]);

  const {
    gameTitle,
    achievementName,
    difficulty,
    content,
    imageUri,
    estimatedTime,
    platforms,
  } = formState;

  const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Very Hard')[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];

  useEffect(() => {
    loadExistingGameTitles();
  }, []);

  const loadExistingGameTitles = async () => {
    try {
      const guides = await guideService.getAllGuides();
      const uniqueGameTitles = Array.from(
        new Set(guides.map(guide => guide.gameTitle.trim()))
      ).filter(title => title.length > 0);
      
      uniqueGameTitles.sort((a, b) => a.localeCompare(b));
      setAllGameTitles(uniqueGameTitles);
    } catch (error) {
      console.error('Error loading game titles:', error);
    }
  };

  const updateGameTitle = (text: string) => {
    setFormState(prev => ({ ...prev, gameTitle: text }));
    
    if (text.trim().length >= 2) {
      const filtered = allGameTitles.filter(title =>
        title.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setFormState(prev => ({ ...prev, gameTitle: suggestion }));
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setSuggestions([]);
    setShowSuggestions(false);
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
      setFormState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
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
      setFormState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    if (!gameTitle.trim() || !achievementName.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'You need to be logged in to create a guide.');
      return;
    }

    try {
      const existingGuides = await guideService.getAllGuides();
      const duplicateExists = existingGuides.some(
        guide => 
          guide.gameTitle.toLowerCase() === gameTitle.trim().toLowerCase() &&
          guide.achievementName.toLowerCase() === achievementName.trim().toLowerCase()
      );

      if (duplicateExists) {
        Alert.alert(
          'Duplicate Guide',
          `A guide for "${gameTitle.trim()}" - "${achievementName.trim()}" already exists. Do you want to continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue Anyway', 
              onPress: () => createGuide()
            }
          ]
        );
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    }

    createGuide();
  };

  const createGuide = async () => {
    setLoading(true);
    try {
      const guideData = {
        gameTitle: gameTitle.trim(),
        achievementName: achievementName.trim(),
        content: content.trim(),
        difficulty,
        authorId: user!.uid,
        authorName: user!.displayName || user!.email?.split('@')[0] || 'Anonymous',
        estimatedTime: estimatedTime.trim() || undefined,
        platform: platforms,
      };

      await guideService.addGuide(guideData, imageUri || undefined);
      
      Alert.alert(
        'Success!',
        'Your achievement guide has been published to the community.',
        [
          {
            text: 'Create Another',
            onPress: () => {
              resetForm();
              loadExistingGameTitles();
            }
          },
          {
            text: 'View Guides',
            onPress: () => {
              resetForm();
              router.replace('/(dashboard)/tasks/home');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to publish guide. Please try again.');
      console.error('Error creating guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setFormState(prev => ({ 
        ...prev, 
        platforms: prev.platforms.filter(p => p !== platform) 
      }));
    } else {
      setFormState(prev => ({ 
        ...prev, 
        platforms: [...prev.platforms, platform] 
      }));
    }
  };

  const updateFormField = (field: keyof typeof initialFormState, value: any) => {
    if (field === 'gameTitle') {
      updateGameTitle(value);
    } else {
      setFormState(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 p-4" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="text-2xl font-bold text-white mb-2">Create New Guide</Text>
            <Text className="text-steam-gray">
              Share your achievement journey with the community
            </Text>
          </View>

          {/* Game Title with Auto-suggest */}
          <View className="mb-4 relative">
            <Text className="text-white font-bold mb-2">Game Title *</Text>
            <View>
              <TextInput
                placeholder="e.g., Cyberpunk 2077, Elden Ring"
                placeholderTextColor="#8b9cb3"
                value={gameTitle}
                onChangeText={(value) => updateFormField('gameTitle', value)}
                className="bg-steam-light text-white p-4 rounded-xl"
                returnKeyType="next"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <View className="absolute top-full left-0 right-0 z-10 mt-1 bg-steam-light border border-steam-accent/30 rounded-xl shadow-lg max-h-48 overflow-hidden">
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    className="max-h-48"
                  >
                    {suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => selectSuggestion(suggestion)}
                        className={`px-4 py-3 border-b border-steam-blue/30 ${
                          index === suggestions.length - 1 ? 'border-b-0' : ''
                        } active:bg-steam-blue/50`}
                      >
                        <View className="flex-row items-center">
                          <MaterialIcons 
                            name="videogame-asset" 
                            size={20} 
                            color="#66c0f4" 
                            className="mr-3"
                          />
                          <Text className="text-white flex-1">{suggestion}</Text>
                          <MaterialIcons 
                            name="arrow-drop-up" 
                            size={20} 
                            color="#66c0f4" 
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {/* Auto-suggest Info */}
              {showSuggestions && suggestions.length > 0 && (
                <View className="mt-2 p-2 bg-steam-blue/50 rounded-lg">
                  <Text className="text-steam-accent text-xs">
                    Found {suggestions.length} matching game{ suggestions.length > 1 ? 's' : '' }. 
                    Tap to select and ensure consistent naming.
                  </Text>
                </View>
              )}
              
              {/* Popular Games Quick Picks */}
              {gameTitle.length === 0 && (
                <View className="mt-3">
                  <Text className="text-steam-gray text-sm mb-2">Popular games:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row">
                      {allGameTitles.slice(0, 6).map((title, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => selectSuggestion(title)}
                          className="bg-steam-blue/50 px-3 py-2 rounded-lg mr-2"
                        >
                          <Text className="text-steam-accent text-sm">{title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Achievement Name */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Achievement Name *</Text>
            <TextInput
              placeholder="e.g., The World, Don't Fear the Reaper"
              placeholderTextColor="#8b9cb3"
              value={achievementName}
              onChangeText={(value) => updateFormField('achievementName', value)}
              className="bg-steam-light text-white p-4 rounded-xl"
              returnKeyType="next"
            />
          </View>

          {/* Difficulty */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Difficulty</Text>
            <View className="flex-row flex-wrap">
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => updateFormField('difficulty', diff)}
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
              onChangeText={(value) => updateFormField('estimatedTime', value)}
              className="bg-steam-light text-white p-4 rounded-xl"
              returnKeyType="next"
            />
          </View>

          {/* Screenshot Upload */}
          <View className="mb-4">
            <Text className="text-white font-bold mb-2">Screenshot (Optional)</Text>
            <Text className="text-steam-gray text-sm mb-3">
              Add a screenshot as proof or visual guide
            </Text>
            
            {imageUri ? (
              <View className="mb-3">
                <Image 
                  source={{ uri: imageUri }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => updateFormField('imageUri', null)}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : null}
            
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
              onChangeText={(value) => updateFormField('content', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-steam-light text-white p-4 rounded-xl min-h-[150px]"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          {/* Game Statistics */}
          {allGameTitles.includes(gameTitle.trim()) && (
            <View className="mb-6 bg-steam-light/50 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="info" size={20} color="#66c0f4" />
                <Text className="text-white font-bold ml-2">Game Information</Text>
              </View>
              <Text className="text-steam-accent">
                <MaterialIcons name="check-circle" size={16} color="#10B981" /> 
                <Text className="ml-2 text-green-400">
                  "{gameTitle.trim()}" already exists in our database!
                </Text>
              </Text>
              <Text className="text-steam-gray text-sm mt-1">
                Great choice! Other players have already shared guides for this game. 
                By using the same name, you're helping keep the community organized.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row mb-8 space-x-2">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Clear Form',
                  'Are you sure you want to clear all fields?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: resetForm
                    }
                  ]
                );
              }}
              className="flex-1 bg-steam-light p-4 rounded-xl items-center"
            >
              <MaterialIcons name="delete-sweep" size={20} color="#8b9cb3" />
              <Text className="text-steam-gray font-bold mt-1">Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`flex-2 ${
                loading ? 'bg-steam-accent/50' : 'bg-steam-accent'
              } p-4 rounded-xl items-center`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="text-white text-lg font-bold">
                  <MaterialIcons name="publish" size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-2">Publish Guide</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Status Indicator */}
          {(gameTitle || achievementName || content || imageUri) && (
            <View className="mb-4 p-3 bg-steam-light/50 rounded-xl">
              <Text className="text-steam-gray text-sm">
                <MaterialIcons name="edit" size={14} color="#66c0f4" /> 
                <Text className="ml-2">Form has unsaved changes</Text>
              </Text>
            </View>
          )}

          {/* Database Statistics */}
          <View className="mt-6 p-4 bg-steam-light rounded-xl">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="storage" size={24} color="#66c0f4" />
              <Text className="text-white font-bold ml-2">Community Database</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-steam-gray">Unique Games:</Text>
                <Text className="text-steam-accent font-bold">{allGameTitles.length}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-steam-gray">Your Contribution:</Text>
                <Text className="text-green-400 font-bold">
                  {allGameTitles.includes(gameTitle.trim()) ? 'Using existing game' : 'Adding new game'}
                </Text>
              </View>
              
              {!allGameTitles.includes(gameTitle.trim()) && gameTitle.trim().length > 0 && (
                <View className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Text className="text-blue-400 text-xs">
                    <MaterialIcons name="add-circle" size={14} color="#3B82F6" /> 
                    <Text className="ml-1">
                      You're adding "{gameTitle.trim()}" as a new game to our database!
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateScreen;