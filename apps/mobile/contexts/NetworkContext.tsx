import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography, Spacing } from '../constants/theme';
import { AlertCircle } from 'lucide-react-native';

interface NetworkContextType {
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOffline: false });

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be null initially, we treat false as strictly offline
      setIsOffline(state.isConnected === false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isOffline }}>
      {children}
      {isOffline && (
        <View style={[styles.banner, { backgroundColor: colors.error, paddingTop: insets.top > 0 ? insets.top : Spacing.md }]}>
          <View style={styles.content}>
            <AlertCircle size={16} color="#fff" />
            <Text style={styles.text}>No internet connection</Text>
          </View>
        </View>
      )}
    </NetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  text: {
    color: '#fff',
    fontSize: Typography.small,
    fontWeight: '600',
  },
});
