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
import { User, Settings, Briefcase, Award, Zap, ChevronRight, CheckCircle2, ArrowRight, Flame } from 'lucide-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from '../../utils/haptics';
import Animated, {
  FadeInUp,
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  useAnimatedStyle,
  withSequence,
  withTiming,
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
import AnimatedCircleProgress from '../../components/AnimatedCircleProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

function AnimatedStat({ value, label, colors, index, onPress, icon: Icon }: any) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reducedMotion ? value : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion || value === 0) {
      setDisplayValue(value);
      return;
    }
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(200 + index * 50).springify().damping(15)} style={styles.statCardContainer}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[styles.statContent, animatedStyle]}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{displayValue}</Text>
          <View style={styles.statLabelRow}>
            <Icon size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface QuickLinkProps {
  title: string;
  actionText: string;
  onPress: () => void;
  colors: any;
  index: number;
}

function QuickLink({ title, actionText, onPress, colors, index }: QuickLinkProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(500 + index * 100).springify().damping(15)}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        activeOpacity={1}
      >
        <Animated.View style={[styles.quickLink, { backgroundColor: colors.surface }, animatedStyle]}>
          <Text style={[styles.quickLinkTitle, { color: colors.textPrimary }]}>{title}</Text>
          <View style={styles.quickLinkActionRow}>
            <Text style={[styles.quickLinkActionText, { color: colors.primary }]}>{actionText}</Text>
            <ChevronRight size={16} color={colors.primary} />
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
  const { data: profile, loading, error, refetch: refetchProfile } = useUserProfile();
  const { colors, isDark } = useAppTheme();
  const [greeting, setGreeting] = useState('');
  
  const initials = (profile?.name || user?.displayName || 'U').substring(0, 1).toUpperCase();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const { have: userCerts, missing: missingCerts, refetch: refetchCerts } = useCertifications(
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
    await Promise.all([
      refetchProfile(),
      refetchCerts(),
      refetchJobs()
    ]);
    setRefreshing(false);
  }, [refetchProfile, refetchCerts, refetchJobs, isOffline, showToast]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Dashboard</Text>
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
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 16, 32) }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(100).springify().damping(15)}>
          <View style={styles.headerTop}>
            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.name}</Text>
              <Text style={[styles.trade, { color: colors.textSecondary }]}>{profile.trade.toUpperCase()}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                style={styles.settingsButton}
                activeOpacity={0.7}
              >
                <Settings size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <View style={[styles.profileIconContainer, { backgroundColor: colors.primary }]}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                  ) : (
                    <Text style={styles.avatarText}>{initials}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.contextText, { color: colors.textSecondary }]}>Ready for your next opportunity?</Text>
        </Animated.View>
      </View>

      {/* Stats Overview */}
      <View style={[styles.statsPanel, { backgroundColor: colors.surface }]}>
        <AnimatedStat icon={Briefcase} value={jobs.length} label="Matches" colors={colors} index={0} onPress={() => router.push('/(tabs)/jobs')} />
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : '#E5E5EA' }]} />
        <AnimatedStat icon={Zap} value={profile.skills.length} label="Skills" colors={colors} index={1} onPress={() => router.push('/profile/edit/skills')} />
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : '#E5E5EA' }]} />
        <AnimatedStat icon={Award} value={userCerts.length} label="Certificates" colors={colors} index={2} onPress={() => router.push('/(tabs)/certifications')} />
      </View>

      {/* Dashboard Section */}
      <View style={styles.dashboardGrid}>
        {/* Profile Progress */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(300).springify().damping(15)} style={styles.dashboardCardWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => !isProfileComplete ? router.push('/profile') : null}
            style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E5E5EA' }]}
          >
            <View style={styles.dashboardCardHeader}>
              <Text style={[styles.dashboardCardTitle, { color: colors.textSecondary }]}>Profile Strength</Text>
            </View>
            <View style={styles.dashboardCardContent}>
              <AnimatedCircleProgress
                progress={completionPercent}
                size={80}
                strokeWidth={8}
                primaryColor={isProfileComplete ? colors.success : colors.primary}
                secondaryColor={colors.warning}
                successColor={colors.success}
                backgroundColor={isDark ? '#333' : '#E5E5EA'}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Activity Goal */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(400).springify().damping(15)} style={styles.dashboardCardWrapper}>
          <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E5E5EA' }]}>
            <View style={[styles.dashboardCardHeader, { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }]}>
              <Text style={[styles.dashboardCardTitle, { color: colors.textSecondary }]}>Weekly Goal</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.warning}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                <Flame size={12} color={colors.warning} style={{ marginRight: 2 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.warning }}>3 Wks</Text>
              </View>
            </View>
            <View style={styles.dashboardCardContent}>
              <AnimatedCircleProgress
                progress={Math.min((appliedJobs.length / 5) * 100, 100)}
                size={80}
                strokeWidth={8}
                primaryColor={colors.secondary}
                secondaryColor={colors.primary}
                successColor={colors.success}
                backgroundColor={isDark ? '#333' : '#E5E5EA'}
              />
            </View>
            <Text style={[styles.dashboardCardSubtitle, { color: colors.textPrimary }]}>
              {appliedJobs.length} / 5 Applied
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Primary Action */}
      <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(400).springify().damping(15)}>
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/jobs')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Explore Opportunities</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Recent Matches */}
      {jobs.length > 0 && (
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(500).springify().damping(15)} style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')} style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.feedContainer}>
            {jobs.slice(0, 3).map(({ job, score }, idx) => (
              <View key={idx} style={styles.feedItem}>
                <JobCard
                  job={job}
                  score={score}
                  expanded={expandedJobId === job.id}
                  onPress={() => {
                    setExpandedJobId(expandedJobId === job.id ? null : (job.id || null));
                  }}
                  colors={colors}
                  isDark={isDark}
                  index={idx}
                  parallaxEnabled={false}
                  swipeEnabled={false}
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

      {/* Empty States / Quick Actions */}
      <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(600).springify().damping(15)} style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 16 }]}>
          Needs Attention
        </Text>
        <View style={styles.quickLinksContainer}>
          {!completionSteps.name && (
            <QuickLink
              title="0 Profile details"
              actionText="Complete Profile"
              onPress={() => router.push('/profile/edit/name')}
              colors={colors}
              index={0}
            />
          )}
          {!completionSteps.skills && (
            <QuickLink
              title="0 Skills added"
              actionText="Add Skills"
              onPress={() => router.push('/profile/edit/skills')}
              colors={colors}
              index={1}
            />
          )}
          {missingCerts.length > 0 && (
            <QuickLink
              title={`${missingCerts.length} Missing certificates`}
              actionText="Add certificate"
              onPress={() => router.push('/(tabs)/certifications')}
              colors={colors}
              index={2}
            />
          )}
          <QuickLink
            title="Interview preparation"
            actionText="Practice now"
            onPress={() => router.push('/(tabs)/prep')}
            colors={colors}
            index={3}
          />
        </View>
      </Animated.View>

      <JobApplicationModal
        visible={!!applyingJob}
        job={applyingJob}
        score={applyingJobScore}
        onClose={() => setApplyingJob(null)}
        onSubmit={(jobId, coverLetter) => {
          markJobApplied(jobId);
          setApplyingJob(null);
        }}
      />
    </ScrollView>
    <ConfettiCannon
      ref={confettiRef}
      count={200}
      origin={{ x: -10, y: 0 }}
      autoStart={false}
      fadeOut={true}
      fallSpeed={3000}
    />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // accommodate floating tab bar
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  trade: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  contextText: {
    fontSize: 15,
    marginTop: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statCardContainer: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.header,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  dashboardCardWrapper: {
    width: '48%',
  },
  dashboardCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    minHeight: 160,
  },
  dashboardCardHeader: {
    marginBottom: Spacing.md,
  },
  dashboardCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dashboardCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardCardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  progressHint: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedContainer: {
    gap: 16,
  },
  feedItem: {
    width: '100%',
  },
  quickLinksContainer: {
    gap: 12,
  },
  quickLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent', // Can add subtle border if needed
  },
  quickLinkTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickLinkActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickLinkActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
