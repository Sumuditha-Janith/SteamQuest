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
import VoteButtons from './VoteButtons';

interface GuideCardProps {
  guide: Guide;
  showActions?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onVoteUpdate?: (updatedGuide: Guide) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ 
  guide, 
  showActions = false, 
  onDelete, 
  onEdit,
  onVoteUpdate 
}) => {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Hard': return 'bg-red-500/20 text-red-400';
      case 'Very Hard': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const diffStyle = getDifficultyColor(guide.difficulty);
  const [bgClass, textClass] = diffStyle.split(' ');

  const handlePress = () => {
    router.push({
      pathname: '/(dashboard)/tasks/guidedetails',
      params: { id: guide.id }
    } as any);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.9}
      className="bg-steam-light rounded-2xl mb-5 overflow-hidden shadow-md shadow-black/40 border border-steam-light/50"
    >
      <View className="h-44 w-full bg-steam-blue relative">
          {guide.imageUrl && guide.imageUrl !== 'https://i.ibb.co/8nHp9Z0V/steamquestdark.jpg' ? (
            <Image 
              source={{ uri: guide.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-steam-blue/80">
              <MaterialIcons name="gamepad" size={48} color="#2a475e" />
            </View>
          )}
          
          {/* Difficulty Badge Overlay */}
          <View className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg ${bgClass} backdrop-blur-md`}>
             <Text className={`text-xs font-bold ${textClass} uppercase tracking-wide`}>
                {guide.difficulty}
             </Text>
          </View>
      </View>
      
      <View className="p-4">
        <View className="mb-2">
            <Text className="text-steam-accent text-sm font-bold uppercase tracking-wider mb-1 opacity-90" numberOfLines={1}>
              {guide.gameTitle}
            </Text>
            <Text className="text-white text-xl font-bold leading-tight" numberOfLines={2}>
              {guide.achievementName}
            </Text>
        </View>
        
        <Text className="text-steam-gray text-base leading-6 mb-4" numberOfLines={2}>
          {guide.content}
        </Text>
        
        <View className="flex-row items-center justify-between border-t border-steam-blue/50 pt-3">
             <View className="flex-row items-center">
                 <View className="w-6 h-6 bg-steam-blue rounded-full items-center justify-center mr-2">
                    <Text className="text-[10px] text-white font-bold">
                        <MaterialIcons name="person" size={16} color="#66c0f4" />
                    </Text>
                 </View>
                 <Text className="text-steam-gray text-xs">{guide.authorName}</Text>
             </View>
             
             <View className="flex-row items-center space-x-3">
                 <View className="flex-row items-center bg-steam-blue/30 px-2 py-1 rounded-lg">
                    <MaterialIcons name="comment" size={14} color="#66c0f4" />
                    <Text className="text-steam-gray ml-1.5 text-xs font-medium">{guide.commentCount || 0}</Text>
                 </View>
                 <VoteButtons guide={guide} onVoteUpdate={onVoteUpdate || (() => {})} compact />
             </View>
        </View>
        
        {showActions && (onDelete || onEdit) && (
          <View className="mt-4 pt-3 border-t border-steam-blue/50 flex-row gap-2">
              {onEdit && (
                <TouchableOpacity onPress={onEdit} className="flex-1 bg-blue-500/10 py-2.5 rounded-xl flex-row justify-center items-center">
                   <Text className="text-blue-400 font-semibold ml-2">Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={onDelete} className="flex-1 bg-red-500/10 py-2.5 rounded-xl flex-row justify-center items-center">
                   <Text className="text-red-400 font-semibold ml-2">Delete</Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default GuideCard;