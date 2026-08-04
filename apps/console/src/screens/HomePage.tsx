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

const useNativeDriver = Platform.OS !== 'web';
const dragonflyLogo = require('../../assets/dragonfly-logo.png');
const coach180Logo = require('../../assets/coach180-logo.png');
const video180Logo = require('../../assets/video180-logo.png');

const COACH180_URL = 'https://coach180.beyond180.com/';

function openExternalUrl(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

type DestinationPanelProps = {
  title: string;
  subtitle: string;
  gradientColors: [string, string, ...string[]];
  gradientLocations: [number, number, ...number[]];
  gradientStart: { x: number; y: number };
  gradientEnd: { x: number; y: number };
  delay: number;
  onPress?: () => void;
  backgroundImage?: number;
};

function DestinationPanel({
  title,
  subtitle,
  gradientColors,
  gradientLocations,
  gradientStart,
  gradientEnd,
  delay,
  onPress,
  backgroundImage,
}: DestinationPanelProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const isInteractive = Boolean(onPress);

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
        accessibilityRole={isInteractive ? 'button' : undefined}
        disabled={!isInteractive}
        onPress={onPress}
        onPressIn={() => {
          if (!isInteractive) {
            return;
          }
          Animated.spring(scale, {
            toValue: 0.985,
            useNativeDriver,
            speed: 40,
            bounciness: 4,
          }).start();
        }}
        onPressOut={() => {
          if (!isInteractive) {
            return;
          }
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver,
            speed: 20,
            bounciness: 6,
          }).start();
        }}
        style={({ hovered, pressed }) => [
          styles.panel,
          isInteractive && styles.panelInteractive,
          isInteractive && (hovered || pressed) && styles.panelPressed,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          locations={gradientLocations}
          start={gradientStart}
          end={gradientEnd}
          style={StyleSheet.absoluteFill}
        />
        {backgroundImage != null && (
          <View style={styles.panelBackgroundImageWrap} pointerEvents="none">
            <Image
              source={backgroundImage}
              style={styles.panelBackgroundImage}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
        )}
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelSubtitle}>{subtitle}</Text>
        <Text style={styles.panelCta}>Enter →</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomePage({
  onOpenSportsAnalytics,
}: {
  onOpenSportsAnalytics: () => void;
}) {
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

  const leftGradient = {
    colors: ['#1E6FE8', '#4A8FF0', '#D6E8FF', '#FFFFFF'] as [string, string, ...string[]],
    locations: [0, 0.05, 0.28, 0.5] as [number, number, ...number[]],
    start: isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 },
    end: isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 },
  };

  const rightGradient = {
    colors: ['#FFFFFF', '#D6E8FF', '#4A8FF0', '#1E6FE8'] as [string, string, ...string[]],
    locations: [0.5, 0.72, 0.95, 1] as [number, number, ...number[]],
    start: isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 },
    end: isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 },
  };

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

      <View style={styles.panels}>
        <View style={[styles.panelRow, !isWide && styles.panelRowStacked]}>
          <DestinationPanel
            title="Coach180"
            subtitle="Squad and player management with team event scheduling and game event tracking."
            gradientColors={leftGradient.colors}
            gradientLocations={leftGradient.locations}
            gradientStart={leftGradient.start}
            gradientEnd={leftGradient.end}
            delay={120}
            onPress={() => openExternalUrl(COACH180_URL)}
            backgroundImage={coach180Logo}
          />
          <DestinationPanel
            title="Sports Analytics"
            subtitle="Time series analytics for data collected across Beyond180 Sports platforms."
            gradientColors={rightGradient.colors}
            gradientLocations={rightGradient.locations}
            gradientStart={rightGradient.start}
            gradientEnd={rightGradient.end}
            delay={200}
            onPress={onOpenSportsAnalytics}
          />
        </View>
        <View style={[styles.panelRow, !isWide && styles.panelRowStacked]}>
          <DestinationPanel
            title="Admin Tools"
            subtitle="Support for bulk squad uploads, PDF loaders, and video loaders."
            gradientColors={leftGradient.colors}
            gradientLocations={leftGradient.locations}
            gradientStart={leftGradient.start}
            gradientEnd={leftGradient.end}
            delay={280}
          />
          <DestinationPanel
            title="Video180"
            subtitle="Game video loader that uses AI engines to analyze footage and extract insights."
            gradientColors={rightGradient.colors}
            gradientLocations={rightGradient.locations}
            gradientStart={rightGradient.start}
            gradientEnd={rightGradient.end}
            delay={360}
            backgroundImage={video180Logo}
          />
        </View>
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
  panelRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
  },
  panelRowStacked: {
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
    backgroundColor: '#FFFFFF',
  },
  panelBackgroundImageWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelBackgroundImage: {
    width: '61%',
    height: '61%',
    maxWidth: 320,
    maxHeight: 320,
    opacity: 0.92,
  },
  panelInteractive: {
    cursor: 'pointer',
  },
  panelPressed: {
    opacity: 0.92,
  },
  panelTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    letterSpacing: 1.5,
    color: '#123A7A',
    marginBottom: 10,
  },
  panelSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(18, 58, 122, 0.72)',
    maxWidth: 300,
    marginBottom: 20,
  },
  panelCta: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
});
