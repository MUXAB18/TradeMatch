import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { User, Settings, Briefcase, Award, Zap, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'react-native';
import AnimatedCircleProgress from '../../components/AnimatedCircleProgress';
import JobCard from '../../components/JobCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

// --- Component for Counting Stats ---
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

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInUp.delay(300 + index * 100).springify().damping(15)}
      style={styles.statCardContainer}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.statCard, { backgroundColor: colors.surface }, animatedStyle]}>
          <View style={[styles.statIconWrapper, { backgroundColor: `${colors.primary}15` }]}>
             <Icon size={20} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{displayValue}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// --- Component for Pulsing Dot ---
function PulsingDot({ color }: { color: string }) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!reducedMotion) {
      scale.value = withRepeat(
        withSequence(withTiming(1.5, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        false
      );
    }
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseRing, { backgroundColor: color }, animatedStyle]} />
      <View style={[styles.pulseCore, { backgroundColor: color }]} />
    </View>
  );
}

// --- Quick Link ---
interface QuickLinkProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  status?: 'complete' | 'pending' | 'recommended';
  colors: any;
  index: number;
}

function QuickLink({ icon, title, description, onPress, status, colors, index }: QuickLinkProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  
  const statusColors = {
    complete: colors.success,
    pending: colors.warning,
    recommended: colors.secondary,
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInUp.delay(500 + index * 100).springify().damping(15)}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.quickLink, { backgroundColor: colors.surface }, animatedStyle]}>
          <View style={[styles.quickLinkIcon, { backgroundColor: `${colors.primary}10` }]}>
            {typeof icon === 'string' ? (
               <Text style={styles.iconText}>{icon}</Text>
            ) : (
               icon
            )}
          </View>
          <View style={styles.quickLinkContent}>
            <Text style={[styles.quickLinkTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.quickLinkDescription, { color: colors.textSecondary }]}>{description}</Text>
          </View>
          
          <View style={styles.quickLinkRight}>
            {status === 'pending' && <PulsingDot color={colors.warning} />}
            {status && status !== 'pending' && (
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusColors[status] },
                ]}
              />
            )}
            <ChevronRight size={20} color={colors.textSecondary} style={{ opacity: 0.5 }} />
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
  const isFirstTimeState = completionPercent === 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: Math.max(insets.top + Spacing.md, Spacing.xl) }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >


      {/* Header */}
      <View style={styles.header}>
        <Animated.Text 
          entering={reducedMotion ? undefined : FadeInUp.delay(100).springify().damping(15)}
          style={[styles.greeting, { color: colors.textSecondary }]}
        >
          {greeting}
        </Animated.Text>
        <Animated.View 
          entering={reducedMotion ? undefined : FadeInUp.delay(200).springify().damping(15)}
          style={styles.nameRow}
        >
          <TouchableOpacity 
            style={styles.nameRowContent}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Go to Profile"
            activeOpacity={0.7}
          >
            <View style={[styles.profileIconContainer, { backgroundColor: colors.primary }]}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {profile.name}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(300).springify().damping(15)}>
          <View style={[styles.tradeBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.trade, { color: colors.primary }]}>{profile.trade}</Text>
          </View>
        </Animated.View>
      </View>

      {/* First-time Empty State vs Normal Dashboard */}
      {isFirstTimeState ? (
        <Animated.View 
          entering={reducedMotion ? undefined : FadeInUp.delay(400).springify().damping(15)}
          style={[styles.emptyStateContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={styles.emptyStateIcon}>🚀</Text>
          <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>Let's build your profile</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Completing your profile unlocks job matches, tailored practice questions, and certifications for your trade.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/profile/edit/name')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <AnimatedStat icon={Briefcase} value={jobs.length} label="Matches" colors={colors} index={0} onPress={() => router.push('/(tabs)/jobs')} />
            <AnimatedStat icon={Zap} value={profile.skills.length} label="Skills" colors={colors} index={1} onPress={() => router.push('/profile/edit/skills')} />
            <AnimatedStat icon={Award} value={userCerts.length} label="Certs" colors={colors} index={2} onPress={() => router.push('/(tabs)/certifications')} />
          </View>

          {/* Profile Completion Ring Card */}
          <Animated.View 
            entering={reducedMotion ? undefined : FadeInUp.delay(600).springify().damping(15)}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => !isProfileComplete ? router.push('/profile') : null}
              style={[styles.completionCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.completionRow}>
                <View style={styles.completionTextContainer}>
                  <Text style={[styles.completionTitle, { color: colors.textPrimary }]}>Profile Setup</Text>
                  {!isProfileComplete ? (
                    <Text style={[styles.completionHint, { color: colors.textSecondary }]}>
                      Complete your profile to unlock premium matches.
                    </Text>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 6 }} />
                      <Text style={[styles.completionHint, { color: colors.success, marginTop: 0 }]}>
                        All set and ready!
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.ringContainer}>
                  <AnimatedCircleProgress
                    progress={completionPercent}
                    size={72}
                    strokeWidth={8}
                    primaryColor={colors.primary}
                    secondaryColor={`${colors.primary}20`}
                    successColor={colors.success}
                    backgroundColor={colors.border}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Recent Matches Carousel */}
          {jobs.length > 0 && (
            <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(700).springify().damping(15)}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Matches</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')} style={styles.seeAllButton}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
                snapToInterval={SCREEN_WIDTH * 0.85 + Spacing.md}
                decelerationRate="fast"
                snapToAlignment="start"
              >
                {jobs.slice(0, 3).map(({ job, score }, idx) => (
                  <View key={idx} style={[styles.carouselItem, { width: SCREEN_WIDTH * 0.85 }]}>
                    <JobCard
                      job={job}
                      score={score}
                      expanded={false}
                      onPress={() => router.push('/(tabs)/jobs')}
                      colors={colors}
                      isDark={isDark}
                      index={idx}
                      parallaxEnabled={false}
                      swipeEnabled={false}
                    />
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Quick Links */}
          <Animated.Text 
            entering={reducedMotion ? undefined : FadeInUp.delay(800).springify().damping(15)}
            style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: Spacing.xl + Spacing.sm }]}
          >
            Quick Actions
          </Animated.Text>

          <View style={styles.quickLinksContainer}>
            {!completionSteps.name && (
              <QuickLink
                icon="✏️"
                title="Complete Your Profile"
                description="Add your name and experience"
                onPress={() => router.push('/profile/edit/name')}
                status="pending"
                colors={colors}
                index={0}
              />
            )}

            {!completionSteps.skills && (
              <QuickLink
                icon="⚙️"
                title="Add Your Skills"
                description="List your technical competencies"
                onPress={() => router.push('/profile/edit/skills')}
                status="pending"
                colors={colors}
                index={1}
              />
            )}

            {missingCerts.length > 0 && (
              <QuickLink
                icon="📜"
                title="Missing Certifications"
                description={`${missingCerts.length} cert${missingCerts.length === 1 ? '' : 's'} to complete`}
                onPress={() => router.push('/(tabs)/certifications')}
                status="recommended"
                colors={colors}
                index={2}
              />
            )}

            <QuickLink
              icon="📚"
              title="Practice Interview"
              description="Prepare for your next challenge"
              onPress={() => router.push('/(tabs)/prep')}
              colors={colors}
              index={3}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl + 80,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  topBarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  greeting: {
    fontSize: Typography.body,
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  nameRow: {
    marginTop: Spacing.xs,
  },
  nameRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#FFF',
  },
  name: {
    fontSize: Typography.headerLarge * 1.25,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  tradeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  trade: {
    fontSize: Typography.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCardContainer: {
    flex: 1,
  },
  statCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'flex-start',
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  completionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionTextContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  completionTitle: {
    fontSize: Typography.header,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  completionHint: {
    fontSize: Typography.body,
    lineHeight: 22,
    marginTop: 4,
  },
  ringContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.header,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  carouselContent: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  carouselItem: {
    // width is set inline
  },
  quickLinksContainer: {
    gap: Spacing.md,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    minHeight: 76,
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 22,
  },
  quickLinkContent: {
    flex: 1,
    justifyContent: 'center',
  },
  quickLinkTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  quickLinkDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  errorTitle: {
    fontSize: Typography.header,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.body,
    textAlign: 'center',
  },
  emptyStateContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateText: {
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#F5F5F7',
    fontSize: Typography.body,
    fontWeight: '700',
  },
  pulseContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  pulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pulseCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
