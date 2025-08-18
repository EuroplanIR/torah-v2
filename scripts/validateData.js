const fs = require('fs');
const path = require('path');

/**
 * Скрипт для валидации структуры данных Торы
 * Использование: node scripts/validateData.js
 */

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      books: 0,
      chapters: 0,
      verses: 0,
      words: 0,
      emptyVerses: 0,
      missingTranslations: 0,
      missingCommentaries: 0
    };
  }

  log(level, message, file = null) {
    const entry = { level, message, file, timestamp: new Date().toISOString() };
    if (level === 'error') {
      this.errors.push(entry);
    } else if (level === 'warning') {
      this.warnings.push(entry);
    }
    
    const prefix = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : '✅';
    const fileInfo = file ? ` (${file})` : '';
    console.log(`${prefix} ${message}${fileInfo}`);
  }

  validateFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
      this.log('error', `Отсутствует ${description}`, filePath);
      return false;
    }
    return true;
  }

  validateJsonFile(filePath, description) {
    if (!this.validateFileExists(filePath, description)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      this.log('info', `✅ Валиден ${description}`, filePath);
      return data;
    } catch (error) {
      this.log('error', `Ошибка парсинга JSON: ${error.message}`, filePath);
      return null;
    }
  }

  validateBooksIndex() {
    console.log('\n📚 Валидация индекса книг...');
    
    const indexPath = path.join(DATA_DIR, 'metadata', 'books.json');
    const booksIndex = this.validateJsonFile(indexPath, 'индекс книг');
    
    if (!booksIndex) return null;

    // Проверяем структуру
    if (!booksIndex.books || !Array.isArray(booksIndex.books)) {
      this.log('error', 'Отсутствует массив books в индексе', indexPath);
      return null;
    }

    this.stats.books = booksIndex.books.length;

    // Проверяем каждую книгу
    booksIndex.books.forEach(book => {
      const required = ['id', 'english', 'hebrew', 'russian', 'chapters', 'totalVerses'];
      required.forEach(field => {
        if (!book[field]) {
          this.log('error', `Отсутствует поле ${field} в книге ${book.id || 'unknown'}`, indexPath);
        }
      });
    });

    this.log('info', `Найдено ${booksIndex.books.length} книг в индексе`);
    return booksIndex;
  }

  validateBookMetadata(bookId) {
    const metadataPath = path.join(DATA_DIR, bookId, 'metadata.json');
    const metadata = this.validateJsonFile(metadataPath, `метаданные ${bookId}`);
    
    if (!metadata) return null;

    // Проверяем обязательные поля
    const required = ['book', 'english', 'hebrew', 'russian', 'totalChapters', 'availableChapters'];
    required.forEach(field => {
      if (!metadata[field]) {
        this.log('error', `Отсутствует поле ${field} в метаданных`, metadataPath);
      }
    });

    return metadata;
  }

  validateChapter(bookId, chapterNum) {
    const chapterPath = path.join(DATA_DIR, bookId, `chapter-${chapterNum.toString().padStart(3, '0')}.json`);
    const chapter = this.validateJsonFile(chapterPath, `${bookId} глава ${chapterNum}`);
    
    if (!chapter) return null;

    this.stats.chapters++;

    // Проверяем структуру главы
    if (!chapter.verses || !Array.isArray(chapter.verses)) {
      this.log('error', 'Отсутствует массив verses в главе', chapterPath);
      return null;
    }

    // Проверяем каждый стих
    chapter.verses.forEach(verse => {
      this.stats.verses++;
      
      if (!verse.number) {
        this.log('error', 'Отсутствует номер стиха', chapterPath);
      }

      if (!verse.hebrew || !Array.isArray(verse.hebrew)) {
        this.log('error', `Отсутствует еврейский текст в стихе ${verse.number}`, chapterPath);
      }

      if (!verse.russian) {
        this.log('warning', `Отсутствует русский перевод в стихе ${verse.number}`, chapterPath);
        this.stats.missingTranslations++;
      }

      // Проверяем слова
      if (!verse.words || !Array.isArray(verse.words)) {
        this.log('warning', `Отсутствует разбор слов в стихе ${verse.number}`, chapterPath);
      } else {
        verse.words.forEach((word, index) => {
          this.stats.words++;
          
          if (!word.hebrew) {
            this.log('error', `Отсутствует еврейское слово в позиции ${index + 1} стиха ${verse.number}`, chapterPath);
          }

          if (word.hebrew === '[ТРЕБУЕТСЯ_ЗАПОЛНЕНИЕ]') {
            this.log('warning', `Требуется заполнение слова в позиции ${index + 1} стиха ${verse.number}`, chapterPath);
            this.stats.emptyVerses++;
          }

          if (!word.translations || word.translations.length === 0) {
            this.log('warning', `Отсутствуют переводы для слова ${word.hebrew}`, chapterPath);
          }
        });
      }

      // Проверяем комментарии
      if (!verse.commentaries) {
        this.log('warning', `Отсутствуют комментарии в стихе ${verse.number}`, chapterPath);
        this.stats.missingCommentaries++;
      } else {
        const commentators = ['rashi', 'ramban', 'ibn_ezra'];
        commentators.forEach(commentator => {
          if (!verse.commentaries[commentator] || verse.commentaries[commentator].includes('[ТРЕБУЕТСЯ')) {
            this.log('warning', `Отсутствует комментарий ${commentator} в стихе ${verse.number}`, chapterPath);
          }
        });
      }
    });

    return chapter;
  }

  validateCommentators() {
    console.log('\n👥 Валидация комментаторов...');
    
    const commentatorsPath = path.join(DATA_DIR, 'metadata', 'commentators.json');
    const commentators = this.validateJsonFile(commentatorsPath, 'индекс комментаторов');
    
    if (!commentators) return null;

    if (!commentators.commentators || !Array.isArray(commentators.commentators)) {
      this.log('error', 'Отсутствует массив commentators', commentatorsPath);
      return null;
    }

    commentators.commentators.forEach(commentator => {
      const required = ['id', 'name', 'hebrewName', 'fullName', 'years', 'description'];
      required.forEach(field => {
        if (!commentator[field]) {
          this.log('error', `Отсутствует поле ${field} у комментатора ${commentator.id || 'unknown'}`, commentatorsPath);
        }
      });
    });

    this.log('info', `Найдено ${commentators.commentators.length} комментаторов`);
    return commentators;
  }

  validateLexicon() {
    console.log('\n📖 Валидация лексикона...');
    
    // Проверяем оба возможных местоположения
    const newLexiconPath = path.join(DATA_DIR, 'metadata', 'hebrew-lexicon.json');
    const oldLexiconPath = path.join(DATA_DIR, 'hebrew-lexicon.json');
    
    let lexicon = null;
    if (fs.existsSync(newLexiconPath)) {
      lexicon = this.validateJsonFile(newLexiconPath, 'лексикон (новое местоположение)');
    } else if (fs.existsSync(oldLexiconPath)) {
      lexicon = this.validateJsonFile(oldLexiconPath, 'лексикон (старое местоположение)');
      this.log('warning', 'Лексикон в старом местоположении, рекомендуется переместить в metadata/', oldLexiconPath);
    } else {
      this.log('error', 'Лексикон не найден ни в одном из ожидаемых местоположений');
      return null;
    }

    if (lexicon) {
      const wordCount = Object.keys(lexicon).length;
      this.log('info', `Найдено ${wordCount} слов в лексиконе`);
    }

    return lexicon;
  }

  validateAll() {
    console.log('🔍 Начинаем валидацию структуры данных...\n');

    // Валидируем индекс книг
    const booksIndex = this.validateBooksIndex();
    if (!booksIndex) {
      this.log('error', 'Критическая ошибка: не удалось загрузить индекс книг');
      return this.getReport();
    }

    // Валидируем каждую книгу
    console.log('\n📖 Валидация книг и глав...');
    booksIndex.books.forEach(book => {
      console.log(`\n  📚 Проверка ${book.russian} (${book.id})...`);
      
      // Валидируем метаданные книги
      const metadata = this.validateBookMetadata(book.id);
      if (!metadata) return;

      // Валидируем доступные главы
      if (metadata.availableChapters && Array.isArray(metadata.availableChapters)) {
        metadata.availableChapters.forEach(chapterNum => {
          this.validateChapter(book.id, chapterNum);
        });
      }
    });

    // Валидируем дополнительные файлы
    this.validateCommentators();
    this.validateLexicon();

    return this.getReport();
  }

  getReport() {
    console.log('\n📊 ОТЧЕТ О ВАЛИДАЦИИ\n');
    
    // Статистика
    console.log('📈 Статистика данных:');
    console.log(`   📚 Книг: ${this.stats.books}`);
    console.log(`   📖 Глав: ${this.stats.chapters}`);
    console.log(`   📝 Стихов: ${this.stats.verses}`);
    console.log(`   💬 Слов: ${this.stats.words}`);
    
    // Проблемы
    console.log('\n⚠️ Обнаружено проблем:');
    console.log(`   ❌ Ошибок: ${this.errors.length}`);
    console.log(`   ⚠️ Предупреждений: ${this.warnings.length}`);
    console.log(`   📝 Пустых стихов: ${this.stats.emptyVerses}`);
    console.log(`   🈳 Отсутствующих переводов: ${this.stats.missingTranslations}`);
    console.log(`   💭 Отсутствующих комментариев: ${this.stats.missingCommentaries}`);

    // Прогресс заполнения
    const completionRate = this.stats.verses > 0 ? 
      ((this.stats.verses - this.stats.emptyVerses) / this.stats.verses * 100).toFixed(1) : 0;
    
    console.log('\n🎯 Прогресс заполнения:');
    console.log(`   📊 Готовность данных: ${completionRate}%`);
    console.log(`   ✅ Заполненных стихов: ${this.stats.verses - this.stats.emptyVerses}`);
    console.log(`   📝 Требуют заполнения: ${this.stats.emptyVerses}`);

    // Рекомендации
    console.log('\n💡 Рекомендации:');
    if (this.errors.length > 0) {
      console.log('   🔧 Исправьте критические ошибки для корректной работы приложения');
    }
    if (this.stats.emptyVerses > 0) {
      console.log('   📝 Заполните шаблоны стихов реальными данными');
    }
    if (this.stats.missingCommentaries > 0) {
      console.log('   💭 Добавьте комментарии раввинов для полноты изучения');
    }

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      stats: this.stats,
      completionRate: parseFloat(completionRate)
    };
  }
}

function main() {
  const validator = new DataValidator();
  const report = validator.validateAll();
  
  // Сохраняем отчет
  const reportPath = path.join(DATA_DIR, 'metadata', 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n💾 Отчет сохранен: ${reportPath}`);

  // Возвращаем код выхода
  process.exit(report.success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { DataValidator };