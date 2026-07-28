import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import HomePage from './src/screens/HomePage';
import SectionPlaceholder from './src/screens/SectionPlaceholder';
import type { AppSection } from './src/types/navigation';

export default function App() {
  const [section, setSection] = useState<AppSection>('home');
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
      {section === 'home' && <HomePage onNavigate={setSection} />}
      {section === 'coach180' && (
        <SectionPlaceholder
          title="Coach180"
          description="Coach tools and athlete development live here. This is a placeholder for the Coach180 section."
          onBack={() => setSection('home')}
        />
      )}
      {section === 'sports-analytics' && (
        <SectionPlaceholder
          title="Sports Analytics"
          description="Analytics dashboards and performance insights live here. This is a placeholder for the Sports Analytics section."
          onBack={() => setSection('home')}
        />
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
