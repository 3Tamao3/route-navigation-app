import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import MapScreen from '../screens/MapScreen';
import HistoryScreen from '../screens/HistoryScreen';

export type TabParamList = {
  Map: { token: string; username: string };
  History: { token: string; username: string };
};

const Tab = createBottomTabNavigator<TabParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const AppNavigator = ({ navigation, route }: Props) => {
  const { token, username } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <View style={{ paddingRight: 16 }}>
            <Text style={{ fontWeight: '600', color: '#333' }}>{username}</Text>
          </View>
        ),
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        initialParams={{ token, username }}
        options={{
          title: 'Map',
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
          title: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={'Logout' as any}
        component={MapScreen}
        options={{
          tabBarLabel: 'Logout',
          tabBarIcon: ({ size }) => (
            <Ionicons name="log-out-outline" size={size} color="#e53935" />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.replace('Auth')}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="log-out-outline" size={22} color="#e53935" />
              <Text style={{ color: '#e53935', fontWeight: '600', fontSize: 10, marginTop: 2 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
