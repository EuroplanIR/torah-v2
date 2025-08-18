import { TorahDatabase, TorahBook, HebrewLexicon, HebrewWord } from '@/types/torah';
import { getDataPath } from './pathUtils';

// Data Sources Configuration
const DATA_SOURCES = {
  // Mechon Mamre - Hebrew text with vowels
  mechonMamre: 'https://www.mechon-mamre.org/p/pt/pt0101.htm',
  
  // Sefaria API - Multiple translations and commentaries
  sefaria: 'https://www.sefaria.org/api',
  
  // Westminster Leningrad Codex
  tanach: 'https://tanach.us/Tanach.xml',
  
  // Open Scriptures Hebrew Bible
  openScriptures: 'https://github.com/openscriptures/morphhb',
  
  // Hebrew lexicon data
  brownDriverBriggs: 'https://github.com/openscriptures/HebrewLexicon'
};

/**
 * Main class for loading and processing Torah data
 */
export class TorahDataLoader {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || DATA_SOURCES.sefaria;
    this.apiKey = apiKey;
  }

  /**
   * Load complete Torah database from multiple sources
   */
  async loadCompleteDatabase(): Promise<TorahDatabase> {
    try {
      // Load data from multiple sources in parallel
      const [sefariaData, lexiconData, morphologyData] = await Promise.all([
        this.loadFromSefaria(),
        this.loadHebrewLexicon(),
        this.loadMorphologyData()
      ]);

      // Merge and process data
      const database = this.mergeDataSources(sefariaData, lexiconData, morphologyData);
      
      return database;
    } catch (error) {
      console.error('Error loading Torah database:', error);
      throw new Error('Failed to load Torah database');
    }
  }

  /**
   * Load data from Sefaria API
   */
  private async loadFromSefaria(): Promise<Partial<TorahDatabase>> {
    const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
    const loadedBooks: TorahBook[] = [];

    for (const book of books) {
      try {
        // Get Hebrew text
        const hebrewResponse = await fetch(`${this.baseUrl}/texts/${book}.he`);
        const hebrewData = await hebrewResponse.json();

        // Get Russian translation
        const russianResponse = await fetch(`${this.baseUrl}/texts/${book}.ru`);
        const russianData = await russianResponse.json();

        // Process book data
        const processedBook = this.processBookData(book, hebrewData, russianData);
        loadedBooks.push(processedBook);

        // Add delay to respect API limits
        await this.delay(100);
      } catch (error) {
        console.error(`Error loading ${book}:`, error);
      }
    }

    return { books: loadedBooks };
  }

  /**
   * Load Hebrew lexicon with all possible word meanings
   */
  private async loadHebrewLexicon(): Promise<HebrewLexicon> {
    // This would typically load from Brown-Driver-Briggs lexicon
    // or other comprehensive Hebrew dictionaries
    
    // For now, return sample structure - in production this would
    // load from external lexicon sources
    return this.createSampleLexicon();
  }

  /**
   * Load morphological analysis data
   */
  private async loadMorphologyData(): Promise<any> {
    // Load morphological analysis from Westminster Hebrew Morphology
    // This includes part of speech, parsing, and grammatical information
    
    try {
      // In production, this would fetch from morphological databases
      const response = await fetch(getDataPath('morphology.json'));
      return await response.json();
    } catch (error) {
      console.warn('Morphology data not available, using fallback');
      return {};
    }
  }

  /**
   * Process individual book data from API response
   */
  private processBookData(bookName: string, hebrewData: any, russianData: any): TorahBook {
    const bookInfo = this.getBookInfo(bookName);
    
    const chapters = hebrewData.text.map((chapterText: string[], chapterIndex: number) => {
      const verses = chapterText.map((verseText: string, verseIndex: number) => {
        const words = this.parseHebrewVerse(verseText);
        const russianTranslation = russianData.text[chapterIndex]?.[verseIndex] || '';

        return {
          number: verseIndex + 1,
          hebrew: words.map(w => w.hebrew),
          russian: russianTranslation,
          words: words
        };
      });

      return {
        number: chapterIndex + 1,
        verses: verses
      };
    });

    return {
      ...bookInfo,
      chapters: chapters,
      wordCount: this.calculateWordCount(chapters),
      uniqueWords: this.calculateUniqueWords(chapters)
    };
  }

  /**
   * Parse Hebrew verse into individual words with analysis
   */
  private parseHebrewVerse(verseText: string): HebrewWord[] {
    // Remove punctuation and split into words
    const words = verseText
      .replace(/[׃׀׆]/g, '') // Remove verse markers
      .split(/\s+/)
      .filter(word => word.length > 0);

    return words.map(hebrewWord => this.analyzeHebrewWord(hebrewWord));
  }

  /**
   * Analyze individual Hebrew word
   */
  private analyzeHebrewWord(hebrew: string): HebrewWord {
    // Remove vowels for root analysis
    const consonants = this.removeVowels(hebrew);
    
    // This would typically use morphological analysis
    // For now, return basic structure
    return {
      hebrew: hebrew,
      transliteration: this.transliterate(hebrew),
      root: this.extractRoot(consonants),
      translations: this.getWordTranslations(hebrew),
      morphology: this.analyzeMorphology(hebrew)
    };
  }

  /**
   * Get all possible translations for a Hebrew word
   */
  private getWordTranslations(hebrew: string): any[] {
    // This would query the lexicon database
    // For now, return placeholder
    return [
      {
        meaning: 'placeholder',
        context: 'sample context',
        grammar: 'unknown'
      }
    ];
  }

  /**
   * Remove Hebrew vowels (nikkud) from text
   */
  private removeVowels(text: string): string {
    // Remove Hebrew vowel points (U+05B0 to U+05BC, U+05C1, U+05C2, U+05C4, U+05C5, U+05C7)
    return text.replace(/[\u05B0-\u05BC\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '');
  }

  /**
   * Simple Hebrew to Latin transliteration
   */
  private transliterate(hebrew: string): string {
    const transliterationMap: { [key: string]: string } = {
      'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v',
      'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l',
      'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': '', 'פ': 'p', 'צ': 'tz',
      'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
    };

    return this.removeVowels(hebrew)
      .split('')
      .map(char => transliterationMap[char] || char)
      .join('');
  }

  /**
   * Extract Hebrew root from word
   */
  private extractRoot(consonants: string): string {
    // Simplified root extraction - in practice this would use
    // sophisticated morphological analysis
    return consonants.slice(0, 3);
  }

  /**
   * Analyze morphology of Hebrew word
   */
  private analyzeMorphology(hebrew: string): any {
    // This would use comprehensive morphological analysis
    return {
      partOfSpeech: 'unknown'
    };
  }

  /**
   * Get book information
   */
  private getBookInfo(bookName: string): any {
    const bookMap: { [key: string]: any } = {
      Genesis: { hebrew: 'בראשית', russian: 'Берешит', transliteration: 'Bereishit' },
      Exodus: { hebrew: 'שמות', russian: 'Шмот', transliteration: 'Shemot' },
      Leviticus: { hebrew: 'ויקרא', russian: 'Вайикра', transliteration: 'Vayikra' },
      Numbers: { hebrew: 'במדבר', russian: 'Бамидбар', transliteration: 'Bamidbar' },
      Deuteronomy: { hebrew: 'דברים', russian: 'Дварим', transliteration: 'Devarim' }
    };

    return {
      english: bookName,
      ...bookMap[bookName]
    };
  }

  /**
   * Create sample lexicon for development
   */
  private createSampleLexicon(): HebrewLexicon {
    return {
      'ברא': {
        root: 'ברא',
        meanings: [
          { meaning: 'создавать', context: 'творение из ничего', grammar: 'глагол' },
          { meaning: 'творить', context: 'божественное действие' }
        ],
        frequency: 47,
        relatedWords: ['בריה', 'בראשית', 'ברואה'],
        biblicalUsage: [
          { book: 'Genesis', chapter: 1, verse: 1, form: 'בָּרָא' }
        ]
      }
      // Add more entries...
    };
  }

  /**
   * Merge data from multiple sources
   */
  private mergeDataSources(...sources: any[]): TorahDatabase {
    // Combine data from different sources intelligently
    const [sefariaData, lexiconData, morphologyData] = sources;
    
    return {
      books: sefariaData.books || [],
      lexicon: lexiconData || {},
      commentaries: [],
      metadata: {
        totalWords: 0,
        uniqueWords: 0,
        lastUpdated: new Date().toISOString(),
        sources: Object.keys(DATA_SOURCES)
      }
    };
  }

  /**
   * Calculate total word count
   */
  private calculateWordCount(chapters: any[]): number {
    return chapters.reduce((total, chapter) => {
      return total + chapter.verses.reduce((chapterTotal: number, verse: any) => {
        return chapterTotal + verse.words.length;
      }, 0);
    }, 0);
  }

  /**
   * Calculate unique word count
   */
  private calculateUniqueWords(chapters: any[]): number {
    const uniqueWords = new Set();
    chapters.forEach(chapter => {
      chapter.verses.forEach((verse: any) => {
        verse.words.forEach((word: any) => {
          uniqueWords.add(this.removeVowels(word.hebrew));
        });
      });
    });
    return uniqueWords.size;
  }

  /**
   * Add delay for API rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Utility functions for data loading
 */
export const dataLoaderUtils = {
  /**
   * Load Torah data and save to localStorage
   */
  async loadAndCache(): Promise<TorahDatabase> {
    const loader = new TorahDataLoader();
    const database = await loader.loadCompleteDatabase();
    
    // Cache in localStorage (consider IndexedDB for larger datasets)
    localStorage.setItem('torahDatabase', JSON.stringify(database));
    
    return database;
  },

  /**
   * Load from cache if available
   */
  loadFromCache(): TorahDatabase | null {
    const cached = localStorage.getItem('torahDatabase');
    return cached ? JSON.parse(cached) : null;
  },

  /**
   * Check if cache needs updating
   */
  shouldUpdateCache(): boolean {
    const cached = localStorage.getItem('torahDatabase');
    if (!cached) return true;
    
    const data = JSON.parse(cached);
    const lastUpdated = new Date(data.metadata.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > 7; // Update weekly
  }
};