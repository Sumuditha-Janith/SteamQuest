import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc,
  updateDoc,
  getDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

export interface Guide {
  id: string;
  gameTitle: string;
  achievementName: string;
  content: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt?: number;
  estimatedTime?: string;
  platform?: string[];
  upvotes: string[];
  downvotes: string[];
  commentCount: number;
}

export interface Comment {
  id: string;
  guideId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateGuideData {
  gameTitle: string;
  achievementName: string;
  content: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  imageUrl?: string;
  authorId: string;
  authorName: string;
  estimatedTime?: string;
  platform?: string[];
}

export const guideService = {
  async addGuide(guideData: CreateGuideData, imageUri?: string): Promise<string> {
    try {
      let imageUrl: string | null = null;
      
      if (imageUri) {
        try {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileName = `guides/${timestamp}_${randomString}.jpg`;
          const storageRef = ref(storage, fileName);
          
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          await uploadBytes(storageRef, blob);
          
          imageUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          imageUrl = null;
        }
      }
      
      const guideToSave: Record<string, any> = {
        gameTitle: guideData.gameTitle,
        achievementName: guideData.achievementName,
        content: guideData.content,
        difficulty: guideData.difficulty,
        authorId: guideData.authorId,
        authorName: guideData.authorName,
        createdAt: Date.now(),
        upvotes: [],
        downvotes: [],
        commentCount: 0,
      };
      
      if (guideData.estimatedTime && guideData.estimatedTime.trim() !== '') {
        guideToSave.estimatedTime = guideData.estimatedTime;
      }
      
      if (guideData.platform && guideData.platform.length > 0) {
        guideToSave.platform = guideData.platform;
      }
      
      if (imageUrl && imageUrl.trim() !== '') {
        guideToSave.imageUrl = imageUrl;
      }
      
      const docRef = await addDoc(collection(db, 'guides'), guideToSave);
      console.log('Guide added with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding guide:', error);
      throw error;
    }
  },

  async updateGuide(
    guideId: string,
    guideData: Partial<CreateGuideData>,
    imageUri?: string
  ): Promise<void> {
    try {
      let imageUrl: string | undefined = guideData.imageUrl;
      
      if (imageUri) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `guides/${timestamp}_${randomString}.jpg`;
        const storageRef = ref(storage, fileName);
        
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      const updateData: Record<string, any> = {
        ...guideData,
        updatedAt: Date.now(),
      };
      
      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      await updateDoc(doc(db, 'guides', guideId), updateData);
    } catch (error) {
      console.error('Error updating guide:', error);
      throw error;
    }
  },

  async getGuideById(guideId: string): Promise<Guide | null> {
    try {
      const docRef = doc(db, 'guides', guideId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Guide;
      }
      return null;
    } catch (error) {
      console.error('Error getting guide:', error);
      throw error;
    }
  },

  async getAllGuides(): Promise<Guide[]> {
    try {
      const q = query(
        collection(db, 'guides'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const guides: Guide[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        guides.push({
          id: doc.id,
          gameTitle: data.gameTitle || '',
          achievementName: data.achievementName || '',
          content: data.content || '',
          difficulty: data.difficulty || 'Medium',
          imageUrl: data.imageUrl,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Anonymous',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          estimatedTime: data.estimatedTime,
          platform: data.platform || ['PC'],
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          commentCount: data.commentCount || 0,
        });
      });
      
      return guides;
    } catch (error) {
      console.error('Error getting guides:', error);
      throw error;
    }
  },

  async getMyGuides(userId: string): Promise<Guide[]> {
    try {
      const q = query(
        collection(db, 'guides'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const guides: Guide[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        guides.push({
          id: doc.id,
          gameTitle: data.gameTitle || '',
          achievementName: data.achievementName || '',
          content: data.content || '',
          difficulty: data.difficulty || 'Medium',
          imageUrl: data.imageUrl,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Anonymous',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          estimatedTime: data.estimatedTime,
          platform: data.platform || ['PC'],
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          commentCount: data.commentCount || 0,
        });
      });
      
      return guides;
    } catch (error) {
      console.error('Error getting user guides:', error);
      throw error;
    }
  },

  async deleteGuide(guideId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'guides', guideId));
    } catch (error) {
      console.error('Error deleting guide:', error);
      throw error;
    }
  },

  async upvoteGuide(guideId: string, userId: string): Promise<void> {
    try {
      const guideRef = doc(db, 'guides', guideId);
      const guideSnap = await getDoc(guideRef);
      
      if (!guideSnap.exists()) {
        throw new Error('Guide not found');
      }
      
      const guide = guideSnap.data();
      
      if (guide.upvotes?.includes(userId)) {
        await updateDoc(guideRef, {
          upvotes: arrayRemove(userId)
        });
      } else {
        if (guide.downvotes?.includes(userId)) {
          await updateDoc(guideRef, {
            downvotes: arrayRemove(userId),
            upvotes: arrayUnion(userId)
          });
        } else {
          await updateDoc(guideRef, {
            upvotes: arrayUnion(userId)
          });
        }
      }
    } catch (error) {
      console.error('Error upvoting guide:', error);
      throw error;
    }
  },

  async downvoteGuide(guideId: string, userId: string): Promise<void> {
    try {
      const guideRef = doc(db, 'guides', guideId);
      const guideSnap = await getDoc(guideRef);
      
      if (!guideSnap.exists()) {
        throw new Error('Guide not found');
      }
      
      const guide = guideSnap.data();
      
      if (guide.downvotes?.includes(userId)) {
        await updateDoc(guideRef, {
          downvotes: arrayRemove(userId)
        });
      } else {
        if (guide.upvotes?.includes(userId)) {
          await updateDoc(guideRef, {
            upvotes: arrayRemove(userId),
            downvotes: arrayUnion(userId)
          });
        } else {
          await updateDoc(guideRef, {
            downvotes: arrayUnion(userId)
          });
        }
      }
    } catch (error) {
      console.error('Error downvoting guide:', error);
      throw error;
    }
  },

  async addComment(guideId: string, userId: string, userName: string, content: string): Promise<string> {
    try {
      if (!content.trim()) {
        throw new Error('Comment cannot be empty');
      }
      
      const commentRef = await addDoc(collection(db, 'comments'), {
        guideId,
        userId,
        userName,
        content: content.trim(),
        createdAt: Date.now(),
      });
      
      const guideRef = doc(db, 'guides', guideId);
      await updateDoc(guideRef, {
        commentCount: increment(1)
      });
      
      return commentRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async getCommentsByGuideId(guideId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'comments'),
        where('guideId', '==', guideId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          guideId: data.guideId,
          userId: data.userId,
          userName: data.userName,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      
      return comments;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string, guideId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      
      const guideRef = doc(db, 'guides', guideId);
      await updateDoc(guideRef, {
        commentCount: increment(-1)
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  async updateComment(commentId: string, content: string): Promise<void> {
    try {
      if (!content.trim()) {
        throw new Error('Comment cannot be empty');
      }
      
      await updateDoc(doc(db, 'comments', commentId), {
        content: content.trim(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  getUserVoteStatus(guide: Guide, userId: string): 'upvoted' | 'downvoted' | null {
    if (guide.upvotes?.includes(userId)) {
      return 'upvoted';
    } else if (guide.downvotes?.includes(userId)) {
      return 'downvoted';
    }
    return null;
  },

  async searchGuides(searchTerm: string): Promise<Guide[]> {
    try {
      const allGuides = await this.getAllGuides();
      return allGuides.filter(guide => 
        guide.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.achievementName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching guides:', error);
      throw error;
    }
  },
};