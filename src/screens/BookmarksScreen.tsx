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
import { Colors, Typography, Spacing, Radius } from '../theme';
import { getBookmarks, removeBookmark } from '../database/queries';
import { useDatabase } from '../context/DatabaseContext';
import type { Bookmark } from '../database/types';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const { triggerRefresh } = useDatabase();

  const load = useCallback(() => {
    getBookmarks().then(setBookmarks);
  }, []);

  useFocusEffect(load);

  const handleDelete = async (bookmark: Bookmark) => {
    Alert.alert('Remove Bookmark', `Remove bookmark for ${bookmark.bookName} ${bookmark.chapter}:${bookmark.verse}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeBookmark(bookmark.bookId, bookmark.chapter, bookmark.verse);
          triggerRefresh();
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        {bookmarks.length > 0 && (
          <Text style={styles.count}>{bookmarks.length}</Text>
        )}
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyText}>
            Tap any verse while reading to bookmark it
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.bookmark}>
                  <Text style={styles.bookmarkIcon}>🔖</Text>
                  <Text style={styles.ref}>
                    {item.bookName} {item.chapter}:{item.verse}
                  </Text>
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
          )}
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
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bookmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  ref: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.gold,
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
