import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await AsyncStorage.getItem('expenses');
      const arr = data ? JSON.parse(data) : [];
      const marks = {};
      arr.forEach(e => {
        const d = e.date.slice(0, 10);
        marks[d] = { marked: true, dotColor: '#1976d2' };
      });
      setMarkedDates(marks);
      setExpenses(arr);
    };
    fetchExpenses();
  }, []);

  const expensesForDate = expenses.filter(e => e.date.slice(0, 10) === selectedDate);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Calendrier</Title>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#0d47a1', marked: true, dotColor: '#90caf9' },
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: '#121212',
          calendarBackground: '#121212',
          todayTextColor: '#90caf9',
          selectedDayBackgroundColor: '#0d47a1',
          selectedDayTextColor: '#e3f2fd',
          dayTextColor: '#e3f2fd',
          textDisabledColor: '#424242',
          monthTextColor: '#90caf9',
          arrowColor: '#90caf9',
        }}
      />
      {selectedDate ? (
        <View style={styles.expensesBox}>
          <Text style={{ color: '#90caf9' }}>Dépenses du {selectedDate} :</Text>
          {expensesForDate.length > 0 ? expensesForDate.map(e => (
            <Text key={e.id} style={{ color: '#e3f2fd' }}>- {e.category} : {e.amount} FCFA ({e.desc})</Text>
          )) : <Text style={{ color: '#e3f2fd' }}>Aucune dépense.</Text>}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#121212' },
  title: { color: '#90caf9', marginBottom: 10 },
  expensesBox: { marginTop: 10, backgroundColor: '#1a237e', borderRadius: 8, padding: 10 },
});
