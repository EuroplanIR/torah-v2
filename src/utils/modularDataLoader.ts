import { 
  BooksIndex, 
  BookMetadata, 
  ChapterFile, 
  VerseFile,
  CommentatorsIndex,
  HebrewLexicon,
  Parasha 
} from '@/types/torah';

interface ModularDataCache {
  booksIndex?: BooksIndex;
  bookMetadata: Record<string, BookMetadata>;
  chapters: Record<string, ChapterFile>; // key: "genesis-001"
  verses: Record<string, VerseFile>; // key: "genesis-beresheet-001-001"
  commentators?: CommentatorsIndex;
  lexicon?: HebrewLexicon;
  parashas?: Record<string, Parasha[]>; // key: "genesis", value: array of parashas
  lastCacheUpdate: string;
}

class ModularDataLoader {
  private cache: ModularDataCache = {
    bookMetadata: {},
    chapters: {},
    verses: {},
    parashas: {},
    lastCacheUpdate: new Date().toISOString()
  };

  private readonly CACHE_KEY = 'torah_modular_cache';
  private readonly CACHE_VERSION = '1.0.0';

  /**
   * Загружает индекс всех книг
   */
  async loadBooksIndex(): Promise<BooksIndex> {
    if (this.cache.booksIndex) {
      return this.cache.booksIndex;
    }

    try {
      const response = await fetch('/data/metadata/books.json');
      if (!response.ok) {
        throw new Error(`Failed to load books index: ${response.status}`);
      }
      
      const booksIndex: BooksIndex = await response.json();
      this.cache.booksIndex = booksIndex;
      this.saveCache();
      
      return booksIndex;
    } catch (error) {
      console.error('Error loading books index:', error);
      throw error;
    }
  }

  /**
   * Загружает метаданные конкретной книги
   */
  async loadBookMetadata(bookId: string): Promise<BookMetadata> {
    if (this.cache.bookMetadata[bookId]) {
      return this.cache.bookMetadata[bookId];
    }

    try {
      const response = await fetch(`/data/${bookId}/metadata.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${bookId} metadata: ${response.status}`);
      }
      
      const metadata: BookMetadata = await response.json();
      this.cache.bookMetadata[bookId] = metadata;
      this.saveCache();
      
      return metadata;
    } catch (error) {
      console.error(`Error loading ${bookId} metadata:`, error);
      throw error;
    }
  }

  /**
   * Загружает конкретную главу
   */
  async loadChapter(bookId: string, chapter: number, parashaId?: string): Promise<ChapterFile> {
    const chapterKey = `${bookId}-${parashaId || 'default'}-${chapter.toString().padStart(3, '0')}`;
    
    if (this.cache.chapters[chapterKey]) {
      return this.cache.chapters[chapterKey];
    }

    try {
      let response: Response;
      
      // Пробуем загрузить из новой структуры (с парашот)
      if (parashaId) {
        response = await fetch(`/data/${bookId}/${parashaId}/chapter-${chapter.toString().padStart(3, '0')}.json`);
      } else {
        // Если парша не указана, определяем её автоматически
        const parasha = await this.getParashaByChapter(bookId, chapter);
        if (parasha) {
          response = await fetch(`/data/${bookId}/${parasha.id}/chapter-${chapter.toString().padStart(3, '0')}.json`);
        } else {
          // Fallback на старую структуру
          response = await fetch(`/data/${bookId}/chapter-${chapter.toString().padStart(3, '0')}.json`);
        }
      }
      
      // Если не найдено в новой структуре, пробуем старую
      if (!response.ok) {
        response = await fetch(`/data/${bookId}/chapter-${chapter.toString().padStart(3, '0')}.json`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load ${bookId} chapter ${chapter}: ${response.status}`);
      }
      
      const chapterData: ChapterFile = await response.json();
      
      // Добавляем информацию о парше в данные главы, если её нет
      if (!chapterData.parasha && parashaId) {
        chapterData.parasha = parashaId;
      }
      
      this.cache.chapters[chapterKey] = chapterData;
      this.saveCache();
      
      return chapterData;
    } catch (error) {
      console.error(`Error loading ${bookId} chapter ${chapter}:`, error);
      throw error;
    }
  }

  /**
   * Загружает индекс комментаторов
   */
  async loadCommentators(): Promise<CommentatorsIndex> {
    if (this.cache.commentators) {
      return this.cache.commentators;
    }

    try {
      const response = await fetch('/data/metadata/commentators.json');
      if (!response.ok) {
        throw new Error(`Failed to load commentators: ${response.status}`);
      }
      
      const commentators: CommentatorsIndex = await response.json();
      this.cache.commentators = commentators;
      this.saveCache();
      
      return commentators;
    } catch (error) {
      console.error('Error loading commentators:', error);
      throw error;
    }
  }

  /**
   * Загружает парашот для всех книг
   */
  async loadParashas(): Promise<Record<string, Parasha[]>> {
    if (this.cache.parashas && Object.keys(this.cache.parashas).length > 0) {
      return this.cache.parashas;
    }

    try {
      const response = await fetch('/data/metadata/parashas.json');
      if (!response.ok) {
        throw new Error(`Failed to load parashas: ${response.status}`);
      }
      
      const parashas: Record<string, Parasha[]> = await response.json();
      this.cache.parashas = parashas;
      this.saveCache();
      
      return parashas;
    } catch (error) {
      console.error('Error loading parashas:', error);
      throw error;
    }
  }

  /**
   * Получает парашот для конкретной книги
   */
  async getBookParashas(bookId: string): Promise<Parasha[]> {
    try {
      const allParashas = await this.loadParashas();
      return allParashas[bookId] || [];
    } catch (error) {
      console.error(`Error getting parashas for ${bookId}:`, error);
      return [];
    }
  }

  /**
   * Загружает отдельный стих (новая структура файлов)
   */
  async loadVerseFile(bookId: string, parashaId: string, chapter: number, verse: number): Promise<VerseFile> {
    // УНИВЕРСАЛЬНАЯ система перенаправления для всех 22 пересечений
    try {
      const correctParasha = await this.getParashaByChapter(bookId, chapter, verse);
      if (correctParasha && correctParasha.id !== parashaId) {
        // Перенаправляем на правильную паршу
        return this.loadVerseFile(bookId, correctParasha.id, chapter, verse);
      }
    } catch (error) {
      console.warn(`Could not determine correct parasha for ${bookId} ${chapter}:${verse}, continuing with ${parashaId}`);
    }

    const cacheKey = `${bookId}-${parashaId}-${chapter.toString().padStart(3, '0')}-${verse.toString().padStart(3, '0')}`;
    
    // Безопасная проверка кэша
    if (this.cache.verses && this.cache.verses[cacheKey]) {
      return this.cache.verses[cacheKey];
    }

    try {
      const verseFileName = `${parashaId}-${chapter.toString().padStart(3, '0')}-${verse.toString().padStart(3, '0')}.json`;
      const response = await fetch(`/data/${bookId}/${parashaId}/${verseFileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load verse ${bookId} ${chapter}:${verse}: ${response.status}`);
      }
      
      const verseFile: VerseFile = await response.json();
      // Убеждаемся что кэш стихов инициализирован
      if (!this.cache.verses) {
        this.cache.verses = {};
      }
      this.cache.verses[cacheKey] = verseFile;
      this.saveCache();
      
      return verseFile;
    } catch (error) {
      console.error(`Error loading verse ${bookId} ${chapter}:${verse}:`, error);
      throw error;
    }
  }

  /**
   * Получает конкретную паршу по ID
   */
  async getParasha(bookId: string, parashaId: string): Promise<Parasha | null> {
    try {
      const bookParashas = await this.getBookParashas(bookId);
      return bookParashas.find(p => p.id === parashaId) || null;
    } catch (error) {
      console.error(`Error getting parasha ${parashaId} for ${bookId}:`, error);
      return null;
    }
  }

  /**
   * Находит паршу по номеру главы
   */
  async getParashaByChapter(bookId: string, chapter: number, verse?: number): Promise<Parasha | null> {
    try {
      const bookParashas = await this.getBookParashas(bookId);
      
      // Находим все парши, которые включают эту главу
      const candidateParashas = bookParashas.filter(p => 
        chapter >= p.startChapter && chapter <= p.endChapter
      );
      
      if (candidateParashas.length === 0) {
        return null;
      }
      
      if (candidateParashas.length === 1) {
        return candidateParashas[0];
      }
      
      // УНИВЕРСАЛЬНАЯ логика для всех пересечений: используем стих для определения парши
      if (verse) {
        for (const parasha of candidateParashas) {
          // Первая глава парши
          if (chapter === parasha.startChapter && verse >= parasha.startVerse) {
            // Если это также последняя глава парши
            if (chapter === parasha.endChapter && verse <= parasha.endVerse) {
              return parasha;
            }
            // Если первая, но не последняя глава
            if (chapter !== parasha.endChapter) {
              return parasha;
            }
          }
          // Последняя глава парши
          if (chapter === parasha.endChapter && verse <= parasha.endVerse) {
            // Если последняя, но не первая глава
            if (chapter !== parasha.startChapter) {
              return parasha;
            }
          }
        }
      }
      
      // Fallback: возвращаем первую подходящую паршу
      return candidateParashas[0];
    } catch (error) {
      console.error(`Error finding parasha for ${bookId} chapter ${chapter}:`, error);
      return null;
    }
  }

  /**
   * Получает главы, принадлежащие конкретной парше
   */
  async getChaptersForParasha(bookId: string, parashaId: string): Promise<number[]> {
    try {
      const parasha = await this.getParasha(bookId, parashaId);
      if (!parasha) return [];
      
      const availableChapters = await this.getAvailableChapters(bookId);
      const chapters = [];
      
      for (let i = parasha.startChapter; i <= parasha.endChapter; i++) {
        if (availableChapters.includes(i)) {
          chapters.push(i);
        }
      }
      
      return chapters;
    } catch (error) {
      console.error(`Error getting chapters for parasha ${parashaId}:`, error);
      return [];
    }
  }

  /**
   * Загружает словарь иврита
   */
  async loadHebrewLexicon(): Promise<HebrewLexicon> {
    if (this.cache.lexicon) {
      return this.cache.lexicon;
    }

    try {
      const response = await fetch('/data/metadata/hebrew-lexicon.json');
      if (!response.ok) {
        // Пробуем старый путь для совместимости
        const fallbackResponse = await fetch('/data/hebrew-lexicon.json');
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to load Hebrew lexicon: ${response.status}`);
        }
        const lexicon: HebrewLexicon = await fallbackResponse.json();
        this.cache.lexicon = lexicon;
        this.saveCache();
        return lexicon;
      }
      
      const lexicon: HebrewLexicon = await response.json();
      this.cache.lexicon = lexicon;
      this.saveCache();
      
      return lexicon;
    } catch (error) {
      console.error('Error loading Hebrew lexicon:', error);
      throw error;
    }
  }

  /**
   * Предварительная загрузка нескольких глав
   */
  async preloadChapters(bookId: string, chapters: number[], parashaId?: string): Promise<void> {
    const promises = chapters.map(chapter => 
      this.loadChapter(bookId, chapter, parashaId).catch(error => {
        console.warn(`Failed to preload ${bookId} chapter ${chapter}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Получает информацию о доступных главах книги
   */
  async getAvailableChapters(bookId: string): Promise<number[]> {
    try {
      const metadata = await this.loadBookMetadata(bookId);
      return metadata.availableChapters || [];
    } catch (error) {
      console.error(`Error getting available chapters for ${bookId}:`, error);
      return [];
    }
  }

  /**
   * Получает информацию о доступных стихах главы
   */
  /**
   * УНИВЕРСАЛЬНАЯ функция получения диапазона стихов для любой парши
   * Обрабатывает все 22 пересечения глав в Торе автоматически
   */
  async getParashaVerseRange(bookId: string, chapter: number, parashaId: string): Promise<{start: number, end: number} | null> {
    try {
      const bookParashas = await this.getBookParashas(bookId);
      const parasha = bookParashas.find(p => p.id === parashaId);
      
      if (!parasha) {
        return null;
      }
      
      // Если парша не включает эту главу
      if (chapter < parasha.startChapter || chapter > parasha.endChapter) {
        return null;
      }
      
      // Первая глава парши
      if (chapter === parasha.startChapter) {
        // Последняя глава парши тоже
        if (chapter === parasha.endChapter) {
          return { start: parasha.startVerse, end: parasha.endVerse };
        } else {
          // Первая, но не последняя - от startVerse до конца главы
          const structure = await this.getTorahStructure();
          const bookStructure = structure.books[bookId.toLowerCase()];
          if (bookStructure?.chaptersData?.[chapter.toString()]) {
            const verseCount = bookStructure.chaptersData[chapter.toString()].verses;
            return { start: parasha.startVerse, end: verseCount };
          }
        }
      }
      
      // Последняя глава парши (но не первая)
      if (chapter === parasha.endChapter) {
        return { start: 1, end: parasha.endVerse };
      }
      
      // Средняя глава - вся глава
      const structure = await this.getTorahStructure();
      const bookStructure = structure.books[bookId.toLowerCase()];
      if (bookStructure?.chaptersData?.[chapter.toString()]) {
        const verseCount = bookStructure.chaptersData[chapter.toString()].verses;
        return { start: 1, end: verseCount };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting parasha verse range for ${bookId} ${chapter} ${parashaId}:`, error);
      return null;
    }
  }

  async getAvailableVerses(bookId: string, chapter: number, parashaId?: string): Promise<number[]> {
    try {
      if (parashaId) {
        // УНИВЕРСАЛЬНАЯ система для всех пересекающихся глав
        const range = await this.getParashaVerseRange(bookId, chapter, parashaId);
        if (range) {
          const verses = [];
          for (let i = range.start; i <= range.end; i++) {
            verses.push(i);
          }
          return verses;
        }
      }
      
      // Fallback для полной главы - используем torah-structure.json
      const structure = await this.getTorahStructure();
      const bookStructure = structure.books[bookId.toLowerCase()];
      
      if (bookStructure?.chaptersData?.[chapter.toString()]) {
        const verseCount = bookStructure.chaptersData[chapter.toString()].verses;
        return Array.from({ length: verseCount }, (_, i) => i + 1);
      }
      
      // Последний fallback - попробуем стандартные значения для основных глав
      console.log('🚨 Torah structure failed, using standard values');
      const standardVerseCounts: Record<string, Record<number, number>> = {
        'genesis': { 1: 31, 2: 25, 3: 24, 4: 26, 5: 32, 6: 22, 7: 24, 8: 22, 9: 29, 10: 32 },
        'exodus': { 1: 22, 2: 25, 3: 22, 4: 31, 5: 23, 6: 30, 7: 25, 8: 28, 9: 35, 10: 29 },
        'leviticus': { 1: 17, 2: 16, 3: 17, 4: 35, 5: 26, 6: 23, 7: 38, 8: 36, 9: 24, 10: 20 }
      };
      
      const standardCount = standardVerseCounts[bookId]?.[chapter];
      console.log('📋 Standard count for', bookId, chapter, ':', standardCount);
      if (standardCount) {
        console.log('✅ Using standard count:', standardCount);
        return Array.from({ length: standardCount }, (_, i) => i + 1);
      }
      
      // Окончательный fallback
      console.log('❌ ULTIMATE FALLBACK: returning [1]');
      return [1];
    } catch (error) {
      console.error(`Error getting available verses for ${bookId} chapter ${chapter}:`, error);
      return [1];
    }
  }

  /**
   * Получает структуру Торы из файла
   */
  private async getTorahStructure(): Promise<any> {
    try {
      const response = await fetch('/data/metadata/torah-structure.json');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Could not load torah structure');
    } catch (error) {
      console.error('Error loading torah structure:', error);
      throw error;
    }
  }

  /**
   * Поиск слова в лексиконе
   */
  async searchWord(hebrew: string): Promise<any> {
    try {
      const lexicon = await this.loadHebrewLexicon();
      
      // Удаляем огласовки для поиска
      const cleanWord = hebrew.replace(/[\u05B0-\u05BC\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
      
      return lexicon[cleanWord] || lexicon[hebrew] || null;
    } catch (error) {
      console.error('Error searching word:', error);
      return null;
    }
  }

  /**
   * Получает переводы слова
   */
  async getWordTranslations(hebrew: string): Promise<any[]> {
    const wordData = await this.searchWord(hebrew);
    return wordData?.meanings || [
      { meaning: 'неизвестно', context: 'требует дополнительного анализа', grammar: 'неопределено' }
    ];
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.cache = {
      bookMetadata: {},
      chapters: {},
      parashas: {},
      lastCacheUpdate: new Date().toISOString()
    };
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Сохранение кэша в localStorage
   */
  private saveCache(): void {
    try {
      const cacheData = {
        ...this.cache,
        version: this.CACHE_VERSION,
        lastCacheUpdate: new Date().toISOString()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Загрузка кэша из localStorage
   */
  private loadCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (cacheData.version === this.CACHE_VERSION) {
          this.cache = {
            bookMetadata: cacheData.bookMetadata || {},
            chapters: cacheData.chapters || {},
            verses: cacheData.verses || {},
            parashas: cacheData.parashas || {},
            booksIndex: cacheData.booksIndex,
            commentators: cacheData.commentators,
            lexicon: cacheData.lexicon,
            lastCacheUpdate: cacheData.lastCacheUpdate || new Date().toISOString()
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      // При ошибке загрузки кэша - сбрасываем к начальному состоянию
      this.cache = {
        bookMetadata: {},
        chapters: {},
        verses: {},
        parashas: {},
        lastCacheUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Проверка нужности обновления кэша
   */
  shouldUpdateCache(): boolean {
    const lastUpdate = new Date(this.cache.lastCacheUpdate);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceUpdate > 24; // Обновляем кэш раз в день
  }

  constructor() {
    this.loadCache();
  }
}

// Экспортируем singleton instance
export const modularDataLoader = new ModularDataLoader();
export default modularDataLoader;