import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReaderContextValue {
  fontSize: number;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ReaderContext = createContext<ReaderContextValue>({
  fontSize: 18,
  setFontSize: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
});

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState(18);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(Math.min(32, Math.max(12, size)));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSizeState(prev => Math.min(32, prev + 2));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeState(prev => Math.max(12, prev - 2));
  }, []);

  return (
    <ReaderContext.Provider value={{ fontSize, setFontSize, increaseFontSize, decreaseFontSize }}>
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  return useContext(ReaderContext);
}
