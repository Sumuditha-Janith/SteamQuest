import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  checkAndUpdateVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        const updatedUser = auth.currentUser;
        
        if (updatedUser?.emailVerified) {
          try {
            const userDocRef = doc(db, 'users', updatedUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists() && !userDoc.data()?.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: true,
                verifiedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error updating verification status:', error);
          }
        }
        
        setUser(updatedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await userCredential.user.reload();
        const currentUser = auth.currentUser;
        
        if (currentUser && !currentUser.emailVerified) {
          await signOut(auth);
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification email.');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: displayName
      });

      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        uid: user.uid,
        emailVerified: false,
        verificationSentAt: new Date().toISOString()
      });
      
      console.log('User registered and verification email sent');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please try logging in or use a different email.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateDisplayName = async (displayName: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }
      
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: displayName,
        updatedAt: new Date().toISOString()
      });
      
      setUser({ ...auth.currentUser });
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user logged in');
      }
      
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      await updatePassword(auth.currentUser, newPassword);
      
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resendVerification = async () => {
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser);
        
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          verificationSentAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const refreshUser = async (): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const currentUser = auth.currentUser;
        setUser({ ...currentUser });
        return currentUser.emailVerified || false;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return false;
    }
  };

  const checkAndUpdateVerification = async (): Promise<boolean> => {
    try {
      if (!auth.currentUser) return false;
      
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;
      
      if (isVerified) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true,
          verifiedAt: new Date().toISOString()
        });
        
        setUser({ ...auth.currentUser });
      }
      
      return isVerified;
    } catch (error) {
      console.error('Error checking verification:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateDisplayName,
    changePassword,
    resendVerification,
    refreshUser,
    checkAndUpdateVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};