import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import MessageCard from '../components/Messages/MessageCard';

export default function ConversationsList({ conversations, user, setSelectedConversationId }) {
  const router = useRouter();

  const handlePress = (id) => {
    setSelectedConversationId(id);
    router.push(`/messages/${id}`);
  };

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <MessageCard 
          message={{
            senderId: item.participants.find(p => user != null && p !== user.email),
            text: 'Tap to view conversation',
            timestamp: item.createdAt,
            avatar: require('../assets/images/avatars/avatar1.png'),
          }}
          onPress={() => handlePress(item.id)}
        />
      )}
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
