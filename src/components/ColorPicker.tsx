import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, HIGHLIGHT_COLORS } from '../theme';

interface ColorPickerProps {
  visible: boolean;
  currentColor: string | null;
  verseRef: string;
  onSelect: (color: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function ColorPicker({
  visible, currentColor, verseRef, onSelect, onRemove, onClose,
}: ColorPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Highlight — {verseRef}</Text>

          <View style={styles.colorRow}>
            {HIGHLIGHT_COLORS.map(({ key, label, solid, bg }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.colorBtn,
                  { backgroundColor: bg, borderColor: solid },
                  currentColor === key && styles.colorBtnActive,
                ]}
                onPress={() => { onSelect(key); onClose(); }}
              >
                <View style={[styles.colorDot, { backgroundColor: solid }]} />
                <Text style={[styles.colorLabel, { color: solid }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentColor && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => { onRemove(); onClose(); }}>
              <Text style={styles.removeBtnText}>Remove Highlight</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.md,
    color: Colors.gold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  colorBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  colorBtnActive: {
    borderWidth: 3,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorLabel: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.xs,
  },
  removeBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  removeBtnText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
});
