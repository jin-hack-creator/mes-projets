import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Title, Card, Text, Modal, Portal, Button, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [inputBalance, setInputBalance] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const navigation = useNavigation();


  useEffect(() => {
    const checkWelcome = async () => {
      const shown = await AsyncStorage.getItem('welcome_shown');
      if (!shown) {
        setShowWelcome(true);
        await AsyncStorage.setItem('welcome_shown', '1');
      }
    };
    checkWelcome();
  }, []);

  
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);


  useEffect(() => {
    const checkBalance = async () => {
      const b = await AsyncStorage.getItem('balance');
      if (b === null) setShowModal(true);
      else setBalance(parseFloat(b));
    };
    checkBalance();
  }, []);


  useEffect(() => {
    const updateBalance = async () => {
      const b = await AsyncStorage.getItem('balance');
      const data = await AsyncStorage.getItem('expenses');
      const arr = data ? JSON.parse(data) : [];
      const totalSpent = arr.reduce((sum, e) => sum + e.amount, 0);
      if (b !== null) setBalance(parseFloat(b) - totalSpent);
    };
    updateBalance();
  }, []);

  const saveInitialBalance = async () => {
    if (!inputBalance || isNaN(inputBalance)) return;
    await AsyncStorage.setItem('balance', inputBalance);
    setBalance(parseFloat(inputBalance));
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{flex:1}} />
        <TouchableOpacity onPress={() => navigation.navigate('Paramètres')} style={styles.settingsBtn}>
          <MaterialCommunityIcons name="cog" size={32} color="#90caf9" />
        </TouchableOpacity>
      </View>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Title style={styles.title}>Monnaie_Compte</Title>
      <View style={styles.balanceBox}>
        <MaterialCommunityIcons name="wallet" size={32} color="#64b5f6" style={{marginRight:8}} />
        <Text style={styles.balanceText}>Solde : <Text style={{fontWeight:'bold', color:'#64b5f6'}}>{balance.toFixed(2)} FCFA</Text></Text>
      </View>
      <Portal>
        <Modal visible={showModal} onDismiss={()=>{}} contentContainerStyle={styles.modal}>
          <Text style={{color:'#e3f2fd', fontSize:18, marginBottom:10}}>Entrez votre montant de départ :</Text>
          <TextInput
            label="Solde initial (FCFA)"
            value={inputBalance}
            onChangeText={setInputBalance}
            keyboardType="numeric"
            style={styles.input}
            theme={{ colors: { text: '#e3f2fd', background: '#232f3e', placeholder: '#90caf9' } }}
          />
          <Button mode="contained" onPress={saveInitialBalance} style={{backgroundColor:'#1976d2', marginTop:10}} labelStyle={{color:'#e3f2fd'}}>Valider</Button>
        </Modal>
      </Portal>
      {showWelcome && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.text}>Bienvenue !{"\n"}Gérez vos dépenses quotidiennes facilement. Ajoutez, consultez et analysez vos dépenses.</Text>
          </Card.Content>
        </Card>
      )}
      <View style={styles.buttonsRow}>
        <Card style={styles.buttonCard} onPress={() => navigation.navigate('Ajouter')}><Card.Content><Text style={styles.buttonText}>Ajouter</Text></Card.Content></Card>
        <Card style={styles.buttonCard} onPress={() => navigation.navigate('Dépenses')}><Card.Content><Text style={styles.buttonText}>Liste</Text></Card.Content></Card>
      </View>
      <View style={styles.buttonsRow}>
        <Card style={styles.buttonCard} onPress={() => navigation.navigate('Historique')}><Card.Content><Text style={styles.buttonText}>Historique</Text></Card.Content></Card>
        <Card style={styles.buttonCard} onPress={() => navigation.navigate('Calendrier')}><Card.Content><Text style={styles.buttonText}>Calendrier</Text></Card.Content></Card>
      </View>

      {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#232f3e', paddingTop: 40 },
  logo: { width: 90, height: 90, marginBottom: 10, borderRadius: 20 },
  title: { color: '#90caf9', fontSize: 28, marginBottom: 20 },
  card: { width: '90%', backgroundColor: '#283593', marginBottom: 20 },
  text: { color: '#e3f2fd', fontSize: 16 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 },
  buttonCard: { flex: 1, margin: 5, backgroundColor: '#1976d2', borderRadius: 10 },
  buttonText: { color: '#e3f2fd', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  balanceBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#283593', borderRadius: 10, padding: 10 },
  balanceText: { color: '#e3f2fd', fontSize: 18 },
  modal: { backgroundColor: '#232f3e', padding: 20, borderRadius: 12, alignItems: 'center', margin: 30, width: '90%', maxWidth: 400, alignSelf: 'center' },
  input: { width: '100%', minWidth: 180, maxWidth: 350, alignSelf: 'center', backgroundColor: '#232f3e', color: '#e3f2fd', marginBottom: 10 },
  headerRow: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10, marginBottom: 0 },
  settingsBtn: { padding: 8, marginRight: 10 },
});
