import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  SlidersHorizontal,
  Bookmark,
  Settings,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../constants/theme';
import { useJobs } from '../../hooks/useJobs';
import { useUserProfile } from '../../hooks/useUserProfile';
import JobApplicationModal from '../../components/JobApplicationModal';
import { useToast } from '../../providers/ToastProvider';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { data: profile, loading: profileLoading } = useUserProfile();
  const { jobs, loading: jobsLoading } = useJobs(profile || null);
  const { showToast } = useToast();

  const initials = (profile?.name || 'U').substring(0, 1).toUpperCase();

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [saved, applied] = await Promise.all([
          AsyncStorage.getItem('savedJobs'),
          AsyncStorage.getItem('appliedJobs'),
        ]);
        if (saved) {
          setIsBookmarked(JSON.parse(saved).includes(id));
        }
        if (applied) {
          setIsApplied(JSON.parse(applied).includes(id));
        }
      } catch (e) {
        console.error('Failed to load local state', e);
      }
    };
    loadState();
  }, [id]);

  const toggleBookmark = async () => {
    try {
      const savedStr = await AsyncStorage.getItem('savedJobs');
      let savedJobs: string[] = savedStr ? JSON.parse(savedStr) : [];
      if (isBookmarked) {
        savedJobs = savedJobs.filter(jId => jId !== id);
        showToast('Job removed from saved list', 'info');
      } else {
        savedJobs.push(id as string);
        showToast('Job saved successfully', 'success');
      }
      setIsBookmarked(!isBookmarked);
      await AsyncStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    } catch (e) {
      console.error('Failed to toggle save', e);
    }
  };

  const handleApply = async (jobId: string, coverLetter: string) => {
    try {
      const appliedStr = await AsyncStorage.getItem('appliedJobs');
      let appliedJobs: string[] = appliedStr ? JSON.parse(appliedStr) : [];
      if (!appliedJobs.includes(jobId)) {
        appliedJobs.push(jobId);
        await AsyncStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
      }
      setIsApplied(true);
      setApplyModalVisible(false);
      showToast('Application sent successfully!', 'success');
    } catch (e) {
      console.error('Failed to apply', e);
    }
  };

  const scoredJob = jobs?.find(j => j.job.id === id);
  const job = scoredJob?.job;
  const matchResult = scoredJob?.score || { total: 0 };

  if (jobsLoading || profileLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: '#FFF' }}>Loading Job Details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: '#FFF' }}>Job not found</Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#FFF' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* Header Area */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top + 10, 50) },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs Details</Text>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/profile')}
        >
          {profile?.photoURL ? (
            <Image
              source={{ uri: profile.photoURL }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>{job.title}</Text>
        <Text style={styles.heroLocation}>
          {job.country || 'Unknown Location'}
        </Text>
      </View>

      {/* Wrapper for Overlapping Logo */}
      <View style={{ flex: 1, overflow: 'visible', zIndex: 1 }}>
        {/* Main White Content Card */}
        <View
          style={[
            styles.contentCard,
            { backgroundColor: isDark ? colors.background : '#FFFFFF' },
          ]}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: 64 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Company Name */}
            <Text
              style={[styles.companyNameCard, { color: colors.textPrimary }]}
            >
              {job.company || 'Unknown Company'}
            </Text>

            {/* Two Stats Blocks */}
            <View style={styles.statsRow}>
              <View
                style={[styles.statBox, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}
                >
                  Salary/year
                </Text>
                <Text style={styles.statValue}>
                  {job.salary || 'Competitive'}
                </Text>
              </View>
              <View
                style={[styles.statBox, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}
                >
                  Job Type
                </Text>
                <Text style={styles.statValue}>{job.jobType || 'Full Time'}</Text>
              </View>
            </View>

            {/* Job Details Section */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Job Details
            </Text>
            <Text
              style={[styles.descriptionText, { color: colors.textSecondary }]}
            >
              {job.description || 'No description provided.'}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {job.requiredSkills && job.requiredSkills.length > 0 ? (
                job.requiredSkills.map((skill: string, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: isDark ? colors.surface : '#F9FAFB',
                        borderColor: isDark ? colors.border : '#E5E7EB',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.tagText, { color: colors.textPrimary }]}
                    >
                      {skill}
                    </Text>
                  </View>
                ))
              ) : (
                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? colors.surface : '#F9FAFB',
                      borderColor: isDark ? colors.border : '#E5E7EB',
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.textPrimary }]}>
                    {job.jobType || 'Full Time'}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isDark ? colors.surface : '#F9FAFB',
                    borderColor: isDark ? colors.border : '#E5E7EB',
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.textPrimary }]}>
                  {Math.round(matchResult.total)}% Match
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Bar */}
          <View
            style={[
              styles.bottomBar,
              {
                paddingBottom: Math.max(insets.bottom, 24),
                backgroundColor: isDark ? colors.background : '#FFFFFF',
                borderTopColor: isDark ? colors.border : '#F9FAFB',
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.bookmarkBtn,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: isDark ? colors.border : '#E5E7EB',
                },
              ]}
              onPress={toggleBookmark}
            >
              <Bookmark
                size={24}
                color={isBookmarked ? colors.primary : colors.textSecondary}
                fill={isBookmarked ? colors.primary : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyBtn,
                {
                  backgroundColor: isApplied ? colors.success : colors.primary,
                },
              ]}
              onPress={() => !isApplied && setApplyModalVisible(true)}
            >
              <Text style={styles.applyBtnText}>
                {isApplied ? 'Applied \u2713' : 'Apply Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fixed Logo Overlapping the Top Edge */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderColor: isDark ? colors.background : '#FFFFFF',
            },
          ]}
        >
          <Text style={[styles.logoText, { color: colors.primary }]}>
            {job.company ? job.company.substring(0, 4) : 'CO'}
          </Text>
        </View>
      </View>

      <JobApplicationModal
        visible={applyModalVisible}
        job={job}
        score={matchResult}
        onClose={() => setApplyModalVisible(false)}
        onSubmit={handleApply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 70,
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  companyNameCard: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  floatingActionBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF', // standard premium blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: -54,
    alignSelf: 'center',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  logoText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    alignSelf: 'flex-start',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    textAlign: 'left',
    marginBottom: 32,
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  tagPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    gap: 16,
  },
  bookmarkBtn: {
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  applyBtn: {
    flex: 1,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
