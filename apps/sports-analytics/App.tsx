import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { SquadRecord } from '@beyond180/shared';
import SportsAnalyticsPage from './src/screens/SportsAnalyticsPage';
import SquadAnalyticsPage from './src/screens/SquadAnalyticsPage';

export default function App() {
  const [selectedSquad, setSelectedSquad] = useState<SquadRecord | null>(null);
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
      ) : (
        <SportsAnalyticsPage onSelectSquad={setSelectedSquad} />
      )}
      <StatusBar style="dark" />
    </>
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
