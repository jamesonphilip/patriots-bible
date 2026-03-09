/**
 * Standalone seed script for development.
 * Run with: npx ts-node scripts/seed-bible.ts
 *
 * Downloads the KJV Bible from aruljohn/Bible-kjv and writes it
 * to a local JSON file that can be bundled as an asset.
 */

import * as fs from 'fs';
import * as path from 'path';

const KJV_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/Books.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'kjv.json');

async function main() {
  console.log('Downloading KJV Bible...');
  const response = await fetch(KJV_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const books = Array.isArray(data) ? data : data.books ?? [];

  console.log(`Downloaded ${books.length} books`);

  // Normalize to our expected shape
  const normalized = books.map((book: any, index: number) => ({
    id: index + 1,
    book: book.book ?? book.name,
    chapters: (book.chapters ?? []).map((ch: any) => ({
      chapter: ch.chapter ?? ch.id,
      verses: (ch.verses ?? []).map((v: any) => ({
        verse: v.verse ?? v.id,
        text: v.text,
      })),
    })),
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 0));
  console.log(`Saved to ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
