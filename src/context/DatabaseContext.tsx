import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { initDatabase, isBibleSeeded, seedBible } from '../database/database';
import type { KJVBook } from '../database/types';

type Status = 'loading' | 'seeding' | 'ready' | 'error';

interface DatabaseContextValue {
  status: Status;
  progress: number;
  error: string | null;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  status: 'loading',
  progress: 0,
  error: null,
  refreshKey: 0,
  triggerRefresh: () => {},
});

async function loadBibleData(): Promise<KJVBook[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const asset = Asset.fromModule(require('../../assets/data/bible_kjv.kjv'));
  await asset.downloadAsync();
  const json = await FileSystem.readAsStringAsync(asset.localUri!);
  return JSON.parse(json) as KJVBook[];
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        const seeded = await isBibleSeeded();

        if (!seeded) {
          setStatus('seeding');
          const bibleData = await loadBibleData();
          await seedBible(bibleData, (pct) => setProgress(pct));
        }

        setStatus('ready');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setStatus('error');
      }
    }

    setup();
  }, []);

  return (
    <DatabaseContext.Provider value={{ status, progress, error, refreshKey, triggerRefresh }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
