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
  const currentVote = user ? guideService.getUserVoteStatus(guide, user.uid) : null;
  const netVotes = (guide.upvotes?.length || 0) - (guide.downvotes?.length || 0);

  const handleUpvote = async () => {
    if (!user) return;
    try {
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
    } catch (error) { console.error(error); }
  };

  const handleDownvote = async () => {
    if (!user) return;
    try {
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
    } catch (error) { console.error(error); }
  };
  
  if (compact) {
    return (
      <View className="flex-row items-center bg-steam-blue/30 px-2 py-1 rounded-lg">
        <TouchableOpacity onPress={handleUpvote} disabled={!user}>
          <MaterialIcons name="thumb-up" size={14} color={currentVote === 'upvoted' ? '#10B981' : '#8b9cb3'} />
        </TouchableOpacity>
        <Text className={`mx-2 text-xs font-bold ${currentVote === 'upvoted' ? 'text-green-400' : currentVote === 'downvoted' ? 'text-red-400' : 'text-steam-gray'}`}>
          {netVotes}
        </Text>
        <TouchableOpacity onPress={handleDownvote} disabled={!user}>
          <MaterialIcons name="thumb-down" size={14} color={currentVote === 'downvoted' ? '#EF4444' : '#8b9cb3'} />
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View className="flex-row items-center bg-steam-blue/40 rounded-xl p-2 self-start border border-steam-blue">
      <TouchableOpacity
        onPress={handleUpvote}
        disabled={!user}
        className={`p-2 rounded-lg ${currentVote === 'upvoted' ? 'bg-green-500/10' : 'active:bg-steam-light'}`}
      >
        <MaterialIcons name="thumb-up" size={24} color={currentVote === 'upvoted' ? '#10B981' : '#66c0f4'} />
      </TouchableOpacity>
      
      <Text className="text-white text-xl font-bold mx-4 min-w-[30px] text-center">
        {netVotes}
      </Text>
      
      <TouchableOpacity
        onPress={handleDownvote}
        disabled={!user}
        className={`p-2 rounded-lg ${currentVote === 'downvoted' ? 'bg-red-500/10' : 'active:bg-steam-light'}`}
      >
        <MaterialIcons name="thumb-down" size={24} color={currentVote === 'downvoted' ? '#EF4444' : '#66c0f4'} />
      </TouchableOpacity>
    </View>
  );
};

export default VoteButtons;