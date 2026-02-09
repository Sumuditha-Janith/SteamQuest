import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useDoublePressBackExit } from '../utils/backHandler';
import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import '../global.css';

function AuthRouting() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useDoublePressBackExit();

  useEffect(() => {
    const configureNavBar = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#1b2838');
        await NavigationBar.setButtonStyleAsync('light');
        await NavigationBar.setPositionAsync('relative'); 
      }
    };

    configureNavBar();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        configureNavBar();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onVerifyScreen = segments[1] === 'verify';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (!user.emailVerified) {
        if (!onVerifyScreen) {
          router.replace('/(auth)/verify');
        }
      } else {
        if (inAuthGroup && !onVerifyScreen) {
          router.replace('/(dashboard)/home');
        }
      }
    }
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
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