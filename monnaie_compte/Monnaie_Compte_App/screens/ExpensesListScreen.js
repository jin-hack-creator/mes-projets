import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, StyleSheet } from 'react-native';
import { List, Title, Text, TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExpensesListScreen() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('mois');
  const [filtered, setFiltered] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchExpenses = async () => {
        const data = await AsyncStorage.getItem('expenses');
        setExpenses(data ? JSON.parse(data) : []);
      };
      fetchExpenses();
    }, [])
  );

  useEffect(() => {
    let arr = [...expenses];
    if (search) {
      arr = arr.filter(e =>
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.desc && e.desc.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (period !== 'tous') {
      const now = new Date();
      arr = arr.filter(e => {
        const d = new Date(e.date);
        if (period === 'jour') return d.toDateString() === now.toDateString();
        if (period === 'semaine') {
          const first = new Date(now.setDate(now.getDate() - now.getDay()));
          const last = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          return d >= first && d <= last;
        }
        if (period === 'mois') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (period === 'annee') return d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    setFiltered(arr.reverse());
  }, [search, period, expenses]);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Liste des dépenses</Title>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          placeholder="Recherche..."
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, marginRight: 8, backgroundColor: '#1a237e', color: '#e3f2fd' }}
          placeholderTextColor="#90caf9"
        />
        <Button mode={period==='jour'?'contained':'outlined'} onPress={()=>setPeriod('jour')} style={{marginRight:2}}>Jour</Button>
        <Button mode={period==='semaine'?'contained':'outlined'} onPress={()=>setPeriod('semaine')} style={{marginRight:2}}>Sem.</Button>
        <Button mode={period==='mois'?'contained':'outlined'} onPress={()=>setPeriod('mois')} style={{marginRight:2}}>Mois</Button>
        <Button mode={period==='annee'?'contained':'outlined'} onPress={()=>setPeriod('annee')}>Année</Button>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.category + ' - ' + item.amount + ' €'}
            description={item.desc + ' | ' + new Date(item.date).toLocaleDateString()}
            left={props => <List.Icon {...props} icon="cash" color="#90caf9" />}
            titleStyle={{ color: '#e3f2fd' }}
            descriptionStyle={{ color: '#90caf9' }}
            style={{ backgroundColor: '#1a237e' }}
          />
        )}
        ListEmptyComponent={<Text style={{ color: '#e3f2fd' }}>Aucune dépense enregistrée.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#121212' },
  title: { color: '#90caf9', marginBottom: 10 },
});
