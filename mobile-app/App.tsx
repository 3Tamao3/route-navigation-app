import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text } from 'react-native';
import axios from 'axios';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './context/ThemeContext';

export type RootStackParamList = {
  Auth: undefined;
  Main: { token: string; username: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;

const AuthScreen = ({ navigation }: AuthScreenProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const { data } = await axios.post('http://192.168.0.249:3000/auth/register', {
        username,
        email,
        password,
      });
      // after register, log in automatically to get a token
      const loginRes = await axios.post('http://192.168.0.249:3000/auth/login', {
        email,
        password,
      });
      navigation.replace('Main', { token: loginRes.data.access_token, username: data.username });
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setMessage(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error during registration'));
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = await axios.post('http://192.168.0.249:3000/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      navigation.replace('Main', { token: data.access_token, username: data.username });
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setMessage(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error during login'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Register" onPress={handleRegister} />

      <Text style={[styles.heading, { marginTop: 24 }]}>Login</Text>
      <TextInput placeholder="Email" value={loginEmail} onChangeText={setLoginEmail} style={styles.input} />
      <TextInput placeholder="Password" value={loginPassword} onChangeText={setLoginPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />

      {message ? <Text style={styles.error}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 8, alignSelf: 'flex-start' },
  input: {
    width: '100%',
    height: 44,
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  error: { marginTop: 12, color: '#c00' },
});

const AppRoot = () => {
  const { isDark } = useTheme();
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={AppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <ThemeProvider>
    <AppRoot />
  </ThemeProvider>
);

export default App;
