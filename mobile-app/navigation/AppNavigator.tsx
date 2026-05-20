import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
        options={{ title: 'Map', tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        initialParams={{ token, username }}
        options={{ title: 'History', tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name={'Logout' as any}
        component={MapScreen}
        options={{
          tabBarLabel: 'Logout',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.replace('Auth')}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#e53935', fontWeight: '600', fontSize: 12 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
