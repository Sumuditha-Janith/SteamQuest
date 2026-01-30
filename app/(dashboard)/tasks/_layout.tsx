import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';

const TasksLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1b2838',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="home" 
        options={{ 
          title: 'Achievement Guides',
          headerRight: () => (
            <MaterialIcons 
              name="search" 
              size={24} 
              color="#66c0f4" 
              style={{ marginRight: 15 }}
            />
          ),
        }} 
      />
      <Stack.Screen 
        name="guidedetails" 
        options={{ 
          title: 'Guide Details',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
};

export default TasksLayout;