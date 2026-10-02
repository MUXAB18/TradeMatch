import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, LayoutAnimation, UIManager } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/theme';
import { ArrowLeft, Send, Mic, Smile, LayoutGrid, MoreVertical, Camera, FileText, Phone, Video } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MOCK_CHAT_DATA: Record<string, any> = {
  '1': {
    name: 'Justin Olson',
    image: 'https://i.pravatar.cc/150?u=justin',
    isOnline: true,
    messages: [
      { id: '1', text: "Hey Justin, what's up?", sender: 'them', time: '10:00 AM' },
      { id: '2', text: "Oh hey there, Anna. I'm all good btw. How are you?", sender: 'me', time: '10:05 AM' },
      { id: '3', text: "Thank you. Bye", sender: 'me', time: '10:06 AM' },
    ]
  },
  '2': {
    name: 'Andreas Anton',
    image: 'https://i.pravatar.cc/150?u=andreas2',
    isOnline: false,
    messages: [
      { id: '1', text: 'The workout was really tiring yesterday.', sender: 'them', time: 'Yesterday' },
    ]
  },
  '3': {
    name: 'Grace Coleman',
    image: 'https://i.pravatar.cc/150?u=grace',
    isOnline: true,
    messages: [
      { id: '1', text: "Congrats you just hit your goal! Let's share this with..", sender: 'them', time: '45 m' },
    ]
  },
  '4': {
    name: 'Betty Cooper',
    image: 'https://i.pravatar.cc/150?u=betty',
    isOnline: false,
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
  const rotation = useSharedValue(0);

  const toggleAttachments = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextState = !showAttachments;
    setShowAttachments(nextState);
    rotation.value = withSpring(nextState ? 45 : 0, { damping: 14, stiffness: 150 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

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
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7FA' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerUser}>
            <View>
              <Image source={{ uri: chatData.image }} style={styles.headerAvatar} />
              {chatData.isOnline && (
                <View style={[styles.onlineIndicator, { borderColor: isDark ? '#121212' : '#F7F7FA' }]} />
              )}
            </View>
            <View style={styles.headerUserInfo}>
              <Text style={[styles.headerName, { color: colors.textPrimary }]}>{chatData.name}</Text>
              <Text style={[styles.headerStatus, { color: chatData.isOnline ? colors.primary : colors.textSecondary }]}>
                {chatData.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => router.push(`/chat/call?id=${id}&type=audio`)}
          >
            <Phone size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => router.push(`/chat/call?id=${id}&type=video`)}
          >
            <Video size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chat Area */}
      <View style={[
        styles.chatContainer, 
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
        !isDark ? getShadow(0.06, 20) : {}
      ]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={() => (
            <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.dateSeparator}>
              <Text style={[styles.dateSeparatorText, { color: colors.textSecondary }]}>Today, May 3</Text>
            </Animated.View>
          )}
          renderItem={({ item, index }) => {
            const isMe = item.sender === 'me';
            return (
              <Animated.View 
                entering={FadeInDown.delay(index * 100).springify().damping(12)}
                style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}
              >
                {!isMe && (
                  <Image source={{ uri: chatData.image }} style={styles.messageAvatar} />
                )}
                <View style={[
                  styles.messageBubbleContainer,
                  isMe ? styles.messageBubbleContainerMe : styles.messageBubbleContainerThem,
                  (!isDark && !isMe) ? getShadow(0.04, 6) : {}
                ]}>
                  {isMe ? (
                    <LinearGradient
                      colors={[colors.primary, '#6366f1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.messageBubbleGradient}
                    >
                      <Text style={[styles.messageText, { color: '#FFFFFF' }]}>{item.text}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[
                      styles.messageBubbleSolid, 
                      { backgroundColor: isDark ? '#2C2C2E' : '#F4F4F6' }
                    ]}>
                      <Text style={[styles.messageText, { color: colors.textPrimary }]}>{item.text}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          }}
        />

        {/* Input Area */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            style={[
              styles.inputPill, 
              { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              !isDark ? getShadow(0.08, 12) : {}
            ]}
          >
            <TouchableOpacity 
              style={[
                styles.gridIconContainer, 
                { backgroundColor: showAttachments ? colors.primary : (isDark ? '#1C1C1E' : '#F0F0F5') }
              ]}
              onPress={toggleAttachments}
              activeOpacity={0.7}
            >
              <Animated.View style={animatedIconStyle}>
                <LayoutGrid size={18} color={showAttachments ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')} />
              </Animated.View>
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Message..."
              placeholderTextColor={colors.textPlaceholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            <View style={styles.inputRightActions}>
              <TouchableOpacity style={styles.smileIconContainer}>
                <Smile size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {inputText.trim().length > 0 && (
                <Animated.View entering={ZoomIn.springify()}>
                  <TouchableOpacity style={[styles.sendIconContainer, { backgroundColor: colors.primary }]} onPress={sendMessage}>
                    <Send size={18} color="#FFF" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Action Row (Togglable) */}
      {showAttachments && (
        <Animated.View 
          entering={FadeInDown.springify()} 
          style={[styles.bottomActions, { paddingBottom: insets.bottom || 24, backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#2C2C2E' : '#F7F7FA' }, !isDark ? getShadow(0.05, 8) : {}]}>
            <Camera size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#2C2C2E' : '#F7F7FA' }, !isDark ? getShadow(0.05, 8) : {}]}>
            <FileText size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#2C2C2E' : '#F7F7FA' }, !isDark ? getShadow(0.05, 8) : {}]}>
            <Mic size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Audio</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  headerUserInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 10,
    marginLeft: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 20,
  },
  chatContainer: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  messagesList: {
    padding: 24,
    paddingBottom: 10,
  },
  dateSeparator: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperThem: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  messageBubbleContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  messageBubbleContainerMe: {
    borderBottomRightRadius: 6,
  },
  messageBubbleContainerThem: {
    borderBottomLeftRadius: 6,
  },
  messageBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  messageBubbleSolid: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 36,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
    borderWidth: 1,
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 12,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  inputRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smileIconContainer: {
    padding: 6,
    marginRight: 4,
  },
  sendIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
