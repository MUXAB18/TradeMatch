import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, StatusBar, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, MoreVertical, Search, Bell } from 'lucide-react-native';
import { useAppTheme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const ACTIVE_USERS = [
  { id: '1', name: 'Melissa', image: 'https://i.pravatar.cc/150?u=melissa', hasStory: true },
  { id: '2', name: 'Helena', image: 'https://i.pravatar.cc/150?u=helena', hasStory: true },
  { id: '3', name: 'Andreas', image: 'https://i.pravatar.cc/150?u=andreas', hasStory: false },
  { id: '4', name: 'Betty', image: 'https://i.pravatar.cc/150?u=betty', hasStory: true },
  { id: '5', name: 'James', image: 'https://i.pravatar.cc/150?u=james', hasStory: false },
];

const RECENT_CHATS = [
  {
    id: '1',
    name: 'Justin Olson',
    message: "Oh hey there, Anna. I'm all good btw. How are you?",
    time: '5 m',
    unread: 1,
    image: 'https://i.pravatar.cc/150?u=justin',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Andreas Anton',
    message: "The workout was really tiring yesterday.",
    time: '12 m',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=andreas2',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Grace Coleman',
    message: "Congrats you just hit your goal! Let's share this with..",
    time: '45 m',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=grace',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Betty Cooper',
    message: "Are we still on for tomorrow?",
    time: '1 h',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=betty',
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7FA' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary, isDark ? '#121212' : '#F7F7FA']}
        style={[StyleSheet.absoluteFill, { height: 350, opacity: isDark ? 0.3 : 0.1 }]}
      />
      
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(600).springify()}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View>
          <Text style={[styles.headerGreeting, { color: colors.textSecondary }]}>Good Morning</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Messages</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Bell size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary, marginLeft: 12 }]}>
            <Plus size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }, !isDark ? getShadow(0.04, 12) : {}]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search messages..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Active Users Horizontal Scroll */}
      <View style={styles.activeUsersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeUsersContent}>
          {ACTIVE_USERS.map((user, index) => (
            <Animated.View key={user.id} entering={FadeInRight.delay(200 + index * 100).springify()}>
              <TouchableOpacity 
                style={styles.activeUserItem}
                onPress={() => router.push(`/chat/${user.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.activeUserImageContainer, user.hasStory && { borderColor: colors.primary, borderWidth: 2, padding: 2 }]}>
                  <Image source={{ uri: user.image }} style={styles.activeUserImage} />
                  {user.hasStory && (
                    <Animated.View entering={ZoomIn.delay(600 + index * 100)} style={styles.storyBadge}>
                      <View style={[styles.storyBadgeInner, { backgroundColor: colors.primary }]} />
                    </Animated.View>
                  )}
                </View>
                <Text style={[styles.activeUserName, { color: colors.textPrimary }]} numberOfLines={1}>{user.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Recent Chats */}
      <Animated.View 
        entering={FadeInDown.delay(300).duration(800).springify()} 
        style={[
          styles.cardContainer, 
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
          !isDark ? getShadow(0.08, 20) : {}
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textPrimary }]}>Recent Chats</Text>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={RECENT_CHATS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(400 + index * 100).springify()}>
              <TouchableOpacity 
                style={styles.chatItem}
                onPress={() => router.push(`/chat/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.chatItemImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.chatItemImage} />
                  {item.isOnline && (
                    <View style={[styles.onlineIndicator, { borderColor: isDark ? '#1C1C1E' : '#FFFFFF' }]} />
                  )}
                </View>
                <View style={styles.chatItemDetails}>
                  <View style={styles.chatItemHeader}>
                    <Text style={[styles.chatItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.chatItemTime, { color: item.unread > 0 ? colors.primary : colors.textSecondary, fontWeight: item.unread > 0 ? '700' : '500' }]}>{item.time}</Text>
                  </View>
                  <View style={styles.chatItemFooter}>
                    <Text style={[styles.chatItemMessage, { color: item.unread > 0 ? colors.textPrimary : colors.textSecondary, fontWeight: item.unread > 0 ? '600' : '400' }]} numberOfLines={1}>
                      {item.message}
                    </Text>
                    {item.unread > 0 && (
                      <Animated.View entering={ZoomIn.springify()} style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                      </Animated.View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerGreeting: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    height: '100%',
  },
  activeUsersContainer: {
    marginBottom: 30,
  },
  activeUsersContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  activeUserItem: {
    alignItems: 'center',
    width: 72,
  },
  activeUserImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeUserImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  storyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  storyBadgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  activeUserName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  moreButton: {
    padding: 4,
  },
  chatListContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, 
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  chatItemImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  chatItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  chatItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatItemName: {
    fontSize: 17,
    fontWeight: '700',
  },
  chatItemTime: {
    fontSize: 13,
  },
  chatItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatItemMessage: {
    flex: 1,
    fontSize: 15,
    marginRight: 16,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

