import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { guideService, Comment } from '../services/guideService';

interface CommentSectionProps {
  guideId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ guideId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [guideId]);

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const fetchedComments = await guideService.getCommentsByGuideId(guideId);
      setComments(fetchedComments);
    } catch (error) {
      Alert.alert('Error', 'Failed to load comments');
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    setLoading(true);
    try {
      await guideService.addComment(
        guideId,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        newComment
      );
      
      setNewComment('');
      fetchComments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await guideService.deleteComment(commentId, guideId);
              setComments(comments.filter(comment => comment.id !== commentId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      await guideService.updateComment(commentId, editText);
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editText, updatedAt: Date.now() }
          : comment
      ));
      setEditingCommentId(null);
      setEditText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update comment');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isOwner = user?.uid === item.userId;
    const isEditing = editingCommentId === item.id;

    return (
      <View className="bg-steam-light rounded-xl p-4 mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-steam-accent rounded-full justify-center items-center mr-2">
                <Text className="text-white font-bold text-xs">
                  {item.userName?.charAt(0)?.toUpperCase() || 'A'}
                </Text>
              </View>
              <Text className="text-white font-bold">{item.userName}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-steam-gray text-xs">
              {formatTime(item.createdAt)}
              {item.updatedAt && ' • Edited'}
            </Text>
            
            {isOwner && (
              <View className="flex-row ml-2">
                <TouchableOpacity
                  onPress={() => handleStartEdit(item)}
                  className="p-1"
                >
                  <MaterialIcons name="edit" size={16} color="#66c0f4" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleDeleteComment(item.id)}
                  className="p-1 ml-1"
                >
                  <MaterialIcons name="delete" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {isEditing ? (
          <View>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              className="bg-steam-blue text-white p-3 rounded-lg mb-2"
            />
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setEditingCommentId(null)}
                className="bg-steam-gray px-3 py-2 rounded-lg mr-2"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSaveEdit(item.id)}
                className="bg-steam-accent px-3 py-2 rounded-lg"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text className="text-steam-gray">{item.content}</Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="items-center p-6">
      <MaterialIcons name="forum" size={60} color="#2a475e" />
      <Text className="text-white text-lg font-bold mt-4">No Comments Yet</Text>
      <Text className="text-steam-gray text-center mt-2">
        Be the first to share your thoughts on this guide!
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <Text className="text-white text-xl font-bold mb-4">Community Comments</Text>
      
      {commentsLoading ? (
        <ActivityIndicator size="large" color="#66c0f4" />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          className="mb-4"
        />
      )}
      
      {/* Comment Input */}
      {user ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="mt-4"
        >
          <View className="bg-steam-light rounded-xl p-3">
            <TextInput
              placeholder="Add your comment..."
              placeholderTextColor="#8b9cb3"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              className="text-white min-h-[80px] p-2"
            />
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-steam-gray text-xs">
                {newComment.length}/500 characters
              </Text>
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={loading || !newComment.trim()}
                className={`${
                  loading || !newComment.trim() ? 'bg-steam-accent/50' : 'bg-steam-accent'
                } px-4 py-2 rounded-lg`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold">Post Comment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View className="bg-steam-light rounded-xl p-4 items-center">
          <MaterialIcons name="lock" size={30} color="#66c0f4" />
          <Text className="text-white font-bold mt-2">Sign In to Comment</Text>
          <Text className="text-steam-gray text-center mt-1">
            You need to be logged in to join the discussion
          </Text>
        </View>
      )}
    </View>
  );
};

export default CommentSection;