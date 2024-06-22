import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import colors from '../config/colors';
import s from '../config/styles';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Param from '../components/Param';
import { auth } from '../app/firebaseConfig';

export default function Settings() {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('profile');
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

    const handleAssistance = () => {
        Linking.openURL('https://support.discord.com/hc/en-us');
    };

    const handlePress = (route) => {
        router.push(route);
    };

    const settingsPages = [
        {
            iconName: "account-circle",
            iconType: "MaterialCommunityIcons",
            label: "Mon compte",
            route: "/settings/account"
        },
        {
            iconName: "language",
            iconType: "Ionicons",
            label: "Langue",
            route: "/settings/language"
        },
        {
            iconName: "help-circle",
            iconType: "MaterialCommunityIcons",
            label: "Assistance",
            route: handleAssistance 
        },
        {
            iconName: "exit-to-app",
            iconType: "MaterialCommunityIcons",
            label: "Déconnexion",
            route: handleSignOut, 
            isSignOut: true 
        }
    ];

    return (
        <View style={styles.container}>
            <View style={[styles.view1, s.paddingG]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={[s.textWhite, s.mediumTitle]}>Paramètres</Text>
            </View>
            <View style={[s.paddingG, styles.view2]}>
                <Text style={[s.textGray, {marginTop:25}]}>Paramètres du compte</Text>
                <Card>
                    {settingsPages.map((page, index) => (
                        <Param
                            key={index}
                            iconName={page.iconName}
                            iconType={page.iconType}
                            label={page.label}
                            onPress={typeof page.route === 'function' ? page.route : () => handlePress(page.route)}
                            isSignOut={page.isSignOut} 
                        />
                    ))}
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
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
    backButton: {
        marginRight: 20,
    },
});
