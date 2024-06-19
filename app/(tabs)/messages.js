import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../config/colors';
import s from '../../config/styles';
import MessagesFlow from '../../components/Messages/MessagesFlow';
import { filterMessages } from '../../assets/js/utils';

const allMessages = [
    { id: 1, pseudo: 'John', content: 'Hello there! aoda hjzihaiodh jziaodnioa oizhja dioaziod oiahzdioj', avatar: require('../../assets/images/avatars/avatar1.png'), date: new Date('2024-06-18T09:30:00') },
    { id: 2, pseudo: 'Jane', content: 'Hey, how are you?', avatar: require('../../assets/images/avatars/avatar2.png'), date: new Date('2022-01-02T14:45:00') },
    { id: 3, pseudo: 'Max', content: 'I\'m doing great, thanks!', avatar: require('../../assets/images/avatars/avatar3.png'), date: new Date('2022-01-03T18:20:00') },
    { id: 4, pseudo: 'Sarah', content: 'What are you up to?', avatar: require('../../assets/images/avatars/avatar4.png'), date: new Date('2022-01-04T21:10:00') },
    { id: 5, pseudo: 'Mike', content: 'Just working on a project.', avatar: require('../../assets/images/avatars/avatar5.png'), date: new Date('2022-01-05T10:15:00') },
];

export default function Messages() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState(allMessages);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = filterMessages(allMessages, query);
        setFilteredMessages(filtered);
    };

    return (
        <View style={[styles.container, s.paddingG]}>
            <View style={styles.view1}>
                <Text style={[s.textWhite, s.mediumTitle]}>Messages</Text>
                <TouchableOpacity style={styles.button}>
                    <Ionicons name="add" size={20} color="#ffffff" /><Text style={[s.textWhite, s.bold]}>Ajouter des amis</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.view2}>
                <View style={[styles.inputContainer, s.bgDark]}>
                    <Ionicons name="search" size={20} color="#8E909C" />
                    <TextInput
                        style={styles.input}
                        placeholder="Recherche"
                        placeholderTextColor={colors.gray}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
                <MessagesFlow messages={filteredMessages} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primary,
        height: '100%',
    },
    input: {
        marginLeft: 10,
        fontSize: 16,
        width: '80%',
        fontWeight: 'bold',
        color: colors.gray,
    },
    view1: {
        height: '15%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 10,
    },
    button: {
        flexDirection: 'row',
        borderRadius: 20,
        backgroundColor: '#23272A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    view2: {
        height: '85%',
    },
    inputContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        alignItems: 'center',
        padding: 10,
        marginVertical: 10,
    },
});
