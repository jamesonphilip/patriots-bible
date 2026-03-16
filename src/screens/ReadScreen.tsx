import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { getBooks, getChapterVerses, getChapterAnnotations,
  addBookmark, removeBookmark, setHighlight, removeHighlight,
  saveNote, deleteNote } from '../database/queries';
import { useDatabase } from '../context/DatabaseContext';
import { useReader } from '../context/ReaderContext';
import type { Book, Verse, VerseAnnotations } from '../database/types';
import VerseRow from '../components/VerseRow';

type View_ = 'books' | 'chapters' | 'reader';

export default function ReadScreen() {
  const { refreshKey, triggerRefresh } = useDatabase();
  const { fontSize, increaseFontSize, decreaseFontSize } = useReader();

  const [view, setView] = useState<View_>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [annotations, setAnnotations] = useState<Map<number, VerseAnnotations>>(new Map());
  const [loading, setLoading] = useState(false);

  // Load books
  useEffect(() => {
    getBooks().then(setBooks);
  }, [refreshKey]);

  // Load chapter when selected
  useEffect(() => {
    if (!selectedBook || !selectedChapter) return;
    setLoading(true);
    Promise.all([
      getChapterVerses(selectedBook.id, selectedChapter),
      getChapterAnnotations(selectedBook.id, selectedChapter),
    ]).then(([v, a]) => {
      setVerses(v);
      setAnnotations(a);
      setLoading(false);
    });
  }, [selectedBook, selectedChapter]);

  const reloadAnnotations = useCallback(() => {
    if (!selectedBook || !selectedChapter) return;
    getChapterAnnotations(selectedBook.id, selectedChapter).then(setAnnotations);
    triggerRefresh();
  }, [selectedBook, selectedChapter, triggerRefresh]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setView('chapters');
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setView('reader');
  };

  const handleBack = () => {
    if (view === 'reader') { setView('chapters'); setVerses([]); }
    else if (view === 'chapters') { setView('books'); setSelectedBook(null); }
  };

  // Verse action handlers
  const handleToggleBookmark = async (verse: number) => {
    if (!selectedBook || !selectedChapter) return;
    const ann = annotations.get(verse) ?? { isBookmarked: false, highlight: null, note: null };
    if (ann.isBookmarked) await removeBookmark(selectedBook.id, selectedChapter, verse);
    else await addBookmark(selectedBook.id, selectedChapter, verse);
    reloadAnnotations();
  };

  const handleSetHighlight = async (verse: number, color: string) => {
    if (!selectedBook || !selectedChapter) return;
    await setHighlight(selectedBook.id, selectedChapter, verse, color);
    reloadAnnotations();
  };

  const handleRemoveHighlight = async (verse: number) => {
    if (!selectedBook || !selectedChapter) return;
    await removeHighlight(selectedBook.id, selectedChapter, verse);
    reloadAnnotations();
  };

  const handleSaveNote = async (verse: number, text: string) => {
    if (!selectedBook || !selectedChapter) return;
    await saveNote(selectedBook.id, selectedChapter, verse, text);
    reloadAnnotations();
  };

  const handleDeleteNote = async (verse: number) => {
    if (!selectedBook || !selectedChapter) return;
    await deleteNote(selectedBook.id, selectedChapter, verse);
    reloadAnnotations();
  };

  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');

  const chapterCount = selectedBook?.chapterCount ?? 0;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {view !== 'books' && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {view === 'books' && 'Holy Bible'}
          {view === 'chapters' && selectedBook?.name}
          {view === 'reader' && `${selectedBook?.name} ${selectedChapter}`}
        </Text>
        {view === 'reader' && (
          <View style={styles.fontControls}>
            <TouchableOpacity style={styles.fontBtn} onPress={decreaseFontSize}>
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fontBtn} onPress={increaseFontSize}>
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Book List */}
      {view === 'books' && (
        <ScrollView contentContainerStyle={styles.bookListContainer}>
          <BookSection title="★  Old Testament" books={otBooks} onSelect={handleBookSelect} />
          <BookSection title="★  New Testament" books={ntBooks} onSelect={handleBookSelect} />
        </ScrollView>
      )}

      {/* Chapter Grid */}
      {view === 'chapters' && (
        <FlatList
          data={chapters}
          keyExtractor={(item) => String(item)}
          numColumns={5}
          contentContainerStyle={styles.chapterGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chapterBtn}
              onPress={() => handleChapterSelect(item)}
            >
              <Text style={styles.chapterBtnText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Reader */}
      {view === 'reader' && (
        <>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.gold} size="large" />
            </View>
          ) : (
            <FlatList
              data={verses}
              keyExtractor={(item) => String(item.verse)}
              contentContainerStyle={styles.verseList}
              renderItem={({ item }) => {
                const ann = annotations.get(item.verse) ?? { isBookmarked: false, highlight: null, note: null };
                return (
                  <VerseRow
                    bookId={item.bookId}
                    bookName={item.bookName}
                    chapter={item.chapter}
                    verse={item.verse}
                    text={item.text}
                    annotations={ann}
                    fontSize={fontSize}
                    onToggleBookmark={() => handleToggleBookmark(item.verse)}
                    onSetHighlight={(color) => handleSetHighlight(item.verse, color)}
                    onRemoveHighlight={() => handleRemoveHighlight(item.verse)}
                    onSaveNote={(text) => handleSaveNote(item.verse, text)}
                    onDeleteNote={() => handleDeleteNote(item.verse)}
                  />
                );
              }}
              ListFooterComponent={() =>
                selectedBook && selectedChapter && selectedChapter < chapterCount ? (
                  <TouchableOpacity
                    style={styles.nextChapterBtn}
                    onPress={() => handleChapterSelect(selectedChapter + 1)}
                  >
                    <Text style={styles.nextChapterText}>
                      Next — Chapter {selectedChapter + 1} →
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

function BookSection({ title, books, onSelect }: {
  title: string;
  books: Book[];
  onSelect: (book: Book) => void;
}) {
  return (
    <View style={styles.testamentSection}>
      <Text style={styles.testamentTitle}>{title}</Text>
      <View style={styles.bookGrid}>
        {books.map(book => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookBtn}
            onPress={() => onSelect(book)}
          >
            <Text style={styles.bookBtnText} numberOfLines={2}>{book.name}</Text>
            <Text style={styles.bookChapterCount}>{book.chapterCount} ch</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
    borderBottomWidth: 2,
    borderBottomColor: Colors.red,
    backgroundColor: Colors.navy,
  },
  backBtn: {
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.gold,
    lineHeight: 30,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Typography.bibleFamilyBold,
    fontSize: Typography.xl,
    color: Colors.white,
  },
  fontControls: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  fontBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  fontBtnText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.xs,
    color: Colors.gold,
  },
  bookListContainer: {
    paddingVertical: Spacing.md,
  },
  testamentSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  testamentTitle: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.sm,
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  bookBtn: {
    width: '30%',
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
    minHeight: 64,
    justifyContent: 'center',
  },
  bookBtnText: {
    fontFamily: Typography.uiFamilyMedium,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  bookChapterCount: {
    fontFamily: Typography.uiFamily,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chapterGrid: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  chapterBtn: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    maxWidth: 60,
    backgroundColor: Colors.navyLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterBtnText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseList: {
    paddingBottom: Spacing.xxxl,
  },
  nextChapterBtn: {
    margin: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.navyMid,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  nextChapterText: {
    fontFamily: Typography.uiFamilyBold,
    fontSize: Typography.md,
    color: Colors.gold,
  },
});
