import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import useSession from '../hooks/useSession';
import colors from '../config/colors';
import s from '../config/styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const acceptFriendRequest = async (requestId, requesterUid, recipientUid) => {
  try {
    const requestRef = doc(db, "friend_requests", requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Friend request not found");
    }

    await updateDoc(requestRef, {
      status: "accepted",
    });

    const requesterRef = doc(db, "users", requesterUid);
    const recipientRef = doc(db, "users", recipientUid);

    let requesterDoc = await getDoc(requesterRef);
    let recipientDoc = await getDoc(recipientRef);

    if (!requesterDoc.exists()) {
      await setDoc(requesterRef, { friends: [] });
      requesterDoc = await getDoc(requesterRef);
    }

    if (!recipientDoc.exists()) {
      await setDoc(recipientRef, { friends: [] });
      recipientDoc = await getDoc(recipientRef);
    }

    await updateDoc(requesterRef, {
      friends: arrayUnion(recipientUid),
    });

    await updateDoc(recipientRef, {
      friends: arrayUnion(requesterUid),
    });

    Alert.alert("Success", "Friend request accepted!");
  } catch (error) {
    console.error("Error accepting friend request: ", error);
    Alert.alert("Error", error.message);
  }
};

const refuseFriendRequest = async (requestId) => {
  try {
    const requestRef = doc(db, "friend_requests", requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Friend request not found");
    }

    await deleteDoc(requestRef);

    Alert.alert("Success", "Friend request refused!");
  } catch (error) {
    console.error("Error refusing friend request: ", error);
    Alert.alert("Error", error.message);
  }
};

export default function FriendRequests() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequestEmails, setReceivedRequestEmails] = useState([]);
  const [sentRequestEmails, setSentRequestEmails] = useState([]);
  const user = useSession();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const receivedQuery = query(
        collection(db, "friend_requests"),
        where("recipientUid", "==", user.id),
        where("status", "==", "pending")
      );

      const sentQuery = query(
        collection(db, "friend_requests"),
        where("requesterUid", "==", user.id),
        where("status", "==", "pending")
      );

      const unsubscribeReceived = onSnapshot(receivedQuery, (querySnapshot) => {
        const requestsData = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });
        setReceivedRequests(requestsData);
        fetchEmails(requestsData, setReceivedRequestEmails, "requesterUid"); // Fetch emails for received requests
      });

      const unsubscribeSent = onSnapshot(sentQuery, (querySnapshot) => {
        const requestsData = [];
        querySnapshot.forEach((doc) => {
          requestsData.push({ id: doc.id, ...doc.data() });
        });
        setSentRequests(requestsData);
        fetchEmails(requestsData, setSentRequestEmails, "recipientUid"); // Fetch emails for sent requests
      });

      return () => {
        unsubscribeReceived();
        unsubscribeSent();
      };
    }
  }, [user]);

  const fetchEmails = async (requests, setEmails, key) => {
    try {
      const emails = [];
      for (const request of requests) {
        const userDoc = await getDoc(doc(db, "users", request[key]));
        if (userDoc.exists()) {
          emails.push(userDoc.data().email);
        }
      }
      setEmails(emails);
    } catch (error) {
      console.error("Error fetching emails: ", error);
    }
  };

  const handleAccept = async (requestId, requesterUid) => {
    await acceptFriendRequest(requestId, requesterUid, user.id);
  };

  const handleRefuse = async (requestId) => {
    await refuseFriendRequest(requestId);
  };

  return (
    <View style={[styles.container, s.paddingG]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={[s.textWhite, s.mediumTitle]}>Friend Requests</Text>
      </View>

      <Text style={[s.textWhite, s.mediumTitle, styles.categoryTitle]}>Received Requests</Text>
      {receivedRequestEmails.length === 0 ? (
        <Text style={[s.textWhite, styles.noRequestsText]}>No received friend requests pending</Text>
      ) : (
        <FlatList
          data={receivedRequestEmails} // Use emails for received requests
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.requestContainer}>
              <Text style={[s.textWhite, styles.requestText]}>{item}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(receivedRequests[index].id, receivedRequests[index].requesterUid)}>
                  <Text style={[s.textWhite, s.bold]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.refuseButton} onPress={() => handleRefuse(receivedRequests[index].id)}>
                  <Text style={[s.textWhite, s.bold]}>Refuse</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Text style={[s.textWhite, s.mediumTitle, styles.categoryTitle]}>Sent Requests</Text>
      {sentRequestEmails.length === 0 ? (
        <Text style={[s.textWhite, styles.noRequestsText]}>No sent friend requests pending</Text>
      ) : (
        <FlatList
          data={sentRequestEmails} // Use emails for sent requests
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.requestContainer}>
              <Text style={[s.textWhite, styles.requestText]}>{item}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleRefuse(sentRequests[index].id)}>
                <Text style={[s.textWhite, s.bold]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    height: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 50,
  },
  backButton: {
    marginRight: 20,
  },
  categoryTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  requestContainer: {
    backgroundColor: '#23272A',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#7289DA',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  refuseButton: {
    backgroundColor: '#FF5555',
    padding: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#FF5555',
    padding: 10,
    borderRadius: 10,
  },
  noRequestsText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
});
