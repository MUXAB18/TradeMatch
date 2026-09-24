import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TextInput,
  Image
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constants/theme';
import * as Haptics from '../../utils/haptics';
import { useToast } from '../../providers/ToastProvider';
import { useNetwork } from '../../contexts/NetworkContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useJobs } from '../../hooks/useJobs';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import LottieView from 'lottie-react-native';
import JobCard from '../../components/JobCard';
import JobApplicationModal from '../../components/JobApplicationModal';
import { Grid, Bell, Sliders } from 'lucide-react-native';

export default function JobsScreen() {
  const { data: profile, loading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const { jobs, loading: jobsLoading, error, refetch: refetchJobs } = useJobs(profile);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();
  const { showToast } = useToast();
  const { jobId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'strong' | 'applied'>('all');
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [applyingJobScore, setApplyingJobScore] = useState<any | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  React.useEffect(() => {
    const loadState = async () => {
      try {
        const [saved, applied] = await Promise.all([
          AsyncStorage.getItem('savedJobs'),
          AsyncStorage.getItem('appliedJobs'),
        ]);
        if (saved) setSavedJobs(JSON.parse(saved));
        if (applied) setAppliedJobs(JSON.parse(applied));
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
    if (activeFilter === 'saved') {
      result = result.filter(j => savedJobs.includes(j.job.id!));
    } else if (activeFilter === 'strong') {
      result = result.filter(j => j.score.total >= 80);
    } else if (activeFilter === 'applied') {
      result = result.filter(j => appliedJobs.includes(j.job.id!));
    }
    result.sort((a, b) => b.score.total - a.score.total);
    return result;
  }, [jobs, activeFilter, savedJobs, appliedJobs]);

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
    Haptics.selectionAsync();
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
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F8F9FA' }]}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 10, 50) }]}>
           <Skeleton width={44} height={44} borderRadius={16} />
           <View style={{ flexDirection: 'row', gap: 12 }}>
             <Skeleton width={44} height={44} borderRadius={22} />
             <Skeleton width={44} height={44} borderRadius={22} />
           </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Skeleton width="70%" height={80} style={{ marginVertical: 20 }} />
          <Skeleton width="100%" height={60} borderRadius={16} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? '#000' : '#F8F9FA' }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Jobs</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  const filters = [
    { id: 'all', label: 'All Jobs' },
    { id: 'strong', label: 'Strong Match' },
    { id: 'saved', label: 'Saved' },
    { id: 'applied', label: 'Applied' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F8F9FA' }]}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 10, 50) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <Grid size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
              <Bell size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150' }} 
              style={styles.avatar} 
            />
          </View>
        </View>

        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
          Find Your{'\n'}Best Dream Job
        </Text>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <TextInput 
              placeholder="Search jobs..." 
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <Sliders size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterPill,
                  isActive ? { backgroundColor: isDark ? '#333' : '#111' } : { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }
                ]}
                onPress={() => setActiveFilter(f.id as any)}
              >
                <Text style={[
                  styles.filterPillText, 
                  { color: isActive ? '#FFFFFF' : colors.textSecondary }
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Jobs List */}
        {filteredAndSortedJobs.length === 0 ? (
          <EmptyState
            illustration={
              <LottieView
                source={require('../../assets/lottie/empty.json')}
                autoPlay
                loop
                style={{ width: 150, height: 150 }}
              />
            }
            title="No Jobs Found"
            description="We couldn't find any jobs matching this filter right now."
          >
            <View />
          </EmptyState>
        ) : (
          <View style={styles.jobsListContainer}>
            {filteredAndSortedJobs.map((jobData, index) => {
              const isFeatured = index === 0 && activeFilter === 'all';
              
              if (index === 1 && activeFilter === 'all') {
                return (
                  <View key="recent-header" style={styles.recentJobsHeader}>
                    <Text style={[styles.recentJobsTitle, { color: colors.textPrimary }]}>Recent Jobs</Text>
                    <TouchableOpacity>
                      <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <JobCard
                  key={jobData.job.id}
                  job={jobData.job}
                  score={jobData.score}
                  expanded={expandedJobId === jobData.job.id}
                  onPress={() => handleJobPress(jobData.job.id!)}
                  onSave={() => toggleSaveJob(jobData.job.id!)}
                  onApplyPress={() => {
                    if (appliedJobs.includes(jobData.job.id!)) return;
                    setApplyingJob(jobData.job);
                    setApplyingJobScore(jobData.score);
                  }}
                  isSaved={savedJobs.includes(jobData.job.id!)}
                  isApplied={appliedJobs.includes(jobData.job.id!)}
                  colors={colors}
                  isDark={isDark}
                  index={index}
                  variant={isFeatured ? 'featured' : 'list'}
                />
              );
            })}
          </View>
        )}
      </Animated.ScrollView>

      <JobApplicationModal
        visible={!!applyingJob}
        job={applyingJob}
        score={applyingJobScore}
        onClose={() => setApplyingJob(null)}
        onSubmit={(jobId, _coverLetter) => {
          markJobApplied(jobId);
          setApplyingJob(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Space for tab bar
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 40,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '500',
    height: '100%',
  },
  filterBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  jobsListContainer: {
    paddingHorizontal: 20,
  },
  recentJobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  recentJobsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
  }
});
