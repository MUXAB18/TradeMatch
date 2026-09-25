import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, MoreVertical } from 'lucide-react-native';
import { useAppTheme } from '../../constants/theme';
import { useRouter } from 'expo-router';

const ACTIVE_USERS = [
  { id: '1', name: 'Melissa', image: 'https://i.pravatar.cc/150?u=melissa' },
  { id: '2', name: 'Helena', image: 'https://i.pravatar.cc/150?u=helena' },
  { id: '3', name: 'Andreas', image: 'https://i.pravatar.cc/150?u=andreas' },
  { id: '4', name: 'Betty', image: 'https://i.pravatar.cc/150?u=betty' },
  { id: '5', name: 'James', image: 'https://i.pravatar.cc/150?u=james' },
];

const RECENT_CHATS = [
  {
    id: '1',
    name: 'Justin Olson',
    message: "Oh hey there, Anna. I'm all good btw. How are you?",
    time: '5 m',
    unread: 1,
    image: 'https://i.pravatar.cc/150?u=justin',
  },
  {
    id: '2',
    name: 'Andreas Anton',
    message: "The workout was really tiring yesterday.",
    time: '12 m',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=andreas2',
  },
  {
    id: '3',
    name: 'Grace Coleman',
    message: "Congrats you just hit your goal! Let's share this with..",
    time: '45 m',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=grace',
  },
  {
    id: '4',
    name: 'Betty Cooper',
    message: "Are we still on for tomorrow?",
    time: '1 h',
    unread: 0,
    image: 'https://i.pravatar.cc/150?u=betty',
  },
];

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Messages</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]}>
          <Plus size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Active Users Horizontal Scroll */}
      <View style={styles.activeUsersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeUsersContent}>
          {ACTIVE_USERS.map((user) => (
            <TouchableOpacity 
              key={user.id} 
              style={styles.activeUserItem}
              onPress={() => router.push(`/chat/${user.id}`)}
            >
              <Image source={{ uri: user.image }} style={styles.activeUserImage} />
              <Text style={[styles.activeUserName, { color: colors.textSecondary }]}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Chats Card */}
      <View style={[styles.cardContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardHeaderTitle, { color: colors.textSecondary }]}>Recent</Text>
          <TouchableOpacity>
            <MoreVertical size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={RECENT_CHATS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatItem}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.chatItemImage} />
              <View style={styles.chatItemDetails}>
                <View style={styles.chatItemHeader}>
                  <Text style={[styles.chatItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.chatItemTime, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
                <View style={styles.chatItemFooter}>
                  <Text style={[styles.chatItemMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  {item.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                      <Text style={styles.unreadBadgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
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
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeUsersContainer: {
    marginBottom: 35,
  },
  activeUsersContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  activeUserItem: {
    alignItems: 'center',
  },
  activeUserImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
  },
  activeUserName: {
    fontSize: 13,
    fontWeight: '500',
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
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chatListContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, 
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  chatItemImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  chatItemDetails: {
    flex: 1,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatItemName: {
    fontSize: 16,
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
    fontSize: 14,
    marginRight: 16,
    lineHeight: 20,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
