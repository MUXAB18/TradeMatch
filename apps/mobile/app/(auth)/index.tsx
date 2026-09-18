import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from '../../utils/haptics';
import {
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useToast } from '../../providers/ToastProvider';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  interpolateColor,
  FadeInDown,
} from 'react-native-reanimated';
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { Svg, Path, G } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

// --- Animated Input Component ---
interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  reduceMotion: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

const AnimatedInput = React.forwardRef<TextInput, AnimatedInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      secureTextEntry,
      reduceMotion,
      keyboardType = 'default',
      autoCapitalize = 'none',
      autoComplete,
      returnKeyType,
      onSubmitEditing,
    },
    ref
  ) => {
    const { colors } = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const focusAnim = useSharedValue(value ? 1 : 0);
    const shakeAnim = useSharedValue(0);

    useEffect(() => {
      focusAnim.value = withTiming(isFocused || value ? 1 : 0, { duration: reduceMotion ? 0 : 200 });
    }, [isFocused, value, reduceMotion]);

    useEffect(() => {
      if (error && !reduceMotion) {
        shakeAnim.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }, [error, reduceMotion]);

    const showPasswordAnim = useSharedValue(showPassword ? 1 : 0);
    useEffect(() => {
      showPasswordAnim.value = withTiming(showPassword ? 1 : 0, { duration: reduceMotion ? 0 : 150 });
    }, [showPassword, reduceMotion]);

    const eyeStyle = useAnimatedStyle(() => ({
      opacity: 1 - showPasswordAnim.value,
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }));
    
    const eyeOffStyle = useAnimatedStyle(() => ({
      opacity: showPasswordAnim.value,
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }));

    const animatedLabelStyle = useAnimatedStyle(() => {
      return {
        top: withTiming(focusAnim.value === 1 ? 10 : 19, { duration: reduceMotion ? 0 : 200 }),
        fontSize: withTiming(focusAnim.value === 1 ? 11 : 15, { duration: reduceMotion ? 0 : 200 }),
        color: interpolateColor(
          focusAnim.value,
          [0, 1],
          [colors.textSecondary, isFocused ? colors.primary : colors.textSecondary]
        ),
      };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = error
        ? colors.error
        : isFocused
        ? colors.primary
        : `${colors.border}80`; // very subtle border when inactive
      
      return {
        borderColor: reduceMotion ? borderColor : withTiming(borderColor, { duration: 200 }),
        borderWidth: isFocused ? 1.5 : 1, // slightly thicker when focused
        transform: [{ translateX: shakeAnim.value }],
      };
    });

    const isPassword = secureTextEntry !== undefined;

    return (
      <Animated.View style={[styles.inputContainer, { backgroundColor: colors.surface }, animatedContainerStyle]}>
        <Animated.Text style={[styles.floatingLabel, animatedLabelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          ref={ref}
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          selectionColor={colors.primary}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Animated.View style={eyeStyle}>
              <Eye size={20} color={colors.textSecondary} />
            </Animated.View>
            <Animated.View style={eyeOffStyle}>
              <EyeOff size={20} color={colors.textSecondary} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
);

// --- Google Logo Component ---
const GoogleLogo = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <G fill="none" fillRule="evenodd">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </G>
  </Svg>
);

// --- Main Screen Component ---
export default function AuthScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  const [reduceMotion, setReduceMotion] = useState(false);

  // Form State
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Focus management
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Mode animations
  const nameHeightAnim = useSharedValue(mode === 'signup' ? 76 : 0);
  const nameOpacityAnim = useSharedValue(mode === 'signup' ? 1 : 0);
  
  const submitScaleAnim = useSharedValue(1);
  const googleScaleAnim = useSharedValue(1);
  const successScale = useSharedValue(0);

  useEffect(() => {
    nameHeightAnim.value = withTiming(mode === 'signup' ? 76 : 0, { duration: reduceMotion ? 0 : 300 });
    nameOpacityAnim.value = withTiming(mode === 'signup' ? 1 : 0, { duration: reduceMotion ? 0 : 300 });
  }, [mode, reduceMotion]);

  useEffect(() => {
    if (success && !reduceMotion) {
      successScale.value = withSpring(1);
    } else if (success) {
      successScale.value = 1;
    }
  }, [success, reduceMotion]);

  const animatedNameStyle = useAnimatedStyle(() => ({
    height: nameHeightAnim.value,
    opacity: nameOpacityAnim.value,
    overflow: 'hidden',
  }));

  const animatedSubmitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScaleAnim.value }],
  }));

  const animatedGoogleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleScaleAnim.value }],
  }));

  const animatedSuccessStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }));

  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'your-ios-client-id',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'your-android-client-id',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(() => {
          handleSuccess();
        })
        .catch((err) => {
          handleError(err);
        });
    }
  }, [response]);

  const handleError = (err: any) => {
    console.error(err);
    let msg = err.message || 'Authentication failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') msg = 'That email is already in use.';
    if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
    if (err.code === 'auth/weak-password') msg = 'Password is too weak (min 6 chars).';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
    setError(msg);
    showToast(msg, 'error');
    setLoading(false);
  };

  const handleSuccess = () => {
    if (!reduceMotion) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSuccess(true);
    setTimeout(async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const { userProfileExists } = await import('../../services/users');
          const hasProfile = await userProfileExists(currentUser.uid);
          if (hasProfile) {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/(auth)/trade');
          }
        } else {
            router.replace('/');
        }
      } catch (e) {
        console.error(e);
        router.replace('/');
      }
    }, 1000);
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (mode === 'signup' && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
          // Send email verification
          try {
            const { sendEmailVerification } = await import('firebase/auth');
            await sendEmailVerification(userCredential.user);
            showToast('Verification email sent. Please check your inbox.', 'success');
          } catch (e) {
            console.error('Failed to send verification email', e);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleSuccess();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    // Haptic feedback for switching modes
    if (!reduceMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(100).springify()} style={styles.header}>
          <Image 
            source={require('../../assets/logo-v2.png')} 
            style={styles.logo} 
          />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'login' ? 'Enter your details to continue.' : 'Sign up to get started.'}
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(200).springify()} style={styles.formContainer}>
          {error ? <Text style={[styles.mainErrorText, { color: colors.error }]}>{error}</Text> : null}
          
          <Animated.View style={animatedNameStyle}>
            <AnimatedInput
              label="Full Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              reduceMotion={reduceMotion}
              error={error && !name && mode === 'signup' ? 'Required' : undefined}
              autoCapitalize="words"
              autoComplete="name"
            />
          </Animated.View>

          <AnimatedInput
            ref={emailRef}
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            reduceMotion={reduceMotion}
            error={error && !email ? 'Required' : undefined}
            keyboardType="email-address"
            autoComplete="email"
          />

          <AnimatedInput
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            reduceMotion={reduceMotion}
            error={error && !password ? 'Required' : undefined}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          
          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <AnimatedPressable
            style={[
              styles.submitButton, 
              { backgroundColor: success ? colors.success : colors.primary },
              animatedSubmitStyle
            ]}
            onPressIn={() => {
              if (!reduceMotion) submitScaleAnim.value = withSpring(0.96, { damping: 15 });
            }}
            onPressOut={() => {
              if (!reduceMotion) submitScaleAnim.value = withSpring(1, { damping: 15 });
            }}
            onPress={handleSubmit}
            disabled={loading || success}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : success ? (
              <Animated.View style={animatedSuccessStyle}>
                <Check size={20} color="#FFFFFF" style={{ marginRight: Spacing.xs }} />
                <Text style={[styles.submitButtonText, { color: "#FFFFFF" }]}>Success</Text>
              </Animated.View>
            ) : (
              <Text style={[styles.submitButtonText, { color: "#FFFFFF" }]}>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </AnimatedPressable>
        </Animated.View>

        {/* Divider */}
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(300).springify()} style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Google Sign In */}
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(400).springify()}>
          <AnimatedPressable
            style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: `${colors.border}80` }, animatedGoogleStyle]}
            onPressIn={() => {
              if (!reduceMotion) googleScaleAnim.value = withSpring(0.97, { damping: 15 });
            }}
            onPressOut={() => {
              if (!reduceMotion) googleScaleAnim.value = withSpring(1, { damping: 15 });
            }}
            onPress={() => {
              setError('');
              promptAsync();
            }}
            disabled={!request || loading || success}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            {loading && !success ? (
               <ActivityIndicator color={colors.textPrimary} style={{ marginRight: Spacing.sm }} />
            ) : (
              <View style={styles.googleIconContainer}>
                <GoogleLogo />
              </View>
            )}
            <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>
              Google
            </Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Bottom Mode Toggle */}
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(500).springify()} style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl, // generous whitespace
  },
  header: {
    alignItems: 'center',
    paddingTop: 100, // pushed down slightly for elegance
    paddingBottom: Spacing.xl + Spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginBottom: Spacing.lg,
    borderRadius: 12, // just in case the logo isn't fully round, it'll look nice
  },
  title: {
    fontSize: Typography.headerLarge * 1.1, // slightly larger
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    height: 60, // slightly taller
    borderWidth: 1,
    borderRadius: 16, // soft corners
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: Spacing.lg,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: {
    fontSize: 16,
    marginTop: 14,
    height: 40,
    flex: 1,
    paddingRight: 40,
    fontWeight: '500',
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 18,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  mainErrorText: {
    fontSize: 14,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    height: 60,
    borderRadius: 100, // pill shape for premium modern feel
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: '#007AFF', // strict primary accent shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth, // extremely thin premium line
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 13,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 100, // pill shape matching submit button
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  googleIconContainer: {
    position: 'absolute',
    left: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
