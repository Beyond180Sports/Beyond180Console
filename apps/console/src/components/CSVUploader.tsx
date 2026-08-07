import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { parseCSV, type PlayerData } from '@beyond180/shared';

const SAMPLE_CSV = `firstName,lastName,email,phone,emergencyEmail,emergencyPhone,number,heightCm,weightKg
John,Smith,john.smith@example.com,+1234567890,emergency.smith@example.com,+1987654321,7,185,82
Sarah,Johnson,sarah.j@example.com,+1234567891,emergency.johnson@example.com,+1987654322,10,170,65
Michael,Williams,m.williams@example.com,+1234567892,emergency.williams@example.com,+1987654323,15,190,88
Emma,Brown,emma.b@example.com,+1234567893,emergency.brown@example.com,+1987654324,23,175,70
David,Jones,david.jones@example.com,+1234567894,emergency.jones@example.com,+1987654325,31,182,85
`;

type CSVUploaderProps = {
  onCancel: () => void;
  onConfirm: (players: PlayerData[]) => Promise<void>;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  checkDuplicates?: (players: PlayerData[]) => Promise<{
    uniquePlayers: PlayerData[];
    duplicateEmails: string[];
  }>;
};

async function readPickedFileText(
  asset: DocumentPicker.DocumentPickerAsset,
): Promise<string> {
  if (Platform.OS === 'web' && asset.file) {
    return asset.file.text();
  }

  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error('Unable to read the selected file.');
  }
  return response.text();
}

function downloadSampleTemplate() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_roster.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function CSVUploader({
  onCancel,
  onConfirm,
  title = 'Upload Roster CSV',
  description = 'Upload a CSV file containing your team roster information.',
  confirmButtonText = 'Confirm Upload',
  cancelButtonText = 'Upload Different File',
  checkDuplicates,
}: CSVUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const [uniquePlayers, setUniquePlayers] = useState<PlayerData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [totalPlayersCount, setTotalPlayersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkForDuplicates() {
      if (players.length === 0) {
        return;
      }

      setTotalPlayersCount(players.length);

      if (checkDuplicates) {
        setIsCheckingDuplicates(true);
        try {
          const result = await checkDuplicates(players);
          if (!cancelled) {
            setUniquePlayers(result.uniquePlayers);
            setDuplicateEmails(result.duplicateEmails);
          }
        } catch {
          if (!cancelled) {
            setUniquePlayers(players);
            setDuplicateEmails([]);
            setError('Could not check for duplicate players.');
          }
        } finally {
          if (!cancelled) {
            setIsCheckingDuplicates(false);
          }
        }
      } else if (!cancelled) {
        setUniquePlayers(players);
        setDuplicateEmails([]);
      }
    }

    void checkForDuplicates();
    return () => {
      cancelled = true;
    };
  }, [players, checkDuplicates]);

  async function handleFileUpload() {
    try {
      setIsUploading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const content = await readPickedFileText(result.assets[0]);
      const parsedPlayers = parseCSV(content);
      setPlayers(parsedPlayers);
      setShowPreview(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process CSV file',
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmUpload() {
    try {
      setIsUploading(true);
      setError(null);
      await onConfirm(uniquePlayers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unknown error occurred',
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleCancelPreview() {
    setShowPreview(false);
    setPlayers([]);
    setUniquePlayers([]);
    setDuplicateEmails([]);
    setTotalPlayersCount(0);
    setError(null);
    onCancel();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {error != null && <Text style={styles.error}>{error}</Text>}

      {!showPreview ? (
        <>
          <View style={styles.guide}>
            <Text style={styles.guideTitle}>CSV Format Guide</Text>
            <Text style={styles.guideBody}>
              Your CSV should include these columns:{'\n'}• firstName (required)
              {'\n'}• lastName (required){'\n'}• email (required)
              {'\n'}• phone{'\n'}• emergencyEmail{'\n'}• emergencyPhone
              {'\n'}• number{'\n'}• heightCm{'\n'}• weightKg{'\n'}• birthYear
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isUploading}
            onPress={() => {
              void handleFileUpload();
            }}
            style={({ hovered, pressed }) => [
              styles.primaryButton,
              (hovered || pressed) && styles.buttonPressed,
              isUploading && styles.buttonDisabled,
            ]}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Select CSV File</Text>
            )}
          </Pressable>

          {Platform.OS === 'web' && (
            <Pressable
              accessibilityRole="button"
              onPress={downloadSampleTemplate}
              style={({ hovered, pressed }) => [
                styles.secondaryLink,
                (hovered || pressed) && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryLinkText}>Download Template</Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          {duplicateEmails.length > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Duplicate Players Detected</Text>
              <Text style={styles.warningBody}>
                {duplicateEmails.length} of {totalPlayersCount} players have
                emails that already exist in this squad and will be excluded.
              </Text>
              <Text style={styles.warningBody}>
                Only {uniquePlayers.length} unique players will be shown below
                and added to the squad.
              </Text>
              <View style={styles.duplicateList}>
                <Text style={styles.duplicateListTitle}>Duplicate emails:</Text>
                {duplicateEmails.map((email) => (
                  <Text key={email} style={styles.duplicateEmail}>
                    • {email}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.previewHeading}>Players to Add</Text>
          <Text style={styles.previewSummary}>
            {isCheckingDuplicates
              ? 'Checking for duplicates...'
              : uniquePlayers.length > 0
                ? `${uniquePlayers.length} players will be added to the squad`
                : 'No unique players to add'}
          </Text>

          {isCheckingDuplicates ? (
            <View style={styles.centeredBlock}>
              <ActivityIndicator color="#1E6FE8" size="large" />
              <Text style={styles.centeredCopy}>Checking for duplicates...</Text>
            </View>
          ) : uniquePlayers.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.centeredCopy}>
                All players in the CSV already exist in this squad.{'\n'}
                Try uploading a different file.
              </Text>
            </View>
          ) : (
            uniquePlayers.map((player) => (
              <View
                key={`${player.email}-${player.firstName}-${player.lastName}`}
                style={styles.playerCard}
              >
                <View style={styles.playerHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {player.firstName?.[0] ?? ''}
                      {player.lastName?.[0] ?? ''}
                    </Text>
                  </View>
                  <View style={styles.playerHeaderCopy}>
                    <Text style={styles.playerName}>
                      {player.firstName} {player.lastName}
                    </Text>
                    {player.number != null && (
                      <View style={styles.jerseyTag}>
                        <Text style={styles.jerseyTagText}>#{player.number}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.playerDetails}>
                  <Text style={styles.detailSectionTitle}>Contact Information</Text>
                  <Text style={styles.detailLine}>{player.email}</Text>
                  {player.phone != null && (
                    <Text style={styles.detailLine}>{player.phone}</Text>
                  )}

                  {(player.emergencyEmail != null ||
                    player.emergencyPhone != null) && (
                    <>
                      <Text style={[styles.detailSectionTitle, styles.detailGap]}>
                        Emergency Contact
                      </Text>
                      {player.emergencyEmail != null && (
                        <Text style={styles.detailLine}>
                          {player.emergencyEmail}
                        </Text>
                      )}
                      {player.emergencyPhone != null && (
                        <Text style={styles.detailLine}>
                          {player.emergencyPhone}
                        </Text>
                      )}
                    </>
                  )}

                  {(player.heightCm != null ||
                    player.weightKg != null ||
                    player.birthYear != null) && (
                    <>
                      <Text style={[styles.detailSectionTitle, styles.detailGap]}>
                        Physical Details
                      </Text>
                      {player.heightCm != null && (
                        <Text style={styles.detailLine}>
                          {player.heightCm} cm
                        </Text>
                      )}
                      {player.weightKg != null && (
                        <Text style={styles.detailLine}>
                          {player.weightKg} kg
                        </Text>
                      )}
                      {player.birthYear != null && (
                        <Text style={styles.detailLine}>
                          Born {player.birthYear}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              </View>
            ))
          )}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleCancelPreview}
              style={({ hovered, pressed }) => [
                styles.secondaryButton,
                (hovered || pressed) && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>{cancelButtonText}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isUploading || uniquePlayers.length === 0}
              onPress={() => {
                void handleConfirmUpload();
              }}
              style={({ hovered, pressed }) => [
                styles.primaryButton,
                styles.actionButton,
                (isUploading || uniquePlayers.length === 0) &&
                  styles.buttonDisabled,
                uniquePlayers.length > 0 &&
                  !isUploading &&
                  (hovered || pressed) &&
                  styles.buttonPressed,
              ]}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{confirmButtonText}</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 36,
    letterSpacing: 1.2,
    color: '#123A7A',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(18, 58, 122, 0.72)',
    marginBottom: 24,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#B42318',
    marginBottom: 16,
  },
  guide: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.22)',
    padding: 16,
    marginBottom: 24,
  },
  guideTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
    marginBottom: 8,
  },
  guideBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(18, 58, 122, 0.8)',
  },
  primaryButton: {
    backgroundColor: '#1E6FE8',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  secondaryLink: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryLinkText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  warningBox: {
    backgroundColor: 'rgba(180, 83, 9, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.35)',
    padding: 16,
    marginBottom: 20,
  },
  warningTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  warningBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(146, 64, 14, 0.9)',
    marginBottom: 8,
  },
  duplicateList: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.2)',
    padding: 12,
    marginTop: 4,
  },
  duplicateListTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#92400E',
    marginBottom: 6,
  },
  duplicateEmail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(146, 64, 14, 0.9)',
    marginBottom: 2,
  },
  previewHeading: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    color: '#123A7A',
    marginBottom: 4,
  },
  previewSummary: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.65)',
    marginBottom: 16,
  },
  centeredBlock: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F7FAFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.15)',
  },
  centeredCopy: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(18, 58, 122, 0.65)',
    textAlign: 'center',
    marginTop: 12,
  },
  playerCard: {
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    overflow: 'hidden',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.12)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E6FE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  playerHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  playerName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#123A7A',
  },
  jerseyTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E6FE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  jerseyTagText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  playerDetails: {
    padding: 14,
  },
  detailSectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#123A7A',
    marginBottom: 6,
  },
  detailGap: {
    marginTop: 14,
  },
  detailLine: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.8)',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.35)',
    backgroundColor: '#F7FAFF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#1E6FE8',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
