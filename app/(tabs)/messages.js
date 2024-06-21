import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import useSession from '../../hooks/useSession';
import ConversationsList from '../../components/ConversationList';
import { db } from '../firebaseConfig'; 
import s from '../../config/styles';
import colors from '../../config/colors';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { calculateTimeSinceLastMessage } from '../../assets/js/utils';

export default function Messages() {
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const router = useRouter();


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
        setMessages(loadedMessages.reverse());
      });
      return unsubscribe;
    }
  }, [selectedConversationId]);

  const navigateAddFriends = () => {
    router.push('/addFriends');
  };

  const navigateFriendsList = () => {
    router.push('/friendsRequest');
  };


  const createConversation = async () => {
    if (newConversationEmail) {
      try {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participants: [user.email, newConversationEmail],
          createdAt: new Date(),
        });
        setNewConversationEmail('');
        setSelectedConversationId(newConversationRef.id);
      } catch (error) {
        console.error("Erreur lors de la création de la conversation : ", error);
        Alert.alert("Erreur lors de la création de la conversation", error.message);
      }
    }
  };

  const sendMessage = async () => {
    if ((currentMessage || currentImage) && selectedConversationId) {
      const messageData = {
        text: currentMessage,
        senderId: user.email,
        timestamp: new Date(),
        image: currentImage || null,
      };

      try {
        await addDoc(collection(db, "conversations", selectedConversationId, "messages"), messageData);
        setCurrentMessage('');
        setCurrentImage(null);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message : ", error);
        Alert.alert("Erreur lors de l'envoi du message", error.message);
      }
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Vous devez autoriser l'accès à la galerie pour ajouter des photos.");
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

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      const selectedImage = pickerResult.assets[0].uri;
      console.log("Image URI:", selectedImage);
      setCurrentImage(selectedImage);
    } else {
      console.log("No image picked.");
    }
  };

  return (
    <View style={[styles.container, s.paddingG]}>
      <View style={styles.view1}>
        <Text style={[s.textWhite, s.mediumTitle]}>Messages</Text>
        <TouchableOpacity style={styles.button} onPress={navigateAddFriends}>
          <AntDesign name="pluscircleo" size={20} color="#ffffff" />
          <Text style={[s.textWhite, s.bold, {marginLeft: 5}]}>Ajouter des amis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateFriendsList}>
          <Ionicons name="people" size={20} color="#ffffff" />
          <Text style={[s.textWhite, s.bold, { marginLeft: 5 }]}>Friend Requests</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.view2}>
        <View style={[styles.inputContainer, s.bgDark]}>
          <Ionicons name="search" size={20} color="#8E909C" />
          <TextInput
            style={styles.input}
            placeholder="Recherche"
            placeholderTextColor={colors.gray}
            value={newConversationEmail}
            onChangeText={setNewConversationEmail}
          />
        </View>
        <ConversationsList
          conversations={conversations}
          user={user}
          setSelectedConversationId={setSelectedConversationId}
        />
        {selectedConversationId && (
          <>
            <FlatList
              style={[styles.messagesList, s.paddingG]}
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.messageContainer}>
                  <View style={styles.avatarContainer}>
                    <Image source={require('../../assets/images/avatars/avatar1.png')} style={styles.avatar} />
                  </View>
                  <View style={styles.messageContent}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <Text style={[s.textWhite, styles.username]}>{item.senderId}</Text>
                      <Text style={[styles.timestamp]}>{calculateTimeSinceLastMessage(new Date(item.timestamp))}</Text>
                    </View>
                    {item.image && (
                      <TouchableOpacity onPress={() => viewFullScreenImage(item.image)}>
                        <Image source={{ uri: item.image }} style={styles.imageMessage} />
                      </TouchableOpacity>
                    )}
                    <Text style={[s.textWhite, styles.text]}>{item.text}</Text>
                  </View>
                </View>
              )}
              inverted
            />
            <View style={styles.footer}>
              <TextInput
                style={styles.messageInput}
                value={currentMessage}
                onChangeText={setCurrentMessage}
                placeholder="Type a message"
                placeholderTextColor={colors.gray}
              />
              <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
                <Ionicons name="send-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    width: '80%',
    fontWeight: 'bold',
    color: colors.gray,
  },
  view1: {
    height: '15%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#23272A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  view2: {
    height: '85%',
  },
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 9999,
  },
  messageContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    marginVertical: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E909C',
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#23272A',
    paddingBottom: 40,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 25,
    marginRight: 10,
    color: 'white',
  },
  iconButton: {
    padding: 10,
  },
});

