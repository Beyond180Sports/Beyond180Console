import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { SquadRecord } from '@beyond180/shared';
import { AuthProvider } from './src/auth/AuthContext';
import CreateAccountPage from './src/screens/CreateAccountPage';
import HomePage from './src/screens/HomePage';
import LoginPage from './src/screens/LoginPage';
import PowerAdminPage from './src/screens/PowerAdminPage';
import RosterLoaderPage from './src/screens/RosterLoaderPage';
import RosterUploadPage from './src/screens/RosterUploadPage';
import SportsAnalyticsPage from './src/screens/SportsAnalyticsPage';
import SquadAnalyticsPage from './src/screens/SquadAnalyticsPage';

type AppView =
  | 'home'
  | 'analytics'
  | 'powerAdmin'
  | 'rosterLoader'
  | 'login'
  | 'createAccount';

function ConsoleApp() {
  const [view, setView] = useState<AppView>('home');
  const [selectedSquad, setSelectedSquad] = useState<SquadRecord | null>(null);
  const [rosterSquad, setRosterSquad] = useState<SquadRecord | null>(null);
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#1E6FE8" />
      </View>
    );
  }

  return (
    <>
      {selectedSquad ? (
        <SquadAnalyticsPage
          squad={selectedSquad}
          onBack={() => setSelectedSquad(null)}
        />
      ) : rosterSquad ? (
        <RosterUploadPage
          squad={rosterSquad}
          onBack={() => setRosterSquad(null)}
          onSuccess={() => setRosterSquad(null)}
        />
      ) : view === 'createAccount' ? (
        <CreateAccountPage
          onBack={() => setView('home')}
          onSignIn={() => setView('login')}
          onSuccess={() => setView('home')}
        />
      ) : view === 'login' ? (
        <LoginPage
          onBack={() => setView('home')}
          onSuccess={() => setView('home')}
          onCreateAccount={() => setView('createAccount')}
        />
      ) : view === 'analytics' ? (
        <SportsAnalyticsPage
          onSelectSquad={setSelectedSquad}
          onBack={() => setView('home')}
        />
      ) : view === 'rosterLoader' ? (
        <RosterLoaderPage
          onSelectSquad={setRosterSquad}
          onBack={() => setView('powerAdmin')}
        />
      ) : view === 'powerAdmin' ? (
        <PowerAdminPage
          onBack={() => setView('home')}
          onSelectFunction={(id) => {
            if (id === 'rosterLoader') {
              setView('rosterLoader');
            }
          }}
        />
      ) : (
        <HomePage
          onOpenSportsAnalytics={() => setView('analytics')}
          onOpenPowerAdmin={() => setView('powerAdmin')}
          onOpenSignIn={() => setView('login')}
          onOpenCreateAccount={() => setView('createAccount')}
        />
      )}
      <StatusBar style="dark" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConsoleApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
