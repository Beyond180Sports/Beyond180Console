import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getSessionProfile,
  signInWithEmailPassword,
  signOut as sharedSignOut,
  signUpWithEmailPassword,
  supabase,
  type AuthProfile,
} from '@beyond180/shared';

type AuthContextValue = {
  profile: AuthProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { profile: nextProfile } = await getSessionProfile();
        if (!cancelled) {
          setProfile(nextProfile);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      void getSessionProfile()
        .then(({ profile: nextProfile }) => {
          if (!cancelled) {
            setProfile(nextProfile);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setProfile(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { profile: nextProfile } = await signInWithEmailPassword(email, password);
    setProfile(nextProfile);
  }

  async function signUp(email: string, password: string) {
    const { profile: nextProfile } = await signUpWithEmailPassword(email, password);
    setProfile(nextProfile);
  }

  async function signOut() {
    await sharedSignOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
