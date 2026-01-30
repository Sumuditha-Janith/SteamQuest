import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Guide } from '../services/guideService';

interface GuideCardProps {
  guide: Guide;
  showActions?: boolean;
  onDelete?: () => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, showActions = false, onDelete }) => {
  const router = useRouter();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      case 'Very Hard': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const handlePress = () => {
    router.push({
      pathname: '/(dashboard)/tasks/guidedetails',
      params: { id: guide.id }
    } as any);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="bg-steam-light rounded-xl mb-4 overflow-hidden shadow-lg"
    >
      {guide.imageUrl ? (
        <Image 
          source={{ uri: guide.imageUrl }}
          style={styles.image}
          className="w-full h-40"
        />
      ) : (
        <View className="w-full h-40 bg-steam-blue justify-center items-center">
          <MaterialIcons name="sports-esports" size={60} color="#66c0f4" />
          <Text className="text-steam-accent mt-2">No Screenshot</Text>
        </View>
      )}
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-white text-lg font-bold" numberOfLines={1}>
              {guide.gameTitle}
            </Text>
            <Text className="text-steam-accent text-base font-semibold mb-1" numberOfLines={1}>
              {guide.achievementName}
            </Text>
          </View>
          
          <View className="flex-row items-center ml-2">
            <View 
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
            >
              <Text className="text-white text-xs font-bold">
                {guide.difficulty}
              </Text>
            </View>
          </View>
        </View>
        
        <Text className="text-steam-gray text-sm mb-3" numberOfLines={2}>
          {guide.content}
        </Text>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <MaterialIcons name="person" size={16} color="#66c0f4" />
            <Text className="text-steam-accent ml-1 text-sm">
              {guide.authorName}
            </Text>
          </View>
          
          <Text className="text-steam-gray text-xs">
            {new Date(guide.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        {showActions && onDelete && (
          <View className="mt-3 pt-3 border-t border-steam-blue">
            <TouchableOpacity
              onPress={onDelete}
              className="bg-red-500/20 py-2 rounded-lg flex-row justify-center items-center"
            >
              <MaterialIcons name="delete" size={18} color="#EF4444" />
              <Text className="text-red-400 ml-2 font-semibold">Delete Guide</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
});

export default GuideCard;