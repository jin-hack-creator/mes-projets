import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

export default function StatsScreen() {
  const [data, setData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const expenses = await AsyncStorage.getItem('expenses');
        const arr = expenses ? JSON.parse(expenses) : [];
        const byCat = {};
        arr.forEach(e => {
          byCat[e.category] = (byCat[e.category] || 0) + e.amount;
        });
        const colors = ['#1976d2', '#64b5f6', '#90caf9', '#42a5f5', '#1565c0', '#2196f3'];
        setData(Object.keys(byCat).map((cat, i) => ({
          name: cat,
          amount: byCat[cat],
          color: colors[i % colors.length],
          legendFontColor: '#333',
          legendFontSize: 14,
        })));
      };
      fetchData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Statistiques</Title>
      {data.length > 0 ? (
        <PieChart
          data={data.map(d => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: '#e3f2fd',
            legendFontSize: 14,
          }))}
          width={Dimensions.get('window').width - 30}
          height={220}
          chartConfig={{
            backgroundColor: '#121212',
            backgroundGradientFrom: '#1a237e',
            backgroundGradientTo: '#0d47a1',
            color: () => '#90caf9',
            labelColor: () => '#e3f2fd',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={{ color: '#e3f2fd' }}>Aucune donnée à afficher.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#121212' },
  title: { color: '#90caf9', marginBottom: 10 },
});
