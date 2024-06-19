import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import s from '../../config/styles';
import { calculateTimeSinceLastMessage } from '../../assets/js/utils';

const MessageCard = ({ message, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Image source={message.avatar} style={styles.avatar} />
        </View>
        <View style={[styles.contentContainer]}>
          <View style={styles.usernameContainer}>
            <Text style={[styles.username, s.textGray]}>{message.senderId}</Text>
            <Text style={[styles.time]}>{calculateTimeSinceLastMessage(new Date(message.timestamp))}</Text>
          </View>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.content]}>
            {message.text}
          </Text>
          {message.image && <Image source={{ uri: message.image }} style={styles.image} />}
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
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default MessageCard;
