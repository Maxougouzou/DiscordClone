import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import {  signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import s from '../config/styles';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/messages');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Utilisateur connecté : ', userCredential.user);
        router.replace('/messages');
      })
      .catch((error) => {
        console.error('Erreur de connexion : ', error);
        Alert.alert('Erreur de connexion', error.message);
      });
  };

  const navigateToSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <View style={styles.container}>
      <Text style={[s.largeTitle, { textAlign: 'center', marginBottom: 20 }]}>Se connecter</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <Button
        title="Se connecter"
        onPress={handleLogin}
      />
      <Button
        title="S'inscrire"
        onPress={navigateToSignUp}
        color="green"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 5,
  },
});
