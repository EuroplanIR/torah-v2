// Torah Data Types - Модульная архитектура

// Недельная глава (Парша)
export interface Parasha {
  id: string;          // "beresheet", "noach", etc.
  number: number;      // 1, 2, 3...
  hebrew: string;      // "בראשית", "נח"
  russian: string;     // "Берешит", "Ноах"
  english: string;     // "Beresheet", "Noach"
  startChapter: number;
  endChapter: number;
  startVerse?: number;  // Опционально, если парша не начинается с первого стиха
  endVerse?: number;    // Опционально, если парша не заканчивается последним стихом
  theme: string;       // Основная тема недельной главы
  description: string; // Краткое описание содержания
}

// Метаданные парши
export interface ParashaMetadata {
  id: string;
  availableChapters: number[];
  totalChapters: number;
  totalVerses: number;
  lastUpdated: string;
  dataVersion: string;
}

export interface Translation {
  meaning: string;
  context?: string;
  grammar?: string;
  frequency?: 'common' | 'rare' | 'unique' | 'very_common' | 'uncommon';
  etymology?: string;
  relatedWords?: string[];
  sources?: string[]; // Источники комментариев
}

export interface HebrewWord {
  position: number; // Номер слова в стихе (начиная с 1)
  hebrew: string;
  transliteration: string;
  root?: string; // שורש - Hebrew root
  translations: Translation[];
  morphology?: {
    partOfSpeech: string;
    gender?: 'masculine' | 'feminine';
    number?: 'singular' | 'plural' | 'dual';
    person?: '1st' | '2nd' | '3rd';
    tense?: 'past' | 'present' | 'future' | 'imperative';
    binyan?: string; // Hebrew verb form
    construct?: boolean; // Смихут
    definiteness?: 'definite' | 'indefinite';
    function?: string; // Дополнительная грамматическая функция
  };
  occurrences?: number; // How many times this word appears in Torah
  frequency?: 'very_common' | 'common' | 'uncommon' | 'rare' | 'unique';
  firstOccurrence?: {
    book: string;
    chapter: number;
    verse: number;
  };
}

export interface Verse {
  number: number;
  hebrew: string[];
  russian: string;
  english?: string;
  words: HebrewWord[];
  cantillation?: string[]; // Trope marks
  commentaries?: {
    rashi?: string;
    ramban?: string;
    ibn_ezra?: string;
    sforno?: string;
    kli_yakar?: string;
    [key: string]: string | undefined;
  };
}

export interface Chapter {
  number: number;
  verses: Verse[];
  title?: string;
  theme?: string;
  summary?: string;
  totalVerses?: number;
  metadata?: {
    availableVerses: number[];
    lastUpdated: string;
    dataVersion: string;
    completeness: {
      verses: string;
      words: string;
      translations: string;
      commentaries: string;
    };
  };
}

// Новые типы для модульной архитектуры

// Файл отдельного стиха (новая структура)
export interface VerseFile {
  book: string;
  parasha: string;
  chapter: number;
  verse: number;
  hebrew: string[];
  russian?: string;  // Русский перевод всего стиха
  words: HebrewWord[];
  commentaries?: {
    rashi?: string;
    ramban?: string;
    ibn_ezra?: string;
    sforno?: string;
    kli_yakar?: string;
    [key: string]: string | undefined;
  };
  metadata: {
    lastUpdated: string;
    dataVersion: string;
    completeness: {
      words: string;
      translations: string;
      commentaries: string;
    };
    convertedFrom?: string;
  };
}
export interface ChapterFile {
  book: string;
  parasha?: string;    // ID недельной главы
  chapter: number;
  title?: string;
  theme?: string;
  totalVerses: number;
  verses: Verse[];
  metadata: Chapter['metadata'];
}

export interface BookMetadata {
  book: string;
  english: string;
  hebrew: string;
  russian: string;
  transliteration: string;
  description?: string;
  totalChapters: number;
  totalVerses: number;
  parashas: Parasha[];              // Список недельных глав в книге
  chapters: Array<{
    number: number;
    verses: number;
    title?: string;
    theme?: string;
    parasha?: string;               // К какой парше принадлежит глава
  }>;
  availableChapters: number[];
  availableParashas: string[];      // Доступные ID парашот
  lastUpdated: string;
  dataVersion: string;
}

export interface BooksIndex {
  books: Array<{
    id: string;
    english: string;
    hebrew: string;
    russian: string;
    transliteration: string;
    chapters: number;
    totalVerses: number;
    totalParashas: number;          // Общее количество парашот в книге
    availableParashas: string[];    // Доступные ID парашот
    description?: string;
  }>;
  totalBooks: number;
  totalChapters: number;
  totalVerses: number;
  totalParashas: number;            // Общее количество парашот в Торе
  lastUpdated: string;
}

export interface CommentatorsIndex {
  commentators: Array<{
    id: string;
    name: string;
    hebrewName: string;
    fullName: string;
    years: string;
    description: string;
    style: string;
    language: string;
  }>;
}

export interface TorahBook {
  hebrew: string;
  russian: string;
  english: string;
  transliteration: string;
  chapters: Chapter[];
  wordCount?: number;
  uniqueWords?: number;
}

export interface Commentary {
  author: string;
  text: string;
  category: 'peshat' | 'remez' | 'drash' | 'sod' | 'halacha' | 'aggada';
  verse?: {
    book: string;
    chapter: number;
    verse: number;
  };
  language: 'hebrew' | 'russian' | 'english';
}

export interface HebrewLexicon {
  [key: string]: {
    root: string;
    meanings: Translation[];
    frequency: number;
    relatedWords: string[];
    biblicalUsage: Array<{
      book: string;
      chapter: number;
      verse: number;
      form: string;
    }>;
  };
}

export interface TorahDatabase {
  books: TorahBook[];
  lexicon: HebrewLexicon;
  commentaries: Commentary[];
  metadata: {
    totalWords: number;
    uniqueWords: number;
    lastUpdated: string;
    sources: string[];
  };
}