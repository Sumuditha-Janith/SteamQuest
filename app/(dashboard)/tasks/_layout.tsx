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

        }} 
      />
      <Stack.Screen 
        name="guidedetails" 
        options={{ 
          title: 'Guide Details',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Edit Guide',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
};

export default TasksLayout;