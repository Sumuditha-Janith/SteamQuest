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
  const [estimatedTime, setEstimatedTime] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['PC']);
  
  const difficulties: ('Easy' | 'Medium' | 'Hard' | 'Very Hard')[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];

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
      setEstimatedTime(fetchedGuide.estimatedTime || '');
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
    if (!gameTitle.trim() || !achievementName.trim() || !content.trim()) return;
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
      const newImageUri = imageUri === guide?.imageUrl ? undefined : imageUri || undefined;
      await guideService.updateGuide(guide!.id, updateData, newImageUri);
      Alert.alert('Success', 'Guide updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) { Alert.alert('Error', 'Failed to update.'); } finally { setUpdating(false); }
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
            <Text className="text-white font-semibold mb-2">Game Title</Text>
            <TextInput value={gameTitle} onChangeText={setGameTitle} className="bg-steam-light rounded-xl text-white p-4" placeholderTextColor="#8b9cb3" />
          </View>

          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Achievement Name</Text>
            <TextInput value={achievementName} onChangeText={setAchievementName} className="bg-steam-light rounded-xl text-white p-4" placeholderTextColor="#8b9cb3" />
          </View>

          <View className="mb-4">
            <Text className="text-white font-semibold mb-2">Difficulty</Text>
            <View className="flex-row flex-wrap gap-2">
                {difficulties.map(diff => (
                    <TouchableOpacity key={diff} onPress={() => setDifficulty(diff)} className={`px-4 py-2 rounded-full border ${difficulty === diff ? 'bg-steam-accent border-steam-accent' : 'bg-steam-light border-steam-light'}`}>
                        <Text className={difficulty === diff ? 'text-white font-bold' : 'text-steam-gray'}>{diff}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <View className="mb-4">
             <Text className="text-white font-semibold mb-2">Cover Image</Text>
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
            <Text className="text-white font-semibold mb-2">Content</Text>
            <TextInput value={content} onChangeText={setContent} multiline className="bg-steam-light rounded-xl text-white p-4 min-h-[150px]" textAlignVertical="top" placeholderTextColor="#8b9cb3" />
          </View>

          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="flex-1 bg-steam-light py-4 rounded-xl items-center">
                <Text className="text-steam-gray font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={updating} className="flex-1 bg-steam-accent py-4 rounded-xl items-center">
                {updating ? <ActivityIndicator color="white"/> : <Text className="text-white font-bold">Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditScreen;