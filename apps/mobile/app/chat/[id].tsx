import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, LayoutAnimation, UIManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/theme';
import { ArrowLeft, Send, Mic, Smile, LayoutGrid, MoreVertical, Camera, FileText } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MOCK_CHAT_DATA: Record<string, any> = {
  '1': {
    name: 'Justin Olson',
    image: 'https://i.pravatar.cc/150?u=justin',
    messages: [
      { id: '1', text: "Hey Justin, what's up?", sender: 'them', time: '10:00 AM' },
      { id: '2', text: "Oh hey there, Anna. I'm all good btw. How are you?", sender: 'me', time: '10:05 AM' },
      { id: '3', text: "Thank you. Bye", sender: 'me', time: '10:06 AM' },
    ]
  },
  '2': {
    name: 'Andreas Anton',
    image: 'https://i.pravatar.cc/150?u=andreas2',
    messages: [
      { id: '1', text: 'The workout was really tiring yesterday.', sender: 'them', time: 'Yesterday' },
    ]
  },
  '3': {
    name: 'Grace Coleman',
    image: 'https://i.pravatar.cc/150?u=grace',
    messages: [
      { id: '1', text: "Congrats you just hit your goal! Let's share this with..", sender: 'them', time: '45 m' },
    ]
  },
  '4': {
    name: 'Betty Cooper',
    image: 'https://i.pravatar.cc/150?u=betty',
    messages: [
      { id: '1', text: "Are we still on for tomorrow?", sender: 'them', time: '1 h' },
    ]
  }
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [inputText, setInputText] = useState('');
  
  const chatData = MOCK_CHAT_DATA[id as string] || { name: 'User', messages: [] };
  const [messages, setMessages] = useState(chatData.messages);
  const flatListRef = useRef<FlatList>(null);

  const [showAttachments, setShowAttachments] = useState(false);

  const toggleAttachments = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAttachments(!showAttachments);
  };

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      time: 'Now',
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getShadow = (opacity: number = 0.05, radius: number = 4) => Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: radius,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Card Area */}
      <View style={[styles.topCard, { backgroundColor: colors.surface, paddingTop: insets.top, ...(!isDark ? getShadow(0.1, 12) : {}) }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            {chatData.image && (
              <Image 
                source={{ uri: chatData.image }} 
                style={[styles.headerAvatar, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
              />
            )}
            <Text style={[styles.headerName, { color: colors.textPrimary }]}>{chatData.name}</Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={() => (
            <View style={styles.dateSeparator}>
              <Text style={[styles.dateSeparatorText, { color: colors.textSecondary }]}>Today, May 3</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isMe = item.sender === 'me';
            return (
              <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
                <View style={[
                  styles.messageBubble, 
                  isMe ? [styles.messageBubbleMe, { backgroundColor: colors.primary }] : [styles.messageBubbleThem, { backgroundColor: isDark ? '#2C2C2E' : '#F5F5F7' }],
                  (!isDark && !isMe) ? getShadow(0.04, 3) : {}
                ]}>
                  <Text style={[styles.messageText, { color: isMe ? '#FFFFFF' : colors.textPrimary }]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input Pill Area */}
        <View style={styles.inputArea}>
          <View style={[
            styles.inputPill, 
            { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
            !isDark ? getShadow(0.04, 8) : {}
          ]}>
            <TouchableOpacity 
              style={[styles.gridIconContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F0F0F5' }]}
              onPress={toggleAttachments}
            >
              <LayoutGrid size={16} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Aa"
              placeholderTextColor={colors.textPlaceholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            <View style={styles.inputRightActions}>
              <TouchableOpacity style={styles.smileIconContainer}>
                <Smile size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {inputText.trim().length > 0 && (
                <TouchableOpacity style={styles.sendIconContainer} onPress={sendMessage}>
                  <Send size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Row (Togglable) */}
      {showAttachments && (
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom || 24 }]}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }, !isDark ? getShadow(0.08, 6) : {}]}>
            <Camera size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }, !isDark ? getShadow(0.08, 6) : {}]}>
            <FileText size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }, !isDark ? getShadow(0.08, 6) : {}]}>
            <Mic size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topCard: {
    flex: 1,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerButton: {
    padding: 8,
    marginTop: 14,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 12,
    borderWidth: 2,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  messagesList: {
    padding: 20,
    paddingBottom: 24,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: '78%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperThem: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 6,
  },
  messageBubbleThem: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  inputArea: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 36,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
    borderWidth: 1,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 16,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 6 : 0,
  },
  inputRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smileIconContainer: {
    padding: 6,
  },
  sendIconContainer: {
    padding: 6,
    marginLeft: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 28,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
