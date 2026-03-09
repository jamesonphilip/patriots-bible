import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, HIGHLIGHT_COLORS } from '../theme';
import { getHighlights, removeHighlight } from '../database/queries';
import { useDatabase } from '../context/DatabaseContext';
import type { Highlight } from '../database/types';

function getHighlightStyle(colorKey: string) {
  const found = HIGHLIGHT_COLORS.find(c => c.key === colorKey);
  return {
    bg: found?.bg ?? Colors.highlightGold,
    solid: found?.solid ?? Colors.highlightGoldSolid,
    label: found?.label ?? 'Gold',
  };
}

export default function HighlightsScreen() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { triggerRefresh } = useDatabase();

  const load = useCallback(() => {
    getHighlights().then(setHighlights);
  }, []);

  useFocusEffect(load);

  const handleDelete = (highlight: Highlight) => {
    Alert.alert(
      'Remove Highlight',
      `Remove highlight from ${highlight.bookName} ${highlight.chapter}:${highlight.verse}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeHighlight(highlight.bookId, highlight.chapter, highlight.verse);
            triggerRefresh();
            load();
          },
        },
      ]
    );
  };

  // Group by color
  const grouped = HIGHLIGHT_COLORS.map(({ key, label, solid }) => ({
    colorKey: key,
    label,
    solid,
    items: highlights.filter(h => h.color === key),
  })).filter(g => g.items.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Highlights</Text>
        {highlights.length > 0 && (
          <Text style={styles.count}>{highlights.length}</Text>
        )}
      </View>

      {highlights.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🖊</Text>
          <Text style={styles.emptyTitle}>No highlights yet</Text>
          <Text style={styles.emptyText}>
            Long-press any verse while reading to highlight it
          </Text>
        </View>
      ) : (
        <FlatList
          data={highlights}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const { bg, solid, label } = getHighlightStyle(item.color);
            return (
              <View style={[styles.card, { backgroundColor: bg, borderLeftColor: solid }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.refRow}>
                    <View style={[styles.colorDot, { backgroundColor: solid }]} />
                    <Text style={[styles.ref, { color: solid }]}>
                      {item.bookName} {item.chapter}:{item.verse}
                    </Text>
                    <Text style={[styles.colorLabel, { color: solid }]}>{label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.verseText} numberOfLines={3}>
                  {item.verseText}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xl,
    color: Colors.white,
    flex: 1,
  },
  count: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.gold,
    backgroundColor: Colors.navyMid,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.md,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ref: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
  },
  colorLabel: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    opacity: 0.7,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  deleteBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  verseText: {
    fontFamily: Typography.bibleFamily,
    fontSize: Typography.md,
    color: Colors.text,
    lineHeight: 24,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.lg,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
