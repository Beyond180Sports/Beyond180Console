import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  checkDuplicatePlayerEmails,
  savePlayersToTeam,
  type PlayerData,
  type SquadRecord,
} from '@beyond180/shared';
import CSVUploader from '../components/CSVUploader';

type RosterUploadPageProps = {
  squad: SquadRecord;
  onBack: () => void;
  onSuccess: () => void;
};

export default function RosterUploadPage({
  squad,
  onBack,
  onSuccess,
}: RosterUploadPageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDuplicates = useCallback(
    async (players: PlayerData[]) => {
      return checkDuplicatePlayerEmails(squad.id, players);
    },
    [squad.id],
  );

  async function handleConfirmUpload(players: PlayerData[]) {
    if (players.length === 0) {
      setError('No players to add. Please upload a valid CSV file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await savePlayersToTeam(squad.id, players);

      if (!result.success) {
        setError(
          result.message ||
            'Failed to add players to the team. Please try again.',
        );
        return;
      }

      setSuccessMessage(
        result.message || `Added ${players.length} players to ${squad.name}.`,
      );

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch {
      setError('Something went wrong while adding players. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Roster Loader</Text>
      </Pressable>

      <Text style={styles.squadLabel}>{squad.name}</Text>

      {error != null && <Text style={styles.error}>{error}</Text>}

      {isUploading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1E6FE8" size="large" />
          <Text style={styles.processing}>Processing upload...</Text>
        </View>
      ) : successMessage != null ? (
        <View style={styles.centered}>
          <Text style={styles.successLarge}>{successMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onSuccess}
            style={({ hovered, pressed }) => [
              styles.doneButton,
              (hovered || pressed) && styles.doneButtonPressed,
            ]}
          >
            <Text style={styles.doneButtonText}>Back to Squad List</Text>
          </Pressable>
        </View>
      ) : (
        <CSVUploader
          onCancel={onBack}
          onConfirm={handleConfirmUpload}
          checkDuplicates={checkDuplicates}
          title="Add Players to Squad"
          description="Upload a CSV file containing player information you want to add to this squad. Players with emails that already exist in the squad will be automatically excluded."
          confirmButtonText="Add to Squad"
          cancelButtonText="Cancel"
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
  squadLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.65)',
    marginBottom: 8,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#B42318',
    marginBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  processing: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.65)',
    marginTop: 16,
  },
  successLarge: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#027A48',
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    backgroundColor: '#1E6FE8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
  },
  doneButtonPressed: {
    opacity: 0.88,
  },
  doneButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
});
