import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCREHmRwgBt-0lSkFCtjOw1BvMyZzORfs",
  authDomain: "steam-quest-app.firebaseapp.com",
  projectId: "steam-quest-app",
  storageBucket: "steam-quest-app.firebasestorage.app",
  messagingSenderId: "19920792747",
  appId: "1:19920792747:web:1f6e22ace6c846ae449bee"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: require('firebase/auth').getReactNativePersistence(AsyncStorage)
});

export { auth };
export const db = getFirestore(app);
export default app;