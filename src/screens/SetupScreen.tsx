import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme';
import { useDatabase } from '../context/DatabaseContext';

export default function SetupScreen() {
  const { status, progress, error } = useDatabase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Flag stripe header */}
      <View style={styles.flagStripe}>
        <View style={styles.stripeRed} />
        <View style={styles.stripeWhite} />
        <View style={styles.stripeBlue} />
      </View>

      <View style={styles.content}>
        {/* Stars row */}
        <Text style={styles.stars}>★  ★  ★  ★  ★</Text>

        {/* Shield / Cross icon rendered with text art */}
        <View style={styles.iconContainer}>
          <Text style={styles.crossIcon}>✝</Text>
        </View>

        <Text style={styles.title}>The Patriot's Bible</Text>
        <Text style={styles.tagline}>Faith. Freedom. Truth.</Text>

        <View style={styles.statusContainer}>
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.statusText}>Initializing…</Text>
            </>
          )}

          {status === 'seeding' && (
            <>
              <ActivityIndicator size="large" color={Colors.gold} />
              <Text style={styles.statusText}>Building your Bible… {progress}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </>
          )}

          {status === 'error' && (
            <>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>Setup failed</Text>
              <Text style={styles.subText}>{error}</Text>
              <Text style={styles.subText}>Please check your internet connection and restart the app.</Text>
            </>
          )}
        </View>

        <Text style={styles.edition}>King James Version · Patriot Edition</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.navyMid,
    borderWidth: 3,
    borderColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  crossIcon: {
    fontSize: 52,
    color: Colors.gold,
  },
  title: {
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xxxl,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.md,
    color: Colors.gold,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  statusContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 100,
  },
  statusText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.md,
    color: Colors.text,
    textAlign: 'center',
  },
  subText: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  progressBar: {
    width: 220,
    height: 6,
    backgroundColor: Colors.navyMid,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.red,
    borderRadius: 3,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.lg,
    color: '#DC3545',
  },
  edition: {
    position: 'absolute',
    bottom: Spacing.xl,
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  flagStripe: {
    flexDirection: 'row',
    height: 6,
  },
  stripeRed: {
    flex: 1,
    backgroundColor: Colors.red,
  },
  stripeWhite: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  stripeBlue: {
    flex: 1,
    backgroundColor: Colors.navyMid,
  },
  stars: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.lg,
    color: Colors.gold,
    letterSpacing: 4,
    marginBottom: Spacing.xl,
  },
});
