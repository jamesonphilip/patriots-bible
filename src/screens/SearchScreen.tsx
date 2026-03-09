import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { searchVerses } from '../database/queries';
import type { Verse } from '../database/types';

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return <Text style={styles.resultText}>{text}</Text>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <Text style={styles.resultText}>{text}</Text>;
  return (
    <Text style={styles.resultText}>
      {text.slice(0, idx)}
      <Text style={styles.highlight}>{text.slice(idx, idx + lowerQuery.length)}</Text>
      {text.slice(idx + lowerQuery.length)}
    </Text>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim() || text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchVerses(text.trim());
        setResults(r);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search the Bible…"
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      )}

      {!loading && searched && (
        <Text style={styles.resultCount}>
          {results.length === 0
            ? 'No results found'
            : `${results.length} result${results.length !== 1 ? 's' : ''}${results.length === 200 ? ' (showing first 200)' : ''}`}
        </Text>
      )}

      {!loading && !searched && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyText}>Search by word, phrase, or topic</Text>
          <Text style={styles.emptySubtext}>e.g. "love one another" · "faith" · "prayer"</Text>
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No verses found for &ldquo;{query}&rdquo;</Text>
          <Text style={styles.emptySubtext}>Try a different word or phrase</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.ref}>
              {item.bookName} {item.chapter}:{item.verse}
            </Text>
            {highlightMatch(item.text, query)}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xl,
    color: Colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Typography.uiFamily,
    fontSize: Typography.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  clearBtn: {
    padding: Spacing.sm,
  },
  clearBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  resultCount: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  resultCard: {
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ref: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  resultText: {
    fontFamily: Typography.bibleFamily,
    fontSize: Typography.md,
    color: Colors.text,
    lineHeight: 24,
  },
  highlight: {
    backgroundColor: Colors.highlightGold,
    color: Colors.goldLight,
    fontFamily: Typography.bibleFamilyBold,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
