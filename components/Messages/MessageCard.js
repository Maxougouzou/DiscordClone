import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import s from '../../config/styles';
import { calculateTimeSinceLastMessage } from '../../assets/js/utils';

const MessageCard = ({ id, avatar, pseudo, content, date }) => {
    const router = useRouter();

    const handleCardPress = () => {
        router.push(`/messages/${id}`);
    };

    return (
        <TouchableOpacity onPress={handleCardPress}>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Image source={avatar} style={styles.avatar} />
                </View>
                <View style={[styles.contentContainer]}>
                    <View style={styles.usernameContainer}>
                        <Text style={[styles.username, s.textGray]}>{pseudo}</Text>
                        <Text style={[styles.time]}>{calculateTimeSinceLastMessage(date)}</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.content]}>
                        {content}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
    },
    usernameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    username: {
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 16,
    },
    content: {
        fontSize: 14,
        color: '#8E909C',
    },
    time: {
        fontSize: 12,
        color: '#8E909C',
    },
});

export default MessageCard;
