import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import MapScreen from '../screens/MapScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ReplayScreen from '../screens/ReplayScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type TabParamList = {
  Map: { token: string; username: string };
  History: { token: string; username: string };
  Replay: { token: string; username: string };
  Profile: { token: string; username: string };
};

const Tab = createBottomTabNavigator<TabParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const AppNavigator = ({ route }: Props) => {
  const { token, username } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        initialParams={{ token, username }}
        options={{
          headerShown: false,
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        initialParams={{ token, username }}
        options={{
          title: 'Route History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Replay"
        component={ReplayScreen}
        initialParams={{ token, username }}
        options={{
          title: 'Route Replay',
          tabBarLabel: 'Route Replay',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ token, username }}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
