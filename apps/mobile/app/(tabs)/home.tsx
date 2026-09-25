import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import {
  User,
  Settings,
  Briefcase,
  Award,
  Zap,
  ChevronRight,
  ArrowRight,
  Flame,
  Bot,
  PenTool,
  Bell,
} from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from '../../utils/haptics';
import Animated, {
  FadeInUp,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useNetwork } from '../../contexts/NetworkContext';
import { useToast } from '../../providers/ToastProvider';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCertifications } from '../../hooks/useCertifications';
import { useJobs } from '../../hooks/useJobs';
import { useAppTheme, Typography, Spacing } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import JobCard from '../../components/JobCard';
import JobApplicationModal from '../../components/JobApplicationModal';
import { GlobalPopup } from '../../components/GlobalPopup';
import NotificationModal from '../../components/NotificationModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function QuickLink({
  title,
  actionText,
  onPress,
  colors,
  index,
  icon: Icon,
}: any) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInUp.delay(500 + index * 100)
              .springify()
              .damping(15)
      }
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            newStyles.listCard,
            { backgroundColor: colors.surface },
            animatedStyle,
          ]}
        >
          <View
            style={[
              newStyles.listCardIcon,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <Icon size={20} color={colors.primary} />
          </View>
          <View style={newStyles.listCardText}>
            <Text
              style={[newStyles.listCardTitle, { color: colors.textPrimary }]}
            >
              {title}
            </Text>
            <Text
              style={[
                newStyles.listCardSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              {actionText}
            </Text>
          </View>
          <View style={newStyles.listCardArrow}>
            <ArrowRight size={20} color={colors.textSecondary} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    data: profile,
    loading,
    error,
    refetch: refetchProfile,
  } = useUserProfile();
  const { colors, isDark } = useAppTheme();

  const initials = (profile?.name || user?.displayName || 'U')
    .substring(0, 1)
    .toUpperCase();
  const firstName = profile?.name ? profile.name.split(' ')[0] : 'User';

  const { missing: missingCerts, refetch: refetchCerts } = useCertifications(
    profile?.trade || '',
    profile?.country || '',
    profile?.certifications || []
  );

  const { jobs, refetch: refetchJobs } = useJobs(profile);
  const { isOffline } = useNetwork();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [applyingJobScore, setApplyingJobScore] = useState<any | null>(null);

  const confettiRef = useRef<any>(null);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAdminNotifications(notifs);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadState = async () => {
      try {
        const applied = await AsyncStorage.getItem('appliedJobs');
        if (applied) setAppliedJobs(JSON.parse(applied));
      } catch (e) {
        console.error('Failed to load local state', e);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (appliedJobs.length >= 5 && !hasCelebrated) {
      setTimeout(() => {
        confettiRef.current?.start();
        setHasCelebrated(true);
      }, 500);
    }
  }, [appliedJobs.length, hasCelebrated]);

  const markJobApplied = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (appliedJobs.includes(id)) return;
    const newApplied = [...appliedJobs, id];
    setAppliedJobs(newApplied);
    await AsyncStorage.setItem('appliedJobs', JSON.stringify(newApplied));
    showToast('Job marked as applied', 'success');
  };

  const onRefresh = React.useCallback(async () => {
    if (isOffline) {
      showToast('Cannot refresh while offline', 'error');
      return;
    }
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchCerts(), refetchJobs()]);
    setRefreshing(false);
  }, [refetchProfile, refetchCerts, refetchJobs, isOffline, showToast]);

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          Error Loading Dashboard
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error || 'Failed to load profile'}
        </Text>
      </View>
    );
  }

  const completionSteps = {
    name: profile.name !== 'New User',
    experience: profile.yearsExperience > 0,
    skills: profile.skills.length > 0,
    certifications: profile.certifications.length > 0,
  };

  const completedSteps = Object.values(completionSteps).filter(Boolean).length;
  const totalSteps = Object.keys(completionSteps).length;
  const completionPercent = Math.round((completedSteps / totalSteps) * 100);
  const isProfileComplete = completedSteps === totalSteps;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? colors.background : '#F3F6F1',
      }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxl + 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(100).springify().damping(15)
          }
          style={[
            newStyles.header,
            { marginTop: Math.max(insets.top + 10, 50) },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={[
              newStyles.userBadge,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
          >
            <View style={newStyles.avatarPlaceholder}>
              {profile?.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  style={{ width: '100%', height: '100%', borderRadius: 16 }}
                />
              ) : (
                <Text style={newStyles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text
              style={[newStyles.userBadgeText, { color: colors.textPrimary }]}
            >
              Hello, {firstName}!
            </Text>
            <ChevronRight
              size={14}
              color={colors.textSecondary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          <View style={newStyles.headerActions}>
            <TouchableOpacity
              style={[
                newStyles.iconButton,
                { backgroundColor: isDark ? colors.surface : '#FFF' },
              ]}
              onPress={() => setShowNotificationsModal(true)}
            >
              <Bell size={18} color={colors.textPrimary} />
              {adminNotifications.length > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#EF4444',
                    borderWidth: 1.5,
                    borderColor: isDark ? colors.surface : '#FFF',
                  }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                newStyles.iconButton,
                { backgroundColor: isDark ? colors.surface : '#FFF' },
              ]}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Settings size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Hero Text */}
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(150).springify().damping(15)
          }
          style={newStyles.heroSection}
        >
          <Text
            style={[newStyles.heroTextLight, { color: colors.textSecondary }]}
          >
            Ready for your next
          </Text>
          <Text style={[newStyles.heroTextBold, { color: colors.textPrimary }]}>
            opportunity?
          </Text>
        </Animated.View>

        {/* Quick Actions Row */}
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(200).springify().damping(15)
          }
          style={newStyles.quickActionsRow}
        >
          <TouchableOpacity
            style={[
              newStyles.quickActionPill,
              {
                backgroundColor: isDark ? colors.surface : '#FFF',
                borderColor: isDark ? colors.border : '#E5E5EA',
                borderWidth: 1,
              },
            ]}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <Text
              style={[
                newStyles.quickActionPillText,
                { color: colors.textPrimary },
              ]}
            >
              Explore Jobs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              newStyles.quickActionCircle,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
            onPress={() => router.push('/(tabs)/prep')}
          >
            <Bot size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              newStyles.quickActionCircle,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
            onPress={() => router.push('/profile')}
          >
            <Award size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Big Banner */}
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(300).springify().damping(15)
          }
        >
          {!isProfileComplete ? (
            <View
              style={[
                newStyles.bannerCard,
                { backgroundColor: colors.primary },
              ]}
            >
              <View style={newStyles.bannerHeader}>
                <View
                  style={[
                    newStyles.bannerIconWrapper,
                    { backgroundColor: 'rgba(255,255,255,0.2)' },
                  ]}
                >
                  <Zap size={24} color="#FFF" />
                </View>
                <View style={newStyles.bannerTextContainer}>
                  <Text style={newStyles.bannerTitle}>Complete Profile</Text>
                  <Text style={newStyles.bannerSubtitle}>
                    Add your experience and skills to unlock premium job
                    matches.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={newStyles.bannerButton}
                onPress={() => router.push('/profile/edit/name')}
              >
                <Text style={newStyles.bannerButtonText}>+ Add Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                newStyles.bannerCard,
                { backgroundColor: colors.success || '#84CC16' },
              ]}
            >
              <View style={newStyles.bannerHeader}>
                <View
                  style={[
                    newStyles.bannerIconWrapper,
                    { backgroundColor: 'rgba(255,255,255,0.2)' },
                  ]}
                >
                  <Zap size={24} color="#FFF" />
                </View>
                <View style={newStyles.bannerTextContainer}>
                  <Text style={newStyles.bannerTitle}>Profile Complete!</Text>
                  <Text style={newStyles.bannerSubtitle}>
                    You're ready to match with top employers in your trade.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={newStyles.bannerButton}
                onPress={() => router.push('/(tabs)/jobs')}
              >
                <Text style={newStyles.bannerButtonText}>View Matches</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Square Stats Row */}
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={newStyles.statsScroll}
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(400).springify().damping(15)
          }
        >
          <TouchableOpacity
            style={[
              newStyles.statSquare,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <View
              style={[
                newStyles.statIconBadge,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Briefcase size={20} color={colors.primary} />
            </View>
            <Text style={[newStyles.statTitle, { color: colors.textPrimary }]}>
              Matches
            </Text>
            <Text
              style={[newStyles.statSubtitle, { color: colors.textSecondary }]}
            >
              {jobs.length} found
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              newStyles.statSquare,
              {
                backgroundColor: isDark
                  ? colors.surface
                  : `${colors.primary}20`,
              },
            ]}
            onPress={() => router.push('/profile')}
          >
            <View
              style={[
                newStyles.statIconBadge,
                { backgroundColor: isDark ? colors.background : '#FFF' },
              ]}
            >
              <User size={20} color={colors.textPrimary} />
            </View>
            <Text style={[newStyles.statTitle, { color: colors.textPrimary }]}>
              Profile
            </Text>
            <Text
              style={[newStyles.statSubtitle, { color: colors.textSecondary }]}
            >
              {completionPercent}% done
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              newStyles.statSquare,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
          >
            <View
              style={[
                newStyles.statIconBadge,
                { backgroundColor: `${colors.warning}15` },
              ]}
            >
              <Flame size={20} color={colors.warning} />
            </View>
            <Text style={[newStyles.statTitle, { color: colors.textPrimary }]}>
              Goal
            </Text>
            <Text
              style={[newStyles.statSubtitle, { color: colors.textSecondary }]}
            >
              {appliedJobs.length}/5 apps
            </Text>
          </TouchableOpacity>
        </Animated.ScrollView>

        {/* Today's Tasks */}
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInUp.delay(500).springify().damping(15)
          }
          style={newStyles.listSection}
        >
          <View style={newStyles.listHeader}>
            <Text style={[newStyles.listTitle, { color: colors.textPrimary }]}>
              Today's Tasks
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
              <Text
                style={[newStyles.listViewAll, { color: colors.textSecondary }]}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {!completionSteps.name && (
            <QuickLink
              title="0 Profile details"
              actionText="Complete Profile"
              onPress={() => router.push('/profile/edit/name')}
              colors={colors}
              index={0}
              icon={User}
            />
          )}
          {!completionSteps.skills && (
            <QuickLink
              title="0 Skills added"
              actionText="Add Skills"
              onPress={() => router.push('/profile/edit/skills')}
              colors={colors}
              index={1}
              icon={PenTool}
            />
          )}
          {missingCerts.length > 0 && (
            <QuickLink
              title={`${missingCerts.length} Missing certs`}
              actionText="Add certificate"
              onPress={() => router.push('/profile')}
              colors={colors}
              index={2}
              icon={Award}
            />
          )}

          <QuickLink
            title="Interview preparation"
            actionText="Practice now"
            onPress={() => router.push('/(tabs)/prep')}
            colors={colors}
            index={3}
            icon={Bot}
          />
        </Animated.View>

        {/* Recent Matches Feed */}
        {jobs.length > 0 && (
          <Animated.View
            entering={
              reducedMotion
                ? undefined
                : FadeInUp.delay(600).springify().damping(15)
            }
            style={[newStyles.listSection, { marginTop: 10 }]}
          >
            <View style={newStyles.listHeader}>
              <Text
                style={[newStyles.listTitle, { color: colors.textPrimary }]}
              >
                Recent Matches
              </Text>
            </View>
            <View style={styles.feedContainer}>
              {jobs.slice(0, 3).map(({ job, score }, idx) => (
                <View key={idx} style={styles.feedItem}>
                  <JobCard
                    job={job}
                    score={score}
                    expanded={expandedJobId === job.id}
                    onPress={() => {
                      setExpandedJobId(
                        expandedJobId === job.id ? null : job.id || null
                      );
                    }}
                    colors={colors}
                    isDark={isDark}
                    index={idx}
                    isApplied={appliedJobs.includes(job.id!)}
                    onApplyPress={() => {
                      if (appliedJobs.includes(job.id!)) return;
                      setApplyingJob(job);
                      setApplyingJobScore(score);
                    }}
                    onApply={() => markJobApplied(job.id!)}
                  />
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <JobApplicationModal
        visible={!!applyingJob}
        job={applyingJob}
        score={applyingJobScore}
        onClose={() => setApplyingJob(null)}
        onSubmit={jobId => {
          markJobApplied(jobId);
          setApplyingJob(null);
        }}
      />

      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={3000}
      />
      <GlobalPopup />

      <NotificationModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        adminNotifications={adminNotifications}
      />
    </View>
  );
}

const newStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    paddingRight: 14,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroTextLight: {
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  heroTextBold: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  quickActionPill: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionPillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  bannerButton: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bannerButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statSquare: {
    width: (SCREEN_WIDTH - 64) / 3,
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  listSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listViewAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  listCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listCardText: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  listCardSubtitle: {
    fontSize: 13,
  },
  listCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.header,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  feedContainer: { gap: 16 },
  feedItem: { width: '100%' },
});
