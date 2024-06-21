import React, { useState, useEffect } from 'react';
// <<<<<<< mathis
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList, Modal } from 'react-native';
// import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, arrayUnion, doc, getDocs } from "firebase/firestore";
// =======
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
// import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
// >>>>>>> master
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
  const [newConversationIdentifier, setNewConversationIdentifier] = useState('');
  const [newConversationEmail, setNewConversationEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
// <<<<<<< mathis
//   const [newMessage, setNewMessage] = useState('');
//   const [modalVisible, setModalVisible] = useState(false);
// =======
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [currentImage, setCurrentImage] = useState(null);
//   const router = useRouter();

// >>>>>>> master

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

//   const sendMessage = async () => {
// <<<<<<< mathis
//     if (newMessage.trim() !== '') {
//       try {
//         await addDoc(collection(db, "conversations", selectedConversationId, "messages"), {
//           text: newMessage,
//           senderId: user.email,
//           timestamp: serverTimestamp(),
//         });
//         setNewMessage('');
// =======
//     if ((currentMessage || currentImage) && selectedConversationId) {
//       const messageData = {
//         text: currentMessage,
//         senderId: user.email,
//         timestamp: new Date(),
//         image: currentImage || null,
//       };

//       try {
//         await addDoc(collection(db, "conversations", selectedConversationId, "messages"), messageData);
//         setCurrentMessage('');
//         setCurrentImage(null);
// >>>>>>> master
      } catch (error) {
        console.error("Erreur lors de l'envoi du message : ", error);
        Alert.alert("Erreur lors de l'envoi du message", error.message);
      }
    }
  };

// <<<<<<< mathis
//   const deleteConversation = async (conversationId) => {
//     try {
//       const conversationRef = doc(db, "conversations", conversationId);
//       await updateDoc(conversationRef, {
//         deletedBy: arrayUnion(user.email)
//       });
//       setSelectedConversationId(null);
//     } catch (error) {
//       console.error("Erreur lors de la suppression de la conversation : ", error);
//       Alert.alert("Erreur lors de la suppression de la conversation", error.message);
//     }
//   };

//   const formatTimestamp = (timestamp) => {
//     const messageDate = timestamp.toDate();
//     const hours = messageDate.getHours().toString().padStart(2, '0');
//     const minutes = messageDate.getMinutes().toString().padStart(2, '0');
//     return `${hours}:${minutes}`;
//   };

//   const renderItem = ({ item }) => {
//     return (
//       <View style={item.senderId === user.email ? styles.sentMessage : styles.receivedMessage}>
//         <Text style={styles.messageText}>{item.text}</Text>
//         <Text style={styles.timestamp}>{item.timestamp ? formatTimestamp(item.timestamp) : ''}</Text>
//       </View>
//     );
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMessages((prevMessages) => [...prevMessages]);
//     }, 60000); // Update every minute

//     return () => clearInterval(interval);
//   }, []);
// =======
//   const pickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (permissionResult.granted === false) {
//       Alert.alert("Permission requise", "Vous devez autoriser l'accès à la galerie pour ajouter des photos.");
//       return;
//     }

//     const pickerResult = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (pickerResult.canceled) {
//       console.log("Image picking was cancelled.");
//       return;
//     }

//     if (!pickerResult.canceled && pickerResult.assets.length > 0) {
//       const selectedImage = pickerResult.assets[0].uri;
//       console.log("Image URI:", selectedImage);
//       setCurrentImage(selectedImage);
//     } else {
//       console.log("No image picked.");
//     }
//   };
// >>>>>>> master

  return (
    <View style={[styles.container, s.paddingG]}>
      <View style={styles.view1}>
        <Text style={[s.textWhite, s.mediumTitle]}>Messages</Text>
// <<<<<<< mathis
//         <TouchableOpacity style={styles.button} onPress={createConversation}>
//           <AntDesign name="pluscircleo" size={20} color="#ffffff" />
//           <Text style={[s.textWhite, s.bold, {marginLeft: 5}]}>Ajouter des amis</Text>
// =======
//         <TouchableOpacity style={styles.button} onPress={navigateAddFriends}>
//           <AntDesign name="pluscircleo" size={20} color="#ffffff" />
//           <Text style={[s.textWhite, s.bold, {marginLeft: 5}]}>Ajouter des amis</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={navigateFriendsList}>
//           <Ionicons name="people" size={20} color="#ffffff" />
//           <Text style={[s.textWhite, s.bold, { marginLeft: 5 }]}>Friend Requests</Text>
// >>>>>>> master
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
// <<<<<<< mathis
//   conversationItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: '#333',
//     marginVertical: 5,
//     borderRadius: 10,
//   },
//   conversation: {
//     flex: 1,
//   },
//   conversationText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   deleteButton: {
//     paddingHorizontal: 10,
//   },
//   messagesContainer: {
//     flex: 1,
//     padding: 10,
//   },
//   sentMessage: {
//     alignSelf: 'flex-end',
//     backgroundColor: colors.secondary,
//     borderRadius: 10,
//     padding: 10,
//     marginVertical: 5,
//   },
//   receivedMessage: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     padding: 10,
//     marginVertical: 5,
//   },
//   messageText: {
//     color: '#000',
//   },
//   timestamp: {
//     fontSize: 10,
//     color: '#555',
//     textAlign: 'right',
//   },
//   inputMessageContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 20,
//   },
//   messageInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#000',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: colors.secondary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalButton: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: colors.secondary,
//     borderRadius: 10,
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
// =======
//   messagesList: {
//     flex: 1,
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 10,
//     padding: 10,
//   },
//   avatarContainer: {
//     width: 50,
//     height: 50,
//     marginRight: 16,
//     alignSelf: 'flex-start',
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 9999,
//   },
//   messageContent: {
//     flex: 1,
//   },
//   username: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   text: {
//     fontSize: 14,
//     marginVertical: 4,
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#8E909C',
//   },
//   imageMessage: {
//     width: 200,
//     height: 200,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#23272A',
//     paddingBottom: 40,
//   },
//   messageInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: 'gray',
//     padding: 10,
//     borderRadius: 25,
//     marginRight: 10,
//     color: 'white',
//   },
//   iconButton: {
//     padding: 10,
// >>>>>>> master
  },
});

