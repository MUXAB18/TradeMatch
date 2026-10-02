import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Speaker } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';
let AgoraSDK: any = null;
if (!isExpoGo) {
  try {
    AgoraSDK = require('react-native-agora');
  } catch (e) {
    console.warn('react-native-agora is not linked natively');
  }
}

const { width, height } = Dimensions.get('window');

const RtcSurfaceView = AgoraSDK ? AgoraSDK.RtcSurfaceView : View;
const ChannelProfileType = AgoraSDK ? AgoraSDK.ChannelProfileType : {};
const ClientRoleType = AgoraSDK ? AgoraSDK.ClientRoleType : {};
const createAgoraRtcEngine = AgoraSDK ? AgoraSDK.createAgoraRtcEngine : null;

const MOCK_USERS: Record<string, any> = {
  '1': { name: 'Justin Olson', image: 'https://i.pravatar.cc/150?u=justin' },
  '2': { name: 'Andreas Anton', image: 'https://i.pravatar.cc/150?u=andreas2' },
  '3': { name: 'Grace Coleman', image: 'https://i.pravatar.cc/150?u=grace' },
  '4': { name: 'Betty Cooper', image: 'https://i.pravatar.cc/150?u=betty' },
};

export default function CallScreen() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const user = MOCK_USERS[id as string] || { name: 'Unknown User', image: 'https://i.pravatar.cc/150' };
  const isVideo = type === 'video';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideo);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [callDuration, setCallDuration] = useState(0);

  // Agora State
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const engine = useRef<any>(null);

  // Pulse animation for the calling state
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (callState === 'calling') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [callState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    initAgora();
    return () => {
      engine.current?.leaveChannel();
      engine.current?.release();
    };
  }, []);

  const initAgora = async () => {
    if (isExpoGo) {
      console.warn("Agora is disabled in Expo Go. Simulating call state.");
      setTimeout(() => {
        setIsJoined(true);
        setCallState('connected');
      }, 2000);
      return;
    }

    try {
      if (!process.env.EXPO_PUBLIC_AGORA_APP_ID) {
        throw new Error("Missing Agora App ID in .env");
      }
      
      if (createAgoraRtcEngine) {
        engine.current = createAgoraRtcEngine();
        engine.current.initialize({
          appId: process.env.EXPO_PUBLIC_AGORA_APP_ID,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
        });
      }

      engine.current.registerEventHandler({
        onJoinChannelSuccess: () => {
          setIsJoined(true);
          setCallState('connected');
        },
        onUserJoined: (_connection, uid) => {
          setRemoteUid(uid);
        },
        onUserOffline: (_connection, uid) => {
          if (uid === remoteUid) {
            setRemoteUid(null);
            endCall();
          }
        },
      });

      if (isVideo) {
        engine.current.enableVideo();
        engine.current.startPreview();
      } else {
        engine.current.enableAudio();
      }

      // Join the channel based on the chat ID
      engine.current.joinChannel("", `chat-${id}`, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

    } catch (e) {
      console.warn("Agora Init Error", e);
      Alert.alert("Agora Error", "Native module missing. Please build a Custom Dev Client (npx expo run:ios/android).");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    router.back();
  };

  const toggleMic = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    engine.current?.muteLocalAudioStream(nextMuted);
  };

  const toggleVideo = () => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);
    engine.current?.muteLocalVideoStream(nextVideoOff);
  };

  const toggleSpeaker = () => {
    const nextSpeaker = !isSpeaker;
    setIsSpeaker(nextSpeaker);
    engine.current?.setEnableSpeakerphone(nextSpeaker);
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: callState === 'calling' ? 0.4 : 0,
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 1.5 }],
    opacity: callState === 'calling' ? 0.2 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Background */}
      <Image 
        source={{ uri: user.image }} 
        style={StyleSheet.absoluteFill}
        blurRadius={Platform.OS === 'ios' ? 50 : 20}
      />
      
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />

      {/* Header */}
      <Animated.View entering={FadeInUp.delay(200).springify()} style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.encryptionText}>End-to-end encrypted</Text>
      </Animated.View>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {callState === 'calling' ? (
          <View style={styles.avatarContainer}>
            <Animated.View style={[styles.pulseRing, pulseStyle2]} />
            <Animated.View style={[styles.pulseRing, pulseStyle]} />
            <Image source={{ uri: user.image }} style={styles.avatar} />
          </View>
        ) : isVideo && !isVideoOff && isJoined ? (
          // Real Video Call Layout with Agora RtcSurfaceView
          <Animated.View entering={FadeIn.duration(800)} style={styles.videoContainer}>
            {remoteUid ? (
              <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.remoteVideo} />
            ) : (
              <Image source={{ uri: user.image }} style={styles.remoteVideo} />
            )}
            
            <View style={styles.localVideo}>
              <RtcSurfaceView canvas={{ uid: 0 }} style={styles.localVideoSurface} />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.springify()} style={styles.avatarContainer}>
            <Image source={{ uri: user.image }} style={styles.avatarConnected} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.status}>
            {callState === 'calling' ? (isVideo ? 'Connecting video...' : 'Calling...') : formatTime(callDuration)}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Controls */}
      <Animated.View entering={FadeInDown.delay(500).springify()} style={[styles.controlsContainer, { paddingBottom: Math.max(insets.bottom, 30) }]}>
        <BlurView intensity={40} tint="dark" style={styles.controlsBlur}>
          <View style={styles.controlsRow}>
            {/* Speaker Toggle */}
            <TouchableOpacity 
              style={[styles.controlButton, isSpeaker && styles.controlButtonActive]} 
              onPress={toggleSpeaker}
            >
              <Speaker size={28} color={isSpeaker ? '#000' : '#FFF'} />
            </TouchableOpacity>

            {/* Video Toggle */}
            <TouchableOpacity 
              style={[styles.controlButton, !isVideoOff && styles.controlButtonActive]} 
              onPress={toggleVideo}
            >
              {isVideoOff ? (
                <VideoOff size={28} color="#FFF" />
              ) : (
                <VideoIcon size={28} color="#000" />
              )}
            </TouchableOpacity>

            {/* Mic Toggle */}
            <TouchableOpacity 
              style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
              onPress={toggleMic}
            >
              {isMuted ? (
                <MicOff size={28} color="#000" />
              ) : (
                <Mic size={28} color="#FFF" />
              )}
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
              <PhoneOff size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 10,
  },
  encryptionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarConnected: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  name: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  status: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '500',
  },
  videoContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#111',
  },
  remoteVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  localVideo: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#333',
  },
  localVideoSurface: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controlsBlur: {
    borderRadius: 36,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#FFF',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
