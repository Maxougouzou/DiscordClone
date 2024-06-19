// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
// import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
// import useSession from '../hooks/useSession';
// import * as ImagePicker from 'expo-image-picker';

// const db = getFirestore();
// const auth = getAuth();

// export default function Messages() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [newConversationEmail, setNewConversationEmail] = useState('');
//   const [currentMessage, setCurrentMessage] = useState('');
//   const [currentImage, setCurrentImage] = useState(null);
//   const [imageModalVisible, setImageModalVisible] = useState(false);
//   const [fullScreenImage, setFullScreenImage] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [conversations, setConversations] = useState([]);
//   const [selectedConversationId, setSelectedConversationId] = useState(null);

//   const user = useSession();

//   useEffect(() => {
//     if (user) {
//       const q = query(collection(db, "conversations"), where("participants", "array-contains", user.email));
//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         const loadedConversations = [];
//         querySnapshot.forEach((doc) => {
//           loadedConversations.push({ id: doc.id, ...doc.data() });
//         });
//         setConversations(loadedConversations);
//       });
//       return unsubscribe;
//     }
//   }, [user]);

//   useEffect(() => {
//     if (selectedConversationId) {
//       const messagesRef = collection(db, "conversations", selectedConversationId, "messages");
//       const q = query(messagesRef, orderBy("timestamp", "asc"));
//       const unsubscribe = onSnapshot(q, (querySnapshot) => {
//         const loadedMessages = [];
//         querySnapshot.forEach((doc) => {
//           loadedMessages.push(doc.data());
//         });
//         setMessages(loadedMessages);
//       });
//       return unsubscribe;
//     }
//   }, [selectedConversationId]);

//   const handleLogin = () => {
//     signInWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         console.log("Utilisateur connecté : ", userCredential.user);
//       })
//       .catch((error) => {
//         console.error("Erreur de connexion : ", error);
//         Alert.alert("Erreur de connexion", error.message);
//       });
//   };

//   const handleSignUp = () => {
//     createUserWithEmailAndPassword(auth, email, password)
//       .then((userCredential) => {
//         console.log("Compte créé avec succès : ", userCredential.user);
//       })
//       .catch((error) => {
//         console.error("Erreur lors de la création du compte : ", error);
//         Alert.alert("Erreur lors de la création du compte", error.message);
//       });
//   };

//   const handleSignOut = () => {
//     signOut(auth)
//       .then(() => {
//         console.log("Déconnexion réussie");
//       })
//       .catch((error) => {
//         console.error("Erreur de déconnexion : ", error);
//         Alert.alert("Erreur de déconnexion", error.message);
//       });
//   };

//   const createConversation = async () => {
//     if (newConversationEmail) {
//       try {
//         const newConversationRef = await addDoc(collection(db, "conversations"), {
//           participants: [user.email, newConversationEmail],
//           createdAt: new Date(),
//         });
//         setNewConversationEmail('');
//         setSelectedConversationId(newConversationRef.id);
//       } catch (error) {
//         console.error("Erreur lors de la création de la conversation : ", error);
//         Alert.alert("Erreur lors de la création de la conversation", error.message);
//       }
//     }
//   };

//   const sendMessage = async () => {
//     if ((currentMessage || currentImage) && selectedConversationId) {
//       const messageData = {
//         text: currentMessage,
//         senderId: user.email,
//         timestamp: new Date(),
//       };

//       if (currentImage) {
//         messageData.image = currentImage;
//       }

//       try {
//         await addDoc(collection(db, "conversations", selectedConversationId, "messages"), messageData);
//         setCurrentMessage('');
//         setCurrentImage(null);
//       } catch (error) {
//         console.error("Erreur lors de l'envoi du message : ", error);
//         Alert.alert("Erreur lors de l'envoi du message", error.message);
//       }
//     }
//   };

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

//   const viewFullScreenImage = (uri) => {
//     setFullScreenImage(uri);
//     setImageModalVisible(true);
//   };

//   if (user) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.welcome}>Bienvenue, {user.email}!</Text>
//         <View style={styles.header}>
//           <TextInput
//             style={styles.input}
//             value={newConversationEmail}
//             onChangeText={setNewConversationEmail}
//             placeholder="Start a conversation with email"
//           />
//           <TouchableOpacity style={styles.iconButton} onPress={createConversation}>
//             <AntDesign name="pluscircleo" size={24} color="black" />
//           </TouchableOpacity>
//         </View>
//         <FlatList
//           data={conversations}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={styles.conversationItem} onPress={() => setSelectedConversationId(item.id)}>
//               <Text>Conversation with {item.participants.filter(p => p !== user.email)}</Text>
//             </TouchableOpacity>
//           )}
//         />
//         <FlatList
//           data={messages}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity onPress={() => item.image && viewFullScreenImage(item.image)}>
//               <View style={[
//                 styles.messageBubble,
//                 item.senderId === user.email ? styles.rightBubble : styles.leftBubble
//               ]}>
//                 <Text style={styles.senderEmail}>{item.senderId}</Text>
//                 <Text style={styles.messageText}>{item.text}</Text>
//                 {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//         <View style={styles.footer}>
//           <TextInput
//             style={styles.messageInput}
//             value={currentMessage}
//             onChangeText={setCurrentMessage}
//             placeholder="Type a message"
//           />
//           <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
//             <Ionicons name="image-outline" size={24} color="black" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
//             <Ionicons name="send-outline" size={24} color="black" />
//           </TouchableOpacity>
//         </View>
//         {currentImage && <Image source={{ uri: currentImage }} style={styles.imagePreview} />}
//         <Button
//           title="Se déconnecter"
//           onPress={handleSignOut}
//           color="red"
//         />
//         <Modal
//           animationType="slide"
//           transparent={false}
//           visible={imageModalVisible}
//           onRequestClose={() => {
//             setImageModalVisible(!imageModalVisible);
//           }}
//         >
//           <View style={styles.fullScreenImageContainer}>
//             <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} />
//             <Button title="Close" onPress={() => setImageModalVisible(false)} />
//           </View>
//         </Modal>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry={true}
//       />
//       <Button
//         title="Se connecter"
//         onPress={handleLogin}
//       />
//       <Button
//         title="S'inscrire"
//         onPress={handleSignUp}
//         color="green"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   input: {
//     width: '100%',
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: 'gray',
//     padding: 10,
//     borderRadius: 5,
//   },
//   welcome: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     margin: 10,
//     textAlign: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   iconButton: {
//     marginLeft: 10,
//   },
//   conversationItem: {
//     padding: 10,
//     backgroundColor: '#f7f7f7',
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 5,
//     marginVertical: 4,
//   },
//   messageBubble: {
//     padding: 10,
//     borderRadius: 15,
//     marginVertical: 2,
//     maxWidth: '70%',
//   },
//   rightBubble: {
//     backgroundColor: '#dcf8c6',
//     alignSelf: 'flex-end',
//   },
//   leftBubble: {
//     backgroundColor: '#f0f0f0',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   senderEmail: {
//     fontWeight: 'bold',
//     marginBottom: 4,
//     fontSize: 12,
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   messageInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: 'gray',
//     padding: 10,
//     borderRadius: 25,
//   },
//   fullScreenImageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'black',
//   },
//   fullScreenImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//   },
//   image: {
//     width: 200,
//     height: 200,
//     marginTop: 5,
//     borderRadius: 10,
//   },
//   imagePreview: {
//     width: 100,
//     height: 100,
//     marginVertical: 10,
//   },
// });
import { Redirect } from "expo-router";
import useSession from '../hooks/useSession';

export default function StartPage() {
  const user = useSession();

  if (user) {
    return <Redirect href="/messages" />;
  }

  return <Redirect href="/sign-in" />;
}

