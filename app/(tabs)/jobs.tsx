import React, { useState } from 'react';
import { TouchableOpacity, Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler, useAnimatedStyle, withSpring, interpolateColor, Layout, FadeIn
} from 'react-native-reanimated';

import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import { useToast } from '../../providers/ToastProvider';
import { useNetwork } from '../../contexts/NetworkContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useJobs } from '../../hooks/useJobs';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { NoJobsIllustration } from '../../components/illustrations';

import JobCard from '../../components/JobCard';


const FilterSortBar = ({ activeFilter, setActiveFilter, activeSort, setActiveSort, colors, isDark }: any) => {
  const filters = [
    { id: 'all', label: 'All Matches' },
    { id: 'strong', label: 'Strong (>80%)' },
    { id: 'saved', label: 'Saved' },
  ];
  
  const sorts = [
    { id: 'score', label: 'Match Score' },
    { id: 'distance', label: 'Distance' },
    { id: 'recent', label: 'Recent' },
  ];

  return (
    <View style={[styles.filterSortContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>Filter:</Text>
        {filters.map((f, i) => {
          const isActive = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.chip,
                isActive ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? colors.background : colors.white, borderColor: colors.border, borderWidth: 1 },
                i === filters.length - 1 && { marginRight: Spacing.xl }
              ]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textPrimary }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>Sort:</Text>
        {sorts.map((s, i) => {
          const isActive = activeSort === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.chip,
                isActive ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? colors.background : colors.white, borderColor: colors.border, borderWidth: 1 },
                i === sorts.length - 1 && { marginRight: Spacing.xl }
              ]}
              onPress={() => setActiveSort(s.id)}
            >
              <Text style={[styles.chipText, { color: isActive ? '#fff' : colors.textPrimary }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function JobsScreen() {
  const { data: profile, loading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const { jobs, loading: jobsLoading, error, refetch: refetchJobs } = useJobs(profile);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();
  const { showToast } = useToast();
  const { jobId } = useLocalSearchParams();

  const [refreshing, setRefreshing] = useState(false);

  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<number>(Date.now());
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'strong'>('all');
  const [activeSort, setActiveSort] = useState<'score' | 'distance' | 'recent'>('score');

  React.useEffect(() => {
    const loadState = async () => {
      try {
        const [saved, applied, timestamp] = await Promise.all([
          AsyncStorage.getItem('savedJobs'),
          AsyncStorage.getItem('appliedJobs'),
          AsyncStorage.getItem('lastViewedTimestamp')
        ]);
        if (saved) setSavedJobs(JSON.parse(saved));
        if (applied) setAppliedJobs(JSON.parse(applied));
        if (timestamp) {
          setLastViewedTimestamp(parseInt(timestamp, 10));
        }
        await AsyncStorage.setItem('lastViewedTimestamp', Date.now().toString());
      } catch (e) {
        console.error('Failed to load local state', e);
      }
    };
    loadState();
  }, []);

  const toggleSaveJob = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isSaved = savedJobs.includes(id);
    const newSaved = isSaved ? savedJobs.filter(j => j !== id) : [...savedJobs, id];
    setSavedJobs(newSaved);
    await AsyncStorage.setItem('savedJobs', JSON.stringify(newSaved));
    if (!isSaved) showToast('Job saved', 'success');
  };

  const markJobApplied = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (appliedJobs.includes(id)) return;
    const newApplied = [...appliedJobs, id];
    setAppliedJobs(newApplied);
    await AsyncStorage.setItem('appliedJobs', JSON.stringify(newApplied));
    showToast('Job marked as applied', 'success');
  };

  const filteredAndSortedJobs = React.useMemo(() => {
    let result = [...jobs];
    
    // Filter
    if (activeFilter === 'saved') {
      result = result.filter(j => savedJobs.includes(j.job.id!));
    } else if (activeFilter === 'strong') {
      result = result.filter(j => j.score.total >= 80);
    }

    // Sort
    if (activeSort === 'score') {
      result.sort((a, b) => b.score.total - a.score.total);
    } else if (activeSort === 'distance') {
      result.sort((a, b) => a.score.breakdown.distanceKm - b.score.breakdown.distanceKm);
    } else if (activeSort === 'recent') {
      // Assuming job object has a createdAt or similar, but for now we'll just mock recent by preserving order
      // We don't have createdAt in the type currently. Let's just sort by ID string comparison as a mock if needed.
      result.sort((a, b) => (b.job.id || '').localeCompare(a.job.id || ''));
    }

    return result;
  }, [jobs, activeFilter, activeSort, savedJobs]);



  React.useEffect(() => {
    if (jobId && typeof jobId === 'string' && jobs.length > 0) {
      const exists = jobs.find(j => j.job.id === jobId);
      if (exists) {
        setExpandedJobId(jobId);
      }
    }
  }, [jobId, jobs]);

  const onRefresh = React.useCallback(async () => {
    if (isOffline) {
      showToast('Cannot refresh jobs while offline', 'error');
      return;
    }
    setRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchJobs()
    ]);
    setRefreshing(false);
  }, [refetchProfile, refetchJobs, isOffline, showToast]);

  const handleJobPress = async (id: string) => {
    const isExpanding = expandedJobId !== id;
    setExpandedJobId(isExpanding ? id : null);

    if (isExpanding && profile?.trade && profile?.availability && profile.skills.length > 0) {
      try {
        const hasRequested = await AsyncStorage.getItem('hasRequestedReview');
        if (hasRequested === 'true') return;

        const viewedStr = await AsyncStorage.getItem('viewedJobs');
        let viewedJobs: string[] = viewedStr ? JSON.parse(viewedStr) : [];
        
        if (!viewedJobs.includes(id)) {
          viewedJobs.push(id);
          await AsyncStorage.setItem('viewedJobs', JSON.stringify(viewedJobs));
        }

        if (viewedJobs.length >= 3 && await StoreReview.hasAction()) {
          await StoreReview.requestReview();
          await AsyncStorage.setItem('hasRequestedReview', 'true');
        }
      } catch (e) {
        console.error('Error in StoreReview logic:', e);
      }
    }
  };

  if (profileLoading || jobsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Skeleton width="40%" height={Typography.headerLarge} style={{ marginBottom: Spacing.xs }} />
          <Skeleton width="60%" height={Typography.body} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[
                styles.jobCard,
                {
                  backgroundColor: isDark ? colors.surface : colors.white,
                  borderColor: isDark ? colors.border : `${colors.textSecondary}30`,
                }
              ]}
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleContainer}>
                  <Skeleton width="70%" height={Typography.header} style={{ marginBottom: Spacing.xs }} />
                  <Skeleton width="40%" height={Typography.body} />
                </View>
                <Skeleton width={50} height={32} borderRadius={16} />
              </View>

              <Skeleton width="30%" height={Typography.body} style={{ marginBottom: Spacing.md }} />

              <View style={styles.keyInfo}>
                {[1, 2, 3].map(j => (
                  <View key={j} style={styles.infoRow}>
                    <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: Spacing.xs }} />
                    <Skeleton width={`${40 + j * 10}%`} height={Typography.body} />
                  </View>
                ))}
              </View>
              
              <Skeleton width="40%" height={Typography.small} style={{ alignSelf: 'center', marginTop: Spacing.sm }} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Jobs</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Job Matches</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            {profile?.trade}
          </Text>
        </View>

        <EmptyState
          illustration={<NoJobsIllustration size={120} color={colors.primary} />}
          title="No Jobs Found"
          description="We couldn't find any jobs matching your profile right now."
        >
          <View style={[styles.emptyTips, { backgroundColor: `${colors.secondary}10`, borderLeftColor: colors.secondary }]}>
            <Text style={[styles.emptyTipsTitle, { color: colors.textPrimary }]}>Try this:</Text>
            <Text style={[styles.emptyTip, { color: colors.textSecondary }]}>• Add more skills to your profile</Text>
            <Text style={[styles.emptyTip, { color: colors.textSecondary }]}>
              • Complete missing certifications
            </Text>
            <Text style={[styles.emptyTip, { color: colors.textSecondary }]}>• Check back later for new postings</Text>
          </View>
        </EmptyState>
      </View>
    );
  }

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Job Matches</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          {filteredAndSortedJobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found for{' '}
          {profile?.trade}
        </Text>
      </View>

      <FilterSortBar
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        activeSort={activeSort} 
        setActiveSort={setActiveSort} 
        colors={colors} 
        isDark={isDark} 
      />
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
      {filteredAndSortedJobs.map(({ job, score }, index) => (
          <JobCard
            key={job.id}
            job={job}
            score={score}
            expanded={expandedJobId === job.id}
            onPress={() => handleJobPress(job.id!)}
            colors={colors}
            isDark={isDark}
            index={index}
            scrollY={scrollY}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  filterSortContainer: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chipLabel: {
    fontSize: Typography.small,
    fontWeight: '700',
    marginRight: Spacing.md,
    alignSelf: 'center',
    width: 45,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },

  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20, // account for status bar
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  jobCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    minHeight: Spacing.minTapTarget,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobTitle: {
    fontSize: Typography.header,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  jobCompany: {
    fontSize: Typography.body,
  },
  matchBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  matchScore: {
    fontSize: Typography.header,
    fontWeight: '800',
  },
  matchLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  keyInfo: {
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoIcon: {
    fontSize: Typography.body,
    marginRight: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.body,
  },
  tapHint: {
    fontSize: Typography.small,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  expandedSection: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  detailSection: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },
  certList: {
    marginTop: Spacing.xs,
  },
  certItem: {
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
  applyButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: Spacing.minTapTarget,
  },
  applyButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#fff',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
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
  emptyTips: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
  },
  emptyTipsTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyTip: {
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
});
