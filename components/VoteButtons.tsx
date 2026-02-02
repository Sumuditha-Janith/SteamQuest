import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { guideService, Guide } from '../services/guideService';

interface VoteButtonsProps {
  guide: Guide;
  onVoteUpdate: (updatedGuide: Guide) => void;
  compact?: boolean;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ guide, onVoteUpdate, compact = false }) => {
  const { user } = useAuth();
  
  const handleUpvote = async () => {
    if (!user) return;
    
    try {
      const currentVote = guideService.getUserVoteStatus(guide, user.uid);
      const updatedGuide = { ...guide };
      
      if (currentVote === 'upvoted') {
        updatedGuide.upvotes = updatedGuide.upvotes.filter(id => id !== user.uid);
      } else if (currentVote === 'downvoted') {
        updatedGuide.downvotes = updatedGuide.downvotes.filter(id => id !== user.uid);
        updatedGuide.upvotes = [...updatedGuide.upvotes, user.uid];
      } else {
        updatedGuide.upvotes = [...updatedGuide.upvotes, user.uid];
      }
      
      onVoteUpdate(updatedGuide);
      
      await guideService.upvoteGuide(guide.id, user.uid);
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };
  
  const handleDownvote = async () => {
    if (!user) return;
    
    try {
      const currentVote = guideService.getUserVoteStatus(guide, user.uid);
      const updatedGuide = { ...guide };
      
      if (currentVote === 'downvoted') {
        updatedGuide.downvotes = updatedGuide.downvotes.filter(id => id !== user.uid);
      } else if (currentVote === 'upvoted') {
        updatedGuide.upvotes = updatedGuide.upvotes.filter(id => id !== user.uid);
        updatedGuide.downvotes = [...updatedGuide.downvotes, user.uid];
      } else {
        updatedGuide.downvotes = [...updatedGuide.downvotes, user.uid];
      }
      
      onVoteUpdate(updatedGuide);
      
      await guideService.downvoteGuide(guide.id, user.uid);
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };
  
  const currentVote = user ? guideService.getUserVoteStatus(guide, user.uid) : null;
  const netVotes = (guide.upvotes?.length || 0) - (guide.downvotes?.length || 0);
  
  if (compact) {
    return (
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleUpvote}
          disabled={!user}
          className={`p-2 rounded-full ${currentVote === 'upvoted' ? 'bg-green-500/20' : 'bg-steam-light'}`}
        >
          <MaterialIcons 
            name="thumb-up" 
            size={16} 
            color={currentVote === 'upvoted' ? '#10B981' : '#8b9cb3'} 
          />
        </TouchableOpacity>
        
        <Text className="text-white mx-2 font-bold">{netVotes}</Text>
        
        <TouchableOpacity
          onPress={handleDownvote}
          disabled={!user}
          className={`p-2 rounded-full ${currentVote === 'downvoted' ? 'bg-red-500/20' : 'bg-steam-light'}`}
        >
          <MaterialIcons 
            name="thumb-down" 
            size={16} 
            color={currentVote === 'downvoted' ? '#EF4444' : '#8b9cb3'} 
          />
        </TouchableOpacity>
        
        <View className="flex-row items-center ml-4">
          <MaterialIcons name="comment" size={16} color="#8b9cb3" />
          <Text className="text-steam-gray ml-1 text-sm">{guide.commentCount || 0}</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="flex-row items-center bg-steam-light rounded-xl p-3 mb-4">
      <View className="items-center mr-4">
        <TouchableOpacity
          onPress={handleUpvote}
          disabled={!user}
          className={`p-2 rounded-full mb-1 ${currentVote === 'upvoted' ? 'bg-green-500/20' : 'hover:bg-steam-blue/50'}`}
        >
          <MaterialIcons 
            name="thumb-up" 
            size={24} 
            color={currentVote === 'upvoted' ? '#10B981' : '#66c0f4'} 
          />
        </TouchableOpacity>
        
        <Text className="text-white text-xl font-bold">{netVotes}</Text>
        
        <TouchableOpacity
          onPress={handleDownvote}
          disabled={!user}
          className={`p-2 rounded-full mt-1 ${currentVote === 'downvoted' ? 'bg-red-500/20' : 'hover:bg-steam-blue/50'}`}
        >
          <MaterialIcons 
            name="thumb-down" 
            size={24} 
            color={currentVote === 'downvoted' ? '#EF4444' : '#66c0f4'} 
          />
        </TouchableOpacity>
        
        <Text className="text-steam-gray text-xs mt-2">
          {guide.upvotes?.length || 0} up • {guide.downvotes?.length || 0} down
        </Text>
      </View>
      
      <View className="ml-4 flex-1">
        <Text className="text-white font-bold mb-1">Community Rating</Text>
        <Text className="text-steam-gray text-sm">
          {netVotes >= 0 ? 'Positive' : 'Negative'} rating from the community
        </Text>
        {!user && (
          <Text className="text-steam-accent text-xs mt-2">
            Sign in to vote on this guide
          </Text>
        )}
      </View>
    </View>
  );
};

export default VoteButtons;