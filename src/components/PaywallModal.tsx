import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { useSubscription } from '../context/SubscriptionContext';

const FEATURES = [
  { icon: '🔖', label: 'Save Bookmarks', desc: 'Mark verses to return to later' },
  { icon: '🖊', label: 'Highlight Scripture', desc: 'Color-code verses that speak to you' },
  { icon: '📝', label: 'Personal Notes', desc: 'Write reflections on any verse' },
];

export default function PaywallModal() {
  const { paywallVisible, hidePaywall, purchasePremium, restorePurchases } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await purchasePremium();
    } catch {
      Alert.alert('Purchase Failed', 'Could not complete your purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (!restored) {
        Alert.alert('No Purchase Found', 'We couldn\'t find a previous purchase on this account.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={hidePaywall}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Flag stripe accent */}
        <View style={styles.stripeBar}>
          <View style={[styles.stripe, { backgroundColor: Colors.red }]} />
          <View style={[styles.stripe, { backgroundColor: Colors.white }]} />
          <View style={[styles.stripe, { backgroundColor: Colors.navy }]} />
        </View>

        {/* Dismiss */}
        <TouchableOpacity style={styles.closeBtn} onPress={hidePaywall} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.eagle}>🦅</Text>

          <Text style={styles.title}>Unlock Patriot Premium</Text>
          <Text style={styles.subtitle}>
            Study God's Word your way — mark, highlight, and take notes as you read.
          </Text>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.icon} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Annual Plan</Text>
            <Text style={styles.price}>$4.99 / year</Text>
            <Text style={styles.priceSub}>Less than $0.42 / month</Text>
          </View>

          <TouchableOpacity
            style={[styles.unlockBtn, purchasing && styles.unlockBtnDisabled]}
            onPress={handlePurchase}
            disabled={purchasing || restoring}
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator color={Colors.navy} />
            ) : (
              <Text style={styles.unlockBtnText}>Unlock Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={purchasing || restoring}
          >
            {restoring ? (
              <ActivityIndicator color={Colors.gold} size="small" />
            ) : (
              <Text style={styles.restoreBtnText}>Restore Purchase</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={hidePaywall} disabled={purchasing || restoring}>
            <Text style={styles.laterText}>Continue Reading for Free</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  stripeBar: {
    flexDirection: 'row',
    height: 4,
  },
  stripe: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.xs,
  },
  closeBtnText: {
    color: Colors.textMuted,
    fontSize: 18,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  eagle: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xxxl,
    color: Colors.gold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  features: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.white,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  checkmark: {
    color: Colors.gold,
    fontSize: Typography.lg,
    fontFamily: Typography.uiFamilyBold,
  },
  priceCard: {
    width: '100%',
    backgroundColor: Colors.navyMid,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  priceLabel: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.xs,
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  price: {
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xxxl,
    color: Colors.white,
    marginBottom: 2,
  },
  priceSub: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  unlockBtn: {
    width: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  unlockBtnDisabled: {
    opacity: 0.6,
  },
  unlockBtnText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.lg,
    color: Colors.navy,
    letterSpacing: 0.5,
  },
  restoreBtn: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  restoreBtnText: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.gold,
    textDecorationLine: 'underline',
  },
  laterText: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    paddingVertical: Spacing.sm,
  },
});
