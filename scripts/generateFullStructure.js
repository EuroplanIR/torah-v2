import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создать полную файловую структуру для всех парашот и глав Торы
class TorahStructureGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, '../public/data');
    this.metadataDir = path.join(this.dataDir, 'metadata');
    
    // Загружаем существующие данные о структуре
    this.parashas = this.loadJSON(path.join(this.metadataDir, 'parashas.json'));
    this.torahStructure = this.loadJSON(path.join(this.metadataDir, 'torah-structure.json'));
    this.books = this.loadJSON(path.join(this.metadataDir, 'books.json'));
  }

  loadJSON(filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`Ошибка чтения файла ${filePath}:`, error.message);
      return null;
    }
  }

  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Создана папка: ${dirPath}`);
    }
  }

  createChapterStub(bookId, parashaId, chapterNum, verseCount) {
    const stub = {
      "bookId": bookId,
      "parashaId": parashaId,
      "chapterNumber": chapterNum,
      "totalVerses": verseCount,
      "verses": []
    };

    // Создаем заглушки для всех стихов
    for (let verse = 1; verse <= verseCount; verse++) {
      stub.verses.push({
        "number": verse,
        "words": [
          {
            "hebrew": "דָבָר",
            "transliteration": "davar",
            "translations": ["слово", "вещь", "дело"],
            "morphology": {
              "partOfSpeech": "noun",
              "gender": "masculine",
              "number": "singular",
              "root": "דבר"
            }
          }
        ]
      });
    }

    return stub;
  }

  createParashaMetadata(bookId, parasha) {
    return {
      "id": parasha.id,
      "bookId": bookId,
      "number": parasha.number,
      "names": {
        "hebrew": parasha.hebrew,
        "russian": parasha.russian,
        "english": parasha.english
      },
      "structure": {
        "startChapter": parasha.startChapter,
        "endChapter": parasha.endChapter,
        "startVerse": parasha.startVerse || 1,
        "endVerse": parasha.endVerse || null
      },
      "content": {
        "theme": parasha.theme,
        "description": parasha.description
      },
      "chapters": [],
      "totalVerses": 0,
      "availableChapters": []
    };
  }

  generateBookStructure(bookId) {
    const bookParashas = this.parashas[bookId];
    if (!bookParashas) {
      console.error(`❌ Парашот для книги ${bookId} не найдены`);
      return;
    }

    const bookDir = path.join(this.dataDir, bookId);
    this.ensureDirectory(bookDir);

    console.log(`\n📖 Создание структуры для книги: ${bookId}`);

    bookParashas.forEach(parasha => {
      const parashaDir = path.join(bookDir, parasha.id);
      this.ensureDirectory(parashaDir);

      // Создаем metadata.json для парши
      const parashaMetadata = this.createParashaMetadata(bookId, parasha);
      const metadataPath = path.join(parashaDir, 'metadata.json');
      
      // Получаем главы для этой парши
      const chapters = [];
      for (let chapter = parasha.startChapter; chapter <= parasha.endChapter; chapter++) {
        const chapterData = this.torahStructure.books[bookId]?.chaptersData?.[chapter];
        if (chapterData) {
          chapters.push(chapter);
          parashaMetadata.availableChapters.push(chapter);
          parashaMetadata.totalVerses += chapterData.verses;

          // Создаем файл главы
          const chapterFileName = `chapter-${chapter.toString().padStart(3, '0')}.json`;
          const chapterPath = path.join(parashaDir, chapterFileName);
          
          if (!fs.existsSync(chapterPath)) {
            const chapterStub = this.createChapterStub(bookId, parasha.id, chapter, chapterData.verses);
            fs.writeFileSync(chapterPath, JSON.stringify(chapterStub, null, 2), 'utf8');
            console.log(`   ✅ Создан файл: ${parasha.id}/${chapterFileName} (${chapterData.verses} стихов)`);
          } else {
            console.log(`   ⏭️  Файл существует: ${parasha.id}/${chapterFileName}`);
          }
        }
      }

      parashaMetadata.chapters = chapters;

      // Сохраняем metadata.json парши
      if (!fs.existsSync(metadataPath)) {
        fs.writeFileSync(metadataPath, JSON.stringify(parashaMetadata, null, 2), 'utf8');
        console.log(`   ✅ Создан metadata: ${parasha.id}/metadata.json`);
      } else {
        console.log(`   ⏭️  Metadata существует: ${parasha.id}/metadata.json`);
      }
    });
  }

  generateAllBooks() {
    console.log('🏗️  Начинаем создание полной структуры файлов Торы...\n');

    const bookIds = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'];
    
    bookIds.forEach(bookId => {
      this.generateBookStructure(bookId);
    });

    console.log('\n🎉 Полная структура файлов создана!');
    this.printStatistics();
  }

  printStatistics() {
    let totalFiles = 0;
    let totalFolders = 0;

    const bookIds = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'];
    
    console.log('\n📊 Статистика созданных файлов:');
    
    bookIds.forEach(bookId => {
      const bookParashas = this.parashas[bookId];
      if (!bookParashas) return;

      let bookFiles = 0;
      let bookFolders = bookParashas.length; // количество парашот

      bookParashas.forEach(parasha => {
        bookFiles++; // metadata.json парши
        
        // Считаем файлы глав
        for (let chapter = parasha.startChapter; chapter <= parasha.endChapter; chapter++) {
          bookFiles++;
        }
      });

      console.log(`   📖 ${bookId}: ${bookFolders} парашот, ${bookFiles} файлов`);
      totalFiles += bookFiles;
      totalFolders += bookFolders;
    });

    console.log(`\n🎯 Итого: ${totalFolders} папок парашот, ${totalFiles} JSON файлов`);
  }

  // Проверить существующую структуру
  checkExistingStructure() {
    console.log('🔍 Проверка существующей структуры...\n');

    const bookIds = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'];
    
    bookIds.forEach(bookId => {
      const bookDir = path.join(this.dataDir, bookId);
      const exists = fs.existsSync(bookDir);
      console.log(`📖 ${bookId}: ${exists ? '✅ папка существует' : '❌ папка отсутствует'}`);
      
      if (exists) {
        const parashas = fs.readdirSync(bookDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        console.log(`   📁 Парашот (${parashas.length}): ${parashas.join(', ')}`);
      }
    });
  }
}

// Запускаем генератор
const generator = new TorahStructureGenerator();

// Показываем текущее состояние
generator.checkExistingStructure();

// Создаем недостающие файлы
generator.generateAllBooks();