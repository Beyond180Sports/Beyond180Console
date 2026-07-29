import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { AppSection } from '../types/navigation';

const useNativeDriver = Platform.OS !== 'web';
const dragonflyLogo = require('../../assets/dragonfly-logo.png');
const COACH180_URL = 'https://coach180.beyond180.com/';

function openCoach180() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(COACH180_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(COACH180_URL);
}

type HomePageProps = {
  onNavigate: (section: AppSection) => void;
};

type DestinationPanelProps = {
  title: string;
  gradientColors: [string, string, ...string[]];
  gradientLocations: [number, number, ...number[]];
  gradientStart: { x: number; y: number };
  gradientEnd: { x: number; y: number };
  delay: number;
  onPress: () => void;
};

function DestinationPanel({
  title,
  gradientColors,
  gradientLocations,
  gradientStart,
  gradientEnd,
  delay,
  onPress,
}: DestinationPanelProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        delay,
        useNativeDriver,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 650,
        delay,
        useNativeDriver,
      }),
    ]).start();
  }, [delay, fade, rise]);

  return (
    <Animated.View
      style={[
        styles.panelShell,
        {
          opacity: fade,
          transform: [{ translateY: rise }, { scale }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => {
          Animated.spring(scale, {
            toValue: 0.985,
            useNativeDriver,
            speed: 40,
            bounciness: 4,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver,
            speed: 20,
            bounciness: 6,
          }).start();
        }}
        style={({ hovered, pressed }) => [
          styles.panel,
          (hovered || pressed) && styles.panelPressed,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          locations={gradientLocations}
          start={gradientStart}
          end={gradientEnd}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelCta}>Enter →</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const bannerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bannerFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver,
    }).start();
  }, [bannerFade]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.banner, { opacity: bannerFade }]}>
        <View style={styles.brandRow}>
          <Image
            source={dragonflyLogo}
            style={styles.brandLogo}
            resizeMode="contain"
            accessibilityLabel="Beyond180 Sports logo"
          />
          <Text style={styles.brand}>Beyond180 Sports</Text>
        </View>
      </Animated.View>

      <View style={[styles.panels, isWide ? styles.panelsRow : styles.panelsColumn]}>
        <DestinationPanel
          title="Coach180"
          gradientColors={['#1E6FE8', '#4A8FF0', '#D6E8FF', '#FFFFFF']}
          gradientLocations={[0, 0.05, 0.28, 0.5]}
          gradientStart={isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
          gradientEnd={isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
          delay={120}
          onPress={openCoach180}
        />
        <DestinationPanel
          title="Sports Analytics"
          gradientColors={['#FFFFFF', '#D6E8FF', '#4A8FF0', '#1E6FE8']}
          gradientLocations={[0.5, 0.72, 0.95, 1]}
          gradientStart={isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
          gradientEnd={isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
          delay={240}
          onPress={() => onNavigate('sports-analytics')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.18)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandLogo: {
    width: 48,
    height: 48,
  },
  brand: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    letterSpacing: 2,
    color: '#1E6FE8',
    textAlign: 'center',
  },
  panels: {
    flex: 1,
    gap: 1,
    backgroundColor: 'rgba(30, 111, 232, 0.2)',
  },
  panelsRow: {
    flexDirection: 'row',
  },
  panelsColumn: {
    flexDirection: 'column',
  },
  panelShell: {
    flex: 1,
  },
  panel: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 36,
    paddingVertical: 40,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF',
  },
  panelPressed: {
    opacity: 0.92,
  },
  panelTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 56,
    letterSpacing: 1.5,
    color: '#123A7A',
    marginBottom: 28,
  },
  panelCta: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
});
