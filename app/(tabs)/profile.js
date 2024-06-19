import React from 'react';
import { View, StyleSheet, Text, Image} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importation des icônes Ionicons
import s from '../../config/styles';
import colors from '../../config/colors';
import Card from '../../components/Card';

export default function Profile() {
  return (
    <View style={styles.container}>
      <View style={[styles.view1, s.bgBlue]}></View>
      <View style={[styles.view2, s.bgPrimary, s.padding]}>
        <Image source={require('../../assets/images/icon.png')} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Card>
            <Text style={[s.textWhite, s.largeTitle, s.bold]}>BenoitDeLaCompta</Text>
            <Text style={[s.textWhite, s.bodyText]}>benoitdelacompta</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <View style={[s.buttonGray, { flex: 0.48, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="chatbubble-outline" size={16} color="#FFF" style={{ marginRight: 5 }} />
                <Text style={[s.textWhite, s.bold]}>Ajouter un status</Text>
              </View>
              <View style={[s.buttonGray, { flex: 0.48, flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="create-outline" size={16} color="#FFF" style={{ marginRight: 5 }} />
                <Text style={[s.textWhite, s.bold]}>Modifier le profil</Text>
              </View>
            </View>
          </Card>
          <Card>
            <Text style={s.textGray}>Membre discord depuis :</Text>
            <Text style={[s.textWhite, {marginTop:5}]}>9 mai 2017</Text>
          </Card>
          <Card>
            <Text style={s.textGray}>Mes amis :</Text>
          </Card>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  view1: {
    flex: 20,
  },
  view2: {
    flex: 80,
  },
  image: {
    width: 80,
    height: 80,
    marginTop: -48,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: colors.primary,
  },
});
