import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import colors from '../../config/colors';
import s from '../../config/styles';
import { useRouter } from 'expo-router';

export default function LanguageSettingsPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={[styles.view1, s.paddingG]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={[s.textWhite, s.mediumTitle]}>Langues</Text>
            </View>
            <View style={styles.view2}>
            <Text style={[s.textGray, {marginTop:25}]}>Choisir la langue</Text>
                <Card>
                    <View style={styles.languageOption}>
                        <Image
                            source={require('../../assets/images/FlagFrance.png')}
                            style={styles.flag}
                        />
                        <Text style={styles.languageText}>Français</Text>
                        <Ionicons name="checkmark" size={24} color={colors.blurple} style={styles.checkIcon} />
                    </View>
                </Card>
                <Text style={styles.comingSoonText}>D'autres langues arrivent bientôt</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    view1: {
        height: '15%',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    languageText: {
        marginLeft: 8,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    view2: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    flag: {
        width: 40,
        height: 30,
        resizeMode: 'contain',
    },
    backButton: {
        marginRight: 20,
    },
    checkIcon: {
        marginLeft: 'auto',
    },
    comingSoonText: {
        marginTop: 20,
        fontSize: 16,
        color: colors.white,
        textAlign: 'center',
    },
});
