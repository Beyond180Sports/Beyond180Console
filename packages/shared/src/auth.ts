import type { Session, User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types/db';
import { supabase } from './supabase';

export type AuthProfile = User;

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<{ session: Session; profile: AuthProfile }> {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error('Sign in failed. Please try again.');
  }

  const profile = await fetchUserProfile(data.user);
  return { session: data.session, profile };
}

function placeholderNames(email: string): { firstName: string; lastName: string } {
  const localPart = email.split('@')[0]?.trim() || 'User';
  const [first, ...rest] = localPart.split(/[._+\-]+/).filter(Boolean);
  return {
    firstName: first ? first.charAt(0).toUpperCase() + first.slice(1) : 'User',
    lastName: rest.length > 0 ? rest.join(' ') : '',
  };
}

function isAlreadyRegisteredError(error: { message?: string; code?: string }): boolean {
  const message = (error.message ?? '').toLowerCase();
  return (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already exists') ||
    error.code === 'user_already_exists'
  );
}

async function ensureUserProfile(
  authUser: AuthUser,
  email: string,
): Promise<AuthProfile> {
  const { data: existingById, error: byIdError } = await supabase
    .from('User')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (byIdError) {
    throw byIdError;
  }

  if (existingById) {
    return existingById;
  }

  const { data: existingByEmail, error: byEmailError } = await supabase
    .from('User')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (byEmailError) {
    throw byEmailError;
  }

  if (existingByEmail) {
    return existingByEmail;
  }

  const now = new Date().toISOString();
  const { firstName, lastName } = placeholderNames(email);

  const { data: profile, error: insertError } = await supabase
    .from('User')
    .insert({
      id: authUser.id,
      email,
      firstName,
      lastName,
      onboarded: false,
      plan: 'FREE',
      createdAt: now,
      updatedAt: now,
    })
    .select('*')
    .single();

  if (insertError) {
    const message = insertError.message?.toLowerCase() ?? '';
    if (
      insertError.code === '42501' ||
      message.includes('row-level security') ||
      message.includes('permission denied')
    ) {
      throw new Error(
        'Account auth was created, but saving your profile was blocked by database permissions. Ask an admin to allow authenticated inserts on the User table (id = auth.uid()).',
      );
    }
    throw insertError;
  }

  return profile;
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
): Promise<{ session: Session; profile: AuthProfile }> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    throw new Error('Email and password are required.');
  }

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error && isAlreadyRegisteredError(error)) {
    // Auth user may already exist from a previous partial signup. Complete login + profile.
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (signInError || !signInData.session || !signInData.user) {
      throw new Error(
        'An account with this email already exists. Sign in instead, or use a different email.',
      );
    }

    const profile = await ensureUserProfile(signInData.user, trimmedEmail);
    return { session: signInData.session, profile };
  }

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Account creation failed. Please try again.');
  }

  // Supabase may return a user with no identities when the email is taken and
  // confirmations are enabled (anti-enumeration). Treat that as already registered.
  if (!data.session && (data.user.identities?.length ?? 0) === 0) {
    throw new Error(
      'An account with this email already exists. Sign in instead, or use a different email.',
    );
  }

  if (!data.session) {
    throw new Error(
      'Account created. Check your email to confirm before signing in.',
    );
  }

  const profile = await ensureUserProfile(data.user, trimmedEmail);
  return { session: data.session, profile };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function fetchUserProfile(authUser: AuthUser): Promise<AuthProfile> {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  if (!authUser.email) {
    throw new Error('No matching user profile found.');
  }

  const { data: byEmail, error: emailError } = await supabase
    .from('User')
    .select('*')
    .eq('email', authUser.email)
    .maybeSingle();

  if (emailError) {
    throw emailError;
  }

  if (!byEmail) {
    throw new Error('No matching user profile found for this account.');
  }

  return byEmail;
}

export async function getSessionProfile(): Promise<{
  session: Session | null;
  profile: AuthProfile | null;
}> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  const session = data.session;
  if (!session?.user) {
    return { session: null, profile: null };
  }

  try {
    const profile = await fetchUserProfile(session.user);
    return { session, profile };
  } catch {
    return { session, profile: null };
  }
}

const DEFAULT_PASSWORD_RESET_API_URL = 'https://coach180.vercel.app';
const PASSWORD_RESET_RATE_LIMIT_MS = 60 * 1000;

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Request failed. Please try again.');
}

export function passwordResetRateLimitRemainingMs(lastResetTime: number): number {
  const elapsed = Date.now() - lastResetTime;
  return Math.max(0, PASSWORD_RESET_RATE_LIMIT_MS - elapsed);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    throw new Error('Please enter your email address first.');
  }

  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const isWeb = typeof window !== 'undefined';
  // On web, call same-origin /api/send-reset (Metro proxies to Coach180) to avoid CORS.
  const apiUrl = isWeb
    ? ''
    : configuredApiUrl || DEFAULT_PASSWORD_RESET_API_URL;
  const resetUrl = `${apiUrl}/api/send-reset`;

  const response = await withRetry(
    () =>
      fetch(resetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      }),
    2,
    500,
  );

  if (response.ok) {
    return;
  }

  if (response.status === 404) {
    throw new Error(
      'No account found with this email address. Please check your email or sign up for a new account.',
    );
  }

  if (response.status === 405) {
    throw new Error(
      'Password reset service is not properly configured. Please contact support.',
    );
  }

  if (response.status === 429) {
    throw new Error(
      'Please wait a moment before requesting another password reset.',
    );
  }

  if (response.status >= 500) {
    throw new Error(
      'There was a problem sending the reset email. Please try again later.',
    );
  }

  throw new Error('Unable to send reset email. Please try again.');
}
