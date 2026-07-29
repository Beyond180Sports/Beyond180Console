import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SubTeamCombobox from '../components/SubTeamCombobox';
import type { SquadRecord } from '../lib/squads';
import { fetchSquadSubTeams, type SubTeamOption } from '../lib/subteams';
import { squadColorHex } from '../lib/teamColors';

type SquadAnalyticsPageProps = {
  squad: SquadRecord;
  onBack: () => void;
};

export default function SquadAnalyticsPage({ squad, onBack }: SquadAnalyticsPageProps) {
  const [subTeams, setSubTeams] = useState<SubTeamOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accent = squadColorHex(squad.color);

  useEffect(() => {
    let cancelled = false;

    async function loadSubTeams() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSquadSubTeams(squad.id);
        if (!cancelled) {
          setSubTeams(data);
          setSelectedIds(data.map((subTeam) => subTeam.id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load teams');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSubTeams();
    return () => {
      cancelled = true;
    };
  }, [squad.id]);

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>← Sports Analytics</Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={[accent, `${accent}99`, `${accent}22`, '#FFFFFF']}
        locations={[0, 0.22, 0.55, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.titleBar}
      >
        <Text style={styles.title}>{squad.name} Analytics</Text>
      </LinearGradient>

      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#1E6FE8" />
            <Text style={styles.loadingText}>Loading teams…</Text>
          </View>
        )}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && (
          <SubTeamCombobox
            options={subTeams}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 8,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: 'pointer',
  },
  backText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  titleBar: {
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    letterSpacing: 1.5,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.65)',
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#C62828',
  },
});
