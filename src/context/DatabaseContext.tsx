import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initDatabase, isBibleSeeded, seedBible } from '../database/database';
import type { KJVBook } from '../database/types';

type Status = 'loading' | 'downloading' | 'seeding' | 'ready' | 'error';

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

const KJV_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/Books.json';

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
          setStatus('downloading');
          const response = await fetch(KJV_URL);
          if (!response.ok) throw new Error('Failed to download Bible data');
          const data: KJVBook[] = await response.json();

          setStatus('seeding');
          await seedBible(data, (pct) => setProgress(pct));
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
