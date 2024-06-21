import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import colors from '../config/colors';

const auth = getAuth();

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      // Vérifier l'unicité du pseudo
      const q = query(collection(db, 'users'), where('pseudo', '==', pseudo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert('Erreur', 'Ce pseudo est déjà utilisé.');
        return;
      }

      // Créer un nouvel utilisateur avec Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const currentDate = new Date();

      // Ajouter des informations supplémentaires dans Firestore
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        pseudo: pseudo,
        createdAt: currentDate,
      });

      console.log('Compte créé avec succès : ', user);
      router.replace('/messages');
    } catch (error) {
      console.error('Erreur lors de la création du compte : ', error);
      Alert.alert('Erreur lors de la création du compte', error.message);
    }
  };

  const navigateToLogIn = () => {
    router.push('/log-in');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inner}>
        <Text style={styles.title}>S'inscrire</Text>
        <TextInput
          style={styles.input}
          placeholder="Pseudo"
          placeholderTextColor="#888"
          value={pseudo}
          onChangeText={setPseudo}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
        <View style={styles.logInTextContainer}>
          <Text style={styles.logInText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={navigateToLogIn}>
            <Text style={styles.logInLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 60,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.white,
    marginVertical: 5,
    backgroundColor: '#23272A',
  },
  button: {
    backgroundColor: colors.turquoise,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logInTextContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  logInText: {
    color: '#fff',
    fontSize: 16,
  },
  logInLink: {
    color: colors.blurple,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
