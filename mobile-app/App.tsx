import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text } from 'react-native';
import axios from 'axios';

const App = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/register', {
                username,
                email,
                password,
            });
            setMessage('Registration successful!');
        } catch (error) {
            setMessage('Error during registration');
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email: loginEmail,
                password: loginPassword,
            });
            setMessage('Login successful!');
        } catch (error) {
            setMessage('Error during login');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Registration</Text>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Register" onPress={handleRegister} />

            <Text>Login</Text>
            <TextInput
                placeholder="Email"
                value={loginEmail}
                onChangeText={setLoginEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Login" onPress={handleLogin} />

            {message ? <Text>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default App;