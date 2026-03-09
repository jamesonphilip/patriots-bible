export interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
  chapterCount: number;
}

export interface Verse {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Bookmark {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  createdAt: number;
}

export interface Highlight {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  color: string;
  createdAt: number;
}

export interface Note {
  id: number;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface VerseAnnotations {
  isBookmarked: boolean;
  highlight: string | null;
  note: string | null;
}

export interface KJVBook {
  book: string;
  chapters: KJVChapter[];
}

export interface KJVChapter {
  chapter: number;
  verses: KJVVerse[];
}

export interface KJVVerse {
  verse: number;
  text: string;
}
