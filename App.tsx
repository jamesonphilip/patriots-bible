import React, { useEffect, useCallback } from 'react';
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

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { status } = useDatabase();
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const isReady = status === 'ready';

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
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
