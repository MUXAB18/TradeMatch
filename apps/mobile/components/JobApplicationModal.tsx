import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { X, CheckCircle2, Mic, Sparkles, User, Phone, Briefcase, FileText, Upload } from 'lucide-react-native';
import { 
  useAudioRecorder, 
  useAudioRecorderState, 
  RecordingPresets, 
  requestRecordingPermissionsAsync,
  setAudioModeAsync
} from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import * as Haptics from '../utils/haptics';
import { useUserProfile } from '../hooks/useUserProfile';

const { width, height } = Dimensions.get('window');

interface JobApplicationModalProps {
  visible: boolean;
  job: any | null;
  score: any | null;
  onClose: () => void;
  onSubmit: (jobId: string, coverLetter: string) => void;
}

export default function JobApplicationModal({
  visible,
  job,
  score,
  onClose,
  onSubmit
}: JobApplicationModalProps) {
  const { colors, isDark } = useAppTheme();
  const { data: profile } = useUserProfile();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [documentURI, setDocumentURI] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Audio recording
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);
  const [recordedURI, setRecordedURI] = useState<string | null>(null);

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      setDocumentURI(result.assets[0].uri);
      setDocumentName(result.assets[0].name);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      console.error('Failed to pick document', err);
    }
  }

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;
      
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      
      await recorder.prepareToRecordAsync();
      recorder.record();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    await recorder.stop();
    setRecordedURI(recorder.uri);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  // Animation values
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      if (status !== 'idle') setStatus('idle');
      
      // Reset form states if it's a fresh open (e.g. they weren't typing before)
      // This is a bit tricky, but we can assume if it becomes visible we should trigger the animation
      backdropOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
      translateY.value = withSpring(0, { damping: 24, stiffness: 200, mass: 0.8 });
      
      // Auto-fill from profile when it loads, but don't overwrite if user started typing
      if (profile) {
        setName(prev => prev || (profile.name !== 'New User' ? profile.name : ''));
        setExperience(prev => prev || (profile.yearsExperience ? profile.yearsExperience.toString() : ''));
        setPhone(prev => prev || profile.phone || '');
      }
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(height, { duration: 300, easing: Easing.in(Easing.cubic) });
      // Reset everything after close animation
      setTimeout(() => {
        setStatus('idle');
        setCoverLetter('');
        setDocumentURI(null);
        setDocumentName(null);
        successScale.value = 0;
        successOpacity.value = 0;
        setName(''); // Clear out so next open can re-populate correctly
        setPhone('');
        setExperience('');
      }, 350);
    }
  }, [visible, profile]);

  const handleClose = () => {
    Keyboard.dismiss();
    backdropOpacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(height, { duration: 300, easing: Easing.in(Easing.cubic) }, () => {
      runOnJS(onClose)();
    });
  };

  const onPressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const handleSubmit = () => {
    if (!job) return;
    
    if (!name.trim() || !phone.trim() || !experience.trim()) {
      Alert.alert("Missing Information", "Please fill out your Name, Phone Number, and Years of Experience before applying.");
      return;
    }
    
    Keyboard.dismiss();
    setStatus('submitting');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate network delay
    setTimeout(() => {
      setStatus('success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      successScale.value = withSpring(1, { damping: 14, stiffness: 200 });
      successOpacity.value = withTiming(1, { duration: 300 });
      
      // Close after success animation
      setTimeout(() => {
        handleClose();
        onSubmit(job.id, coverLetter);
      }, 2500);
    }, 1500);
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value
  }));

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value
  }));

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  if (!job) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdropWrapper, backdropStyle]}>
            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
            },
            modalStyle
          ]}
        >
          {status === 'success' ? (
            <View style={styles.successContainer}>
              <ConfettiCannon 
                count={100} 
                origin={{x: width / 2, y: 0}} 
                colors={[colors.primary, colors.success, '#FFD700', '#FF69B4']}
                fadeOut
              />
              <Animated.View style={successIconStyle}>
                <LinearGradient
                  colors={[colors.success, '#34D399']}
                  style={styles.successIconBg}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <CheckCircle2 size={48} color="#FFF" strokeWidth={2.5} />
                </LinearGradient>
              </Animated.View>
              <Animated.Text style={[styles.successTitle, { color: colors.textPrimary }, successIconStyle]}>
                Application Sent!
              </Animated.Text>
              <Animated.Text style={[styles.successText, { color: colors.textSecondary }, successIconStyle]}>
                {job.company} has received your profile. Good luck!
              </Animated.Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Apply for Job</Text>
                  <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Complete your application</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.jobCard}>
                <View style={styles.jobCardContent}>
                  <Text style={[styles.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                  <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                </View>
                
                {score && (
                  <LinearGradient
                    colors={['rgba(52, 211, 153, 0.15)', 'rgba(16, 185, 129, 0.15)']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.matchBadge}
                  >
                    <Sparkles size={14} color={colors.success} style={{ marginRight: 4 }} />
                    <Text style={[styles.matchText, { color: colors.success }]}>
                      {Math.round(score.total)}% Match
                    </Text>
                  </LinearGradient>
                )}
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Full Name</Text>
                  <View style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                      borderColor: focusedInput === 'name' ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent'),
                    }
                  ]}>
                    <User size={18} color={focusedInput === 'name' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: colors.textPrimary }]}
                      placeholder="John Doe"
                      placeholderTextColor={colors.textSecondary}
                      value={name}
                      onChangeText={setName}
                      editable={status === 'idle'}
                      onFocus={() => setFocusedInput('name')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.md }]}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Phone Number</Text>
                    <View style={[
                      styles.inputWrapper,
                      { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                        borderColor: focusedInput === 'phone' ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent'),
                      }
                    ]}>
                      <Phone size={18} color={focusedInput === 'phone' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        placeholder="+1 234 567 890"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        editable={status === 'idle'}
                        onFocus={() => setFocusedInput('phone')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 0.7 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Years Exp.</Text>
                    <View style={[
                      styles.inputWrapper,
                      { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                        borderColor: focusedInput === 'experience' ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent'),
                      }
                    ]}>
                      <Briefcase size={18} color={focusedInput === 'experience' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.textInput, { color: colors.textPrimary }]}
                        placeholder="e.g. 5"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={experience}
                        onChangeText={setExperience}
                        editable={status === 'idle'}
                        onFocus={() => setFocusedInput('experience')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Cover Letter / CV (Optional)</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.uploadButton, 
                      { 
                        backgroundColor: documentURI ? 'rgba(16, 185, 129, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5'),
                        borderColor: documentURI ? colors.success : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent')
                      }
                    ]}
                    activeOpacity={0.8}
                    onPress={documentURI ? () => { setDocumentURI(null); setDocumentName(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } : pickDocument}
                    disabled={status !== 'idle'}
                  >
                    <View style={[
                      styles.uploadIconBg, 
                      { backgroundColor: documentURI ? colors.success : colors.primary }
                    ]}>
                      {documentURI ? (
                        <FileText size={18} color="#FFF" />
                      ) : (
                        <Upload size={18} color="#FFF" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.uploadButtonText, { color: documentURI ? colors.success : colors.textPrimary }]} numberOfLines={1}>
                        {documentURI ? documentName : "Upload Document (PDF, DOCX)"}
                      </Text>
                      {documentURI && (
                        <Text style={[styles.uploadButtonSubtext, { color: colors.textSecondary }]}>
                          Tap to remove
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {/* Or write it inline */}
                  {!documentURI && (
                    <View style={[
                      styles.textAreaWrapper,
                      { 
                        marginTop: Spacing.md,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5',
                        borderColor: focusedInput === 'cover' ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent'),
                      }
                    ]}>
                      <TextInput
                        style={[styles.textArea, { color: colors.textPrimary }]}
                        placeholder="Or write a brief note to stand out..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={coverLetter}
                        onChangeText={setCoverLetter}
                        textAlignVertical="top"
                        editable={status === 'idle'}
                        onFocus={() => setFocusedInput('cover')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Voice Pitch (Optional)</Text>
                  <TouchableOpacity
                    style={[
                      styles.recordButton, 
                      { 
                        backgroundColor: recorderState.isRecording ? 'rgba(239, 68, 68, 0.1)' : (recordedURI ? 'rgba(16, 185, 129, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5')),
                        borderColor: recorderState.isRecording ? colors.error : (recordedURI ? colors.success : (isDark ? 'rgba(255,255,255,0.1)' : 'transparent'))
                      }
                    ]}
                    activeOpacity={0.8}
                    onPress={recorderState.isRecording ? stopRecording : startRecording}
                    disabled={status !== 'idle'}
                  >
                    <View style={[
                      styles.recordIconBg, 
                      { backgroundColor: recorderState.isRecording ? colors.error : (recordedURI ? colors.success : colors.primary) }
                    ]}>
                      <Mic size={18} color="#FFF" />
                    </View>
                    <Text style={[styles.recordButtonText, { color: recorderState.isRecording ? colors.error : (recordedURI ? colors.success : colors.textPrimary) }]}>
                      {recorderState.isRecording ? "Recording... Tap to stop" : (recordedURI ? "Pitch recorded! Tap to re-record" : "Record a 30s voice pitch")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={handleSubmit} disabled={status === 'submitting'}>
                  <Animated.View style={[styles.submitButtonContainer, submitButtonStyle]}>
                    <LinearGradient
                      colors={[colors.primary, '#6366F1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitButtonGradient}
                    >
                      {status === 'submitting' ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.submitButtonText}>Apply Now</Text>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropWrapper: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    height: height * 0.9,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  jobCardContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  uploadIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  recordIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.md,
  },
  submitButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  successIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  }
});
