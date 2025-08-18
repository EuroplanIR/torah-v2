import { useState, useEffect, useCallback } from 'react';
import { modularDataLoader } from '@/utils/modularDataLoader';
import { 
  BooksIndex, 
  BookMetadata, 
  ChapterFile, 
  VerseFile,
  Verse,
  CommentatorsIndex,
  HebrewLexicon,
  Parasha 
} from '@/types/torah';

interface UseModularTorahDataReturn {
  // Данные
  booksIndex: BooksIndex | null;
  currentBookMetadata: BookMetadata | null;
  currentChapter: ChapterFile | null;
  currentVerseFile: VerseFile | null; // Новый тип для загрузки отдельного стиха
  currentVerse: Verse | null;
  commentators: CommentatorsIndex | null;
  lexicon: HebrewLexicon | null;
  currentBookParashas: Parasha[];
  currentParasha: Parasha | null;
  
  // Состояние загрузки
  isLoading: boolean;
  error: string | null;
  progress: {
    loaded: number;
    total: number;
    currentOperation: string;
  };
  
  // Методы
  loadBook: (bookId: string) => Promise<void>;
  loadChapter: (bookId: string, chapter: number) => Promise<void>;
  loadVerse: (bookId: string, chapter: number, verse: number, parashaId?: string) => Promise<void>; // Новый метод
  navigateToVerse: (bookId: string, chapter: number, verse: number, parashaId?: string) => Promise<void>;
  getAvailableChapters: (bookId: string) => Promise<number[]>;
  getAvailableVerses: (bookId: string, chapter: number) => Promise<number[]>;
  getBookParashas: (bookId: string) => Promise<Parasha[]>;
  getParashaByChapter: (bookId: string, chapter: number, verse?: number) => Promise<Parasha | null>;
  getChaptersForParasha: (bookId: string, parashaId: string) => Promise<number[]>;
  searchWord: (hebrew: string) => Promise<any>;
  getWordTranslations: (hebrew: string) => Promise<any[]>;
  clearCache: () => void;
}

export const useModularTorahData = (): UseModularTorahDataReturn => {
  // Состояние данных
  const [booksIndex, setBooksIndex] = useState<BooksIndex | null>(null);
  const [currentBookMetadata, setCurrentBookMetadata] = useState<BookMetadata | null>(null);
  const [currentChapter, setCurrentChapter] = useState<ChapterFile | null>(null);
  const [currentVerseFile, setCurrentVerseFile] = useState<VerseFile | null>(null); // Новое состояние
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [commentators, setCommentators] = useState<CommentatorsIndex | null>(null);
  const [lexicon, setLexicon] = useState<HebrewLexicon | null>(null);
  const [currentBookParashas, setCurrentBookParashas] = useState<Parasha[]>([]);
  const [currentParasha, setCurrentParasha] = useState<Parasha | null>(null);
  
  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 3,
    currentOperation: 'Инициализация модульной системы...'
  });

  /**
   * Инициализация - загружаем базовые данные
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: 3, currentOperation: 'Загрузка индекса книг...' });

      // Загружаем индекс книг
      const books = await modularDataLoader.loadBooksIndex();
      setBooksIndex(books);
      setProgress({ loaded: 1, total: 3, currentOperation: 'Загрузка комментаторов...' });

      // Загружаем комментаторов
      const commentatorsData = await modularDataLoader.loadCommentators();
      setCommentators(commentatorsData);
      setProgress({ loaded: 2, total: 3, currentOperation: 'Загрузка лексикона...' });

      // Загружаем лексикон
      const lexiconData = await modularDataLoader.loadHebrewLexicon();
      setLexicon(lexiconData);
      setProgress({ loaded: 3, total: 3, currentOperation: 'Инициализация завершена' });

      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка инициализации модульной системы:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка инициализации');
      setIsLoading(false);
    }
  }, []);

  /**
   * Загружает метаданные книги
   */
  const loadBook = useCallback(async (bookId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: 1, currentOperation: `Загрузка метаданных ${bookId}...` });

      const metadata = await modularDataLoader.loadBookMetadata(bookId);
      setCurrentBookMetadata(metadata);
      
      setProgress({ loaded: 1, total: 1, currentOperation: `Метаданные ${bookId} загружены` });
      setIsLoading(false);
    } catch (err) {
      console.error(`Ошибка загрузки книги ${bookId}:`, err);
      setError(err instanceof Error ? err.message : `Ошибка загрузки книги ${bookId}`);
      setIsLoading(false);
    }
  }, []);

  /**
   * Загружает конкретную главу
   */
  const loadChapter = useCallback(async (bookId: string, chapter: number, parashaId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({ 
        loaded: 0, 
        total: 2, 
        currentOperation: `Загрузка ${bookId} главы ${chapter}...` 
      });

      // Загружаем метаданные книги если не загружены
      if (!currentBookMetadata || currentBookMetadata.book !== bookId) {
        const metadata = await modularDataLoader.loadBookMetadata(bookId);
        setCurrentBookMetadata(metadata);
        setProgress({ 
          loaded: 1, 
          total: 2, 
          currentOperation: `Загрузка главы ${chapter}...` 
        });
      }

      // Загружаем главу
      const chapterData = await modularDataLoader.loadChapter(bookId, chapter, parashaId);
      setCurrentChapter(chapterData);
      
      // Сбрасываем текущий стих
      setCurrentVerse(null);
      
      setProgress({ 
        loaded: 2, 
        total: 2, 
        currentOperation: `Глава ${chapter} загружена` 
      });
      setIsLoading(false);
    } catch (err) {
      console.error(`Ошибка загрузки главы ${bookId} ${chapter}:`, err);
      setError(err instanceof Error ? err.message : `Ошибка загрузки главы ${chapter}`);
      setIsLoading(false);
    }
  }, [currentBookMetadata]);

  /**
   * Находит паршу по номеру главы
   */
  const getParashaByChapter = useCallback(async (bookId: string, chapter: number, verse?: number): Promise<Parasha | null> => {
    try {
      return await modularDataLoader.getParashaByChapter(bookId, chapter, verse);
    } catch (err) {
      console.error(`Ошибка поиска парши для ${bookId} главы ${chapter}:`, err);
      return null;
    }
  }, []);

  /**
   * Загружает отдельный стих (новая структура)
   */
  const loadVerse = useCallback(async (bookId: string, chapter: number, verse: number, parashaId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: 2, currentOperation: `Загрузка стиха ${chapter}:${verse}...` });

      // Получаем паршу, если не указана
      let actualParashaId = parashaId;
      if (!actualParashaId) {
        const parasha = await getParashaByChapter(bookId, chapter);
        if (!parasha) {
          throw new Error(`Парша для главы ${chapter} не найдена`);
        }
        actualParashaId = parasha.id;
      }

      setProgress({ loaded: 1, total: 2, currentOperation: `Загрузка данных стиха...` });

      // Загружаем файл стиха
      const verseFile = await modularDataLoader.loadVerseFile(bookId, actualParashaId, chapter, verse);
      setCurrentVerseFile(verseFile);

      // Обновляем currentVerse для совместимости
      if (verseFile.words && verseFile.words.length > 0) {
        const verse_obj = {
          number: verseFile.verse,
          hebrew: verseFile.hebrew,
          russian: verseFile.hebrew.join(' '), // Временное решение
          words: verseFile.words,
          commentaries: verseFile.commentaries
        };
        setCurrentVerse(verse_obj);
      }

      setProgress({ loaded: 2, total: 2, currentOperation: `Стих загружен` });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading verse:', error);
      setError(`Ошибка загрузки стиха: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [getParashaByChapter]);

  /**
   * Навигация к конкретному стиху (ИСПРАВЛЕНО для новой структуры)
   */
  const navigateToVerse = useCallback(async (bookId: string, chapter: number, verse: number, parashaId?: string) => {
    try {
      console.log('🔄 navigateToVerse called:', bookId, chapter, verse, parashaId);
      
      // Используем новый метод loadVerse напрямую
      await loadVerse(bookId, chapter, verse, parashaId);
      
      console.log('✅ loadVerse completed successfully');
      
      // Определяем паршу если не указана
      if (!parashaId) {
        const parasha = await modularDataLoader.getParashaByChapter(bookId, chapter, verse);
        setCurrentParasha(parasha);
      }
    } catch (err) {
      console.error(`❌ Ошибка навигации к стиху ${bookId} ${chapter}:${verse}:`, err);
      setError(err instanceof Error ? err.message : 'Ошибка навигации');
    }
  }, [loadVerse]);

  /**
   * Получает доступные главы для книги
   */
  const getAvailableChapters = useCallback(async (bookId: string): Promise<number[]> => {
    try {
      return await modularDataLoader.getAvailableChapters(bookId);
    } catch (err) {
      console.error(`Ошибка получения глав для ${bookId}:`, err);
      return [];
    }
  }, []);

  /**
   * Получает доступные стихи для главы
   */
  const getAvailableVerses = useCallback(async (bookId: string, chapter: number, parashaId?: string): Promise<number[]> => {
    try {
      return await modularDataLoader.getAvailableVerses(bookId, chapter, parashaId);
    } catch (err) {
      console.error(`Ошибка получения стихов для ${bookId} главы ${chapter}:`, err);
      return [];
    }
  }, []);

  /**
   * Поиск слова в лексиконе
   */
  const searchWord = useCallback(async (hebrew: string) => {
    try {
      return await modularDataLoader.searchWord(hebrew);
    } catch (err) {
      console.error('Ошибка поиска слова:', err);
      return null;
    }
  }, []);

  /**
   * Получение переводов слова
   */
  const getWordTranslations = useCallback(async (hebrew: string) => {
    try {
      return await modularDataLoader.getWordTranslations(hebrew);
    } catch (err) {
      console.error('Ошибка получения переводов:', err);
      return [
        { meaning: 'ошибка загрузки', context: 'попробуйте позже', grammar: 'неопределено' }
      ];
    }
  }, []);

  /**
   * Получает парашот для книги
   */
  const getBookParashas = useCallback(async (bookId: string): Promise<Parasha[]> => {
    try {
      const parashas = await modularDataLoader.getBookParashas(bookId);
      setCurrentBookParashas(parashas);
      return parashas;
    } catch (err) {
      console.error(`Ошибка получения парашот для ${bookId}:`, err);
      return [];
    }
  }, []);

  /**
   * Получает главы для конкретной парши
   */
  const getChaptersForParasha = useCallback(async (bookId: string, parashaId: string): Promise<number[]> => {
    try {
      return await modularDataLoader.getChaptersForParasha(bookId, parashaId);
    } catch (err) {
      console.error(`Ошибка получения глав для парши ${parashaId}:`, err);
      return [];
    }
  }, []);

  /**
   * Очистка кэша
   */
  const clearCache = useCallback(() => {
    modularDataLoader.clearCache();
    // Сбрасываем состояние
    setBooksIndex(null);
    setCurrentBookMetadata(null);
    setCurrentChapter(null);
    setCurrentVerse(null);
    setCommentators(null);
    setLexicon(null);
    setCurrentBookParashas([]);
    setCurrentParasha(null);
    // Перезапускаем инициализацию
    initialize();
  }, [initialize]);



  // Инициализация при монтировании компонента
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // Данные
    booksIndex,
    currentBookMetadata,
    currentChapter,
    currentVerseFile, // Новое поле
    currentVerse,
    commentators,
    lexicon,
    currentBookParashas,
    currentParasha,
    
    // Состояние
    isLoading,
    error,
    progress,
    
    // Методы
    loadBook,
    loadChapter: (bookId: string, chapter: number, parashaId?: string) => loadChapter(bookId, chapter, parashaId),
    loadVerse, // Новый метод
    navigateToVerse,
    getAvailableChapters,
    getAvailableVerses,
    getBookParashas,
    getParashaByChapter,
    getChaptersForParasha,
    searchWord,
    getWordTranslations,
    clearCache
  };
};