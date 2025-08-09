
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { supabase } from '../../utils/supabase';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => supabase.auth.signOut()} style={{ marginRight: 15 }}>
              <FontAwesome name="sign-out" size={25} color="gray" />
            </Pressable>
          ),
        }}
      />
      {/* Vous pouvez ajouter d'autres onglets ici si nécessaire */}
    </Tabs>
  );
}

