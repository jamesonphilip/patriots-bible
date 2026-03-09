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
import { getNotes, saveNote, deleteNote } from '../database/queries';
import { useDatabase } from '../context/DatabaseContext';
import type { Note } from '../database/types';
import NoteModal from '../components/NoteModal';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { triggerRefresh } = useDatabase();

  const load = useCallback(() => {
    getNotes().then(setNotes);
  }, []);

  useFocusEffect(load);

  const handleDelete = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Delete your note on ${note.bookName} ${note.chapter}:${note.verse}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(note.bookId, note.chapter, note.verse);
            triggerRefresh();
            load();
          },
        },
      ]
    );
  };

  const handleSave = async (text: string) => {
    if (!editingNote) return;
    await saveNote(editingNote.bookId, editingNote.chapter, editingNote.verse, text);
    triggerRefresh();
    load();
    setEditingNote(null);
  };

  const handleDeleteFromModal = async () => {
    if (!editingNote) return;
    await deleteNote(editingNote.bookId, editingNote.chapter, editingNote.verse);
    triggerRefresh();
    load();
    setEditingNote(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        {notes.length > 0 && (
          <Text style={styles.count}>{notes.length}</Text>
        )}
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptyText}>
            Tap a verse while reading and choose &ldquo;Add Note&rdquo;
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setEditingNote(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.ref}>
                  📝 {item.bookName} {item.chapter}:{item.verse}
                </Text>
                <View style={styles.headerRight}>
                  <Text style={styles.date}>{formatDate(item.updatedAt)}</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.verseText} numberOfLines={2}>
                &ldquo;{item.verseText}&rdquo;
              </Text>

              <View style={styles.divider} />

              <Text style={styles.noteText} numberOfLines={3}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {editingNote && (
        <NoteModal
          visible={!!editingNote}
          verseRef={`${editingNote.bookName} ${editingNote.chapter}:${editingNote.verse}`}
          verseText={editingNote.verseText}
          initialNote={editingNote.text}
          onSave={handleSave}
          onDelete={handleDeleteFromModal}
          onClose={() => setEditingNote(null)}
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
    borderLeftColor: Colors.highlightBlueSolid,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ref: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.highlightBlueSolid,
    flex: 1,
  },
  date: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    color: Colors.textMuted,
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
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  noteText: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.md,
    color: Colors.text,
    lineHeight: 22,
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
