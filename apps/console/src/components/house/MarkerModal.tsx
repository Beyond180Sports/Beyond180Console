import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { HouseMarkerInsert, PlayerRecord } from '@beyond180/shared';
import FilterDropdown from './FilterDropdown';

type MarkerModalProps = {
  markerModalVisible: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  newMarker: HouseMarkerInsert | null;
  aptitudeValue: number;
  attitudeValue: number;
  comment: string;
  setAptitudeValue: (value: number) => void;
  setAttitudeValue: (value: number) => void;
  setComment: (comment: string) => void;
  closeModal: () => void;
  submitMarker: () => void;
  handleDeleteFromModal: () => void;
  modalPlayers: PlayerRecord[];
  onPlayerChange: (playerId: string) => void;
  roundToStep: (value: number) => number;
  markerDate: Date;
  setMarkerDate: (date: Date) => void;
};

function StepValueControl({
  label,
  value,
  onChange,
  roundToStep,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  roundToStep: (value: number) => number;
}) {
  const adjust = (delta: number) => {
    onChange(roundToStep(Math.max(0, Math.min(100, value + delta))));
  };

  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.stepRow}>
        <Pressable
          onPress={() => adjust(-5)}
          style={({ hovered, pressed }) => [
            styles.stepButton,
            (hovered || pressed) && styles.stepPressed,
          ]}
        >
          <Text style={styles.stepText}>−5</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${value}%` }]} />
        </View>
        <Pressable
          onPress={() => adjust(5)}
          style={({ hovered, pressed }) => [
            styles.stepButton,
            (hovered || pressed) && styles.stepPressed,
          ]}
        >
          <Text style={styles.stepText}>+5</Text>
        </Pressable>
      </View>
    </View>
  );
}

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MarkerModal({
  markerModalVisible,
  isEditMode,
  isSubmitting,
  newMarker,
  aptitudeValue,
  attitudeValue,
  comment,
  setAptitudeValue,
  setAttitudeValue,
  setComment,
  closeModal,
  submitMarker,
  handleDeleteFromModal,
  modalPlayers,
  onPlayerChange,
  roundToStep,
  markerDate,
  setMarkerDate,
}: MarkerModalProps) {
  const selectedPlayer = modalPlayers.find(
    (player) => player.id === newMarker?.playerRecordId,
  );
  const playerLabel = selectedPlayer
    ? `${selectedPlayer.firstName} ${selectedPlayer.lastName}`
    : 'Select player';

  const playerOptions = modalPlayers.map((player) => ({
    id: player.id,
    label: `${player.firstName} ${player.lastName}`,
    subtitle: player.jerseyNumber
      ? `Jersey #${player.jerseyNumber}`
      : undefined,
  }));

  return (
    <Modal
      visible={markerModalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPress} onPress={closeModal} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Player Marker' : 'Add Player Marker'}
            </Text>
            {isEditMode ? (
              <Pressable
                onPress={handleDeleteFromModal}
                style={({ hovered, pressed }) => [
                  styles.deleteButton,
                  (hovered || pressed) && styles.deletePressed,
                ]}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <Text style={styles.label}>Player</Text>
              {isEditMode ? (
                <View style={styles.readonly}>
                  <Text style={styles.readonlyText}>{playerLabel}</Text>
                </View>
              ) : (
                <FilterDropdown
                  options={playerOptions}
                  selectedId={newMarker?.playerRecordId ?? null}
                  onSelect={(id) => {
                    if (id) {
                      onPlayerChange(id);
                    }
                  }}
                  placeholder="Select player"
                  enableSearch
                />
              )}
            </View>

            <StepValueControl
              label="Aptitude"
              value={aptitudeValue}
              onChange={setAptitudeValue}
              roundToStep={roundToStep}
            />

            <StepValueControl
              label="Attitude"
              value={attitudeValue}
              onChange={setAttitudeValue}
              roundToStep={roundToStep}
            />

            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={toInputValue(markerDate)}
                  onChange={(event: { target: { value: string } }) => {
                    const next = event.target.value;
                    if (next) {
                      setMarkerDate(new Date(`${next}T12:00:00`));
                    }
                  }}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14,
                    color: '#123A7A',
                    border: '1px solid rgba(30, 111, 232, 0.18)',
                    background: '#F3F7FF',
                    padding: '10px 12px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              ) : (
                <Text style={styles.readonlyText}>
                  {markerDate.toLocaleDateString()}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Comment</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Optional notes"
                placeholderTextColor="rgba(18, 58, 122, 0.4)"
                multiline
                style={styles.comment}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={closeModal}
              disabled={isSubmitting}
              style={({ hovered, pressed }) => [
                styles.footerButton,
                styles.cancelButton,
                (hovered || pressed) && styles.cancelPressed,
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={submitMarker}
              disabled={isSubmitting || !newMarker?.playerRecordId}
              style={({ hovered, pressed }) => [
                styles.footerButton,
                styles.saveButton,
                (hovered || pressed) && styles.savePressed,
                (isSubmitting || !newMarker?.playerRecordId) && styles.disabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>
                  {isEditMode ? 'Save changes' : 'Add marker'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 64, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.12)',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    color: '#123A7A',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deletePressed: {
    backgroundColor: '#FECACA',
  },
  deleteText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#DC2626',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#123A7A',
  },
  value: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1E6FE8',
  },
  readonly: {
    backgroundColor: '#F3F7FF',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  readonlyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 48,
    alignItems: 'center',
  },
  stepPressed: {
    backgroundColor: '#D6E8FF',
  },
  stepText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1E6FE8',
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5EEFF',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#1E6FE8',
  },
  comment: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
    backgroundColor: '#F7FAFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 111, 232, 0.12)',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: '#F3F7FF',
  },
  cancelPressed: {
    backgroundColor: '#E5EEFF',
  },
  cancelText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
  },
  saveButton: {
    backgroundColor: '#1E6FE8',
  },
  savePressed: {
    backgroundColor: '#1859BA',
  },
  saveText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
