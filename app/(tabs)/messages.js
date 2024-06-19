import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import useSession from '../../hooks/useSession';
import ConversationsList from '../../components/ConversationList';
import { db } from '../firebaseConfig'; 
import s from '../../config/styles';
import colors from '../../config/colors';

export default function Messages() {
  const [newConversationEmail, setNewConversationEmail] = useState('');
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

  return (
    <View style={[styles.container, s.paddingG]}>
      <View style={styles.view1}>
        <Text style={[s.textWhite, s.mediumTitle]}>Messages</Text>
        <TouchableOpacity style={styles.button} onPress={createConversation}>
          <AntDesign name="pluscircleo" size={20} color="#ffffff" /><Text style={[s.textWhite, s.bold, {marginLeft:5}]}>Ajouter des amis</Text>
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
});
