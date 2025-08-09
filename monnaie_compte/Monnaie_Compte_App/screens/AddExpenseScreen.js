import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  const saveExpense = async () => {
    if (!amount || isNaN(amount) || !category) {
      setError('Montant et catégorie obligatoires');
      return;
    }
    const expense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      desc,
      date: new Date().toISOString(),
    };
    try {
      const data = await AsyncStorage.getItem('expenses');
      const expenses = data ? JSON.parse(data) : [];
      expenses.push(expense);
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
      setAmount(''); setCategory(''); setDesc(''); setError('');
      navigation.navigate('Dépenses');
    } catch (e) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Ajouter une dépense</Title>
      <TextInput label="Montant" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} theme={{ colors: { text: '#e3f2fd', background: '#1a237e', placeholder: '#90caf9' } }} />
      <TextInput label="Catégorie" value={category} onChangeText={setCategory} style={styles.input} theme={{ colors: { text: '#e3f2fd', background: '#1a237e', placeholder: '#90caf9' } }} />
      <TextInput label="Description" value={desc} onChangeText={setDesc} style={styles.input} theme={{ colors: { text: '#e3f2fd', background: '#1a237e', placeholder: '#90caf9' } }} />
      <HelperText type="error" visible={!!error}>{error}</HelperText>
      <Button mode="contained" onPress={saveExpense} style={styles.button} labelStyle={{ color: '#e3f2fd' }}>Enregistrer</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  title: { color: '#90caf9', marginBottom: 10 },
  input: { marginBottom: 10, backgroundColor: '#1a237e', color: '#e3f2fd' },
  button: { marginTop: 10, backgroundColor: '#0d47a1' },
});
