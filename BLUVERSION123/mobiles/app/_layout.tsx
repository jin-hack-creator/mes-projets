
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { View, ActivityIndicator } from 'react-native';


const AuthContext = createContext<{ session: Session | null; loading: boolean }>({ 
  session: null,
  loading: true,
});


export const useAuth = () => {
  return useContext(AuthContext);
};


const useProtectedRoute = (session: Session | null) => {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, router]);
};

// 2. Fournisseur de contexte
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Layout qui gère la redirection et l'état de chargement
function InitialLayout() {
    const { session, loading } = useAuth();
    useProtectedRoute(session);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f9' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return <Slot />;
}

// 3. Layout principal
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
