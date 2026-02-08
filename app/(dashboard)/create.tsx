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
import { useAuth } from '../../context/AuthContext';
import { guideService } from '../../services/guideService';
import { useRouter } from 'expo-router';

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const initialFormState = {
    gameTitle: '',
    achievementName: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Very Hard',
    content: '',
    imageUri: null as string | null,
    estimatedTime: { value: '', unit: 'Minutes' as 'Minutes' | 'Hours' },
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
  const timeUnits = ['Minutes', 'Hours'];

  useEffect(() => {
    loadExistingGameTitles();
  }, []);

  useEffect(() => {
    if (gameTitle.trim().length >= 2) {
      const filtered = allGameTitles.filter(title =>
        title.toLowerCase().includes(gameTitle.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [gameTitle, allGameTitles]);

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
      Alert.alert('Permission required', 'We need access to your photos to upload images.');
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
      Alert.alert('Permission required', 'We need camera access to take photos.');
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
    
    if (estimatedTime.value && isNaN(parseInt(estimatedTime.value))) {
      Alert.alert('Invalid Time', 'Please enter a valid number for estimated time.');
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
          `A guide for "${gameTitle.trim()}" - "${achievementName.trim()}" already exists.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue Anyway', onPress: () => createGuide() }
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
        estimatedTime: estimatedTime.value ? `${estimatedTime.value} ${estimatedTime.unit}` : undefined,
        platform: platforms,
      };
      await guideService.addGuide(guideData, imageUri || undefined);
      
      const newGameTitle = gameTitle.trim();
      if (newGameTitle && !allGameTitles.includes(newGameTitle)) {
        setAllGameTitles(prev => [...prev, newGameTitle].sort());
      }

      Alert.alert(
        'Success!',
        'Your achievement guide has been published.',
        [
          { text: 'Create Another', onPress: () => resetForm() },
          { text: 'View Guides', onPress: () => { resetForm(); router.replace('/(dashboard)/home'); } }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to publish guide. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setFormState(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform) }));
    } else {
      setFormState(prev => ({ ...prev, platforms: [...prev.platforms, platform] }));
    }
  };

  const updateFormField = (field: keyof typeof initialFormState, value: any) => {
    if (field === 'gameTitle') {
      updateGameTitle(value);
    } else if (field === 'estimatedTime') {
      if (typeof value === 'object') {
        setFormState(prev => ({ ...prev, estimatedTime: { ...prev.estimatedTime, ...value } }));
      }
    } else {
      setFormState(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateEstimatedTimeValue = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setFormState(prev => ({ 
      ...prev, 
      estimatedTime: { ...prev.estimatedTime, value: numericValue } 
    }));
  };

  const updateEstimatedTimeUnit = (unit: 'Minutes' | 'Hours') => {
    setFormState(prev => ({ 
      ...prev, 
      estimatedTime: { ...prev.estimatedTime, unit } 
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-white mb-2">Create Guide</Text>
            <Text className="text-steam-gray">Share your knowledge with the world.</Text>
          </View>

          {/* Game Title */}
          <View className="mb-5 relative z-20">
            <Text className="text-white font-semibold mb-2 ml-1">Game Title <Text className="text-red-400">*</Text></Text>
            <View>
              <TextInput
                placeholder="e.g., Cyberpunk 2077"
                placeholderTextColor="#8b9cb3"
                value={gameTitle}
                onChangeText={(value) => updateFormField('gameTitle', value)}
                className="bg-steam-light border border-steam-light rounded-xl text-white p-4 text-base"
              />
              {showSuggestions && suggestions.length > 0 && (
                <View className="absolute top-full left-0 right-0 mt-1 bg-steam-light border border-steam-accent/30 rounded-xl shadow-lg z-50">
                  {suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectSuggestion(suggestion)}
                      className={`p-4 border-b border-steam-blue/30 ${index === suggestions.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <Text className="text-white">{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Achievement Name */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 ml-1">Achievement Name <Text className="text-red-400">*</Text></Text>
            <TextInput
              placeholder="e.g., The World"
              placeholderTextColor="#8b9cb3"
              value={achievementName}
              onChangeText={(value) => updateFormField('achievementName', value)}
              className="bg-steam-light border border-steam-light rounded-xl text-white p-4 text-base"
            />
          </View>

          {/* Difficulty */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 ml-1">Difficulty</Text>
            <View className="flex-row flex-wrap gap-2">
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => updateFormField('difficulty', diff)}
                  className={`px-5 py-2.5 rounded-full border ${
                    difficulty === diff ? 'bg-steam-accent border-steam-accent' : 'bg-steam-light border-steam-light'
                  }`}
                >
                  <Text className={`font-semibold ${difficulty === diff ? 'text-white' : 'text-steam-gray'}`}>{diff}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Platform */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 ml-1">Platform</Text>
            <View className="flex-row flex-wrap gap-2">
              {['PC', 'PlayStation', 'Xbox', 'Switch'].map((platform) => (
                <TouchableOpacity
                  key={platform}
                  onPress={() => togglePlatform(platform)}
                  className={`px-4 py-2 rounded-full flex-row items-center border ${
                    platforms.includes(platform) ? 'bg-steam-accent/20 border-steam-accent' : 'bg-steam-light border-steam-light'
                  }`}
                >
                   {platforms.includes(platform) && <MaterialIcons name="check" size={14} color="#66c0f4" style={{marginRight: 4}} />}
                  <Text className={platforms.includes(platform) ? 'text-steam-accent font-semibold' : 'text-steam-gray'}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Time */}
          <View className="mb-5">
            <Text className="text-white font-semibold mb-2 ml-1">Estimated Time</Text>
            <View className="flex-row items-center space-x-3">
              <View className="flex-1">
                <TextInput
                  placeholder="e.g., 25"
                  placeholderTextColor="#8b9cb3"
                  value={estimatedTime.value}
                  onChangeText={updateEstimatedTimeValue}
                  keyboardType="numeric"
                  className="bg-steam-light border border-steam-light rounded-xl text-white p-4 text-base"
                />
              </View>
              <View className="flex-row">
                {timeUnits.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    onPress={() => updateEstimatedTimeUnit(unit as 'Minutes' | 'Hours')}
                    className={`px-4 py-3 rounded-full border ml-2 ${
                      estimatedTime.unit === unit ? 'bg-steam-accent border-steam-accent' : 'bg-steam-light border-steam-light'
                    }`}
                  >
                    <Text className={estimatedTime.unit === unit ? 'text-white font-semibold' : 'text-steam-gray'}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text className="text-steam-gray text-xs mt-1 ml-1">
              Leave empty if not applicable
            </Text>
          </View>

          {/* Image Upload */}
          <View className="mb-6">
            <Text className="text-white font-semibold mb-2 ml-1">Visual Guide (Optional)</Text>
            <View className="bg-steam-light border border-steam-light rounded-xl overflow-hidden">
                {imageUri ? (
                    <View>
                        <Image source={{ uri: imageUri }} className="w-full h-48" resizeMode="cover" />
                        <TouchableOpacity 
                            onPress={() => updateFormField('imageUri', null)}
                            className="absolute top-2 right-2 bg-black/60 rounded-full p-2"
                        >
                            <MaterialIcons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="h-40 justify-center items-center border-2 border-dashed border-steam-blue/50 rounded-xl m-2 bg-steam-blue/20">
                        <MaterialIcons name="add-photo-alternate" size={40} color="#2a475e" />
                        <Text className="text-steam-gray mt-2">Add a screenshot</Text>
                    </View>
                )}
                
                <View className="flex-row border-t border-steam-blue/50">
                    <TouchableOpacity onPress={handleSelectImage} className="flex-1 p-4 items-center border-r border-steam-blue/50 active:bg-steam-blue/50">
                         <View className="flex-row items-center">
                            <MaterialIcons name="photo-library" size={20} color="#66c0f4" />
                            <Text className="text-steam-accent ml-2 font-medium">Gallery</Text>
                         </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleTakePhoto} className="flex-1 p-4 items-center active:bg-steam-blue/50">
                         <View className="flex-row items-center">
                            <MaterialIcons name="camera-alt" size={20} color="#66c0f4" />
                            <Text className="text-steam-accent ml-2 font-medium">Camera</Text>
                         </View>
                    </TouchableOpacity>
                </View>
            </View>
          </View>

          {/* Content */}
          <View className="mb-8">
            <Text className="text-white font-semibold mb-2 ml-1">Guide Instructions <Text className="text-red-400">*</Text></Text>
            <TextInput
              placeholder="Describe step-by-step how to unlock this achievement..."
              placeholderTextColor="#8b9cb3"
              value={content}
              onChangeText={(value) => updateFormField('content', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-steam-light border border-steam-light rounded-xl text-white p-4 min-h-[160px] text-base leading-6"
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mb-10">
            <TouchableOpacity
              onPress={() => Alert.alert('Clear', 'Clear all fields?', [{text: 'Cancel'}, {text: 'Clear', onPress: resetForm, style: 'destructive'}])}
              className="flex-1 bg-steam-light py-4 rounded-xl items-center justify-center border border-steam-light active:opacity-80"
            >
              <Text className="text-steam-gray font-bold">Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="flex-[2] bg-steam-accent py-4 rounded-xl items-center justify-center shadow-lg shadow-steam-accent/20 active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <MaterialIcons name="publish" size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-2">Publish Guide</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateScreen;