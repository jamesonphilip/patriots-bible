import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDatabase } from '../database/database';

interface SubscriptionContextValue {
  isPremium: boolean;
  isLoading: boolean;
  paywallVisible: boolean;
  showPaywall: () => void;
  hidePaywall: () => void;
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  isPremium: false,
  isLoading: true,
  paywallVisible: false,
  showPaywall: () => {},
  hidePaywall: () => {},
  purchasePremium: async () => {},
  restorePurchases: async () => false,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM app_meta WHERE key = 'subscription_status'"
      );
      setIsPremium(result?.value === 'premium');
    } catch {
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const showPaywall = useCallback(() => setPaywallVisible(true), []);
  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  const purchasePremium = useCallback(async () => {
    // TODO: Replace with real IAP via expo-in-app-purchases or RevenueCat
    // Trigger StoreKit purchase here, then call setSubscribed() on success
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('subscription_status', 'premium')"
    );
    setIsPremium(true);
    setPaywallVisible(false);
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // TODO: Call StoreKit restore and verify receipts
    await loadStatus();
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'subscription_status'"
    );
    const restored = result?.value === 'premium';
    if (restored) setPaywallVisible(false);
    return restored;
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ isPremium, isLoading, paywallVisible, showPaywall, hidePaywall, purchasePremium, restorePurchases }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
