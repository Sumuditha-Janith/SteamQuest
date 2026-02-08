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
import { useNavigation } from '@react-navigation/native';

const EditScreen = () => {
  const navigation = useNavigation();
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
  const [estimatedTime, setEstimatedTime] = useState<{ value: string, unit: 'Minutes' | 'Hours' }>({ value: '', unit: 'Minutes' });
  const [platforms, setPlatforms] = useState<string[]>(['PC']);
  
  const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Very Hard')[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];
  const timeUnits = ['Minutes', 'Hours'];

  useEffect(() => {
    if (id) fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const fetchedGuide = await guideService.getGuideById(id);
      if (!fetchedGuide || fetchedGuide.authorId !== user?.uid) {
        Alert.alert('Error', 'Guide not found or unauthorized');
        router.back();
        return;
      }
      setGuide(fetchedGuide);
      setGameTitle(fetchedGuide.gameTitle);
      setAchievementName(fetchedGuide.achievementName);
      setDifficulty(fetchedGuide.difficulty);
      setContent(fetchedGuide.content);
      setImageUri(fetchedGuide.imageUrl || null);
      
      if (fetchedGuide.estimatedTime) {
        const parts = fetchedGuide.estimatedTime.split(' ');
        if (parts.length === 2) {
          setEstimatedTime({ 
            value: parts[0], 
            unit: (parts[1] === 'Minutes' || parts[1] === 'Hours') ? parts[1] as 'Minutes' | 'Hours' : 'Minutes' 
          });
        }
      }
      
      setPlatforms(fetchedGuide.platform || ['PC']);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!gameTitle.trim() || !achievementName.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    if (estimatedTime.value && isNaN(parseInt(estimatedTime.value))) {
      Alert.alert('Invalid Time', 'Please enter a valid number for estimated time.');
      return;
    }
    
    setUpdating(true);
    try {
      const updateData = {
        gameTitle: gameTitle.trim(),
        achievementName: achievementName.trim(),
        content: content.trim(),
        difficulty,
        estimatedTime: estimatedTime.value ? `${estimatedTime.value} ${estimatedTime.unit}` : undefined,
        platform: platforms,
      };
      const newImageUri = imageUri === guide?.imageUrl ? undefined : imageUri || undefined;
      await guideService.updateGuide(guide!.id, updateData, newImageUri);
      Alert.alert('Success', 'Guide updated.', [{ text: 'OK', onPress: () => router.replace('/(dashboard)/home') }]);
    } catch (error) { Alert.alert('Error', 'Failed to update.'); } finally { setUpdating(false); }
  };

  const updateEstimatedTimeValue = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setEstimatedTime(prev => ({ ...prev, value: numericValue }));
  };

  const updateEstimatedTimeUnit = (unit: 'Minutes' | 'Hours') => {
    setEstimatedTime(prev => ({ ...prev, unit }));
  };

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setPlatforms(prev => [...prev, platform]);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#66c0f4" className="flex-1 bg-steam-blue"/>;

  return (
    <SafeAreaView className="flex-1 bg-steam-blue" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
             <Text className="text-2xl font-bold text-white">Edit Guide</Text>
             <Text className="text-steam-gray">Make corrections or add new info.</Text>
          </View>

          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Game Title <Text className="text-red-400">*</Text></Text>
            <TextInput 
              value={gameTitle} 
              onChangeText={setGameTitle} 
              className="bg-steam-light rounded-xl text-white p-4" 
              placeholderTextColor="#8b9cb3" 
            />
          </View>

          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Achievement Name <Text className="text-red-400">*</Text></Text>
            <TextInput 
              value={achievementName} 
              onChangeText={setAchievementName} 
              className="bg-steam-light rounded-xl text-white p-4" 
              placeholderTextColor="#8b9cb3" 
            />
          </View>

          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Difficulty</Text>
            <View className="flex-row flex-wrap gap-2">
                {difficulties.map(diff => (
                    <TouchableOpacity 
                      key={diff} 
                      onPress={() => setDifficulty(diff)} 
                      className={`px-4 py-2 rounded-full border ${
                        difficulty === diff ? 'bg-steam-accent border-steam-accent' : 'bg-steam-light border-steam-light'
                      }`}
                    >
                        <Text className={difficulty === diff ? 'text-white font-bold' : 'text-steam-gray'}>{diff}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Platform */}
          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Platform</Text>
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
          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Estimated Time</Text>
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

          <View className="mb-4">
             <Text className="text-white font-semibold mb-2">Cover Image (Optional)</Text>
             <TouchableOpacity onPress={handleSelectImage} className="h-40 bg-steam-light rounded-xl overflow-hidden justify-center items-center border border-steam-light/50">
                 {imageUri ? (
                     <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                 ) : (
                     <View className="items-center">
                         <MaterialIcons name="add-photo-alternate" size={30} color="#66c0f4"/>
                         <Text className="text-steam-accent mt-2">Change Image</Text>
                     </View>
                 )}
             </TouchableOpacity>
          </View>

          <View className="mb-8">
            <Text className="text-white font-semibold mb-2">Guide Instructions <Text className="text-red-400">*</Text></Text>
            <TextInput 
              value={content} 
              onChangeText={setContent} 
              multiline 
              className="bg-steam-light rounded-xl text-white p-4 min-h-[150px]" 
              textAlignVertical="top" 
              placeholderTextColor="#8b9cb3" 
            />
          </View>

          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
              onPress={() => router.push('/(dashboard)/profile')} 
              className="flex-1 bg-steam-light py-4 rounded-xl items-center"
            >
                <Text className="text-steam-gray font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={updating} 
              className="flex-1 bg-steam-accent py-4 rounded-xl items-center"
            >
                {updating ? <ActivityIndicator color="white"/> : <Text className="text-white font-bold">Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditScreen;