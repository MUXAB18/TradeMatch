import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import Animated, { 
  FadeInUp, 
  useReducedMotion
} from 'react-native-reanimated';
import Button from './Button';



interface JobCardProps {
  job: any;
  score: any;
  expanded?: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  index: number;
  isSaved?: boolean;
  isApplied?: boolean;
  onSave?: () => void;
  onApply?: () => void;
  onApplyPress?: () => void;
  variant?: 'featured' | 'list' | 'grid';
  parallaxEnabled?: boolean;
}

export default function JobCard({ 
  job, 
  score, 
  expanded = false, 
  onPress, 
  colors, 
  isDark, 
  index, 
  isSaved = false,
  isApplied = false,
  onSave,
  onApply,
  onApplyPress,
  variant = 'list',
  parallaxEnabled
}: JobCardProps) {
  const reducedMotion = useReducedMotion();

  const handleSave = () => {
    if (onSave) onSave();
  };



  if (variant === 'featured') {
    return (
      <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(index * 50).duration(250)}>
        <TouchableOpacity
          style={[styles.featuredCard, { backgroundColor: isDark ? colors.surface : '#1A1D1E' }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredCompanyInfo}>
              <View style={[styles.companyLogo, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.companyLogoText, { color: '#000000' }]}>{job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}</Text>
              </View>
              <View>
                <Text style={[styles.featuredCompanyName, { color: colors.white }]}>{job.company || 'Unknown Company'}</Text>
                <Text style={[styles.featuredLocation, { color: colors.white, opacity: 0.7 }]}>{score.breakdown?.distanceKm || '10'} km away</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSave}>
              <Bookmark size={20} color={colors.white} fill={isSaved ? colors.white : "transparent"} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.featuredJobTitle, { color: colors.white }]}>{job.title}</Text>

          <View style={styles.featuredTags}>
            {job.salary && (
              <View style={[styles.featuredTag, { backgroundColor: '#FFFFFF' }]}>
                <Text style={[styles.featuredTagText, { color: '#000000' }]}>{job.salary}</Text>
              </View>
            )}
            <View style={[styles.featuredTag, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.featuredTagText, { color: '#FFFFFF' }]}>{job.jobType || 'Full Time'}</Text>
            </View>
            <View style={[styles.featuredTag, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.featuredTagText, { color: '#FFFFFF' }]}>{Math.round(score.total)}% Match</Text>
            </View>
          </View>
          
          {expanded && (
             <View style={[styles.expandedSectionFeatured, { borderTopColor: colors.white }]}>
                {job.description && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.white }]}>Role Description</Text>
                    <Text style={[styles.detailText, { color: colors.white, opacity: 0.8 }]}>{job.description}</Text>
                  </View>
                )}
                <Button
                  style={[ { marginTop: 16 }, isApplied && { backgroundColor: colors.success, borderColor: colors.success } ]}
                  onPress={() => {
                    if (onApplyPress) onApplyPress();
                    else if (onApply) onApply();
                  }}
                  title={isApplied ? "Applied ✓" : "Apply Now"}
                  variant="primary"
                />
             </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'grid') {
    return (
      <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay((index % 10) * 50).duration(250)} style={{ width: '48%', marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: colors.surface }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.gridHeader}>
            <View style={[styles.companyLogoGrid, { backgroundColor: colors.background }]}>
              <Text style={[styles.companyLogoTextList, { color: colors.textPrimary }]}>
                {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSave}>
              <Bookmark size={18} color={isSaved ? colors.primary : colors.textSecondary} fill={isSaved ? colors.primary : "transparent"} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.gridJobTitle, { color: colors.textPrimary }]} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={[styles.gridCompany, { color: colors.textSecondary }]} numberOfLines={1}>
            {job.company || 'Unknown'}
          </Text>
          
          <View style={styles.gridFooter}>
            <View style={[styles.gridMatchTag, { backgroundColor: isDark ? '#1E2122' : '#F5F6F8' }]}>
              <Text style={[styles.gridMatchText, { color: colors.textPrimary }]}>{Math.round(score.total)}% Match</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // LIST VARIANT
  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay((index % 10) * 50).duration(250)}>
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.listMain}>
          <View style={[styles.companyLogoList, { backgroundColor: colors.background }]}>
            <Text style={[styles.companyLogoTextList, { color: colors.textPrimary }]}>
              {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
            </Text>
          </View>
          <View style={styles.listTextContainer}>
            <Text style={[styles.listJobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
            <Text style={[styles.listCompany, { color: colors.textSecondary }]} numberOfLines={1}>
              {job.company || 'Unknown Company'} - {Math.round(score.total)}% Match
            </Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
            <Bookmark size={20} color={isSaved ? colors.primary : colors.textSecondary} fill={isSaved ? colors.primary : "transparent"} />
          </TouchableOpacity>
        </View>

        {expanded && (
           <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
              {job.salary && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Salary</Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.salary}</Text>
                </View>
              )}
              {job.description && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Role Description</Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={3}>{job.description}</Text>
                </View>
              )}
              <Button
                style={[ { marginTop: 16 }, isApplied && { backgroundColor: colors.success, borderColor: colors.success } ]}
                onPress={() => {
                  if (onApplyPress) onApplyPress();
                  else if (onApply) onApply();
                }}
                title={isApplied ? "Applied ✓" : "Apply Now"}
                variant="primary"
              />
           </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // FEATURED CARD
  featuredCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuredCompanyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 16,
    fontWeight: '800',
  },
  featuredCompanyName: {
    fontSize: 15,
    fontWeight: '600',
  },
  featuredLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  featuredJobTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  featuredTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featuredTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featuredTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedSectionFeatured: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    opacity: 0.9,
  },

  // LIST CARD
  listCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  listMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogoList: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyLogoTextList: {
    fontSize: 16,
    fontWeight: '800',
  },
  listTextContainer: {
    flex: 1,
  },
  listJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  listCompany: {
    fontSize: 13,
    fontWeight: '500',
  },
  expandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 22,
  },
  
  // GRID CARD
  gridCard: {
    borderRadius: 20,
    padding: 16,
    height: 180,
    justifyContent: 'space-between',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogoGrid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridJobTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  gridCompany: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 'auto',
  },
  gridFooter: {
    marginTop: 12,
  },
  gridMatchTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gridMatchText: {
    fontSize: 11,
    fontWeight: '600',
  }
});
