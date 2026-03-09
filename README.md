# The Patriot's Bible — Patriot Edition

**Faith. Freedom. Truth.**

Full KJV Bible app for iOS & Android. Built with React Native + Expo.

---

## Quick Start

```bash
cd patriots-bible
npm install         # already done
npx expo start      # scan QR with Expo Go app
```

**First launch:** The app will download the full KJV from GitHub (~3 MB, one-time) and seed it into a local SQLite database. After that it runs 100% offline.

---

## Features

| Feature | How to use |
|---|---|
| **Read** | Books → Chapters → Verses |
| **Bookmark** | Tap a verse → "Bookmark" |
| **Highlight** | Long-press a verse → pick color |
| **Note** | Tap a verse → "Add Note" |
| **Search** | Full-text search across all 31K+ verses |
| **Font size** | A- / A+ buttons in reader header |

---

## Project Structure

```
patriots-bible/
├── App.tsx                          # Entry, font loading, DB setup gate
├── src/
│   ├── context/
│   │   ├── DatabaseContext.tsx      # DB init, seeding state
│   │   └── ReaderContext.tsx        # Font size state
│   ├── database/
│   │   ├── database.ts              # SQLite init + seed logic
│   │   ├── queries.ts               # All DB queries
│   │   └── types.ts                 # TypeScript types
│   ├── navigation/
│   │   ├── index.tsx                # Bottom tab navigator
│   │   └── types.ts                 # Nav param types
│   ├── screens/
│   │   ├── SetupScreen.tsx          # First-launch download/seed UI
│   │   ├── ReadScreen.tsx           # Books → Chapters → Reader
│   │   ├── SearchScreen.tsx         # Full-text search
│   │   ├── BookmarksScreen.tsx      # All bookmarks
│   │   ├── HighlightsScreen.tsx     # All highlights
│   │   └── NotesScreen.tsx          # All notes
│   ├── components/
│   │   ├── VerseRow.tsx             # Individual verse with actions
│   │   ├── ColorPicker.tsx          # Highlight color selector
│   │   └── NoteModal.tsx            # Note editor sheet
│   └── theme/index.ts               # Colors, typography, spacing
├── scripts/seed-bible.ts            # Dev utility to pre-download KJV
├── app.json                         # Expo config
└── eas.json                         # EAS Build config
```

---

## App Store Build

### Prerequisites
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Update `app.json`:
   - Set your real `extra.eas.projectId`
   - iOS: configure your Apple team/bundle ID
   - Android: configure your package name

### Assets to Replace
- `assets/images/icon.png` — 1024×1024 app icon (shield/eagle with cross, gold on navy)
- `assets/images/splash.png` — 1242×2688 splash screen
- `assets/images/adaptive-icon.png` — 1024×1024 Android adaptive icon foreground

### iOS Build
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android Build
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Design Tokens

| Token | Value |
|---|---|
| Navy (bg) | `#0A1628` |
| Gold (accent) | `#C9A84C` |
| White | `#FFFFFF` |
| Bible font | Playfair Display (serif) |
| UI font | Inter (sans-serif) |

---

## Bundle ID
- iOS: `com.patriotbible.app`
- Android: `com.patriotbible.app`
