import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, TextInput, Switch, Title } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [newBalance, setNewBalance] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleBalanceChange = async () => {
    if (!newBalance || isNaN(newBalance)) return;
    await AsyncStorage.setItem('balance', newBalance);
    Alert.alert('Succès', 'Le solde initial a été mis à jour.');
    setNewBalance('');
  };

  const handleReset = async () => {
    await AsyncStorage.removeItem('expenses');
    await AsyncStorage.removeItem('balance');
    await AsyncStorage.removeItem('welcome_shown');
    Alert.alert('Réinitialisé', 'Toutes les données ont été supprimées.');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Paramètres</Title>
      <Text style={styles.label}>Changer le solde initial :</Text>
      <TextInput
        label="Nouveau solde (FCFA)"
        value={newBalance}
        onChangeText={setNewBalance}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleBalanceChange} style={styles.button}>Mettre à jour</Button>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Mode sombre :</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <Button mode="outlined" onPress={handleReset} style={styles.resetBtn}>
        Réinitialiser toutes les données
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#232f3e', padding: 20 },
  title: { color: '#90caf9', fontSize: 26, marginBottom: 20, alignSelf: 'center' },
  label: { color: '#e3f2fd', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#232f3e', color: '#e3f2fd', marginBottom: 12 },
  button: { backgroundColor: '#1976d2', marginBottom: 20 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 20 },
  resetBtn: { borderColor: '#d32f2f', borderWidth: 1, marginTop: 30 },
});
