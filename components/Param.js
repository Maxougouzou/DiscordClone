import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../config/colors';

export default function Param({ iconName, iconType, label, onPress, isSignOut }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.paramContainer}>
            <View style={styles.paramInnerContainer}>
                {iconType === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={iconName} size={28} color={colors.white} />
                ) : (
                    <Ionicons name={iconName} size={28} color={colors.white} />
                )}
                <Text style={[styles.textParam, { marginLeft: 15, color: isSignOut ? colors.red : colors.white }]}>
                    {label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={26} color={colors.white} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    paramContainer: {
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paramInnerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textParam: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: 'bold',
    },
});
