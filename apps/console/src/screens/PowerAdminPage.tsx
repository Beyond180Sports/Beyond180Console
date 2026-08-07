import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

type AdminFunctionId = 'rosterLoader' | 'gameStatsLoader';

type AdminFunction = {
  id: AdminFunctionId;
  title: string;
  subtitle: string;
};

const ADMIN_FUNCTIONS: AdminFunction[] = [
  {
    id: 'rosterLoader',
    title: 'Roster Loader',
    subtitle: 'Bulk upload and manage squad rosters.',
  },
  {
    id: 'gameStatsLoader',
    title: 'Game Stats Loader',
    subtitle: 'Import game statistics from supported sources.',
  },
];

type PowerAdminPageProps = {
  onBack: () => void;
  onSelectFunction?: (id: AdminFunctionId) => void;
};

export default function PowerAdminPage({
  onBack,
  onSelectFunction,
}: PowerAdminPageProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 28;
  const gap = 16;
  const columns = width >= 900 ? 3 : width >= 560 ? 2 : 1;
  const tileSize =
    (width - horizontalPadding * 2 - gap * (columns - 1)) / columns;

  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Beyond180 Sports</Text>
      </Pressable>

      <Text style={styles.title}>Power Admin Functions</Text>
      <Text style={styles.subtitle}>
        Support tools for bulk uploads and data loaders.
      </Text>

      <View style={[styles.grid, { gap }]}>
        {ADMIN_FUNCTIONS.map((fn) => (
          <Pressable
            key={fn.id}
            accessibilityRole="button"
            accessibilityLabel={fn.title}
            onPress={() => onSelectFunction?.(fn.id)}
            style={({ hovered, pressed }) => [
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
              },
              (hovered || pressed) && styles.tilePressed,
            ]}
          >
            <Text style={styles.tileTitle}>{fn.title}</Text>
            <Text style={styles.tileSubtitle}>{fn.subtitle}</Text>
            <Text style={styles.tileCta}>Open →</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: 'pointer',
    marginBottom: 12,
  },
  backText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    letterSpacing: 1.5,
    color: '#123A7A',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.65)',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 40,
  },
  tile: {
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.22)',
    backgroundColor: '#F7FAFF',
    padding: 24,
    justifyContent: 'flex-end',
    cursor: 'pointer',
  },
  tilePressed: {
    backgroundColor: '#EFF6FF',
    borderColor: 'rgba(30, 111, 232, 0.4)',
  },
  tileTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    letterSpacing: 1,
    color: '#123A7A',
    marginBottom: 8,
  },
  tileSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(18, 58, 122, 0.72)',
    marginBottom: 16,
  },
  tileCta: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
});
