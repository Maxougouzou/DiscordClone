import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import s from '../config/styles';
import colors from '../config/colors';

const NotificationCard = ({ name, type, content, date }) => {
    // Sélection de l'icône en fonction du type de notification
    let iconName;
    switch (type) {
        case 'mention':
            iconName = 'at-outline';
            size = 30;
            break;
        
        case 'friendsAdd':
            iconName = 'person-add-outline';
            size = 25;
            break;
        default:
            iconName = 'notifications-outline';
            size = 30;
            break;
    }

    return (
        <View style={styles.notificationCard}>
            <View style={styles.iconContainer}>
                <Ionicons name={iconName} size={size} color={colors.blurple} />
            </View>
            <View style={styles.content}>
                <Text style={[s.textWhite, s.bodyText, s.bold]}>
                    {name} - {content}
                </Text>
            </View>
            <Text style={styles.time}>{date}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderRadius: 5,
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
