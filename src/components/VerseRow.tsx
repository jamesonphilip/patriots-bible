import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, HIGHLIGHT_COLORS } from '../theme';
import { VerseAnnotations } from '../database/types';
import NoteModal from './NoteModal';
import ColorPicker from './ColorPicker';

interface VerseRowProps {
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  annotations: VerseAnnotations;
  fontSize: number;
  onToggleBookmark: () => void;
  onSetHighlight: (color: string) => void;
  onRemoveHighlight: () => void;
  onSaveNote: (text: string) => void;
  onDeleteNote: () => void;
}

export default function VerseRow({
  bookId, bookName, chapter, verse, text, annotations, fontSize,
  onToggleBookmark, onSetHighlight, onRemoveHighlight, onSaveNote, onDeleteNote,
}: VerseRowProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const verseRef = `${bookName} ${chapter}:${verse}`;

  const highlightBg = annotations.highlight
    ? HIGHLIGHT_COLORS.find(c => c.key === annotations.highlight)?.bg ?? undefined
    : undefined;

  const handleTap = useCallback(() => {
    if (actionMenuVisible) {
      setActionMenuVisible(false);
      return;
    }
    // Single tap: show action menu
    setActionMenuVisible(true);
  }, [actionMenuVisible]);

  const handleLongPress = useCallback(() => {
    setShowColorPicker(true);
  }, []);

  const handleBookmarkPress = useCallback(() => {
    setActionMenuVisible(false);
    onToggleBookmark();
  }, [onToggleBookmark]);

  const handleHighlightPress = useCallback(() => {
    setActionMenuVisible(false);
    setShowColorPicker(true);
  }, []);

  const handleNotePress = useCallback(() => {
    setActionMenuVisible(false);
    setShowNoteModal(true);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={handleTap}
        onLongPress={handleLongPress}
        activeOpacity={0.85}
        style={[styles.container, highlightBg ? { backgroundColor: highlightBg } : null]}
      >
        <View style={styles.verseNumCol}>
          <Text style={styles.verseNum}>{verse}</Text>
          {annotations.isBookmarked && <View style={styles.bookmarkDot} />}
          {annotations.note && <View style={styles.noteDot} />}
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.verseText, { fontSize, lineHeight: fontSize * 1.65 }]}>
            {text}
          </Text>

          {actionMenuVisible && (
            <View style={styles.actionMenu}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleBookmarkPress}>
                <Text style={[styles.actionIcon, annotations.isBookmarked && styles.actionIconActive]}>
                  {annotations.isBookmarked ? '🔖' : '🔖'}
                </Text>
                <Text style={[styles.actionLabel, annotations.isBookmarked && styles.actionLabelActive]}>
                  {annotations.isBookmarked ? 'Unbookmark' : 'Bookmark'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleHighlightPress}>
                <Text style={styles.actionIcon}>🖊</Text>
                <Text style={styles.actionLabel}>Highlight</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleNotePress}>
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionLabel}>{annotations.note ? 'Edit Note' : 'Add Note'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {annotations.note && !actionMenuVisible && (
            <TouchableOpacity onPress={handleNotePress}>
              <Text style={styles.notePreview} numberOfLines={1}>
                📝 {annotations.note}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <ColorPicker
        visible={showColorPicker}
        currentColor={annotations.highlight}
        verseRef={verseRef}
        onSelect={onSetHighlight}
        onRemove={onRemoveHighlight}
        onClose={() => setShowColorPicker(false)}
      />

      <NoteModal
        visible={showNoteModal}
        verseRef={verseRef}
        verseText={text}
        initialNote={annotations.note ?? ''}
        onSave={onSaveNote}
        onDelete={() => {
          onDeleteNote();
          setShowNoteModal(false);
        }}
        onClose={() => setShowNoteModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  verseNumCol: {
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
    gap: 4,
  },
  verseNum: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.xs,
    color: Colors.gold,
  },
  bookmarkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.highlightBlueSolid,
  },
  textCol: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  verseText: {
    fontFamily: Typography.bibleFamily,
    color: Colors.text,
  },
  actionMenu: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    backgroundColor: Colors.navyMid,
    borderRadius: 10,
    padding: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionIconActive: {
    opacity: 0.7,
  },
  actionLabel: {
    fontFamily: Typography.uiFamily,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  actionLabelActive: {
    color: Colors.gold,
  },
  notePreview: {
    fontFamily: Typography.uiFamily,
    fontSize: Typography.xs,
    color: Colors.highlightBlueSolid,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});
