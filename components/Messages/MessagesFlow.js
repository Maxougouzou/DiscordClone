import React from 'react';
import { View, StyleSheet } from 'react-native';
import MessageCard from './MessageCard';

const MessagesFlow = ({ messages }) => {
    return (
        <View style={styles.container}>
            {messages.map(message => (
                <MessageCard
                    key={message.id}
                    id={message.id}
                    avatar={message.avatar}
                    pseudo={message.pseudo}
                    content={message.content}
                    date={message.date}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default MessagesFlow;
