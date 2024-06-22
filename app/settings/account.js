import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../config/colors';
import s from '../../config/styles';
import { useRouter } from 'expo-router';
import useSession from '../../hooks/useSession';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';

export default function AccountSettingsPage() {
    const router = useRouter();
    const user = useSession();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isReauthModalVisible, setIsReauthModalVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnapshot = await getDoc(userDocRef);
                if (docSnapshot.exists()) {
                    setUserData(docSnapshot.data());
                } else {
                    console.log("No such document!");
                }
            } else {
                console.log("No user logged in");
            }
        };

        fetchUserProfile();
    }, [user]);

    const handleGoBack = () => {
        router.push('profile');
    };

    const confirmDeleteAccount = () => {
        setIsModalVisible(true);
    };

    const reauthenticate = async (password) => {
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);
            console.log("User reauthenticated");
            handleDeleteAccount();
        } catch (error) {
            console.error("Erreur lors de la réauthentification : ", error);
            Alert.alert("Erreur", "Réauthentification échouée. Veuillez vérifier votre mot de passe.");
        }
    };

    const handleDeleteAccount = async () => {
        setIsModalVisible(false);
        try {
            console.log("Attempting to delete user document...");
            const userDocRef = doc(db, 'users', user.uid);
            await deleteDoc(userDocRef);
            console.log("User document deleted");

            console.log("Attempting to delete user from auth...");
            await deleteUser(auth.currentUser);
            console.log("User deleted from auth");

            handleSignOut();
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                console.log("Reauthentication required");
                setIsReauthModalVisible(true);
            } else {
                console.error("Erreur lors de la suppression du compte : ", error);
                Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression du compte.");
            }
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log("Déconnexion réussie");
            router.replace('/sign-in');
        } catch (error) {
            console.error("Erreur de déconnexion : ", error);
        }
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.view1, s.paddingG]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={[s.textWhite, s.mediumTitle]}>Mon compte</Text>
            </View>
            <View style={[s.paddingG, styles.view2]}>
                <Text style={[s.textGray, { marginTop: 25 }]}>Informations du compte</Text>
                <Card>
                    <View style={styles.infoContainer}>
                        <View style={[styles.paramInnerContainer]}>
                            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
                                <Ionicons name={"person-outline"} size={24} color={colors.white} style={{ marginBottom: 2 }} />
                                <Text style={[styles.textParam, { marginLeft: 15, color: colors.white }]}>Pseudo :</Text>
                            </View>
                            <View>
                                <Text style={[s.textGray, { marginTop: 5 }]}>
                                    {user.pseudo}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.paramInnerContainer]}>
                            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
                                <Ionicons name={"mail-outline"} size={26} color={colors.white} />
                                <Text style={[styles.textParam, { marginLeft: 15, color: colors.white }]}>Adresse mail :</Text>
                            </View>
                            <View>
                                <Text style={[s.textGray, { marginTop: 5 }]}>
                                    {user.email}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.paramInnerContainer]}>
                            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
                                <Ionicons name={"calendar"} size={26} color={colors.white} />
                                <Text style={[styles.textParam, { marginLeft: 15, color: colors.white }]}>Date de création :</Text>
                            </View>
                            <View>
                                <Text style={[s.textGray, { marginTop: 5 }]}>
                                    {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>
                <Text style={[s.textGray, { marginTop: 25 }]}>Gestion de compte</Text>
                <Card>
                    <TouchableOpacity onPress={confirmDeleteAccount}>
                        <Text style={styles.deleteAccountText}>Supprimer le compte</Text>
                    </TouchableOpacity>
                </Card>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                    setIsModalVisible(!isModalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Êtes-vous sûr de vouloir supprimer votre compte ?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.textStyle}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isReauthModalVisible}
                onRequestClose={() => {
                    setIsReauthModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Veuillez entrer votre mot de passe pour confirmer :</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor={colors.gray}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonCancel]}
                                onPress={() => setIsReauthModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm]}
                                onPress={() => reauthenticate(password)}
                            >
                                <Text style={styles.textStyle}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    view1: {
        height: '15%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 10,
    },
    view2: {
        height: '85%',
    },
    infoContainer: {
        paddingVertical: 10,
    },
    infoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 5,
    },
    backButton: {
        marginRight: 20,
    },
    deleteAccountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.red,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    loadingText: {
        fontSize: 18,
        color: colors.white,
    },
    paramContainer: {
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paramInnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    textParam: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: colors.white,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginHorizontal: 10,
    },
    buttonCancel: {
        backgroundColor: colors.blurple,
    },
    buttonConfirm: {
        backgroundColor: colors.red,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 5,
        color: colors.white,
        marginBottom: 20,
    },
});

