import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import colors from '../../config/colors';
import s from '../../config/styles';

const messages = [
  { id: 1, pseudo: 'John', content: 'Hello there! aoda hjzihaiodh jziaodnioa oizhja dioaziod oiahzdioj', avatar: require('../../assets/images/avatars/avatar1.png'), date: new Date('2024-06-18T09:30:00') },
  { id: 2, pseudo: 'Jane', content: 'Hey, how are you?', avatar: require('../../assets/images/avatars/avatar2.png'), date: new Date('2022-01-02T14:45:00') },
  { id: 3, pseudo: 'Max', content: 'I\'m doing great, thanks!', avatar: require('../../assets/images/avatars/avatar3.png'), date: new Date('2022-01-03T18:20:00') },
  { id: 4, pseudo: 'Sarah', content: 'What are you up to?', avatar: require('../../assets/images/avatars/avatar4.png'), date: new Date('2022-01-04T21:10:00') },
  { id: 5, pseudo: 'Mike', content: 'Just working on a project.', avatar: require('../../assets/images/avatars/avatar5.png'), date: new Date('2022-01-05T10:15:00') },
];

const Conversation = () => {
  const { id } = useLocalSearchParams();
  const message = messages.find(m => m.id == id);

  if (!message) {
    return (
      <View style={[styles.container]}>
        <Text style={[s.textWhite, s.mediumTitle]}>Message not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
        <View style={[styles.view1, s.paddingG]}></View>
    <ScrollView style={[styles.view2, s.paddingG]}>
      <View style={styles.avatarContainer}>
        <Image source={message.avatar} style={styles.avatar} />
      </View>
      <Text style={[s.textWhite, s.mediumTitle]}>{message.pseudo}</Text>
      <Text style={[s.textWhite, s.text]}>{message.content}</Text>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  view2:{
    height:'85%',
    flex: 1,
  },
  view1:{
    backgroundColor:colors.primary,
    height:'15%',
    borderBottomWidth: 0.2,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});

export default Conversation;
