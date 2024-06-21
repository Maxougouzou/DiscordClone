import React from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import MessageCard from '../components/Messages/MessageCard';

export default function ConversationsList({ conversations, user, setSelectedConversationId, deleteConversation }) {
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
          onDelete={() => deleteConversation(item.id)}
        />
      )}
    />
  );
}
