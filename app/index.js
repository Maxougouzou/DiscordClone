import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import useSession from '../hooks/useSession'; 

export default function Messages() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const user = useSession();  // Utilisation du hook pour obtenir l'état de l'utilisateur
  const auth = getAuth();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Utilisateur connecté : ", userCredential.user);
        // Éventuellement, gérer la navigation ou mettre à jour l'état global ici
      })
      .catch((error) => {
        console.error("Erreur de connexion : ", error);
      });
  };

  // Gérer ce que l'on affiche selon que l'utilisateur est connecté ou non
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Bienvenue, {user.email}!</Text>
      </View>
    );
  }

  // Interface de connexion si aucun utilisateur n'est connecté
  return (
    <View style={styles.container}>
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
        title="Log In"
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
  }
});
