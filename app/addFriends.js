import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList } from 'react-native';
import { collection, addDoc, query, where, getDocs, doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import s from '../config/styles';
import colors from '../config/colors';
import useSession from '../hooks/useSession';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddFriends({ navigation }) {
  const [email, setEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [friendEmails, setFriendEmails] = useState([]);
  const user = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.id);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const friendsList = doc.data().friends || [];
          setFriends(friendsList);
          fetchFriendEmails(friendsList);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  const fetchFriendEmails = async (friendIds) => {
    try {
      const emails = [];
      for (const id of friendIds) {
        const friendDoc = await getDoc(doc(db, "users", id));
        if (friendDoc.exists()) {
          emails.push(friendDoc.data().email);
        }
      }
      setFriendEmails(emails);
    } catch (error) {
      console.error("Error fetching friend emails: ", error);
    }
  };

  const addFriend = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }

    try {
      // Vérifier si l'utilisateur existe
      const userQuery = query(collection(db, "users"), where("email", "==", email));
      const userQuerySnapshot = await getDocs(userQuery);

      if (userQuerySnapshot.empty) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Vérifier si une demande d'ami est déjà en cours
      const requestQuery = query(
        collection(db, "friend_requests"),
        where("requesterUid", "==", user.id), // Using UID as document ID
        where("recipientUid", "==", userQuerySnapshot.docs[0].id),
        where("status", "==", "pending")
      );
      const requestQuerySnapshot = await getDocs(requestQuery);

      if (!requestQuerySnapshot.empty) {
        Alert.alert("Error", "Friend request already in progress");
        return;
      }

      // Vérifier si l'utilisateur est déjà un ami
      const userDoc = userQuerySnapshot.docs[0];
      const friendUid = userDoc.id;
      const currentUserDoc = await getDoc(doc(db, "users", user.id));

      if (currentUserDoc.exists() && (currentUserDoc.data().friends || []).includes(friendUid)) {
        Alert.alert("Error", "You already have this contact as a friend");
        return;
      }

      // Ajouter la demande d'ami
      await addDoc(collection(db, "friend_requests"), {
        requesterUid: user.id, 
        recipientUid: friendUid,
        status: "pending",
      });

      Alert.alert("Success", "Friend request sent successfully!");
      setEmail('');
    } catch (error) {
      console.error("Error sending friend request: ", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/messages")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[s.textWhite, s.mediumTitle]}>Ajouter un ami</Text>
      </View>
      <View style={[styles.container, s.paddingG]}>
        <TextInput
          style={styles.input}
          placeholder="Entrer l'email de l'ami à ajouter"
          placeholderTextColor={colors.gray}
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={styles.button} onPress={addFriend}>
          <Text style={[s.textWhite, s.bold]}>Ajouter</Text>
        </TouchableOpacity>
        <Text style={[s.textWhite, s.mediumTitle, styles.friendsTitle]}>Vos amis</Text>
        {friendEmails.length === 0 ? ( 
          <Text style={[s.textWhite, styles.noFriendsText]}>Vous n'avez aucun ami pour l'instant.</Text>
        ) : (
          <FlatList
            data={friendEmails} 
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.friendContainer}>
                <Text style={s.textWhite}>{item}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  header: {
    height: '15%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 20,
  },
  container: {
    height: '85%',
    flex: 1,
    marginTop: 75,
    justifyContent: 'start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.white,
    marginVertical: 10,
    backgroundColor: '#23272A',
  },
  button: {
    backgroundColor: colors.blurple,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  friendsTitle: {
    marginTop: 30,
    marginTop: 100,
    marginBottom: 10,
  },
  noFriendsText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  friendContainer: {
    backgroundColor: '#23272A',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
});
