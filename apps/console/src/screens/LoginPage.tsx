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
import {
  passwordResetRateLimitRemainingMs,
  requestPasswordReset,
} from '@beyond180/shared';
import { useAuth } from '../auth/AuthContext';

const dragonflyLogo = require('../../assets/dragonfly-logo.png');

type LoginPageProps = {
  onBack: () => void;
  onSuccess: () => void;
  onCreateAccount: () => void;
};

export default function LoginPage({
  onBack,
  onSuccess,
  onCreateAccount,
}: LoginPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [lastResetTime, setLastResetTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      setInfo(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      setInfo(null);
      return;
    }

    const remainingMs = passwordResetRateLimitRemainingMs(lastResetTime);
    if (remainingMs > 0) {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      setError(
        `You can request another password reset in ${remainingSeconds} seconds.`,
      );
      setInfo(null);
      return;
    }

    setResetLoading(true);
    setError(null);
    setInfo(null);
    try {
      await requestPasswordReset(email);
      setLastResetTime(Date.now());
      setInfo(
        'Password reset email sent. Please check your email for instructions to reset your password.',
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to send reset email.';
      if (
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('fetch') ||
        message.toLowerCase().includes('failed to fetch')
      ) {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.',
        );
      } else {
        setError(message);
      }
    } finally {
      setResetLoading(false);
    }
  }

  const busy = submitting || resetLoading;

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
          <Text style={styles.title}>Sign In</Text>
        </View>
        <Text style={styles.subtitle}>
          Use your Beyond180 account email and password.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          editable={!busy}
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
          autoComplete="password"
          editable={!busy}
          onChangeText={setPassword}
          onSubmitEditing={() => {
            void handleSubmit();
          }}
          placeholder="Password"
          placeholderTextColor="rgba(18, 58, 122, 0.35)"
          secureTextEntry
          style={styles.input}
          textContentType="password"
          value={password}
        />

        {error != null && <Text style={styles.error}>{error}</Text>}
        {info != null && <Text style={styles.info}>{info}</Text>}

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => {
            void handleSubmit();
          }}
          style={({ hovered, pressed }) => [
            styles.submit,
            (hovered || pressed) && styles.submitPressed,
            busy && styles.submitDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Sign In</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onCreateAccount}
          style={styles.secondaryLink}
        >
          <Text style={styles.secondaryLinkText}>Create Account</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => {
            void handleResetPassword();
          }}
          style={[styles.secondaryLink, styles.resetLink, busy && styles.submitDisabled]}
        >
          <Text style={styles.resetLinkText}>
            {resetLoading ? 'Sending reset email…' : 'Forgot your password?'}
          </Text>
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
  info: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#0E7A3D',
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
  resetLink: {
    marginTop: 14,
  },
  resetLinkText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(18, 58, 122, 0.72)',
  },
});
