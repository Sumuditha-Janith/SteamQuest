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
          className={`p-1 ${currentVote === 'upvoted' ? 'bg-green-500/20' : ''} rounded-full`}
        >
          <MaterialIcons 
            name="thumb-up" 
            size={20} 
            color={currentVote === 'upvoted' ? '#10B981' : '#8b9cb3'} 
          />
        </TouchableOpacity>
        
        <Text className="text-white mx-1 text-sm font-bold min-w-[20px] text-center">
          {netVotes}
        </Text>
        
        <TouchableOpacity
          onPress={handleDownvote}
          disabled={!user}
          className={`p-1 ${currentVote === 'downvoted' ? 'bg-red-500/20' : ''} rounded-full`}
        >
          <MaterialIcons 
            name="thumb-down" 
            size={20} 
            color={currentVote === 'downvoted' ? '#EF4444' : '#8b9cb3'} 
          />
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View className="flex-row items-center bg-steam-light rounded-xl p-3 mb-4">
      <TouchableOpacity
        onPress={handleUpvote}
        disabled={!user}
        className={`p-2 ${currentVote === 'upvoted' ? 'bg-green-500/20' : ''} rounded-full mr-2`}
      >
        <MaterialIcons 
          name="thumb-up" 
          size={24} 
          color={currentVote === 'upvoted' ? '#10B981' : '#66c0f4'} 
        />
      </TouchableOpacity>
      
      <Text className="text-white text-xl font-bold mx-2 min-w-[30px] text-center">
        {netVotes}
      </Text>
      
      <TouchableOpacity
        onPress={handleDownvote}
        disabled={!user}
        className={`p-2 ${currentVote === 'downvoted' ? 'bg-red-500/20' : ''} rounded-full ml-2`}
      >
        <MaterialIcons 
          name="thumb-down" 
          size={24} 
          color={currentVote === 'downvoted' ? '#EF4444' : '#66c0f4'} 
        />
      </TouchableOpacity>
      
      {!user && (
        <Text className="text-steam-accent text-xs ml-4">
          Sign in to vote
        </Text>
      )}
    </View>
  );
};

export default VoteButtons;