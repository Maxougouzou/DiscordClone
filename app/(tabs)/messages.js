import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList, Modal } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, arrayUnion, doc, getDocs } from "firebase/firestore";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import useSession from '../../hooks/useSession';
import ConversationsList from '../../components/ConversationList';
import { db } from '../firebaseConfig'; 
import s from '../../config/styles';
import colors from '../../config/colors';

export default function Messages() {
  const [newConversationIdentifier, setNewConversationIdentifier] = useState('');
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const user = useSession();

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "conversations"), where("participants", "array-contains", user.email));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedConversations = [];
        querySnapshot.forEach((doc) => {
          const conversation = { id: doc.id, ...doc.data() };
          if (!conversation.deletedBy || !conversation.deletedBy.includes(user.email)) {
            loadedConversations.push(conversation);
          }
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
          loadedMessages.push({ id: doc.id, ...doc.data() });
        });
        setMessages(loadedMessages);
      });
      return unsubscribe;
    }
  }, [selectedConversationId]);

  const createConversation = async () => {
    if (newConversationIdentifier) {
      let recipientEmail = newConversationIdentifier;

      // Check if the identifier is not an email
      if (!newConversationIdentifier.includes('@')) {
        // Find the user by pseudo
        const q = query(collection(db, "users"), where("pseudo", "==", newConversationIdentifier));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          recipientEmail = querySnapshot.docs[0].data().email;
        } else {
          Alert.alert('Erreur', 'Pseudo non trouvé.');
          return;
        }
      }

      try {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participants: [user.email, recipientEmail],
          createdAt: serverTimestamp(),
          deletedBy: [],
        });
        setNewConversationIdentifier('');
        setSelectedConversationId(newConversationRef.id);
        setModalVisible(false); // Close the modal after creating the conversation
      } catch (error) {
        console.error("Erreur lors de la création de la conversation : ", error);
        Alert.alert("Erreur lors de la création de la conversation", error.message);
      }
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      try {
        await addDoc(collection(db, "conversations", selectedConversationId, "messages"), {
          text: newMessage,
          senderId: user.email,
          timestamp: serverTimestamp(),
        });
        setNewMessage('');
      } catch (error) {
        console.error("Erreur lors de l'envoi du message : ", error);
        Alert.alert("Erreur lors de l'envoi du message", error.message);
      }
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await updateDoc(conversationRef, {
        deletedBy: arrayUnion(user.email)
      });
      setSelectedConversationId(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation : ", error);
      Alert.alert("Erreur lors de la suppression de la conversation", error.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = timestamp.toDate();
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderItem = ({ item }) => {
    return (
      <View style={item.senderId === user.email ? styles.sentMessage : styles.receivedMessage}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp ? formatTimestamp(item.timestamp) : ''}</Text>
      </View>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prevMessages) => [...prevMessages]);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, s.paddingG]}>
      <View style={styles.view1}>
        <Text style={[s.textWhite, s.mediumTitle]}>Messages</Text>
        <TouchableOpacity style={styles.button} onPress={createConversation}>
          <AntDesign name="pluscircleo" size={20} color="#ffffff" />
          <Text style={[s.textWhite, s.bold, {marginLeft: 5}]}>Ajouter des amis</Text>
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
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <View style={styles.conversationItem}>
              <TouchableOpacity
                style={styles.conversation}
                onPress={() => setSelectedConversationId(item.id)}
              >
                <Text style={styles.conversationText}>{item.participants.filter(email => email !== user.email).join(', ')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteConversation(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      {selectedConversationId && (
        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            inverted
          />
          <View style={styles.inputMessageContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Tapez votre message..."
              placeholderTextColor={colors.gray}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Pseudo ou Email"
              placeholderTextColor={colors.gray}
              value={newConversationIdentifier}
              onChangeText={setNewConversationIdentifier}
            />
            <TouchableOpacity style={styles.modalButton} onPress={createConversation}>
              <Text style={styles.modalButtonText}>Créer une conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#333',
    marginVertical: 5,
    borderRadius: 10,
  },
  conversation: {
    flex: 1,
  },
  conversationText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    paddingHorizontal: 10,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  messageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    textAlign: 'right',
  },
  inputMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  messageInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.secondary,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
