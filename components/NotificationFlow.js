import React from 'react';
import { View, Text } from 'react-native';
import NotificationCard from './NotificationCard';
import s from '../config/styles';

const notifications = [
    { name: 'Notification 1', type: 'mention', content: 'Contenu de la notification 1', date: '3j' },
    { name: 'Notification 2', type: 'friendsAdd', content: 'Contenu de la notification 2', date: '2j' },
    { name: 'Notification 3', type: 'default', content: 'Contenu de la notification 3', date: '1j' },
];

const NotificationFlow = () => {
    return (
        <View style={s.paddingG}>
            <Text style={[s.textGray, {paddingBottom:5}] }>Activité récentes</Text>
            {notifications.map((notification, index) => (
                <NotificationCard
                    key={index}
                    name={notification.name}
                    type={notification.type}
                    content={notification.content}
                    date={notification.date}
                />
            ))}
        </View>
    );
};

export default NotificationFlow;
