import { useState, useEffect, useCallback } from 'react';
import { TorahDatabase, TorahBook, HebrewLexicon } from '@/types/torah';
import { dataLoaderUtils } from '@/utils/dataLoader';
import { getDataPath } from '@/utils/pathUtils';

interface UseTorahDataReturn {
  database: TorahDatabase | null;
  lexicon: HebrewLexicon | null;
  books: TorahBook[];
  currentBook: TorahBook | null;
  isLoading: boolean;
  error: string | null;
  loadBook: (bookName: string) => Promise<void>;
  searchWord: (hebrew: string) => any;
  getWordTranslations: (hebrew: string) => any[];
  refreshData: () => Promise<void>;
  progress: {
    loaded: number;
    total: number;
    currentOperation: string;
  };
}

export const useTorahData = (): UseTorahDataReturn => {
  const [database, setDatabase] = useState<TorahDatabase | null>(null);
  const [currentBook, setCurrentBook] = useState<TorahBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 5,
    currentOperation: 'Инициализация...'
  });

  /**
   * Initialize data loading
   */
  useEffect(() => {
    initializeData();
  }, []);

  /**
   * Initialize Torah data from cache or download
   */
  const initializeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: 5, currentOperation: 'Проверка кэша...' });

      // Try to load from cache first
      const cachedData = dataLoaderUtils.loadFromCache();
      
      if (cachedData && !dataLoaderUtils.shouldUpdateCache()) {
        setProgress({ loaded: 5, total: 5, currentOperation: 'Загрузка из кэша...' });
        setDatabase(cachedData);
        if (cachedData.books.length > 0) {
          setCurrentBook(cachedData.books[0]);
        }
        setIsLoading(false);
        return;
      }

      // Load from external sources
      await loadFromSources();

    } catch (err) {
      console.error('Ошибка инициализации данных:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      
      // Try to use cached data as fallback
      const cachedData = dataLoaderUtils.loadFromCache();
      if (cachedData) {
        setDatabase(cachedData);
        if (cachedData.books.length > 0) {
          setCurrentBook(cachedData.books[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data from external sources
   */
  const loadFromSources = async () => {
    setProgress({ loaded: 0, total: 5, currentOperation: 'Загрузка данных Торы...' });

    try {
      // First, try to load from local JSON files
      const data = await loadFromLocalFiles();
      setDatabase(data);
      if (data.books.length > 0) {
        setCurrentBook(data.books[0]);
      }
    } catch (err) {
      console.warn('Не удалось загрузить локальные файлы, используем встроенные данные');
      
      // Fallback to embedded sample data
      const fallbackData = createFallbackData();
      setDatabase(fallbackData);
      setCurrentBook(fallbackData.books[0]);
    }
  };

  /**
   * Load data from local JSON files
   */
  const loadFromLocalFiles = async (): Promise<TorahDatabase> => {
    const promises = [];

    // Load metadata
    setProgress({ loaded: 1, total: 5, currentOperation: 'Загрузка метаданных...' });
    promises.push(fetch(getDataPath('metadata.json')).then(r => r.json()));

    // Load lexicon
    setProgress({ loaded: 2, total: 5, currentOperation: 'Загрузка словаря...' });
    promises.push(fetch(getDataPath('hebrew-lexicon.json')).then(r => r.json()));

    // Load first book for quick start
    setProgress({ loaded: 3, total: 5, currentOperation: 'Загрузка книг...' });
    promises.push(fetch(getDataPath('genesis.json')).then(r => r.json()));

    try {
      const [metadata, lexicon, genesis] = await Promise.all(promises);
      
      setProgress({ loaded: 5, total: 5, currentOperation: 'Завершение...' });

      const database: TorahDatabase = {
        books: [genesis],
        lexicon: lexicon,
        commentaries: [],
        metadata: metadata
      };

      // Cache the data
      localStorage.setItem('torahDatabase', JSON.stringify(database));

      return database;
    } catch (error) {
      throw new Error('Не удалось загрузить данные из локальных файлов');
    }
  };

  /**
   * Create fallback data if external sources fail
   */
  const createFallbackData = (): TorahDatabase => {
    return {
      books: [
        {
          english: 'Genesis',
          hebrew: 'בראשית',
          russian: 'Берешит',
          transliteration: 'Bereishit',
          chapters: [
            {
              number: 1,
              verses: [
                {
                  number: 1,
                  hebrew: ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים', 'אֵת', 'הַשָּׁמַיִם', 'וְאֵת', 'הָאָרֶץ'],
                  russian: 'В начале сотворил Бог небо и землю.',
                  words: [
                    {
                      hebrew: 'בְּרֵאשִׁית',
                      transliteration: 'b\'reshit',
                      root: 'ראש',
                      translations: [
                        { meaning: 'в начале', context: 'временной период', grammar: 'наречие' }
                      ]
                    }
                    // ... more words would be here
                  ]
                }
              ]
            }
          ],
          wordCount: 7,
          uniqueWords: 7
        }
      ],
      lexicon: {
        'ברא': {
          root: 'ברא',
          meanings: [
            { meaning: 'создавать', context: 'божественное творение', grammar: 'глагол' }
          ],
          frequency: 48,
          relatedWords: ['בריה', 'בראשית'],
          biblicalUsage: [
            { book: 'Genesis', chapter: 1, verse: 1, form: 'בָּרָא' }
          ]
        }
      },
      commentaries: [],
      metadata: {
        totalWords: 7,
        uniqueWords: 7,
        lastUpdated: new Date().toISOString(),
        sources: ['fallback']
      }
    };
  };

  /**
   * Load a specific book
   */
  const loadBook = useCallback(async (bookName: string) => {
    if (!database) return;

    try {
      setIsLoading(true);
      
      // Check if book is already loaded
      const existingBook = database.books.find(book => book.english === bookName);
      if (existingBook) {
        setCurrentBook(existingBook);
        setIsLoading(false);
        return;
      }

      // Load book from file
      const response = await fetch(`/data/${bookName.toLowerCase()}.json`);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить книгу ${bookName}`);
      }

      const bookData = await response.json();
      
      // Add to database
      const updatedDatabase = {
        ...database,
        books: [...database.books, bookData]
      };
      
      setDatabase(updatedDatabase);
      setCurrentBook(bookData);
      
      // Update cache
      localStorage.setItem('torahDatabase', JSON.stringify(updatedDatabase));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки книги');
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  /**
   * Search for a word in the lexicon
   */
  const searchWord = useCallback((hebrew: string) => {
    if (!database?.lexicon) return null;
    
    // Remove vowels for search
    const cleanWord = hebrew.replace(/[\u05B0-\u05BC\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
    
    return database.lexicon[cleanWord] || database.lexicon[hebrew] || null;
  }, [database]);

  /**
   * Get all possible translations for a word
   */
  const getWordTranslations = useCallback((hebrew: string) => {
    const wordData = searchWord(hebrew);
    return wordData?.meanings || [
      { meaning: 'неизвестно', context: 'требует дополнительного анализа', grammar: 'неопределено' }
    ];
  }, [searchWord]);

  /**
   * Refresh data from sources
   */
  const refreshData = useCallback(async () => {
    // Clear cache
    localStorage.removeItem('torahDatabase');
    
    // Reload data
    await initializeData();
  }, []);

  return {
    database,
    lexicon: database?.lexicon || null,
    books: database?.books || [],
    currentBook,
    isLoading,
    error,
    loadBook,
    searchWord,
    getWordTranslations,
    refreshData,
    progress
  };
};