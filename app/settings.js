import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '../config/colors';
import s from '../config/styles';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

export default function Settings() {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('profile');
    };

    return (
        <View style={ styles.container }>
            <View style={[styles.view1, s.paddingG]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={[s.textWhite, s.mediumTitle]}>Paramètres</Text>
            </View>
            <View style={ [s.paddingG, styles.view2] }>
                <Text style={[s.textGray]}>Paramètres du compte </Text>
                <Card>
                    <Text>Paramètre 1</Text>
                </Card>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    view1: {
        height: '15%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    view2: {
        height: '85%',
    },
    backButton: {
        marginRight: 20,
      },
});