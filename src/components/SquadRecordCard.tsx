import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SquadRecord } from '../lib/squads';

type SquadRecordCardProps = {
  squad: SquadRecord;
  onPress?: () => void;
};

export default function SquadRecordCard({ squad, onPress }: SquadRecordCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {squad.logoUrl ? (
        <Image source={{ uri: squad.logoUrl }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoFallback]}>
          <Text style={styles.logoFallbackText}>{squad.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{squad.name}</Text>

        <View style={styles.tagRow}>
          <View style={styles.yearTag}>
            <Text style={styles.yearTagText}>{squad.year}</Text>
          </View>
          {squad.leagues.map((league) => (
            <View key={league} style={styles.leagueTag}>
              <Text style={styles.leagueTagText}>{league}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    cursor: 'pointer',
  },
  cardPressed: {
    backgroundColor: '#F9FAFB',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  logoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E6FE8',
  },
  logoFallbackText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#111827',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  yearTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  yearTagText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#1E40AF',
  },
  leagueTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFEDD5',
  },
  leagueTagText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#9A3412',
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    lineHeight: 24,
    color: '#1E6FE8',
    marginTop: -2,
  },
});
