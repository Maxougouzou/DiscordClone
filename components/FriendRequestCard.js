import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import s from '../config/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../config/colors';


const NotificationCard = () => {
    return (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={25} color={colors.blurple} />
            </View>
            <View style={styles.content}>
                <Text style={[s.textWhite, s.bodyText, s.bold]}>
                    Joueur1, Joueur2 et X autres t'ont envoyé des demandes d'amis.
                </Text>
                <View style={[s.buttonGray , {marginTop:15, marginRight:40}]}>
                    <Text style={[s.textWhite, s.bold]}>Voir les demandes d'amis</Text>
                </View>
            </View>
            <Text style={styles.time}>3j</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'start',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        borderBottomWidth: 0.2,
        borderColor: '#8E909C',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 9999,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 9999,
        backgroundColor: '#23272A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.2,
        borderColor: 'rgba(255, 255, 255, 0.20)',
    },
    content: {
        flex: 1,
        marginLeft: 25,
        marginRight: 25,
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
    },
    time: {
        textAlign: 'right',
        fontSize: 12,
        color: '#8E909C',
    },
});

export default NotificationCard;
