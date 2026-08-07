import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  isOnOrBeforeFilterDate,
  type HouseMarker,
  type PlayerRecord,
} from '@beyond180/shared';

type ListViewProps = {
  isLoading: boolean;
  teamMarkers: HouseMarker[];
  players: PlayerRecord[];
  visiblePlayerIds: string[];
  selectedDate: Date | null;
  handleEditMarker: (marker: HouseMarker) => void;
};

function formatMarkerDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
}

export default function ListView({
  isLoading,
  teamMarkers,
  players,
  visiblePlayerIds,
  selectedDate,
  handleEditMarker,
}: ListViewProps) {
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E6FE8" />
        <Text style={styles.muted}>Loading markers...</Text>
      </View>
    );
  }

  const visiblePlayerIdSet = new Set(visiblePlayerIds);
  const markersToDisplay = teamMarkers
    .filter((marker) => visiblePlayerIdSet.has(marker.playerRecordId))
    .filter((marker) => isOnOrBeforeFilterDate(marker.createdAt, selectedDate))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (markersToDisplay.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>No markers found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      {markersToDisplay.map((marker) => {
        const player = players.find((p) => p.id === marker.playerRecordId);
        if (!player) {
          return null;
        }

        const playerName = `${player.firstName} ${player.lastName}`;

        return (
          <Pressable
            key={marker.id}
            onPress={() => handleEditMarker(marker)}
            style={({ hovered, pressed }) => [
              styles.row,
              (hovered || pressed) && styles.rowPressed,
            ]}
          >
            <View style={styles.rowBody}>
              <Text style={styles.name}>{playerName}</Text>
              <Text style={styles.date}>{formatMarkerDate(marker.createdAt)}</Text>
              <View style={styles.chips}>
                <View style={styles.chipAptitude}>
                  <Text style={styles.chipAptitudeText}>Aptitude: {marker.x}</Text>
                </View>
                <View style={styles.chipAttitude}>
                  <Text style={styles.chipAttitudeText}>Attitude: {marker.y}</Text>
                </View>
              </View>
              {marker.comment ? (
                <Text style={styles.comment}>{marker.comment}</Text>
              ) : null}
            </View>
            <Text style={styles.editHint}>Edit</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.65)',
    marginTop: 12,
  },
  scroll: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.12)',
  },
  rowPressed: {
    backgroundColor: '#F7FAFF',
  },
  rowBody: {
    flex: 1,
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#123A7A',
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(18, 58, 122, 0.6)',
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chipAptitude: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipAptitudeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#1E40AF',
  },
  chipAttitude: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipAttitudeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#B91C1C',
  },
  comment: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.8)',
    marginTop: 8,
  },
  editHint: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#1E6FE8',
    marginLeft: 12,
  },
});
