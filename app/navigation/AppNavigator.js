import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/AudioList';
import Player from '../screens/Player';
import Notes from '../screens/Notes';
import { MaterialIcons, FontAwesome5, SimpleLineIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name='HomeScreen'
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name='home' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Player'
        component={Player}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name='compact-disc' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Notes'
        component={Notes}
        options={{
          tabBarIcon: ({ color, size }) => (
            <SimpleLineIcons name="pencil" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
