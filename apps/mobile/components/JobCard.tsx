import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark, MoreVertical } from 'lucide-react-native';
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
  variant?: 'featured' | 'list';
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
  variant = 'list'
}: JobCardProps) {
  const reducedMotion = useReducedMotion();

  const handleSave = () => {
    if (onSave) onSave();
  };



  if (variant === 'featured') {
    return (
      <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(index * 50).duration(250)}>
        <TouchableOpacity
          style={[styles.featuredCard, { backgroundColor: isDark ? colors.surface : '#111111' }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredCompanyInfo}>
              <View style={[styles.companyLogo, { backgroundColor: isDark ? '#333' : '#333' }]}>
                <Text style={styles.companyLogoText}>{job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}</Text>
              </View>
              <View>
                <Text style={styles.featuredCompanyName}>{job.company || 'Unknown Company'}</Text>
                <Text style={styles.featuredLocation}>{score.breakdown?.distanceKm || '10'} km away</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSave}>
              <Bookmark size={20} color="#FFFFFF" fill={isSaved ? "#FFFFFF" : "transparent"} />
            </TouchableOpacity>
          </View>

          <Text style={styles.featuredJobTitle}>{job.title}</Text>

          <View style={styles.featuredTags}>
            {job.salary && (
              <View style={styles.featuredTag}>
                <Text style={styles.featuredTagText}>{job.salary}</Text>
              </View>
            )}
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>Full Time</Text>
            </View>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>{Math.round(score.total)}% Match</Text>
            </View>
          </View>
          
          {expanded && (
             <View style={styles.expandedSectionFeatured}>
                {job.description && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: '#FFF' }]}>Role Description</Text>
                    <Text style={[styles.detailText, { color: '#CCC' }]}>{job.description}</Text>
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

  // LIST VARIANT
  return (
    <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(index * 50).duration(250)}>
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.listMain}>
          <View style={[styles.companyLogoList, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}>
            <Text style={[styles.companyLogoTextList, { color: colors.textPrimary }]}>
              {job.company ? job.company.substring(0, 2).toUpperCase() : 'CO'}
            </Text>
          </View>
          <View style={styles.listTextContainer}>
            <Text style={[styles.listJobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
            <Text style={[styles.listCompany, { color: colors.textSecondary }]}>
              {job.company || 'Unknown Company'} • {Math.round(score.total)}% Match
            </Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
            <MoreVertical size={20} color={colors.textSecondary} />
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
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.description}</Text>
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  featuredCompanyName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  featuredLocation: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 2,
  },
  featuredJobTitle: {
    color: '#FFF',
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
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featuredTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedSectionFeatured: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
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
});
