import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardLayout = () => {
  const insets = useSafeAreaInsets();
  
  const tabHeight = 60 + (Platform.OS === 'ios' ? 20 : insets.bottom);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1b2838',
          borderTopColor: '#2a475e',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: Platform.OS === 'ios' ? 20 : insets.bottom, 
          paddingTop: 10,
          elevation: 0,
        },
        tabBarActiveTintColor: '#66c0f4',
        tabBarInactiveTintColor: '#c7d5e0',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 5 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default DashboardLayout;