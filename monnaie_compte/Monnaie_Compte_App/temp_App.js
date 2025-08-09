import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './screens/HomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import ExpensesListScreen from './screens/ExpensesListScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CalendarScreen from './screens/CalendarScreen';
import { theme } from './theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Accueil"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#90caf9',
            tabBarStyle: { backgroundColor: '#e3f2fd' },
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Accueil') iconName = 'home';
              else if (route.name === 'Ajouter') iconName = 'plus-circle';
              else if (route.name === 'Dépenses') iconName = 'format-list-bulleted';
              else if (route.name === 'Historique') iconName = 'chart-pie';
              else if (route.name === 'Paramètres') iconName = 'cog';
              else if (route.name === 'Calendrier') iconName = 'calendar';
              return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
            },
          })}
        >
          <Tab.Screen name="Accueil" component={HomeScreen} />
          <Tab.Screen name="Ajouter" component={AddExpenseScreen} />
          <Tab.Screen name="Dépenses" component={ExpensesListScreen} />
          <Tab.Screen name="Historique" component={StatsScreen} />
          <Tab.Screen name="Calendrier" component={CalendarScreen} />
          <Tab.Screen name="Paramètres" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}