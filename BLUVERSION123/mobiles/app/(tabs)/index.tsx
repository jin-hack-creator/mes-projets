import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Pressable,
} from 'react-native';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../app/_layout';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// --- Avatar Component ---
const UserAvatar = ({ username }: { username: string }) => {
  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  // Génère une couleur de fond basée sur le nom d'utilisateur pour la cohérence
  const getBackgroundColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 75%, 60%)`;
    return color;
  };

  return (
    <View style={[styles.avatar, { backgroundColor: getBackgroundColor(username) }]}>
      <Text style={styles.avatarText}>{getInitials(username)}</Text>
    </View>
  );
};

// --- Main Chat Component ---
interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string };
}

export default function TabOneScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { session } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, profiles ( username )`)
        .order('created_at', { ascending: true });

      if (error) console.error('Erreur de récupération:', error);
      else setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', payload.new.user_id)
          .single();
        
        if (error) console.error('Erreur de récupération du profil:', error);
        else {
          const newMessage = { ...payload.new, profiles: profileData } as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() && session) {
      const { error } = await supabase.from('messages').insert([{ content: message, user_id: session.user.id }]);
      if (error) Alert.alert("Erreur d'envoi", error.message);
      else setMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
        {messages.map((msg) => {
          const isMyMessage = msg.user_id === session?.user.id;
          return (
            <View key={msg.id} style={[styles.messageRow, { justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }]}>
              {!isMyMessage && <UserAvatar username={msg.profiles.username} />}
              <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                {!isMyMessage && <Text style={styles.pseudo}>{msg.profiles.username}</Text>}
                <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{msg.content}</Text>
                <Text style={isMyMessage ? styles.myTime : styles.otherTime}>{formatTime(msg.created_at)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Écrivez votre message..." />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <FontAwesome name="paper-plane" size={20} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  messagesContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 5 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: 'white', fontWeight: 'bold' },
  messageBubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, maxWidth: '75%' },
  myMessage: { backgroundColor: '#007AFF', borderBottomRightRadius: 5 },
  otherMessage: { backgroundColor: 'white', borderBottomLeftRadius: 5 },
  pseudo: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
  myMessageText: { fontSize: 16, color: 'white' },
  otherMessageText: { fontSize: 16, color: 'black' },
  myTime: { fontSize: 10, color: '#e0e0e0', alignSelf: 'flex-end', marginTop: 5 },
  otherTime: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f4f4f9',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});