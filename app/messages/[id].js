import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import colors from '../../config/colors';
import s from '../../config/styles';
import { collection, query, onSnapshot, orderBy, doc, getDoc, addDoc } from "firebase/firestore";
import { db, storage } from '../firebaseConfig';
import { calculateTimeSinceLastMessage } from '../../assets/js/utils';
import { Ionicons } from '@expo/vector-icons';
import useSession from '../../hooks/useSession';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import GiphySearch from './GiphySearch';

const Conversation = () => {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [giphyModalVisible, setGiphyModalVisible] = useState(false);
  const [recording, setRecording] = useState(null);
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchConversationData = async () => {
        const docRef = doc(db, "conversations", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const otherParticipantEmail = data.participants && data.participants.find(participant => participant !== user.email);
          setOtherParticipant(otherParticipantEmail);
        }
      };

      fetchConversationData();

      const q = query(collection(db, "conversations", id, "messages"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedMessages = [];
        querySnapshot.forEach((doc) => {
          loadedMessages.push(doc.data());
        });
        setMessages(loadedMessages.reverse());
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [id, user]);

  const uploadFileAsync = async (uri, path) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, blob);

    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  };

  const sendMessage = async () => {
    if ((currentMessage || currentImage || currentAudio) && id) {
      let imageUrl = null;
      if (currentImage) {
        imageUrl = await uploadFileAsync(currentImage, `images/${new Date().toISOString()}`);
      }

      let audioUrl = null;
      if (currentAudio) {
        audioUrl = await uploadFileAsync(currentAudio, `audios/${new Date().toISOString()}`);
      }

      const messageData = {
        text: currentMessage,
        senderId: user.email,
        timestamp: new Date(),
        image: imageUrl,
        audio: audioUrl,
      };

      try {
        await addDoc(collection(db, "conversations", id, "messages"), messageData);
        setCurrentMessage('');
        setCurrentImage(null);
        setCurrentAudio(null);
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

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
         Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    console.log('Recording stopped and stored at', uri);
    setCurrentAudio(uri);
  };

  const viewFullScreenImage = (uri) => {
    setFullScreenImage(uri);
    setImageModalVisible(true);
  };

  const selectGif = (gif) => {
    console.log('GIF selected:', gif);
    setCurrentImage(gif.images.original.url);
    setGiphyModalVisible(false);
  };

  if (!user || loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}
      >
        <View style={{ flex: 1, backgroundColor: colors.primary }}>
          <View style={[styles.view1, s.paddingG]}>
            <View style={styles.viewTop}>
              <TouchableOpacity onPress={() => router.replace('/messages')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Image source={require('../../assets/images/avatars/avatar1.png')} style={styles.image} />
                {otherParticipant && <Text style={[s.textWhite, s.mediumTitle, { marginLeft: 5 }]}>{otherParticipant}</Text>}
              </View>
            </View>
          </View>
          {messages.length > 0 ? (
            <FlatList
              style={[styles.view2, s.paddingG]}
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
                    {item.audio && (
                      <TouchableOpacity onPress={() => Audio.Sound.createAsync({ uri: item.audio }, { shouldPlay: true })}>
                        <Ionicons name="play-circle-outline" size={24} color="#fff" />
                      </TouchableOpacity>
                    )}
                    <Text style={[s.textWhite, styles.text]}>{item.text}</Text>
                  </View>
                </View>
              )}
              inverted
            />
          ) : (
            <View style={[styles.container, styles.noMessages]}>
              <Text style={[s.textWhite, s.mediumTitle, {marginBottom:5}]}>C'est un peu vide ici !</Text>
              <Text style={[s.textGray, s.bodyText]}>Envoie ton premier message à {otherParticipant}</Text>
            </View>
          )}
          <View style={styles.footer}>
            {currentImage && (
              <Image source={{ uri: currentImage }} style={styles.imagePreview} />
            )}
            {currentAudio && (
              <View style={styles.audioPreview}>
                <Ionicons name="musical-notes" size={24} color="#fff" />
                <Text style={styles.audioText}>Audio ready to send</Text>
              </View>
            )}
            <TextInput
              style={styles.messageInput}
              value={currentMessage}
              onChangeText={setCurrentMessage}
              placeholder="Type a message"
              placeholderTextColor={colors.gray}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => setFeatureModalVisible(true)}>
              <Ionicons name="add-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
              <Ionicons name="send-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={featureModalVisible}
            onRequestClose={() => {
              setFeatureModalVisible(!featureModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color="black" />
                  <Text>Send Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => setGiphyModalVisible(true)}>
                  <Ionicons name="happy-outline" size={24} color="black" />
                  <Text>Send GIF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={startRecording}>
                  <Ionicons name="mic-outline" size={24} color="black" />
                  <Text>Record Audio</Text>
                </TouchableOpacity>
                {recording && (
                  <TouchableOpacity style={styles.modalButton} onPress={stopRecording}>
                    <Ionicons name="stop-outline" size={24} color="black" />
                    <Text>Stop Recording</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeModalButton} onPress={() => setFeatureModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={giphyModalVisible}
            onRequestClose={() => {
              setGiphyModalVisible(!giphyModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <GiphySearch 
                apiKey="sEWmkjHZbLJfQApzqhWPOZvWSJpV1kCB"
                onGifSelected={selectGif}
                style={styles.giphySearch}
              />
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setGiphyModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </Modal>
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
              <TouchableOpacity onPress={() => setImageModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  noMessages: {
    justifyContent: 'start',
    alignItems: 'center',
    marginTop: 50,
  },
  view2: {
    flex: 1,
  },
  view1: {
    backgroundColor: colors.primary,
    height: '15%',
    borderBottomWidth: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
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
  image: {
    width: 50,
    height: 50,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: colors.primary,
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
    paddingBottom: 20,
    backgroundColor: '#23272A',
    borderTopWidth: 1,
    borderTopColor: '#121212',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 25,
    marginRight: 10,
    color: 'white',
    backgroundColor: '#2f3136',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  audioText: {
    color: 'white',
    marginLeft: 5,
  },
  iconButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  closeModalButton: {
    marginTop: 10,
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
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  giphySearch: {
    width: '100%',
    height: '80%',
  },
});

export default Conversation;
