import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { X, CheckCircle2, Mic } from 'lucide-react-native';
import { 
  useAudioRecorder, 
  useAudioRecorderState, 
  RecordingPresets, 
  requestRecordingPermissionsAsync 
} from 'expo-audio';
import { TouchableOpacity } from 'react-native';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import Button from './Button';
import * as Haptics from '../utils/haptics';
import { useUserProfile } from '../hooks/useUserProfile';

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Audio recording
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);
  const [recordedURI, setRecordedURI] = useState<string | null>(null);

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return;
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
  const translateY = useSharedValue(1000);
  const backdropOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setStatus('idle');
      setName(profile?.name && profile.name !== 'New User' ? profile.name : '');
      setExperience(profile?.yearsExperience ? profile.yearsExperience.toString() : '');
      setPhone('');
      setCoverLetter('');
      successScale.value = 0;
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(1000, { duration: 300 });
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    backdropOpacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(1000, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
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
      successScale.value = withSpring(1, { damping: 12 });
      
      // Close after success animation
      setTimeout(() => {
        handleClose();
        onSubmit(job.id, coverLetter);
      }, 1500);
    }, 1500);
  };

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value
    };
  });

  const successIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }]
    };
  });

  if (!job) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.modalContent, 
            { backgroundColor: isDark ? colors.surface : colors.background },
            modalStyle
          ]}
        >
          {status === 'success' ? (
            <View style={styles.successContainer}>
              <Animated.View style={successIconStyle}>
                <CheckCircle2 size={80} color={colors.success} strokeWidth={1.5} />
              </Animated.View>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Application Sent!</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                {job.company} has received your profile.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Apply for Job</Text>
                <Button 
                  icon={<X size={20} color={colors.textSecondary} />} 
                  onPress={handleClose} 
                  variant="ghost" 
                  size="sm" 
                  style={styles.closeButton}
                />
              </View>

              <View style={styles.jobInfo}>
                <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
                <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                
                {score && (
                  <View style={[styles.matchBadge, { backgroundColor: `${colors.success}15` }]}>
                    <Text style={[styles.matchText, { color: colors.success }]}>
                      You are a {Math.round(score.total)}% match for this role
                    </Text>
                  </View>
                )}
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Spacing.xl }}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                  Full Name
                </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.singleLineInput,
                  { 
                    backgroundColor: isDark ? colors.background : '#F2F2F7',
                    color: colors.textPrimary,
                    borderColor: isDark ? colors.border : 'transparent',
                  }
                ]}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                editable={status === 'idle'}
              />

              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Phone Number
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      { 
                        backgroundColor: isDark ? colors.background : '#F2F2F7',
                        color: colors.textPrimary,
                        borderColor: isDark ? colors.border : 'transparent',
                      }
                    ]}
                    placeholder="+1 234 567 890"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    editable={status === 'idle'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    Years Exp.
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      { 
                        backgroundColor: isDark ? colors.background : '#F2F2F7',
                        color: colors.textPrimary,
                        borderColor: isDark ? colors.border : 'transparent',
                      }
                    ]}
                    placeholder="e.g. 5"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={experience}
                    onChangeText={setExperience}
                    editable={status === 'idle'}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Cover Letter (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: isDark ? colors.background : '#F2F2F7',
                    color: colors.textPrimary,
                    borderColor: isDark ? colors.border : 'transparent',
                  }
                ]}
                placeholder="Write a brief note to the employer..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={coverLetter}
                onChangeText={setCoverLetter}
                textAlignVertical="top"
                editable={status === 'idle'}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                Voice Pitch (Optional)
              </Text>
              <TouchableOpacity
                style={[
                  styles.recordButton, 
                  { 
                    backgroundColor: recorderState.isRecording ? `${colors.error}15` : (recordedURI ? `${colors.success}15` : `${colors.primary}15`),
                    borderColor: recorderState.isRecording ? colors.error : (recordedURI ? colors.success : colors.primary)
                  }
                ]}
                onPress={recorderState.isRecording ? stopRecording : startRecording}
                disabled={status !== 'idle'}
              >
                <Mic size={24} color={recorderState.isRecording ? colors.error : (recordedURI ? colors.success : colors.primary)} style={{ marginRight: 8 }} />
                <Text style={[styles.recordButtonText, { color: recorderState.isRecording ? colors.error : (recordedURI ? colors.success : colors.primary) }]}>
                  {recorderState.isRecording ? "Stop Recording..." : (recordedURI ? "Recorded! Tap to re-record" : "Record a 30s pitch")}
                </Text>
              </TouchableOpacity>
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  style={[
                    styles.submitButton, 
                    { backgroundColor: colors.primary }
                  ]}
                  onPress={handleSubmit}
                  disabled={status === 'submitting'}
                  loading={status === 'submitting'}
                  title="Submit Application"
                  fullWidth
                />
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
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 0,
    minWidth: 40,
    minHeight: 40,
    borderRadius: 20,
  },
  jobInfo: {
    marginBottom: Spacing.lg,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  singleLineInput: {
    minHeight: 50,
    marginBottom: Spacing.md,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
  }
});
