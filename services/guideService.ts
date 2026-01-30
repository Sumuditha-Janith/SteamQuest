import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc 
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
  estimatedTime?: string;
  platform?: string[];
}

export interface Comment {
  id: string;
  guideId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
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
        console.log('Uploading image:', imageUri);
        
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `guides/${timestamp}_${randomString}.jpg`;
        const storageRef = ref(storage, fileName);
        
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        console.log('Blob created, size:', blob.size);
        
        await uploadBytes(storageRef, blob);
        
        imageUrl = await getDownloadURL(storageRef);
        console.log('Image uploaded successfully, URL:', imageUrl);
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
    
    console.log('Guide to save (cleaned):', guideToSave);
    
    const docRef = await addDoc(collection(db, 'guides'), guideToSave);
    console.log('Guide added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding guide:', error);
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
        guides.push({
          id: doc.id,
          ...doc.data(),
        } as Guide);
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
        guides.push({
          id: doc.id,
          ...doc.data(),
        } as Guide);
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

  async getGuideById(guideId: string): Promise<Guide | null> {
    try {
      const allGuides = await this.getAllGuides();
      return allGuides.find(guide => guide.id === guideId) || null;
    } catch (error) {
      console.error('Error getting guide:', error);
      throw error;
    }
  },
};