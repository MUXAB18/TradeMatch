import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SectionList,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../../providers/ToastProvider';
import * as Location from 'expo-location';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { createUserProfile, logCountryInterest } from '../../services/users';
import { registerForPushNotificationsAsync } from '../../services/notifications';
import Button from '../../components/Button';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { COUNTRIES, POPULAR_COUNTRIES, Country } from '../../constants/countries';
import CountryFlag from 'react-native-country-flag';
import Animated, { FadeInDown, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Search, MapPin, Check, Globe, ChevronRight } from 'lucide-react-native';
import * as Haptics from '../../utils/haptics';

// Custom Animated Components
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

interface CountryCardProps {
  country: Country;
  selected: boolean;
  onPress: () => void;
  index: number;
}

function CountryCard({ country, selected, onPress, index }: CountryCardProps) {
  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchableOpacity
      entering={FadeInDown.delay(Math.min(index * 50, 500)).springify()}
      layout={LinearTransition.springify()}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border },
        selected && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(93, 214, 44, 0.1)' : 'rgba(93, 214, 44, 0.05)' },
        !country.isLive && { opacity: 0.7 }
      ]}
      activeOpacity={0.9}
    >
      <View style={styles.flagContainer}>
        <CountryFlag isoCode={country.code} size={20} style={styles.flagIcon} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.countryName, { color: selected ? colors.primary : colors.textPrimary }]}>
          {country.name}
        </Text>
        {!country.isLive && (
          <View style={[styles.comingSoonBadge, { backgroundColor: isDark ? colors.border : colors.background }]}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Coming Soon</Text>
          </View>
        )}
      </View>
      <View style={[styles.radioOuter, { borderColor: selected ? colors.primary : colors.border }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
      </View>
    </AnimatedTouchableOpacity>
  );
}

export default function LocationScreen() {
  const router = useRouter();
  const { phone, trade } = useLocalSearchParams<{ phone?: string; trade: string }>();
  
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showFullList, setShowFullList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Waitlist Modal
  const [waitlistCountry, setWaitlistCountry] = useState<Country | null>(null);
  const [submittingWaitlist, setSubmittingWaitlist] = useState(false);

  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setShowFullList(true);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocationCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode[0]?.isoCountryCode) {
        const countryCode = geocode[0].isoCountryCode.toUpperCase();
        const matchedCountry = COUNTRIES.find(c => c.code === countryCode);
        if (matchedCountry && matchedCountry.isLive) {
          setDetectedCountry(matchedCountry);
          setSelectedCountry(matchedCountry);
        } else {
          setShowFullList(true);
        }
      } else {
        setShowFullList(true);
      }
    } catch (error) {
      console.error('Location detection error:', error);
      setShowFullList(true);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    Haptics.selectionAsync();
    if (!country.isLive) {
      setWaitlistCountry(country);
    } else {
      setSelectedCountry(country);
    }
  };

  const submitWaitlist = async () => {
    if (!waitlistCountry) return;
    setSubmittingWaitlist(true);
    try {
      // Create temp user if needed just to log intent, or use existing
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const tempEmail = `${Date.now()}@tradematch.temp`;
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const cred = await createUserWithEmailAndPassword(auth, tempEmail, tempPassword);
        currentUser = cred.user;
      }
      await logCountryInterest(currentUser.uid, waitlistCountry.code);
      showToast(`We'll notify you when we launch in ${waitlistCountry.name}!`, 'success');
      setWaitlistCountry(null);
    } catch (err) {
      showToast('Failed to save interest. Please try again.', 'error');
    } finally {
      setSubmittingWaitlist(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedCountry || !trade) {
      showToast('Please select a country and trade', 'error');
      return;
    }
    setLoading(true);
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const tempEmail = `${Date.now()}@tradematch.temp`;
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const userCredential = await createUserWithEmailAndPassword(auth, tempEmail, tempPassword);
        currentUser = userCredential.user;
        await updateProfile(currentUser, { displayName: 'New User' });
      }

      const result = await createUserProfile(currentUser.uid, {
        name: currentUser.displayName || 'New User',
        phone: phone || '',
        email: currentUser.email || '',
        trade: trade,
        country: selectedCountry.code,
        latitude: locationCoords?.latitude || 0,
        longitude: locationCoords?.longitude || 0,
      });

      if (result.error) throw new Error(result.error);

      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) console.log('Push notifications enabled');
      } catch (notifError) {
        console.error('Notification setup error:', notifError);
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Build Sections
  const sections = useMemo(() => {
    let list = COUNTRIES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
      return [{ title: 'Search Results', data: list }];
    }

    const popular = COUNTRIES.filter(c => POPULAR_COUNTRIES.includes(c.code));
    const popularSorted = popular.sort((a, b) => POPULAR_COUNTRIES.indexOf(a.code) - POPULAR_COUNTRIES.indexOf(b.code));
    
    const others = COUNTRIES.filter(c => !POPULAR_COUNTRIES.includes(c.code));
    const alphabetMap: Record<string, Country[]> = {};
    others.forEach(c => {
      const letter = c.name.charAt(0).toUpperCase();
      if (!alphabetMap[letter]) alphabetMap[letter] = [];
      alphabetMap[letter].push(c);
    });

    const alphaSections = Object.keys(alphabetMap).sort().map(letter => ({
      title: letter,
      data: alphabetMap[letter]
    }));

    return [
      { title: 'Popular Destinations', data: popularSorted },
      ...alphaSections
    ];
  }, [searchQuery]);

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>{section.title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Select Your Country</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Where are you looking for work?</Text>
      </View>

      {/* Auto-Detection Top Section */}
      {!showFullList && (
        <Animated.View entering={FadeInDown.springify()} layout={LinearTransition.springify()} style={styles.autoDetectContainer}>
          {detectingLocation ? (
            <View style={styles.detectingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.detectingText, { color: colors.textSecondary }]}>Detecting your location...</Text>
            </View>
          ) : detectedCountry ? (
            <View style={[styles.detectedCard, { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.primary }]}>
              <View style={styles.detectedHeader}>
                <MapPin size={20} color={colors.primary} />
                <Text style={[styles.detectedText, { color: colors.primary }]}>Location Detected</Text>
              </View>
              <View style={styles.detectedCountryRow}>
                <CountryFlag isoCode={detectedCountry.code} size={28} style={styles.flagIcon} />
                <Text style={[styles.detectedCountryName, { color: colors.textPrimary }]}>{detectedCountry.name}</Text>
              </View>
              
              <Button
                title={`Confirm ${detectedCountry.name}`}
                onPress={handleComplete}
                loading={loading}
                style={{ marginTop: Spacing.lg }}
              />
              
              <TouchableOpacity style={styles.chooseDifferent} onPress={() => setShowFullList(true)}>
                <Text style={[styles.chooseDifferentText, { color: colors.textSecondary }]}>Choose a different country</Text>
              </TouchableOpacity>
            </View>
          ) : (
             <TouchableOpacity style={[styles.chooseDifferent, { marginTop: 0 }]} onPress={() => setShowFullList(true)}>
               <Text style={[styles.chooseDifferentText, { color: colors.primary }]}>View all countries</Text>
             </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Full Directory List */}
      {showFullList && (
        <Animated.View style={{ flex: 1 }} entering={FadeInDown.springify()} layout={LinearTransition.springify()}>
          <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.surface : colors.white, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search countries..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <AnimatedSectionList
            sections={sections as any}
            keyExtractor={(item: any) => item.code}
            renderItem={({ item, index }) => (
              <CountryCard
                country={item as Country}
                selected={selectedCountry?.code === (item as Country).code}
                onPress={() => handleCountrySelect(item as Country)}
                index={index}
              />
            )}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            keyboardShouldPersistTaps="handled"
            layout={LinearTransition.springify()}
            itemLayoutAnimation={LinearTransition.springify()}
          />
        </Animated.View>
      )}

      {/* Waitlist Modal for Coming Soon countries */}
      <Modal
        visible={!!waitlistCountry}
        transparent
        animationType="fade"
        onRequestClose={() => setWaitlistCountry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Globe size={48} color={colors.primary} style={{ marginBottom: Spacing.lg }} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              We're not in {waitlistCountry?.name} yet!
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              TradeMatch is expanding quickly. Would you like us to notify you as soon as jobs become available in {waitlistCountry?.name}?
            </Text>
            
            <Button
              title={`Notify me about ${waitlistCountry?.name}`}
              onPress={submitWaitlist}
              loading={submittingWaitlist}
              style={{ width: '100%', marginBottom: Spacing.md }}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setWaitlistCountry(null)}
              disabled={submittingWaitlist}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      {/* Footer (only if full list is shown and we have a valid selection) */}
      {showFullList && (
        <Animated.View entering={FadeInDown.springify()} style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Button
            title="Complete Setup"
            onPress={handleComplete}
            loading={loading}
            disabled={!selectedCountry}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  autoDetectContainer: {
    paddingHorizontal: Spacing.lg,
  },
  detectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  detectingText: { fontSize: Typography.body },
  detectedCard: {
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  detectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  detectedText: {
    fontSize: Typography.bodySmall,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detectedCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flagIcon: {
    borderRadius: BorderRadius.sm,
  },
  detectedCountryName: {
    fontSize: Typography.header2,
    fontWeight: '700',
  },
  chooseDifferent: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
  chooseDifferentText: {
    fontSize: Typography.body,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Typography.body,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 3,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeaderText: {
    fontSize: Typography.bodySmall,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: Spacing.minTapTarget,
  },
  flagContainer: {
    marginRight: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countryName: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.header3,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalText: {
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: Typography.body * Typography.lineHeight,
    marginBottom: Spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
  },
});
