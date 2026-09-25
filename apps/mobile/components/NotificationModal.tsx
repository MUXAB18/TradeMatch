import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { X, Bell, Briefcase, Star, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NOTIFICATIONS = [
  { id: '1', type: 'job', title: 'New Job Match', message: 'A new Senior Engineer role matches your profile!', time: '10m ago', unread: true },
  { id: '2', type: 'system', title: 'Profile Views', message: 'Your profile appeared in 12 searches this week.', time: '2h ago', unread: true },
  { id: '3', type: 'save', title: 'Saved Job Closing', message: 'A job you saved at Google is closing soon.', time: '1d ago', unread: false },
  { id: '4', type: 'job', title: 'Application Update', message: 'Your application for Uber was reviewed.', time: '2d ago', unread: false },
];

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const getIcon = (type: string) => {
    switch(type) {
      case 'job': return <Briefcase size={20} color="#007AFF" />;
      case 'system': return <Info size={20} color="#34C759" />;
      case 'save': return <Star size={20} color="#FF9500" />;
      default: return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayPress} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: isDark ? '#3A3D3E' : '#E5E6E8' }]} />
          </View>
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.iconBg, { backgroundColor: colors.surface }]}>
                <Bell size={20} color={colors.textPrimary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {NOTIFICATIONS.map((notif) => (
              <TouchableOpacity 
                key={notif.id} 
                style={[
                  styles.notifCard, 
                  { backgroundColor: colors.surface },
                  notif.unread && { borderWidth: 1, borderColor: 'rgba(0, 122, 255, 0.3)' }
                ]}
              >
                <View style={[styles.notifIconContainer, { backgroundColor: colors.background }]}>
                  {getIcon(notif.type)}
                </View>
                <View style={styles.notifTextContainer}>
                  <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{notif.title}</Text>
                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>
                  <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{notif.time}</Text>
                </View>
                {notif.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlayPress: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifTextContainer: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 12,
  }
});
