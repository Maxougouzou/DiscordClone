import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import colors from '../config/colors';


export default function SignIn() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/messages');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    let email = identifier;

    if (!identifier.includes('@')) {
      try {
        const q = query(collection(db, 'users'), where('pseudo', '==', identifier));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          email = querySnapshot.docs[0].data().email;
        } else {
          setLoading(false);
          Alert.alert('Erreur de connexion', 'Pseudo non trouvé.');
          return;
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('Erreur de connexion', 'Erreur lors de la vérification du pseudo.');
        console.error('Erreur lors de la vérification du pseudo : ', error);
        return;
      }
    }

    if (!validateEmail(email)) {
      setLoading(false);
      Alert.alert('Erreur de connexion', 'Email invalide.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoading(false);
        console.log('Utilisateur connecté : ', userCredential.user);
        router.replace('/messages');
      })
      .catch((error) => {
        setLoading(false);
        console.error('Erreur de connexion : ', error);
        Alert.alert('Erreur de connexion', error.message);
      });
  };

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const navigateToSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inner}>
        <Text style={styles.title}>Se connecter</Text>
        <TextInput
          style={styles.input}
          placeholder="Email ou Pseudo"
          placeholderTextColor="#888"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Connexion</Text>
          )}
        </TouchableOpacity>
        <View style={styles.signUpTextContainer}>
          <Text style={styles.signUpText}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={styles.signUpLink}>Inscrivez-vous</Text>
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
    backgroundColor: colors.blurple,
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
  signUpTextContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
  },
  signUpLink: {
    color: colors.turquoise,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
