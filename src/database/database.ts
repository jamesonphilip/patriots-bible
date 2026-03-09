import * as SQLite from 'expo-sqlite';
import type { KJVBook } from './types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('patriots_bible.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
      testament TEXT NOT NULL,
      chapter_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE INDEX IF NOT EXISTS idx_verses_location ON verses(book_id, chapter, verse);

    CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
      text,
      content=verses,
      content_rowid=id
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(book_id, chapter, verse),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT 'gold',
      created_at INTEGER NOT NULL,
      UNIQUE(book_id, chapter, verse),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(book_id, chapter, verse),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function isBibleSeeded(): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = 'bible_seeded'"
  );
  return result?.value === '1';
}

const BOOK_ABBREVIATIONS: Record<string, string> = {
  Genesis: 'Gen', Exodus: 'Exo', Leviticus: 'Lev', Numbers: 'Num',
  Deuteronomy: 'Deu', Joshua: 'Jos', Judges: 'Jdg', Ruth: 'Rut',
  '1 Samuel': '1Sa', '2 Samuel': '2Sa', '1 Kings': '1Ki', '2 Kings': '2Ki',
  '1 Chronicles': '1Ch', '2 Chronicles': '2Ch', Ezra: 'Ezr', Nehemiah: 'Neh',
  Esther: 'Est', Job: 'Job', Psalms: 'Psa', Proverbs: 'Pro',
  Ecclesiastes: 'Ecc', 'Song of Solomon': 'Son', Isaiah: 'Isa', Jeremiah: 'Jer',
  Lamentations: 'Lam', Ezekiel: 'Eze', Daniel: 'Dan', Hosea: 'Hos',
  Joel: 'Joe', Amos: 'Amo', Obadiah: 'Oba', Jonah: 'Jon',
  Micah: 'Mic', Nahum: 'Nah', Habakkuk: 'Hab', Zephaniah: 'Zep',
  Haggai: 'Hag', Zechariah: 'Zec', Malachi: 'Mal',
  Matthew: 'Mat', Mark: 'Mar', Luke: 'Luk', John: 'Joh',
  Acts: 'Act', Romans: 'Rom', '1 Corinthians': '1Co', '2 Corinthians': '2Co',
  Galatians: 'Gal', Ephesians: 'Eph', Philippians: 'Phi', Colossians: 'Col',
  '1 Thessalonians': '1Th', '2 Thessalonians': '2Th', '1 Timothy': '1Ti',
  '2 Timothy': '2Ti', Titus: 'Tit', Philemon: 'Phm', Hebrews: 'Heb',
  James: 'Jam', '1 Peter': '1Pe', '2 Peter': '2Pe', '1 John': '1Jo',
  '2 John': '2Jo', '3 John': '3Jo', Jude: 'Jud', Revelation: 'Rev',
};

const NT_BOOKS = new Set([
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John',
  '2 John', '3 John', 'Jude', 'Revelation',
]);

export async function seedBible(
  bibleData: KJVBook[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const database = await getDatabase();

  const total = bibleData.length;

  for (let bookIndex = 0; bookIndex < bibleData.length; bookIndex++) {
    const kjvBook = bibleData[bookIndex];
    const bookId = bookIndex + 1;
    const testament = NT_BOOKS.has(kjvBook.book) ? 'NT' : 'OT';
    const abbr = BOOK_ABBREVIATIONS[kjvBook.book] ?? kjvBook.book.slice(0, 3);

    await database.runAsync(
      'INSERT OR IGNORE INTO books (id, name, abbreviation, testament, chapter_count) VALUES (?, ?, ?, ?, ?)',
      [bookId, kjvBook.book, abbr, testament, kjvBook.chapters.length]
    );

    for (const chapter of kjvBook.chapters) {
      for (const verseData of chapter.verses) {
        const result = await database.runAsync(
          'INSERT OR IGNORE INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)',
          [bookId, chapter.chapter, verseData.verse, verseData.text]
        );
        if (result.lastInsertRowId) {
          await database.runAsync(
            'INSERT INTO verses_fts(rowid, text) VALUES (?, ?)',
            [result.lastInsertRowId, verseData.text]
          );
        }
      }
    }

    if (onProgress) {
      onProgress(Math.round(((bookIndex + 1) / total) * 100));
    }
  }

  await database.runAsync(
    "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('bible_seeded', '1')"
  );
}
