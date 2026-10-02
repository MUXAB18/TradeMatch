import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import {
  Settings,
  FileText,
  Briefcase,
  Award,
  Zap,
  ChevronRight,
  PenTool,
  Home,
  Camera,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCertifications } from '../../hooks/useCertifications';
import { generateCVHTML } from '../../utils/cvTemplate';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { EmptyProfileIllustration } from '../../components/illustrations';
import Button from '../../components/Button';
import { useToast } from '../../providers/ToastProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useAppTheme,
  Typography,
  Spacing,
  BorderRadius,
} from '../../constants/theme';
import { updateUserProfile } from '../../services/users';
import { useAuth } from '../../contexts/AuthContext';
import { extractProfileFromAudio, extractProfileFromCV } from '../../services/ai';
import { useAudioRecorder, RecordingOptions, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { Mic, Square } from 'lucide-react-native';

function ListCard({ icon: Icon, title, subtitle, onPress, colors }: any) {
  return (
    <TouchableOpacity
      style={[newStyles.listCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
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
        <Text style={[newStyles.listCardTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text
          style={[newStyles.listCardSubtitle, { color: colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      </View>
      <View style={newStyles.listCardArrow}>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useUserProfile();
  const [showPreview, setShowPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Audio Recording State
  const [showAIModal, setShowAIModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioRecorder = useAudioRecorder(
    {
      ...RecordingPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
      numberOfChannels: 1,
    },
    (status) => {}
  );
  const [isRecordingProfile, setIsRecordingProfile] = useState(false);

  const startProfileRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status === 'granted') {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        setIsRecordingProfile(true);
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
      } else {
        showToast('Microphone permission is required.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopProfileRecording = async () => {
    try {
      setIsRecordingProfile(false);
      await audioRecorder.stop();
      if (audioRecorder.uri) {
        setIsAnalyzing(true);
        try {
          const aiData = await extractProfileFromAudio(audioRecorder.uri);
          
          if (user?.uid) {
            await updateUserProfile(user.uid, {
              trade: aiData.trade || data?.trade,
              yearsExperience: aiData.yearsExperience || data?.yearsExperience,
              skills: aiData.skills?.length > 0 ? aiData.skills : data?.skills,
              certifications: aiData.certifications?.length > 0 ? aiData.certifications : data?.certifications,
            });
            showToast('Profile updated from voice!', 'success');
            await refetch();
          }
        } catch (e) {
          showToast('Failed to analyze audio.', 'error');
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pickAndUploadCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsAnalyzing(true);
        try {
          const aiData = await extractProfileFromCV(file.uri, file.mimeType || 'application/pdf');
          
          if (user?.uid) {
            await updateUserProfile(user.uid, {
              trade: aiData.trade || data?.trade,
              yearsExperience: aiData.yearsExperience || data?.yearsExperience,
              skills: aiData.skills?.length > 0 ? aiData.skills : data?.skills,
              certifications: aiData.certifications?.length > 0 ? aiData.certifications : data?.certifications,
            });
            showToast('Profile updated from CV!', 'success');
            await refetch();
          }
        } catch (e: any) {
          showToast(e.message || 'Failed to analyze CV.', 'error');
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { have: userCerts } = useCertifications(
    data?.trade || '',
    data?.country || '',
    data?.certifications || []
  );

  const handleEditProfile = () => {
    router.push('/profile/edit/name');
  };

  const handleExportCV = async () => {
    if (!data) {
      showToast('Profile not loaded', 'error');
      return;
    }

    try {
      const html = generateCVHTML({
        user: data,
        certifications: userCerts,
      });

      setPreviewHTML(html);
      setShowPreview(true);
    } catch (err) {
      console.error('CV generation error:', err);
      showToast('Failed to generate CV. Please try again.', 'error');
    }
  };

  const handlePickImage = async () => {
    if (!user?.uid) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Keep small for base64 saving in Firestore
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        const asset = result.assets[0];
        if (asset.base64) {
          const base64Data = `data:image/jpeg;base64,${asset.base64}`;
          const res = await updateUserProfile(user.uid, {
            photoURL: base64Data,
          });
          if (res.error) {
            showToast(res.error, 'error');
          } else {
            showToast('Profile photo updated!', 'success');
            await refetch();
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Failed to update photo', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const exportAnimTranslateY = useSharedValue(0);
  const exportAnimOpacity = useSharedValue(0);
  const exportAnimScale = useSharedValue(0.5);

  const exportIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: exportAnimOpacity.value,
      transform: [
        { translateY: exportAnimTranslateY.value },
        { scale: exportAnimScale.value },
      ],
      position: 'absolute',
      alignSelf: 'center',
      top: -30,
    };
  });

  const triggerExportSuccessAnim = (callback: () => void) => {
    exportAnimOpacity.value = 1;
    exportAnimScale.value = withSpring(1.5, { damping: 10, stiffness: 100 });
    exportAnimTranslateY.value = withSequence(
      withTiming(-80, { duration: 600 }),
      withDelay(
        200,
        withTiming(-100, { duration: 200 }, () => {
          runOnJS(callback)();
          exportAnimOpacity.value = withTiming(0, { duration: 200 }, () => {
            exportAnimTranslateY.value = 0;
            exportAnimScale.value = 0.5;
          });
        })
      )
    );
  };

  const handleConfirmExport = async () => {
    if (!data || !previewHTML) return;
    setIsExporting(true);

    try {
      const { uri } = await Print.printToFileAsync({
        html: previewHTML,
        base64: false,
      });

      triggerExportSuccessAnim(async () => {
        setShowPreview(false);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save or Share your CV',
            UTI: 'com.adobe.pdf',
          });
        } else {
          showToast('CV generated successfully!', 'success');
        }
      });
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export CV. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.headerContainer,
            { paddingTop: Math.max(insets.top, Spacing.lg) },
          ]}
        >
          <Skeleton
            width="50%"
            height={Typography.headerLarge}
            style={{ marginBottom: Spacing.lg }}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Skeleton
            width="40%"
            height={Typography.body}
            style={{ marginBottom: Spacing.md }}
          />
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <Skeleton width="25%" height={Typography.body} />
              <Skeleton width="40%" height={Typography.body} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          Error Loading Profile
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/profile')}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          illustration={
            <EmptyProfileIllustration size={140} color={colors.primary} />
          }
          title="No Profile Found"
          description="Let's create your profile to start matching with jobs and tracking certifications."
          actionLabel="Get Started"
          onActionPress={handleEditProfile}
        />
      </View>
    );
  }

  const isProfileComplete =
    data.name !== 'New User' &&
    data.yearsExperience > 0 &&
    data.skills.length > 0;
  const firstName = data.name ? data.name.split(' ')[0] : 'User';

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
      >
        {/* Header */}
        <View
          style={[
            newStyles.header,
            { marginTop: Math.max(insets.top + 10, 50) },
          ]}
        >
          <TouchableOpacity
            style={[
              newStyles.iconButton,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Home size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[newStyles.headerTitle, { color: colors.textPrimary }]}>
            Profile
          </Text>

          <TouchableOpacity
            style={[
              newStyles.iconButton,
              { backgroundColor: isDark ? colors.surface : '#FFF' },
            ]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Settings size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Top Profile Card */}
        <View
          style={[
            newStyles.topCard,
            { backgroundColor: isDark ? colors.surface : '#FFF' },
          ]}
        >
          <View style={newStyles.topCardLeft}>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={isUploadingPhoto}
            >
              <View style={newStyles.avatarContainer}>
                <Image
                  source={{ uri: data.photoURL || 'https://i.pravatar.cc/150' }}
                  style={[
                    newStyles.avatarLarge,
                    isUploadingPhoto && { opacity: 0.5 },
                  ]}
                />
                <View
                  style={[
                    newStyles.avatarEditBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Camera size={14} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
            <Text
              style={[newStyles.profileName, { color: colors.textPrimary }]}
            >
              {data.name}
            </Text>
            <View style={newStyles.badgeContainer}>
              <Text style={newStyles.badgeText}>
                {data.trade || 'No Trade Set'}
              </Text>
            </View>
            <Text style={[newStyles.tagline, { color: colors.textSecondary }]}>
              {data.country
                ? `Based in ${data.country}`
                : 'Keep learning, keep growing!'}
            </Text>
          </View>

          <View style={newStyles.topCardRight}>
            <TouchableOpacity
              style={[
                newStyles.miniStatCard,
                { borderColor: isDark ? colors.border : '#F0F0F0', marginBottom: 8 },
              ]}
              onPress={isRecordingProfile ? stopProfileRecording : startProfileRecording}
              disabled={isAnalyzing}
            >
              <View
                style={[newStyles.miniStatIcon, { backgroundColor: isRecordingProfile ? '#FEE2E2' : '#F3E8FF' }]}
              >
                {isRecordingProfile ? (
                  <Square size={16} color="#DC2626" />
                ) : (
                  <Mic size={16} color="#9333EA" />
                )}
              </View>
              <View>
                <Text
                  style={[
                    newStyles.miniStatValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  {isAnalyzing ? 'Thinking' : isRecordingProfile ? 'Stop' : 'Talk'}
                </Text>
                <Text
                  style={[
                    newStyles.miniStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {isAnalyzing ? '...' : isRecordingProfile ? 'Recording' : 'to Fill'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                newStyles.miniStatCard,
                { borderColor: isDark ? colors.border : '#F0F0F0', marginBottom: 8 },
              ]}
              onPress={pickAndUploadCV}
              disabled={isAnalyzing}
            >
              <View
                style={[newStyles.miniStatIcon, { backgroundColor: '#E0F2FE' }]}
              >
                <FileText size={16} color="#0284C7" />
              </View>
              <View>
                <Text
                  style={[
                    newStyles.miniStatValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  {isAnalyzing ? 'Parsing' : 'Upload'}
                </Text>
                <Text
                  style={[
                    newStyles.miniStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {isAnalyzing ? 'CV...' : 'CV (Auto)'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                newStyles.miniStatCard,
                { borderColor: isDark ? colors.border : '#F0F0F0' },
              ]}
              onPress={handleEditProfile}
            >
              <View
                style={[newStyles.miniStatIcon, { backgroundColor: '#F3E8FF' }]}
              >
                <PenTool size={16} color="#9333EA" />
              </View>
              <View>
                <Text
                  style={[
                    newStyles.miniStatValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  Edit
                </Text>
                <Text
                  style={[
                    newStyles.miniStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Profile
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                newStyles.miniStatCard,
                { borderColor: isDark ? colors.border : '#F0F0F0' },
              ]}
              onPress={handleExportCV}
            >
              <View
                style={[newStyles.miniStatIcon, { backgroundColor: '#DCFCE7' }]}
              >
                <FileText size={16} color="#16A34A" />
              </View>
              <View>
                <Text
                  style={[
                    newStyles.miniStatValue,
                    { color: colors.textPrimary },
                  ]}
                >
                  Export
                </Text>
                <Text
                  style={[
                    newStyles.miniStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  CV PDF
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Column Stats Card */}
        <View
          style={[
            newStyles.threeColCard,
            { backgroundColor: isDark ? colors.surface : '#FFF' },
          ]}
        >
          <View style={newStyles.colStat}>
            <View style={[newStyles.colIcon, { backgroundColor: '#F3E8FF' }]}>
              <Briefcase size={20} color="#9333EA" />
            </View>
            <Text style={[newStyles.colLabel, { color: colors.textSecondary }]}>
              Experience
            </Text>
            <Text style={[newStyles.colValue, { color: colors.textPrimary }]}>
              {data.yearsExperience} <Text style={{ fontSize: 14 }}>yrs</Text>
            </Text>
          </View>
          <View
            style={[
              newStyles.colDivider,
              { backgroundColor: isDark ? colors.border : '#F0F0F0' },
            ]}
          />
          <TouchableOpacity style={newStyles.colStat} onPress={() => router.push('/profile/edit/skills')}>
            <View style={[newStyles.colIcon, { backgroundColor: '#E0F2FE' }]}>
              <Zap size={20} color="#0284C7" />
            </View>
            <Text style={[newStyles.colLabel, { color: colors.textSecondary }]}>
              Skills
            </Text>
            <Text style={[newStyles.colValue, { color: colors.textPrimary }]}>
              {data.skills.length}
            </Text>
          </TouchableOpacity>
          <View
            style={[
              newStyles.colDivider,
              { backgroundColor: isDark ? colors.border : '#F0F0F0' },
            ]}
          />
          <TouchableOpacity style={newStyles.colStat} onPress={() => router.push('/profile/edit/certifications')}>
            <View style={[newStyles.colIcon, { backgroundColor: '#FFEDD5' }]}>
              <Award size={20} color="#EA580C" />
            </View>
            <Text style={[newStyles.colLabel, { color: colors.textSecondary }]}>
              Active Certs
            </Text>
            <Text style={[newStyles.colValue, { color: colors.textPrimary }]}>
              {userCerts.length < 10
                ? `0${userCerts.length}`
                : userCerts.length}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Big Banner */}
        {!isProfileComplete ? (
          <View
            style={[newStyles.bannerCard, { backgroundColor: colors.primary }]}
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
                  Add your experience and skills to get better job matches.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={newStyles.bannerButton}
              onPress={handleEditProfile}
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
              onPress={handleExportCV}
            >
              <Text style={newStyles.bannerButtonText}>+ Export CV</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Experience Timeline */}
        {data.yearsExperience > 0 && (
          <View style={[newStyles.timelineSection, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <View style={newStyles.sectionHeader}>
              <Text style={[newStyles.sectionTitle, { color: colors.textPrimary }]}>Experience Timeline</Text>
            </View>
            <View style={newStyles.timelineContainer}>
              <View style={[newStyles.timelineLine, { backgroundColor: colors.border }]} />
              
              <View style={newStyles.timelineItem}>
                <View style={[newStyles.timelineDot, { backgroundColor: colors.primary, borderColor: isDark ? colors.surface : '#FFFFFF' }]} />
                <View style={newStyles.timelineContent}>
                  <Text style={[newStyles.timelineRole, { color: colors.textPrimary }]}>Current Role</Text>
                  <Text style={[newStyles.timelineTrade, { color: colors.primary }]}>{data.trade || 'Skilled Professional'}</Text>
                  <Text style={[newStyles.timelineDuration, { color: colors.textSecondary }]}>{data.yearsExperience} years total experience</Text>
                </View>
              </View>

              <View style={[newStyles.timelineItem, { opacity: 0.5 }]}>
                <View style={[newStyles.timelineDot, { backgroundColor: colors.border, borderColor: isDark ? colors.surface : '#FFFFFF' }]} />
                <View style={newStyles.timelineContent}>
                  <Text style={[newStyles.timelineRole, { color: colors.textPrimary }]}>Career Started</Text>
                  <Text style={[newStyles.timelineTrade, { color: colors.textSecondary }]}>Entered the trades</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Certifications Visuals */}
        {userCerts.length > 0 && (
          <View style={newStyles.certsSection}>
            <View style={[newStyles.sectionHeader, { paddingHorizontal: 20 }]}>
              <Text style={[newStyles.sectionTitle, { color: colors.textPrimary }]}>Verified Certifications</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
              {userCerts.map((cert) => {
                const details = data.certificationDetails?.[cert.name];
                return (
                  <View key={cert.id} style={[newStyles.certPhotoCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
                    {details?.photoURL ? (
                      <Image source={{ uri: details.photoURL }} style={[newStyles.certImagePlaceholder, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]} />
                    ) : (
                      <View style={[newStyles.certImagePlaceholder, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                        <Award size={32} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 8, fontWeight: '600' }}>NO PHOTO</Text>
                      </View>
                    )}
                    <View style={newStyles.certCardFooter}>
                      <Text style={[newStyles.certCardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{cert.name}</Text>
                      {details?.issuer && (
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{details.issuer}</Text>
                      )}
                      {details?.completionDate && (
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{details.completionDate}</Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={[newStyles.statusDot, { backgroundColor: colors.success || '#10B981' }]} />
                        <Text style={[newStyles.certCardStatus, { color: colors.success || '#10B981' }]}>Verified active</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Profile Details List */}
        <View style={newStyles.listSection}>
          <ListCard
            icon={PenTool}
            title="Edit Basic Information"
            subtitle={`${data.phone || 'Phone not set'} • ${data.country || 'Country not set'}`}
            colors={colors}
            onPress={() => router.push('/profile/edit/name')}
          />
          <ListCard
            icon={Zap}
            title="Edit Trade Specialisation & Skills"
            subtitle={`${data.trade || 'Not set'} • ${data.skills.length} skills`}
            colors={colors}
            onPress={() => router.push('/profile/edit/skills')}
          />
          <ListCard
            icon={Award}
            title="Edit Certifications"
            subtitle={`${userCerts.length} active`}
            colors={colors}
            onPress={() => router.push('/profile/edit/certifications')}
          />
          <ListCard
            icon={Briefcase}
            title="Edit Availability"
            subtitle={data.availability || 'Not set'}
            colors={colors}
            onPress={() => router.push('/profile/edit/availability')}
          />
        </View>
      </ScrollView>

      {/* CV Export Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              CV Preview
            </Text>
            <TouchableOpacity
              onPress={() => setShowPreview(false)}
              style={styles.modalCloseButton}
            >
              <Text
                style={[styles.modalCloseText, { color: colors.textSecondary }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.previewContainer}>
              <Text
                style={[styles.previewHint, { color: colors.textSecondary }]}
              >
                Preview of your CV. Tap "Export PDF" to save or share.
              </Text>
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.previewName, { color: colors.primary }]}>
                  {data?.name}
                </Text>
                <Text
                  style={[styles.previewTrade, { color: colors.textSecondary }]}
                >
                  {data?.trade}
                </Text>
                <Text
                  style={[styles.previewSection, { color: colors.textPrimary }]}
                >
                  {data?.yearsExperience} years experience
                </Text>
                <Text
                  style={[styles.previewSection, { color: colors.textPrimary }]}
                >
                  {data?.skills.length} skills • {userCerts.length}{' '}
                  certifications
                </Text>
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.modalFooter,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowPreview(false)}
              style={{ flex: 1, borderColor: colors.border }}
            />

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Animated.View
                style={exportIconAnimatedStyle}
                pointerEvents="none"
              >
                <FileText size={32} color={colors.primary} />
              </Animated.View>
              <Button
                title="Export PDF"
                variant="primary"
                onPress={handleConfirmExport}
                loading={isExporting}
                disabled={isExporting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const newStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  topCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  topCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  badgeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
  },
  topCardRight: {
    justifyContent: 'space-between',
    width: 140,
    paddingVertical: 4,
  },
  miniStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  miniStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  threeColCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  colStat: {
    flex: 1,
    alignItems: 'center',
  },
  colIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  colLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  colValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  colDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  bannerCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
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
  listSection: {
    paddingHorizontal: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineSection: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  timelineContainer: { paddingLeft: 8, position: 'relative' },
  timelineLine: { position: 'absolute', left: 14, top: 12, bottom: 20, width: 2 },
  timelineItem: { flexDirection: 'row', marginBottom: 24, position: 'relative' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 4, marginRight: 16, zIndex: 2 },
  timelineContent: { flex: 1 },
  timelineRole: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  timelineTrade: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  timelineDuration: { fontSize: 13 },
  certsSection: { marginBottom: 24, paddingTop: 8 },
  certPhotoCard: { width: 220, borderRadius: 20, padding: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  certImagePlaceholder: { height: 120, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)' },
  certCardFooter: { paddingHorizontal: 4 },
  certCardTitle: { fontSize: 15, fontWeight: '700' },
  certCardStatus: { fontSize: 12, fontWeight: '600', marginLeft: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
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
  retryButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Spacing.minTapTarget,
  },
  retryText: { fontSize: Typography.body, fontWeight: '600', color: '#fff' },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl * 2,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: Typography.headerLarge, fontWeight: '800' },
  modalCloseButton: {
    padding: Spacing.sm,
    minWidth: Spacing.minTapTarget,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: { fontSize: Typography.headerLarge },
  modalContent: { flex: 1 },
  previewContainer: { padding: Spacing.lg },
  previewHint: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  previewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  previewName: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  previewTrade: {
    fontSize: Typography.header,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  previewSection: { fontSize: Typography.body, marginBottom: Spacing.xs },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    paddingBottom: Spacing.xxl,
  },
});
