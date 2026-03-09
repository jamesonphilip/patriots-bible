import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { DatabaseProvider, useDatabase } from './src/context/DatabaseContext';
import { ReaderProvider } from './src/context/ReaderContext';
import Navigation from './src/navigation';
import SetupScreen from './src/screens/SetupScreen';
import { Colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { status } = useDatabase();
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  // Hide splash as soon as fonts resolve (success or error) — never stay blank
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Fallback: always show something after 3s even if fonts are still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const isReady = status === 'ready';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {isReady ? (
        <ReaderProvider>
          <Navigation />
        </ReaderProvider>
      ) : (
        <SetupScreen />
      )}
    </View>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
});
