import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Создает полную структуру файлов для всех 5 книг Торы
 * Формат: {parasha}-{chapter:03d}-{verse:03d}.json
 */

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Структура всех книг Торы
const TORAH_STRUCTURE = {
  genesis: {
    hebrew: "בראשית",
    russian: "Берешит",
    parashas: {
      beresheet: { chapters: [1, 2, 3, 4, 5, 6], verses: [31, 25, 24, 26, 32, 8] },
      noach: { chapters: [6, 7, 8, 9, 10, 11], verses: [14, 24, 22, 29, 32, 32] },
      lech_lecha: { chapters: [12, 13, 14, 15, 16, 17], verses: [20, 18, 24, 21, 16, 27] },
      vayera: { chapters: [18, 19, 20, 21, 22], verses: [33, 38, 18, 34, 24] },
      chayei_sarah: { chapters: [23, 24, 25], verses: [20, 67, 18] },
      toldot: { chapters: [25, 26, 27, 28], verses: [16, 35, 46, 22] },
      vayetzei: { chapters: [28, 29, 30, 31, 32], verses: [22, 35, 43, 55, 3] },
      vayishlach: { chapters: [32, 33, 34, 35, 36], verses: [33, 20, 31, 29, 43] },
      vayeshev: { chapters: [37, 38, 39, 40], verses: [36, 30, 23, 23] },
      miketz: { chapters: [41, 42, 43, 44], verses: [57, 38, 34, 34] },
      vayigash: { chapters: [44, 45, 46, 47], verses: [34, 28, 34, 31] },
      vayechi: { chapters: [47, 48, 49, 50], verses: [31, 22, 33, 26] }
    }
  },
  exodus: {
    hebrew: "שמות",
    russian: "Шмот",
    parashas: {
      shemot: { chapters: [1, 2, 3, 4, 5, 6], verses: [22, 25, 22, 31, 23, 13] },
      vaera: { chapters: [6, 7, 8, 9], verses: [17, 25, 28, 35] },
      bo: { chapters: [10, 11, 12, 13], verses: [29, 10, 51, 16] },
      beshalach: { chapters: [13, 14, 15, 16, 17], verses: [6, 31, 27, 36, 16] },
      yitro: { chapters: [18, 19, 20], verses: [27, 25, 23] },
      mishpatim: { chapters: [21, 22, 23, 24], verses: [37, 30, 33, 18] },
      terumah: { chapters: [25, 26, 27], verses: [40, 37, 21] },
      tetzaveh: { chapters: [27, 28, 29, 30], verses: [21, 43, 46, 10] },
      ki_tisa: { chapters: [30, 31, 32, 33, 34], verses: [28, 18, 35, 23, 35] },
      vayakhel: { chapters: [35, 36, 37, 38], verses: [35, 38, 29, 31] },
      pekudei: { chapters: [38, 39, 40], verses: [20, 43, 38] }
    }
  },
  leviticus: {
    hebrew: "ויקרא",
    russian: "Ваикра",
    parashas: {
      vayikra: { chapters: [1, 2, 3, 4, 5], verses: [17, 16, 17, 35, 26] },
      tzav: { chapters: [6, 7, 8], verses: [23, 38, 36] },
      shemini: { chapters: [9, 10, 11], verses: [24, 20, 47] },
      tazria: { chapters: [12, 13], verses: [8, 59] },
      metzora: { chapters: [14, 15], verses: [57, 33] },
      acharei_mot: { chapters: [16, 17, 18], verses: [34, 16, 30] },
      kedoshim: { chapters: [19, 20], verses: [37, 27] },
      emor: { chapters: [21, 22, 23, 24], verses: [24, 33, 44, 23] },
      behar: { chapters: [25], verses: [55] },
      bechukotai: { chapters: [26, 27], verses: [46, 34] }
    }
  },
  numbers: {
    hebrew: "במדבר",
    russian: "Бемидбар",
    parashas: {
      bamidbar: { chapters: [1, 2, 3, 4], verses: [54, 34, 51, 49] },
      nasso: { chapters: [4, 5, 6, 7], verses: [49, 31, 27, 89] },
      behaalotcha: { chapters: [8, 9, 10, 11, 12], verses: [26, 23, 36, 35, 16] },
      shelach: { chapters: [13, 14, 15], verses: [33, 45, 41] },
      korach: { chapters: [16, 17, 18], verses: [50, 28, 32] },
      chukat: { chapters: [19, 20, 21, 22], verses: [22, 29, 35, 1] },
      balak: { chapters: [22, 23, 24, 25], verses: [40, 30, 25, 18] },
      pinchas: { chapters: [25, 26, 27, 28, 29, 30], verses: [15, 65, 23, 31, 40, 17] },
      matot: { chapters: [30, 31, 32], verses: [17, 54, 42] },
      masei: { chapters: [33, 34, 35, 36], verses: [56, 29, 34, 13] }
    }
  },
  deuteronomy: {
    hebrew: "דברים", 
    russian: "Дварим",
    parashas: {
      devarim: { chapters: [1, 2, 3], verses: [46, 37, 29] },
      vaetchanan: { chapters: [3, 4, 5, 6, 7], verses: [22, 49, 30, 25, 26] },
      eikev: { chapters: [7, 8, 9, 10, 11], verses: [26, 20, 29, 22, 32] },
      reeh: { chapters: [11, 12, 13, 14, 15, 16], verses: [32, 32, 19, 29, 23, 22] },
      shoftim: { chapters: [16, 17, 18, 19, 20, 21], verses: [22, 20, 22, 21, 20, 23] },
      ki_teitzei: { chapters: [21, 22, 23, 24, 25], verses: [23, 29, 25, 22, 19] },
      ki_tavo: { chapters: [26, 27, 28], verses: [19, 26, 68] },
      nitzavim: { chapters: [29, 30], verses: [28, 20] },
      vayeilech: { chapters: [31], verses: [30] },
      haazinu: { chapters: [32], verses: [52] },
      vezot_haberachah: { chapters: [33, 34], verses: [29, 12] }
    }
  }
};

/**
 * Создает заглушку для файла стиха
 */
function createVerseStub(bookId, parashaId, chapter, verse) {
  return {
    book: bookId,
    parasha: parashaId,
    chapter: chapter,
    verse: verse,
    hebrew: [
      `[placeholder_word_${verse}_1]`,
      `[placeholder_word_${verse}_2]`,
      `[placeholder_word_${verse}_3]`
    ],
    words: [
      {
        hebrew: `[placeholder_word_${verse}_1]`,
        transliteration: `placeholder_${verse}_1`,
        translations: [
          {
            meaning: `[перевод слова ${verse}_1]`,
            context: `[контекст для слова ${verse}_1]`,
            frequency: "common"
          }
        ]
      },
      {
        hebrew: `[placeholder_word_${verse}_2]`,
        transliteration: `placeholder_${verse}_2`,
        translations: [
          {
            meaning: `[перевод слова ${verse}_2]`,
            context: `[контекст для слова ${verse}_2]`,
            frequency: "common"
          }
        ]
      },
      {
        hebrew: `[placeholder_word_${verse}_3]`,
        transliteration: `placeholder_${verse}_3`,
        translations: [
          {
            meaning: `[перевод слова ${verse}_3]`,
            context: `[контекст для слова ${verse}_3]`,
            frequency: "common"
          }
        ]
      }
    ],
    commentaries: {
      rashi: `[Комментарий Раши на стих ${chapter}:${verse}]`,
      ramban: `[Комментарий Рамбана на стих ${chapter}:${verse}]`
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      dataVersion: "3.0.0",
      completeness: {
        words: "placeholder",
        translations: "placeholder", 
        commentaries: "placeholder"
      }
    }
  };
}

/**
 * Создает структуру для одной книги
 */
async function createBookStructure(bookId) {
  const bookData = TORAH_STRUCTURE[bookId];
  if (!bookData) {
    console.log(`⚠️  Книга ${bookId} не найдена в структуре`);
    return;
  }

  console.log(`\n📖 Создаю структуру для ${bookData.russian} (${bookData.hebrew})`);
  const bookDir = path.join(DATA_DIR, bookId);

  // Создаем папку книги если не существует
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }

  let totalFiles = 0;

  // Проходим по всем парашот
  for (const [parashaId, parashaData] of Object.entries(bookData.parashas)) {
    console.log(`  📝 Парша: ${parashaId}`);
    
    const parashaDir = path.join(bookDir, parashaId);
    
    // Создаем папку парши
    if (!fs.existsSync(parashaDir)) {
      fs.mkdirSync(parashaDir, { recursive: true });
    }

    // Создаем metadata.json для парши
    const metadata = {
      id: parashaId,
      availableChapters: parashaData.chapters,
      totalChapters: parashaData.chapters.length,
      totalVerses: parashaData.verses.reduce((sum, count) => sum + count, 0),
      lastUpdated: new Date().toISOString(),
      dataVersion: "3.0.0"
    };
    
    const metadataPath = path.join(parashaDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Создаем файлы стихов
    for (let i = 0; i < parashaData.chapters.length; i++) {
      const chapter = parashaData.chapters[i];
      const verseCount = parashaData.verses[i];
      
      for (let verse = 1; verse <= verseCount; verse++) {
        const fileName = `${parashaId}-${chapter.toString().padStart(3, '0')}-${verse.toString().padStart(3, '0')}.json`;
        const filePath = path.join(parashaDir, fileName);
        
        // Создаем только если файл не существует (не перезаписываем готовые данные)
        if (!fs.existsSync(filePath)) {
          const verseData = createVerseStub(bookId, parashaId, chapter, verse);
          fs.writeFileSync(filePath, JSON.stringify(verseData, null, 2), 'utf8');
          totalFiles++;
        }
      }
    }
    
    console.log(`    ✅ ${parashaData.chapters.length} глав, ${parashaData.verses.reduce((sum, count) => sum + count, 0)} стихов`);
  }
  
  console.log(`  🎯 Всего создано файлов: ${totalFiles}`);
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Создание полной структуры файлов для всех книг Торы...\n');
  
  let grandTotal = 0;
  
  for (const bookId of Object.keys(TORAH_STRUCTURE)) {
    await createBookStructure(bookId);
    
    // Подсчитываем общее количество файлов для статистики
    const bookData = TORAH_STRUCTURE[bookId];
    const bookTotal = Object.values(bookData.parashas).reduce((sum, parasha) => {
      return sum + parasha.verses.reduce((sum2, count) => sum2 + count, 0);
    }, 0);
    grandTotal += bookTotal;
  }
  
  console.log('\n✅ Создание структуры завершено!');
  console.log(`📊 Общая статистика:`);
  console.log(`   • Книг: ${Object.keys(TORAH_STRUCTURE).length}`);
  console.log(`   • Парашот: ${Object.values(TORAH_STRUCTURE).reduce((sum, book) => sum + Object.keys(book.parashas).length, 0)}`);
  console.log(`   • Общее количество стихов: ${grandTotal}`);
  
  console.log('\n🔄 Следующие шаги:');
  console.log('1. Заменяйте заглушки на реальные данные');
  console.log('2. Тестируйте новую структуру в приложении');
  console.log('3. Обновите навигацию для использования loadVerse()');
}

main().catch(console.error);