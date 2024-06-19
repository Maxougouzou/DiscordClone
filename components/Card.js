import React from 'react';
import { View, StyleSheet } from 'react-native';
import s from '../config/styles';

const Card = ({ children }) => {
    return (
        <View style={[styles.card, s.borderRadius, s.bgSecondary]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 15,
        width: '100%',
        marginTop: 20,
    },
});

export default Card;
