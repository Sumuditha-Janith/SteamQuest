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
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as FileSystem from 'expo-file-system/legacy';

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

const IMGBB_API_KEY = '0aec13a2f49dfb974fe7b5ac4a86ae2b';
const DEFAULT_IMAGE_URL = 'https://i.ibb.co/HTq3q83z/steamquestdefault2.jpg'

export const guideService = {
  async uploadImageToImgBB(imageUri: string): Promise<string> {
    try {
      console.log('Starting ImgBB upload for:', imageUri);
      
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist: ' + imageUri);
      }

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64);

      console.log('Uploading to ImgBB...');
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.data && result.data.url) {
        console.log('ImgBB upload successful:', result.data.url);
        return result.data.url;
      } else {
        console.error('ImgBB upload failed:', result);
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error('Error in ImgBB upload:', error.message || error);
      throw error;
    }
  },

  async addGuide(guideData: CreateGuideData, imageUri?: string): Promise<string> {
    try {
      console.log('Adding guide, imageUri:', imageUri);
      
      let imageUrl: string = DEFAULT_IMAGE_URL;
      
      if (imageUri && imageUri.trim() !== '' && imageUri !== DEFAULT_IMAGE_URL) {
        try {
          console.log('Attempting to upload image to ImgBB');
          imageUrl = await this.uploadImageToImgBB(imageUri);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          console.error('Image upload to ImgBB failed:', uploadError.message || uploadError);
          console.log('Using default image instead');
          imageUrl = DEFAULT_IMAGE_URL;
        }
      } else {
        console.log('No image provided or default image, using default image URL');
        imageUrl = DEFAULT_IMAGE_URL;
      }
      
      const guideToSave: any = {
        gameTitle: guideData.gameTitle.trim(),
        achievementName: guideData.achievementName.trim(),
        content: guideData.content.trim(),
        difficulty: guideData.difficulty,
        authorId: guideData.authorId,
        authorName: guideData.authorName,
        imageUrl: imageUrl,
        createdAt: Date.now(),
        upvotes: [],
        downvotes: [],
        commentCount: 0,
      };
      
      if (guideData.estimatedTime && guideData.estimatedTime.trim() !== '') {
        guideToSave.estimatedTime = guideData.estimatedTime.trim();
      }
      
      if (guideData.platform && guideData.platform.length > 0) {
        guideToSave.platform = guideData.platform;
      } else {
        guideToSave.platform = ['PC'];
      }
      
      console.log('Saving guide to Firestore:', guideToSave);
      
      const docRef = await addDoc(collection(db, 'guides'), guideToSave);
      console.log('Guide added with ID:', docRef.id, 'Image URL:', imageUrl);
      
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
      console.log('Updating guide:', guideId, 'imageUri:', imageUri);
      
      let imageUrl: string | undefined = undefined;
      
      const currentGuide = await this.getGuideById(guideId);
      
      if (imageUri && imageUri.trim() !== '' && imageUri !== DEFAULT_IMAGE_URL) {
        try {
          console.log('Uploading new image to ImgBB');
          imageUrl = await this.uploadImageToImgBB(imageUri);
          console.log('New image uploaded:', imageUrl);
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError.message || uploadError);
          if (currentGuide && currentGuide.imageUrl) {
            imageUrl = currentGuide.imageUrl;
          } else {
            imageUrl = DEFAULT_IMAGE_URL;
          }
        }
      } else if (imageUri === DEFAULT_IMAGE_URL || !imageUri) {
        imageUrl = DEFAULT_IMAGE_URL;
      } else {
        imageUrl = currentGuide?.imageUrl || DEFAULT_IMAGE_URL;
      }
      
      const updateData: any = {
        ...guideData,
        updatedAt: Date.now(),
      };
      
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      console.log('Updating guide with:', updateData);
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
        const data = docSnap.data();
        const guide = {
          id: docSnap.id,
          gameTitle: data.gameTitle || '',
          achievementName: data.achievementName || '',
          content: data.content || '',
          difficulty: data.difficulty || 'Medium',
          imageUrl: data.imageUrl || DEFAULT_IMAGE_URL,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Anonymous',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          estimatedTime: data.estimatedTime,
          platform: data.platform || ['PC'],
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          commentCount: data.commentCount || 0,
        } as Guide;
        
        console.log('Retrieved guide:', guide.id, 'Image URL:', guide.imageUrl);
        return guide;
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
        const guide = {
          id: doc.id,
          gameTitle: data.gameTitle || '',
          achievementName: data.achievementName || '',
          content: data.content || '',
          difficulty: data.difficulty || 'Medium',
          imageUrl: data.imageUrl || DEFAULT_IMAGE_URL,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Anonymous',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          estimatedTime: data.estimatedTime,
          platform: data.platform || ['PC'],
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          commentCount: data.commentCount || 0,
        } as Guide;
        
        guides.push(guide);
      });
      
      console.log(`Retrieved ${guides.length} guides`);
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
        const guide = {
          id: doc.id,
          gameTitle: data.gameTitle || '',
          achievementName: data.achievementName || '',
          content: data.content || '',
          difficulty: data.difficulty || 'Medium',
          imageUrl: data.imageUrl || DEFAULT_IMAGE_URL,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Anonymous',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          estimatedTime: data.estimatedTime,
          platform: data.platform || ['PC'],
          upvotes: data.upvotes || [],
          downvotes: data.downvotes || [],
          commentCount: data.commentCount || 0,
        } as Guide;
        
        guides.push(guide);
      });
      
      console.log(`Retrieved ${guides.length} guides for user ${userId}`);
      return guides;
    } catch (error) {
      console.error('Error getting user guides:', error);
      throw error;
    }
  },

  async deleteGuide(guideId: string): Promise<void> {
    try {
      const guideRef = doc(db, 'guides', guideId);
      const guideSnap = await getDoc(guideRef);
      
      if (!guideSnap.exists()) {
        throw new Error('Guide not found');
      }
      
      const batch = writeBatch(db);
      
      const commentsQuery = query(
        collection(db, 'comments'),
        where('guideId', '==', guideId)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });
      
      batch.delete(guideRef);
      
      await batch.commit();
      
      console.log(`Guide ${guideId} and its ${commentsSnapshot.size} comments deleted successfully`);
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