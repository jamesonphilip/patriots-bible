import { getDatabase } from './database';
import type { Book, Verse, Bookmark, Highlight, Note, VerseAnnotations } from './types';

// ─── Books ───────────────────────────────────────────────────────────────────

export async function getBooks(): Promise<Book[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; name: string; abbreviation: string; testament: string; chapter_count: number;
  }>('SELECT id, name, abbreviation, testament, chapter_count FROM books ORDER BY id');

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    abbreviation: r.abbreviation,
    testament: r.testament as 'OT' | 'NT',
    chapterCount: r.chapter_count,
  }));
}

export async function getBook(bookId: number): Promise<Book | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{
    id: number; name: string; abbreviation: string; testament: string; chapter_count: number;
  }>('SELECT id, name, abbreviation, testament, chapter_count FROM books WHERE id = ?', [bookId]);
  if (!r) return null;
  return { id: r.id, name: r.name, abbreviation: r.abbreviation, testament: r.testament as 'OT' | 'NT', chapterCount: r.chapter_count };
}

// ─── Verses ──────────────────────────────────────────────────────────────────

export async function getChapterVerses(bookId: number, chapter: number): Promise<Verse[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; book_id: number; name: string; chapter: number; verse: number; text: string;
  }>(
    `SELECT v.id, v.book_id, b.name, v.chapter, v.verse, v.text
     FROM verses v JOIN books b ON b.id = v.book_id
     WHERE v.book_id = ? AND v.chapter = ?
     ORDER BY v.verse`,
    [bookId, chapter]
  );
  return rows.map(r => ({
    id: r.id,
    bookId: r.book_id,
    bookName: r.name,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text,
  }));
}

export async function searchVerses(query: string): Promise<Verse[]> {
  const db = await getDatabase();
  const sanitized = query.replace(/['"]/g, '').trim();
  if (!sanitized) return [];

  const rows = await db.getAllAsync<{
    id: number; book_id: number; name: string; chapter: number; verse: number; text: string;
  }>(
    `SELECT v.id, v.book_id, b.name, v.chapter, v.verse, v.text
     FROM verses v
     JOIN books b ON b.id = v.book_id
     JOIN verses_fts fts ON fts.rowid = v.id
     WHERE verses_fts MATCH ?
     ORDER BY b.id, v.chapter, v.verse
     LIMIT 200`,
    [sanitized + '*']
  );
  return rows.map(r => ({
    id: r.id,
    bookId: r.book_id,
    bookName: r.name,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text,
  }));
}

// ─── Annotations (batch load for a chapter) ──────────────────────────────────

export async function getChapterAnnotations(
  bookId: number,
  chapter: number
): Promise<Map<number, VerseAnnotations>> {
  const db = await getDatabase();

  const bookmarks = await db.getAllAsync<{ verse: number }>(
    'SELECT verse FROM bookmarks WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );
  const highlights = await db.getAllAsync<{ verse: number; color: string }>(
    'SELECT verse, color FROM highlights WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );
  const notes = await db.getAllAsync<{ verse: number; text: string }>(
    'SELECT verse, text FROM notes WHERE book_id = ? AND chapter = ?',
    [bookId, chapter]
  );

  const map = new Map<number, VerseAnnotations>();
  for (const b of bookmarks) {
    const e = map.get(b.verse) ?? { isBookmarked: false, highlight: null, note: null };
    e.isBookmarked = true;
    map.set(b.verse, e);
  }
  for (const h of highlights) {
    const e = map.get(h.verse) ?? { isBookmarked: false, highlight: null, note: null };
    e.highlight = h.color;
    map.set(h.verse, e);
  }
  for (const n of notes) {
    const e = map.get(n.verse) ?? { isBookmarked: false, highlight: null, note: null };
    e.note = n.text;
    map.set(n.verse, e);
  }
  return map;
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function getBookmarks(): Promise<Bookmark[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; book_id: number; name: string; chapter: number; verse: number; text: string; created_at: number;
  }>(
    `SELECT bk.id, bk.book_id, b.name, bk.chapter, bk.verse, v.text, bk.created_at
     FROM bookmarks bk
     JOIN books b ON b.id = bk.book_id
     JOIN verses v ON v.book_id = bk.book_id AND v.chapter = bk.chapter AND v.verse = bk.verse
     ORDER BY bk.created_at DESC`
  );
  return rows.map(r => ({
    id: r.id, bookId: r.book_id, bookName: r.name,
    chapter: r.chapter, verse: r.verse, verseText: r.text, createdAt: r.created_at,
  }));
}

export async function isBookmarked(bookId: number, chapter: number, verse: number): Promise<boolean> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
  return !!r;
}

export async function addBookmark(bookId: number, chapter: number, verse: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO bookmarks (book_id, chapter, verse, created_at) VALUES (?, ?, ?, ?)',
    [bookId, chapter, verse, Date.now()]
  );
}

export async function removeBookmark(bookId: number, chapter: number, verse: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM bookmarks WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
}

// ─── Highlights ───────────────────────────────────────────────────────────────

export async function getHighlights(): Promise<Highlight[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; book_id: number; name: string; chapter: number; verse: number; text: string; color: string; created_at: number;
  }>(
    `SELECT h.id, h.book_id, b.name, h.chapter, h.verse, v.text, h.color, h.created_at
     FROM highlights h
     JOIN books b ON b.id = h.book_id
     JOIN verses v ON v.book_id = h.book_id AND v.chapter = h.chapter AND v.verse = h.verse
     ORDER BY h.created_at DESC`
  );
  return rows.map(r => ({
    id: r.id, bookId: r.book_id, bookName: r.name,
    chapter: r.chapter, verse: r.verse, verseText: r.text,
    color: r.color, createdAt: r.created_at,
  }));
}

export async function setHighlight(
  bookId: number, chapter: number, verse: number, color: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO highlights (book_id, chapter, verse, color, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(book_id, chapter, verse) DO UPDATE SET color = excluded.color`,
    [bookId, chapter, verse, color, Date.now()]
  );
}

export async function removeHighlight(bookId: number, chapter: number, verse: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM highlights WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNotes(): Promise<Note[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number; book_id: number; name: string; chapter: number; verse: number; text: string; note_text: string; created_at: number; updated_at: number;
  }>(
    `SELECT n.id, n.book_id, b.name, n.chapter, n.verse, v.text, n.text as note_text, n.created_at, n.updated_at
     FROM notes n
     JOIN books b ON b.id = n.book_id
     JOIN verses v ON v.book_id = n.book_id AND v.chapter = n.chapter AND v.verse = n.verse
     ORDER BY n.updated_at DESC`
  );
  return rows.map(r => ({
    id: r.id, bookId: r.book_id, bookName: r.name,
    chapter: r.chapter, verse: r.verse, verseText: r.text,
    text: r.note_text, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

export async function getNote(bookId: number, chapter: number, verse: number): Promise<string | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{ text: string }>(
    'SELECT text FROM notes WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
  return r?.text ?? null;
}

export async function saveNote(
  bookId: number, chapter: number, verse: number, text: string
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO notes (book_id, chapter, verse, text, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(book_id, chapter, verse) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`,
    [bookId, chapter, verse, text, now, now]
  );
}

export async function deleteNote(bookId: number, chapter: number, verse: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM notes WHERE book_id = ? AND chapter = ? AND verse = ?',
    [bookId, chapter, verse]
  );
}
