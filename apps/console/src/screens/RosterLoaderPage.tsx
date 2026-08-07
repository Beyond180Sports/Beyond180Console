import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DEMO_STAFF_EMAIL,
  fetchStaffSquads,
  type SquadRecord,
} from '@beyond180/shared';
import { useAuth } from '../auth/AuthContext';
import SquadRecordCard from '../components/SquadRecordCard';

type RosterLoaderPageProps = {
  onSelectSquad: (squad: SquadRecord) => void;
  onBack: () => void;
};

export default function RosterLoaderPage({
  onSelectSquad,
  onBack,
}: RosterLoaderPageProps) {
  const { profile } = useAuth();
  const staffEmail = profile?.email ?? DEMO_STAFF_EMAIL;
  const [squads, setSquads] = useState<SquadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSquads() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStaffSquads(staffEmail);
        if (!cancelled) {
          setSquads(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load squads');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSquads();
    return () => {
      cancelled = true;
    };
  }, [staffEmail]);

  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Power Admin Functions</Text>
      </Pressable>

      <Text style={styles.title}>Roster Loader</Text>
      <Text style={styles.subtitle}>
        Select a squad to upload players · {staffEmail}
      </Text>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color="#1E6FE8" size="large" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && squads.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No squads found for this staff member.</Text>
        </View>
      )}

      {!loading && !error && squads.length > 0 && (
        <FlatList
          data={squads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SquadRecordCard squad={item} onPress={() => onSelectSquad(item)} />
          )}
        />
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(18, 58, 122, 0.65)',
    textAlign: 'center',
  },
  list: {
    paddingBottom: 40,
    gap: 12,
  },
});
