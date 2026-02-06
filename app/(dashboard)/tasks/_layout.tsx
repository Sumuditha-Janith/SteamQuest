import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

const CustomHeader = ({ title, showBack = true }: { title: string, showBack?: boolean }) => {
  const navigation = useNavigation();
  
  return (
    <View className="bg-steam-blue h-16 flex-row items-center justify-between px-4">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <MaterialIcons name="arrow-back" size={24} color="#66c0f4" />
          </TouchableOpacity>
        )}
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>
    </View>
  );
};

const TasksLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="home" 
        options={{ 
          header: () => <CustomHeader title="Achievement Guides" showBack={false} />,
        }} 
      />
      <Stack.Screen 
        name="guidedetails" 
        options={{ 
          header: () => <CustomHeader title="Guide Details" />,
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          header: () => <CustomHeader title="Edit Guide" />,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          header: () => <CustomHeader title="Account Settings" />,
        }} 
      />
    </Stack>
  );
};

export default TasksLayout;