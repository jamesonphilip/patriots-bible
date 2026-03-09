import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface NoteModalProps {
  visible: boolean;
  verseRef: string;
  verseText: string;
  initialNote: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function NoteModal({
  visible, verseRef, verseText, initialNote, onSave, onDelete, onClose,
}: NoteModalProps) {
  const [text, setText] = useState(initialNote);

  useEffect(() => {
    setText(initialNote);
  }, [initialNote, visible]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.ref}>{verseRef}</Text>
          <ScrollView style={styles.verseScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.verseText}>&ldquo;{verseText}&rdquo;</Text>
          </ScrollView>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Write your note here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            {initialNote ? (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, !text.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!text.trim()}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  ref: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.md,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  verseScroll: {
    maxHeight: 80,
    marginBottom: Spacing.md,
  },
  verseText: {
    fontFamily: Typography.bibleFamily,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  input: {
    backgroundColor: Colors.navyMid,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontFamily: Typography.uiFamily,
    fontSize: Typography.md,
    padding: Spacing.md,
    minHeight: 120,
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(220,53,69,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.4)',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.md,
    color: '#DC3545',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.gold,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.md,
    color: Colors.navy,
  },
});
