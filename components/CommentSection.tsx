import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { guideService, Comment } from '../services/guideService';

const CommentSection: React.FC<{ guideId: string }> = ({ guideId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => { fetchComments(); }, [guideId]);

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const fetched = await guideService.getCommentsByGuideId(guideId);
      setComments(fetched);
    } catch (e) { console.error(e); } finally { setCommentsLoading(false); }
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    try {
      await guideService.addComment(guideId, user.uid, user.displayName || 'Anonymous', newComment);
      setNewComment('');
      fetchComments();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
      try {
          await guideService.deleteComment(id, guideId);
          setComments(prev => prev.filter(c => c.id !== id));
      } catch (e) { Alert.alert('Error', 'Failed to delete'); }
  };

  return (
    <View className="mt-4">
      <Text className="text-white text-xl font-bold mb-4 flex-row items-center">
          Comments <Text className="text-steam-gray text-base font-normal">({comments.length})</Text>
      </Text>
      
      {commentsLoading ? (
        <ActivityIndicator color="#66c0f4" />
      ) : comments.length === 0 ? (
        <Text className="text-steam-gray italic mb-4">No comments yet. Be the first!</Text>
      ) : (
        <View className="space-y-4 mb-6">
          {comments.map(comment => (
            <View key={comment.id} className="bg-steam-light rounded-xl p-4 border border-steam-light/50">
              <View className="flex-row justify-between mb-2">
                <Text className="text-steam-accent font-bold text-sm">{comment.userName}</Text>
                <Text className="text-steam-gray text-xs">{new Date(comment.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text className="text-white leading-5">{comment.content}</Text>
              {user?.uid === comment.userId && (
                 <TouchableOpacity onPress={() => handleDelete(comment.id)} className="self-end mt-2">
                     <Text className="text-red-400 text-xs">Delete</Text>
                 </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {user ? (
        <View className="flex-row items-end bg-steam-light rounded-xl p-2 border border-steam-light/50">
            <TextInput 
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Share your thoughts..."
                placeholderTextColor="#8b9cb3"
                multiline
                className="flex-1 text-white p-2 max-h-24"
            />
            <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={loading || !newComment.trim()}
                className="bg-steam-accent p-2 rounded-lg ml-2"
            >
                {loading ? <ActivityIndicator size="small" color="white"/> : <MaterialIcons name="send" size={20} color="white" />}
            </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-steam-light/50 p-4 rounded-xl items-center">
            <Text className="text-steam-gray">Please login to comment.</Text>
        </View>
      )}
    </View>
  );
};

export default CommentSection;