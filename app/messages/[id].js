import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import colors from '../../config/colors';
import s from '../../config/styles';
import { collection, query, onSnapshot, orderBy, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { calculateTimeSinceLastMessage } from '../../assets/js/utils';
import { Ionicons } from '@expo/vector-icons';
import useSession from '../../hooks/useSession';

const Conversation = () => {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchConversationData = async () => {
        const docRef = doc(db, "conversations", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const otherParticipantEmail = data.participants.find(participant => participant !== user.email);
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
        setMessages(loadedMessages);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [id, user]);

  const sendMessage = async () => {
    if (currentMessage && id) {
      const messageData = {
        text: currentMessage,
        senderId: user.email,
        timestamp: new Date(),
      };

      try {
        await addDoc(collection(db, "conversations", id, "messages"), messageData);
        setCurrentMessage('');
      } catch (error) {
        console.error("Erreur lors de l'envoi du message : ", error);
        Alert.alert("Erreur lors de l'envoi du message", error.message);
      }
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={[s.textWhite, s.mediumTitle]}>No messages found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
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
      <ScrollView style={[styles.view2, s.paddingG]}>
        {messages.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <View style={styles.avatarContainer}>
              <Image source={require('../../assets/images/avatars/avatar1.png')} style={styles.avatar} />
            </View>
            <View style={styles.messageContent}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={[s.textWhite, styles.username]}>{message.senderId}</Text>
                <Text style={[styles.timestamp]}>{calculateTimeSinceLastMessage(new Date(message.timestamp))}</Text>
              </View>
              <Text style={[s.textWhite, styles.text]}>{message.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <TextInput
          style={styles.messageInput}
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="Type a message"
          placeholderTextColor={colors.gray}
        />
        <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
          <Ionicons name="send-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
    borderRadius: 10,
    padding: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 99999,
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

export default Conversation;
