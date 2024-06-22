import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, FlatList, Modal } from 'react-native';
import { signOut, getAuth } from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, doc, getDocs, updateDoc, setDoc, getDoc, query, where } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import s from '../../config/styles';
import colors from '../../config/colors';
import Card from '../../components/Card';
import useSession from '../../hooks/useSession';
import { db, storage } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function Profile() {
  const user = useSession();
  const auth = getAuth();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [friends, setFriends] = useState([]);
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchFriends = async () => {
        const friendsRef = collection(db, 'friends');
        const q = query(friendsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const friendsList = querySnapshot.docs.map(doc => doc.data());
        setFriends(friendsList);
      };
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          if (userData.photoURL) {
            setImage({ uri: userData.photoURL });
          }
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Déconnexion réussie");
      router.replace('/sign-in');
    } catch (error) {
      console.error("Erreur de déconnexion : ", error);
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

    if (!pickerResult.canceled) {
      const { uri } = pickerResult.assets[0];
      setImage({ uri });
    }
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const uploadImage = async () => {
    if (!image || !user) return;

    try {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const photoURL = await getDownloadURL(storageRef);

      const userDocRef = doc(db, 'users', user.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        await updateDoc(userDocRef, { photoURL });
      } else {
        await setDoc(userDocRef, { photoURL });
      }

      console.log('Image téléchargée avec succès:', photoURL);
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.');

      setImage({ uri: photoURL });
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image : ", error);
      Alert.alert('Erreur', "Erreur lors de l'upload de l'image");
    }
  };

  const handleSaveStatus = async () => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { status });
      setEditingStatus(false);
      Alert.alert('Succès', 'Votre statut a été mis à jour.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendName}>{item.name}</Text>
    </View>
  );

  return (
    
    <View style={styles.container}>
      <View style={[styles.view1, s.bgBlue]}></View>
      <View style={[styles.view2, s.bgPrimary, s.padding]}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={image ? { uri: image.uri } : require('../../assets/images/icon.png')} style={styles.image} />
        </TouchableOpacity>
        
        <View style={{ flex: 1 }}>
          <Card>
            {user && <Text style={[s.textWhite, s.largeTitle, s.bold]}>{user.pseudo}</Text>}
            {user && <Text style={[s.textWhite, s.bodyText]}>{user.email}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <View style={[s.buttonBlurple, { flex: 0.48, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="chatbubble-outline" size={16} color="#FFF" style={{ marginRight: 5 }} />
                <Text style={[s.textWhite, s.bold]}>Ajouter un status</Text>
              </View>
              <View style={[s.buttonBlurple, { flex: 0.48, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="create-outline" size={16} color="#FFF" style={{ marginRight: 5 }} />
                <Text style={[s.textWhite, s.bold]}>Modifier le profil</Text>
              </View>
            </View>
          </Card>
          <Card>
            <Text style={s.textGray}>Membre discord depuis :</Text>
            <Text style={[s.textWhite, { marginTop: 5 }]}>{new Date(user?.createdAt?.seconds * 1000).toLocaleDateString()}</Text>
          </Card>
          <Card>
            <Text style={s.textGray}>Mes amis :</Text>
            <FlatList
              data={friends}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </Card>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={pickImage}>
              <Image source={image ? { uri: image.uri } : require('../../assets/images/avatars/avatar1.png')} style={styles.modalImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSave} onPress={uploadImage}>
              <Text style={styles.buttonText}>Sauvegarder la photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonClose} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{width: 35, height: 35, borderRadius: 9999, backgroundColor: colors.primary, position: 'absolute', top: 50, right: 20, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={22} color="#FFF"/>
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  view1: {
    flex: 20,
  },
  view2: {
    flex: 80,
  },
  image: {
    width: 80,
    height: 80,
    marginTop: -48,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  friendItem: {
    padding: 10,
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
  },
  friendName: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 99999,
    borderWidth: 4,
    marginTop: -80,
    borderColor: colors.primary,
  },
  modalButtonSave: {
    backgroundColor: colors.blurple,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: 200,
  },
  modalButtonClose: {
    backgroundColor: colors.turquoise,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: 200,
  },
});
