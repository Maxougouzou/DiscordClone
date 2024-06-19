import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import FriendRequestCard from '../../components/FriendRequestCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../config/colors';
import s from '../../config/styles';
import NotificationFlow from '../../components/NotificationFlow';

export default function Notifications() {
  return (
    <View style={styles.container}>
      <View style={[styles.view1, s.paddingG]}>
        <Text style={[s.textWhite, s.mediumTitle]}>Notifications</Text>
        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E909C" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.view2}>
        <FriendRequestCard />
        <View>
          <NotificationFlow />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  view1: {
    height: '15%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#23272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  view2: {
    height: '85%',
  },
});
