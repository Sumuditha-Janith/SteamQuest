import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useDoublePressBackExit } from '../utils/backHandler';
import '../global.css';

function AuthRouting() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useDoublePressBackExit();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(dashboard)/home');
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRouting />
    </AuthProvider>
  );
}