import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import s from '../../config/styles';
import colors from '../../config/colors';

export default function Servers() {
  return (
    <View style={[s.bgPrimary, styles.container]}>
      <Text style={s.textWhite}>Servers Page</Text>
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
    paddingHorizontal: 10,
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
