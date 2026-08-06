import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';

const dragonflyLogo = require('../../assets/dragonfly-logo.png');
const MIN_PASSWORD_LENGTH = 6;

type CreateAccountPageProps = {
  onBack: () => void;
  onSignIn: () => void;
  onSuccess: () => void;
};

export default function CreateAccountPage({
  onBack,
  onSignIn,
  onSuccess,
}: CreateAccountPageProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password || !confirmPassword) {
      setError('Enter your email and password.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signUp(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>← Beyond180 Sports</Text>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.brandRow}>
          <Image
            source={dragonflyLogo}
            style={styles.brandLogo}
            resizeMode="contain"
            accessibilityLabel="Beyond180 Sports logo"
          />
          <Text style={styles.title}>Create Account</Text>
        </View>
        <Text style={styles.subtitle}>
          Create a Beyond180 account with your email and password.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="rgba(18, 58, 122, 0.35)"
          style={styles.input}
          textContentType="emailAddress"
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="rgba(18, 58, 122, 0.35)"
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={password}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          onChangeText={setConfirmPassword}
          onSubmitEditing={() => {
            void handleSubmit();
          }}
          placeholder="Confirm password"
          placeholderTextColor="rgba(18, 58, 122, 0.35)"
          secureTextEntry
          style={styles.input}
          textContentType="newPassword"
          value={confirmPassword}
        />

        {error != null && <Text style={styles.error}>{error}</Text>}

        <Pressable
          accessibilityRole="button"
          disabled={submitting}
          onPress={() => {
            void handleSubmit();
          }}
          style={({ hovered, pressed }) => [
            styles.submit,
            (hovered || pressed) && styles.submitPressed,
            submitting && styles.submitDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onSignIn}
          style={styles.secondaryLink}
        >
          <Text style={styles.secondaryLinkText}>Already have an account? Sign In</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  backText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#1E6FE8',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    letterSpacing: 1.5,
    color: '#123A7A',
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(18, 58, 122, 0.72)',
    marginBottom: 28,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#123A7A',
    marginBottom: 8,
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
    marginBottom: 18,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#B42318',
    marginBottom: 14,
  },
  submit: {
    marginTop: 8,
    backgroundColor: '#1E6FE8',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  secondaryLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#1E6FE8',
  },
});
