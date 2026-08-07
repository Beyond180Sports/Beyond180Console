import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { HouseMarker, PlayerRecord } from '@beyond180/shared';

type MarkerActionModalProps = {
  visible: boolean;
  markers: HouseMarker[];
  x: number;
  y: number;
  players: PlayerRecord[];
  showAddNew?: boolean;
  selectMode?: boolean;
  onEdit: (marker: HouseMarker) => void;
  onAddNew: () => void;
  onClose: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString();
}

export default function MarkerActionModal({
  visible,
  markers,
  x,
  y,
  players,
  showAddNew = true,
  selectMode = false,
  onEdit,
  onAddNew,
  onClose,
}: MarkerActionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {selectMode
                ? 'Select a player'
                : markers.length > 1
                  ? 'Select a marker'
                  : 'Marker options'}
            </Text>
            <Text style={styles.subtitle}>
              Aptitude {x} · Attitude {y}
            </Text>
          </View>

          <ScrollView style={styles.list}>
            {markers.map((marker) => {
              const player = players.find(
                (entry) => entry.id === marker.playerRecordId,
              );
              const playerName = player
                ? `${player.firstName} ${player.lastName}`
                : 'Unknown player';

              return (
                <Pressable
                  key={marker.id}
                  onPress={() => onEdit(marker)}
                  style={({ hovered, pressed }) => [
                    styles.option,
                    (hovered || pressed) && styles.optionPressed,
                  ]}
                >
                  <View style={styles.optionBody}>
                    <Text style={styles.optionName}>{playerName}</Text>
                    <Text style={styles.optionMeta}>
                      {formatDate(marker.createdAt)}
                    </Text>
                    {marker.comment ? (
                      <Text style={styles.optionComment} numberOfLines={1}>
                        {marker.comment}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            {showAddNew ? (
              <Pressable
                onPress={onAddNew}
                style={({ hovered, pressed }) => [
                  styles.addButton,
                  (hovered || pressed) && styles.addPressed,
                ]}
              >
                <Text style={styles.addText}>Add new marker</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onClose}
              style={({ hovered, pressed }) => [
                styles.cancelButton,
                (hovered || pressed) && styles.cancelPressed,
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 64, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.12)',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 26,
    letterSpacing: 1,
    color: '#123A7A',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(18, 58, 122, 0.65)',
    marginTop: 4,
  },
  list: {
    maxHeight: 280,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.08)',
  },
  optionPressed: {
    backgroundColor: '#F7FAFF',
  },
  optionBody: {
    flex: 1,
  },
  optionName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#123A7A',
  },
  optionMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(18, 58, 122, 0.6)',
    marginTop: 2,
  },
  optionComment: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(18, 58, 122, 0.5)',
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: 'rgba(18, 58, 122, 0.35)',
    marginLeft: 8,
  },
  actions: {
    padding: 16,
    gap: 10,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#1E6FE8',
  },
  addPressed: {
    backgroundColor: '#D6E8FF',
  },
  addText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1E6FE8',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(18, 58, 122, 0.2)',
  },
  cancelPressed: {
    backgroundColor: '#F7FAFF',
  },
  cancelText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
  },
});
