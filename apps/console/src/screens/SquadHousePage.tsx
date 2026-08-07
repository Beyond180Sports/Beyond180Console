import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SquadRecord } from '@beyond180/shared';
import HouseBoard from '../components/house/HouseBoard';

type SquadHousePageProps = {
  squad: SquadRecord;
  onBack: () => void;
};

export default function SquadHousePage({ squad, onBack }: SquadHousePageProps) {
  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Player Development</Text>
      </Pressable>

      <Text style={styles.title}>{squad.name}</Text>
      <Text style={styles.subtitle}>Rugby House · aptitude × attitude</Text>

      <View style={styles.board}>
        <HouseBoard teamId={squad.id} />
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
    paddingBottom: 16,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: 'pointer',
    marginBottom: 8,
  },
  backText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 40,
    letterSpacing: 1.5,
    color: '#123A7A',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.65)',
    marginBottom: 16,
  },
  board: {
    flex: 1,
    minHeight: 0,
  },
});
