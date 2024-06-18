import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import useSession from '../hooks/useSession';
import * as ImagePicker from 'expo-image-picker';

const db = getFirestore();
const auth = getAuth();

export default function Messages() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const user = useSession();

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "conversations"), where("participants", "array-contains", user.email));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedConversations = [];
        querySnapshot.forEach((doc) => {
          loadedConversations.push({ id: doc.id, ...doc.data() });
        });
        setConversations(loadedConversations);
      });
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversationId) {
      const messagesRef = collection(db, "conversations", selectedConversationId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedMessages = [];
        querySnapshot.forEach((doc) => {
          loadedMessages.push(doc.data());
        });
        setMessages(loadedMessages);
      });
      return unsubscribe;
    }
  }, [selectedConversationId]);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Utilisateur connecté : ", userCredential.user);
      })
      .catch((error) => {
        console.error("Erreur de connexion : ", error);
      });
  };

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Compte créé avec succès : ", userCredential.user);
      })
      .catch((error) => {
        console.error("Erreur lors de la création du compte : ", error);
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Déconnexion réussie");
      })
      .catch((error) => {
        console.error("Erreur de déconnexion : ", error);
      });
  };

  const createConversation = async () => {
    if (newConversationEmail) {
      const newConversationRef = await addDoc(collection(db, "conversations"), {
        participants: [user.email, newConversationEmail],
        createdAt: new Date(),
      });
      setNewConversationEmail('');
      setSelectedConversationId(newConversationRef.id);
    }
  };

  const sendMessage = async () => {
    if ((currentMessage || currentImage) && selectedConversationId) {
      const messageData = {
        text: currentMessage,
        senderId: user.email,
        timestamp: new Date(),
      };

      if (currentImage) {
        messageData.image = currentImage;
      }

      await addDoc(collection(db, "conversations", selectedConversationId, "messages"), messageData);
      setCurrentMessage('');
      setCurrentImage(null);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Vous devez autoriser l'accès à la galerie pour ajouter des photos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (pickerResult.canceled) {
      console.log("Image picking was cancelled.");
      return;
    }

    if (!pickerResult.canceled && pickerResult.uri) {
      console.log("Image URI:", pickerResult.uri);
      setCurrentImage(pickerResult.uri);
    } else {
      console.log("No image picked.");
    }
  };

  const viewFullScreenImage = (uri) => {
    setFullScreenImage(uri);
    setImageModalVisible(true);
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Bienvenue, {user.email}!</Text>
        <TextInput
          style={styles.input}
          value={newConversationEmail}
          onChangeText={setNewConversationEmail}
          placeholder="Start a conversation with email"
        />
        <Button title="Start Conversation" onPress={createConversation} />
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Text onPress={() => setSelectedConversationId(item.id)}>
              Conversation with {item.participants.filter(p => p !== user.email)}
            </Text>
          )}
        />
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => item.image && viewFullScreenImage(item.image)}>
              <View style={[
                styles.messageBubble,
                item.senderId === user.email ? styles.rightBubble : styles.leftBubble
              ]}>
                <Text style={styles.senderEmail}>{item.senderId}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
                {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
              </View>
            </TouchableOpacity>
          )}
        />
        <TextInput
          style={styles.input}
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="Type a message"
        />
        {currentImage && <Image source={{ uri: currentImage }} style={styles.imagePreview} />}
        <Button title="Pick Image" onPress={pickImage} />
        <Button title="Send Message" onPress={sendMessage} />
        <Button
          title="Se déconnecter"
          onPress={handleSignOut}
          color="red"
        />
        <Modal
          animationType="slide"
          transparent={false}
          visible={imageModalVisible}
          onRequestClose={() => {
            setImageModalVisible(!imageModalVisible);
          }}
        >
          <View style={styles.fullScreenImageContainer}>
            <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} />
            <Button title="Close" onPress={() => setImageModalVisible(false)} />
          </View>
        </Modal>
      </View>
    );
  }

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
        title="Se connecter"
        onPress={handleLogin}
      />
      <Button
        title="S'inscrire"
        onPress={handleSignUp}
        color="green"
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
  },
  messageBubble: {
    padding: 8,
    borderRadius: 15,
    marginVertical: 2,
    maxWidth: '70%',
  },
  rightBubble: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  leftBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  senderEmail: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
  },
  conversationItem: {
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 4,
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 5,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
  }
});
