import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MessageCard from '../components/Messages/MessageCard';
import { db } from '../app/firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function ConversationsList({ conversations, user, setSelectedConversationId, deleteConversation }) {
  const [lastMessages, setLastMessages] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchLastMessages = async () => {
      const messages = {};
      for (const conversation of conversations) {
        const messagesRef = collection(db, "conversations", conversation.id, "messages");
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          messages[conversation.id] = querySnapshot.docs[0].data();
        }
      }
      setLastMessages(messages);
    };
    
    fetchLastMessages();
  }, [conversations]);

  const handlePress = (id) => {
    setSelectedConversationId(id);
    router.push(`/messages/${id}`);
  };

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const lastMessage = lastMessages[item.id];
        return (
          <MessageCard 
            message={{
              senderId: item.participants.find(p => user != null && p !== user.email),
              text: lastMessage ? lastMessage.text : <i>Commencez à échanger</i>,
              text: lastMessage ? lastMessage.text : 'No messages yet',
              timestamp: lastMessage ? lastMessage.timestamp.toDate().toString() : item.createdAt.toDate().toString(),
              avatar: require('../assets/images/avatars/avatar1.png'),
            }}
            onPress={() => handlePress(item.id)}
            onDelete={() => deleteConversation(item.id)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  conversationItem: {
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
