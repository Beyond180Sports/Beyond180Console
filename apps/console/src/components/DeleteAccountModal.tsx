import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { deleteUserAccount } from '@beyond180/shared';

const EXPECTED_CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';

type DeleteAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
  userEmail: string;
  userId: string;
};

export default function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
  userEmail,
  userId,
}: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isDeleting) {
      return;
    }
    setStep('warning');
    setConfirmationText('');
    setError(null);
    onClose();
  }

  async function handleDeleteAccount() {
    if (confirmationText !== EXPECTED_CONFIRMATION_TEXT) {
      setError('Please type the confirmation text exactly as shown.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteUserAccount(userId, userEmail);
      if (!result.success) {
        throw result.error ?? new Error('Failed to delete account');
      }

      setStep('warning');
      setConfirmationText('');
      onDeleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while deleting your account. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Delete Account</Text>
            <Pressable
              accessibilityRole="button"
              disabled={isDeleting}
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'warning' ? (
              <>
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>
                    Warning: This action cannot be undone
                  </Text>
                  <Text style={styles.warningBody}>
                    Deleting your account is permanent. Please read the
                    consequences below carefully.
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>What will be deleted</Text>
                {[
                  {
                    title: 'Your profile and personal information',
                    detail:
                      'Including your name, email, avatar, and account settings.',
                  },
                  {
                    title: 'Team associations',
                    detail:
                      'You will be removed from all teams where you are listed as staff or a fan.',
                  },
                  {
                    title: 'Pending team requests',
                    detail: 'All pending requests to join teams will be cancelled.',
                  },
                  {
                    title: 'Player record ownership',
                    detail:
                      'You will be unlinked from player records; the records remain for team history.',
                  },
                  {
                    title: 'Authentication credentials',
                    detail:
                      'Your auth account will be deleted. You will no longer be able to sign in with this email.',
                  },
                ].map((item) => (
                  <View key={item.title} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <View style={styles.bulletCopy}>
                      <Text style={styles.bulletTitle}>{item.title}</Text>
                      <Text style={styles.bulletDetail}>{item.detail}</Text>
                    </View>
                  </View>
                ))}

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setError(null);
                    setStep('confirm');
                  }}
                  style={({ hovered, pressed }) => [
                    styles.dangerButton,
                    (hovered || pressed) && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.dangerButtonText}>
                    I understand, continue with deletion
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleClose}
                  style={({ hovered, pressed }) => [
                    styles.secondaryButton,
                    (hovered || pressed) && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Final Confirmation</Text>
                <Text style={styles.confirmCopy}>
                  To permanently delete your account and all associated data,
                  type the following text exactly as shown:
                </Text>

                <View style={styles.confirmCodeBox}>
                  <Text style={styles.confirmCode}>{EXPECTED_CONFIRMATION_TEXT}</Text>
                </View>

                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!isDeleting}
                  onChangeText={setConfirmationText}
                  placeholder="Type the confirmation text"
                  placeholderTextColor="rgba(18, 58, 122, 0.35)"
                  style={styles.input}
                  value={confirmationText}
                />

                {error != null && <Text style={styles.error}>{error}</Text>}

                <Pressable
                  accessibilityRole="button"
                  disabled={
                    confirmationText !== EXPECTED_CONFIRMATION_TEXT || isDeleting
                  }
                  onPress={() => {
                    void handleDeleteAccount();
                  }}
                  style={({ hovered, pressed }) => [
                    styles.dangerButton,
                    (confirmationText !== EXPECTED_CONFIRMATION_TEXT ||
                      isDeleting) &&
                      styles.dangerButtonDisabled,
                    confirmationText === EXPECTED_CONFIRMATION_TEXT &&
                      !isDeleting &&
                      (hovered || pressed) &&
                      styles.buttonPressed,
                  ]}
                >
                  {isDeleting ? (
                    <View style={styles.deletingRow}>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text style={styles.dangerButtonText}>Deleting Account…</Text>
                    </View>
                  ) : (
                    <Text style={styles.dangerButtonText}>
                      Permanently Delete My Account
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={isDeleting}
                  onPress={() => {
                    setError(null);
                    setStep('warning');
                  }}
                  style={({ hovered, pressed }) => [
                    styles.secondaryButton,
                    (hovered || pressed) && styles.buttonPressed,
                    isDeleting && styles.dangerButtonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Go Back</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 58, 122, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    maxHeight: '90%',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.12)',
  },
  headerTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    color: '#B42318',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeButtonText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#1E6FE8',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  warningBox: {
    backgroundColor: 'rgba(180, 35, 24, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(180, 35, 24, 0.22)',
    padding: 16,
    marginBottom: 24,
  },
  warningTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#B42318',
    marginBottom: 8,
  },
  warningBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(180, 35, 24, 0.9)',
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
    color: '#123A7A',
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B42318',
    marginTop: 6,
    marginRight: 12,
  },
  bulletCopy: {
    flex: 1,
  },
  bulletTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
    marginBottom: 4,
  },
  bulletDetail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(18, 58, 122, 0.72)',
  },
  confirmCopy: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(18, 58, 122, 0.8)',
    marginBottom: 16,
  },
  confirmCodeBox: {
    backgroundColor: '#F7FAFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  confirmCode: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#123A7A',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.28)',
    backgroundColor: '#F7FAFF',
    color: '#123A7A',
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#B42318',
    marginBottom: 14,
  },
  dangerButton: {
    backgroundColor: '#B42318',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: 12,
  },
  dangerButtonDisabled: {
    opacity: 0.45,
  },
  dangerButtonText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  deletingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: '#F7FAFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.22)',
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
    color: '#123A7A',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
