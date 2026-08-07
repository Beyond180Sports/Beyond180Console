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
import { useAuth } from '../auth/AuthContext';
import AccountMenu from '../components/AccountMenu';

const useNativeDriver = Platform.OS !== 'web';
const dragonflyLogo = require('../../assets/dragonfly-logo.png');
const coach180Logo = require('../../assets/coach180-logo.png');

const COACH180_APP_URL = 'https://coach180.beyond180.com/';
const COACH180_LEARN_MORE_URL = 'https://www.beyond180.com/coach180';
const COACH180_APP_DOWNLOAD_URL = 'https://www.beyond180.com/app-download';
const VIDEO180_URL = 'https://www.beyond180.com/video180';

function openExternalUrl(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  void Linking.openURL(url);
}

type PanelAction = {
  label: string;
  onPress?: () => void;
};

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
  ctaLabel?: string;
  actions?: PanelAction[];
  pro?: boolean;
  comingSoon?: boolean;
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
  ctaLabel = 'Enter →',
  actions,
  pro = false,
  comingSoon = false,
}: DestinationPanelProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const hasActions = Boolean(actions && actions.length > 0);
  const isInteractive = Boolean(onPress) && !hasActions;

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

  const content = (
    <>
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
      {pro && (
        <View style={styles.proBadge} accessibilityLabel="Pro feature">
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      )}
      {comingSoon && (
        <View style={styles.comingSoonBadge} accessibilityLabel="Coming soon">
          <Text style={styles.badgeText}>COMING SOON</Text>
        </View>
      )}
      <Text
        style={[
          styles.panelTitle,
          pro && styles.panelTitlePro,
          comingSoon && styles.panelTitleComingSoon,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.panelSubtitle,
          pro && styles.panelSubtitlePro,
          comingSoon && styles.panelSubtitleComingSoon,
        ]}
      >
        {subtitle}
      </Text>
      {hasActions ? (
        <View style={styles.panelActions}>
          {actions!.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole={action.onPress ? 'button' : undefined}
              disabled={!action.onPress}
              onPress={action.onPress}
              style={({ hovered, pressed }) => [
                styles.panelAction,
                action.onPress && styles.panelInteractive,
                action.onPress && (hovered || pressed) && styles.panelActionPressed,
                !action.onPress && styles.panelActionDisabled,
              ]}
            >
              <Text
                style={[
                  styles.panelCta,
                  pro && styles.panelCtaPro,
                  comingSoon && styles.panelCtaComingSoon,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text
          style={[
            styles.panelCta,
            pro && styles.panelCtaPro,
            comingSoon && styles.panelCtaComingSoon,
          ]}
        >
          {ctaLabel}
        </Text>
      )}
    </>
  );

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
      {isInteractive ? (
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
            styles.panelInteractive,
            (hovered || pressed) && styles.panelPressed,
          ]}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.panel}>{content}</View>
      )}
    </Animated.View>
  );
}

export default function HomePage({
  onOpenSportsAnalytics,
  onOpenPowerAdmin,
  onOpenSignIn,
  onOpenCreateAccount,
}: {
  onOpenSportsAnalytics: () => void;
  onOpenPowerAdmin: () => void;
  onOpenSignIn: () => void;
  onOpenCreateAccount: () => void;
}) {
  const { profile } = useAuth();
  const isLoggedIn = profile != null;
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

  const leftProGradient = {
    colors: ['#6B3FA0', '#8B5CF6', '#EDE4FF', '#FFFFFF'] as [string, string, ...string[]],
    locations: [0, 0.05, 0.28, 0.5] as [number, number, ...number[]],
    start: isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 },
    end: isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 },
  };

  const rightProGradient = {
    colors: ['#FFFFFF', '#EDE4FF', '#8B5CF6', '#6B3FA0'] as [string, string, ...string[]],
    locations: [0.5, 0.72, 0.95, 1] as [number, number, ...number[]],
    start: isWide ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 },
    end: isWide ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 },
  };

  const rightComingSoonGradient = {
    colors: ['#FFFFFF', '#DDF5E5', '#3CB371', '#1F7A4D'] as [string, string, ...string[]],
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
        <AccountMenu
          onSignIn={onOpenSignIn}
          onCreateAccount={onOpenCreateAccount}
        />
      </Animated.View>

      {isLoggedIn ? (
        <View style={[styles.panels, !isWide && styles.panelsStacked]}>
          <View style={[styles.panelColumn, !isWide && styles.panelColumnTall]}>
            <DestinationPanel
              title="Coach180"
              subtitle="Squad and player management with team event scheduling and game event tracking."
              gradientColors={leftGradient.colors}
              gradientLocations={leftGradient.locations}
              gradientStart={leftGradient.start}
              gradientEnd={leftGradient.end}
              delay={120}
              onPress={() => openExternalUrl(COACH180_APP_URL)}
              backgroundImage={coach180Logo}
            />
            <DestinationPanel
              title="Power Admin Functions"
              subtitle="Support for bulk squad uploads, PDF loaders, and video loaders."
              gradientColors={leftProGradient.colors}
              gradientLocations={leftProGradient.locations}
              gradientStart={leftProGradient.start}
              gradientEnd={leftProGradient.end}
              delay={280}
              onPress={onOpenPowerAdmin}
              pro
            />
            <DestinationPanel
              title="Player Development"
              subtitle="Track individual progress, skills, and development pathways across the season."
              gradientColors={leftGradient.colors}
              gradientLocations={leftGradient.locations}
              gradientStart={leftGradient.start}
              gradientEnd={leftGradient.end}
              delay={440}
            />
          </View>
          <View style={[styles.panelColumn, !isWide && styles.panelColumnShort]}>
            <DestinationPanel
              title="Data Analytics Dashboard"
              subtitle="Time series analytics for data collected across Beyond180 Sports platforms."
              gradientColors={rightProGradient.colors}
              gradientLocations={rightProGradient.locations}
              gradientStart={rightProGradient.start}
              gradientEnd={rightProGradient.end}
              delay={200}
              onPress={onOpenSportsAnalytics}
              pro
            />
            <DestinationPanel
              title="Video180"
              subtitle="Game video loader that uses AI engines to analyze footage and extract insights."
              gradientColors={rightComingSoonGradient.colors}
              gradientLocations={rightComingSoonGradient.locations}
              gradientStart={rightComingSoonGradient.start}
              gradientEnd={rightComingSoonGradient.end}
              delay={360}
              onPress={() => openExternalUrl(VIDEO180_URL)}
              ctaLabel="Learn More →"
              comingSoon
            />
          </View>
        </View>
      ) : (
        <View style={[styles.panels, !isWide && styles.panelsStacked]}>
          <View style={styles.panelColumn}>
            <DestinationPanel
              title="Coach180"
              subtitle="Squad and player management with team event scheduling and game event tracking."
              gradientColors={leftGradient.colors}
              gradientLocations={leftGradient.locations}
              gradientStart={leftGradient.start}
              gradientEnd={leftGradient.end}
              delay={120}
              backgroundImage={coach180Logo}
              actions={[
                {
                  label: 'Learn More →',
                  onPress: () => openExternalUrl(COACH180_LEARN_MORE_URL),
                },
                {
                  label: 'Download the App →',
                  onPress: () => openExternalUrl(COACH180_APP_DOWNLOAD_URL),
                },
                {
                  label: 'View Demo →',
                },
              ]}
            />
          </View>
          <View style={styles.panelColumn}>
            <DestinationPanel
              title="Video180"
              subtitle="Game video loader that uses AI engines to analyze footage and extract insights."
              gradientColors={rightComingSoonGradient.colors}
              gradientLocations={rightComingSoonGradient.locations}
              gradientStart={rightComingSoonGradient.start}
              gradientEnd={rightComingSoonGradient.end}
              delay={200}
              onPress={() => openExternalUrl(VIDEO180_URL)}
              ctaLabel="Learn More →"
              comingSoon
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    position: 'relative',
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
    flexDirection: 'row',
    gap: 1,
    backgroundColor: 'rgba(30, 111, 232, 0.2)',
  },
  panelsStacked: {
    flexDirection: 'column',
  },
  panelColumn: {
    flex: 1,
    gap: 1,
  },
  panelColumnTall: {
    flex: 3,
  },
  panelColumnShort: {
    flex: 2,
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
  panelActions: {
    gap: 12,
    alignItems: 'flex-start',
  },
  panelAction: {
    paddingVertical: 2,
  },
  panelActionPressed: {
    opacity: 0.7,
  },
  panelActionDisabled: {
    opacity: 0.45,
  },
  panelCta: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
  panelTitlePro: {
    color: '#3B1F6E',
  },
  panelSubtitlePro: {
    color: 'rgba(59, 31, 110, 0.72)',
  },
  panelCtaPro: {
    color: '#7C3AED',
  },
  panelTitleComingSoon: {
    color: '#14532D',
  },
  panelSubtitleComingSoon: {
    color: 'rgba(20, 83, 45, 0.72)',
  },
  panelCtaComingSoon: {
    color: '#15803D',
  },
  proBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6B3FA0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 2,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1F7A4D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 2,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#FFFFFF',
  },
});
