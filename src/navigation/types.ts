export type RootTabParamList = {
  ReadTab: undefined;
  SearchTab: undefined;
  BookmarksTab: undefined;
  HighlightsTab: undefined;
  NotesTab: undefined;
};

export type ReadStackParamList = {
  BookList: undefined;
  ChapterList: { bookId: number; bookName: string };
  Reader: { bookId: number; bookName: string; chapter: number; scrollToVerse?: number };
};
