const fs = require('fs');
const path = require('path');

/**
 * Скрипт для создания полной модульной структуры данных Торы
 * Использование: node scripts/createDataStructure.js
 */

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Информация о книгах Торы
const TORAH_BOOKS = [
  {
    id: 'genesis',
    english: 'Genesis',
    hebrew: 'בראשית',
    russian: 'Берешит',
    transliteration: 'Bereishit',
    chapters: 50,
    totalVerses: 1533,
    description: 'Первая книга Торы, описывающая сотворение мира и историю патриархов',
    chapterInfo: [
      { number: 1, verses: 31, title: 'Сотворение мира', theme: 'Шесть дней творения' },
      { number: 2, verses: 25, title: 'Человек в Эдемском саду', theme: 'Создание человека' },
      { number: 3, verses: 24, title: 'Грехопадение', theme: 'Нарушение заповеди' },
      { number: 4, verses: 26, title: 'Каин и Авель', theme: 'Первое убийство' },
      { number: 5, verses: 32, title: 'Родословие от Адама', theme: 'Поколения до потопа' }
    ]
  },
  {
    id: 'exodus',
    english: 'Exodus',
    hebrew: 'שמות',
    russian: 'Шмот',
    transliteration: 'Shemot',
    chapters: 40,
    totalVerses: 1213,
    description: 'Вторая книга Торы, рассказывающая об исходе из Египта',
    chapterInfo: [
      { number: 1, verses: 22, title: 'Порабощение в Египте', theme: 'Начало рабства' },
      { number: 2, verses: 25, title: 'Рождение Моисея', theme: 'Спаситель народа' },
      { number: 3, verses: 22, title: 'Неопалимая купина', theme: 'Призвание Моисея' }
    ]
  },
  {
    id: 'leviticus',
    english: 'Leviticus',
    hebrew: 'ויקרא',
    russian: 'Ваикра',
    transliteration: 'Vayikra',
    chapters: 27,
    totalVerses: 859,
    description: 'Третья книга Торы, содержащая законы о жертвоприношениях и чистоте',
    chapterInfo: [
      { number: 1, verses: 17, title: 'Всесожжения', theme: 'Законы жертвоприношений' },
      { number: 2, verses: 16, title: 'Хлебные приношения', theme: 'Мучные жертвы' },
      { number: 3, verses: 17, title: 'Мирные жертвы', theme: 'Жертвы благодарения' }
    ]
  },
  {
    id: 'numbers',
    english: 'Numbers',
    hebrew: 'במדבר',
    russian: 'Бемидбар',
    transliteration: 'Bemidbar',
    chapters: 36,
    totalVerses: 1288,
    description: 'Четвертая книга Торы о странствии в пустыне',
    chapterInfo: [
      { number: 1, verses: 54, title: 'Перепись народа', theme: 'Подсчет колен' },
      { number: 2, verses: 34, title: 'Расположение станов', theme: 'Порядок в стане' },
      { number: 3, verses: 51, title: 'Левиты', theme: 'Служители Храма' }
    ]
  },
  {
    id: 'deuteronomy',
    english: 'Deuteronomy',
    hebrew: 'דברים',
    russian: 'Дварим',
    transliteration: 'Devarim',
    chapters: 34,
    totalVerses: 959,
    description: 'Пятая книга Торы, последние речи Моисея',
    chapterInfo: [
      { number: 1, verses: 46, title: 'Воспоминания о пути', theme: 'История странствий' },
      { number: 2, verses: 37, title: 'Завоевания', theme: 'Победы народа' },
      { number: 3, verses: 29, title: 'Разделение земли', theme: 'Наследование' }
    ]
  }
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dirPath}`);
  }
}

function createBooksIndex() {
  const indexPath = path.join(DATA_DIR, 'metadata', 'books.json');
  
  const booksIndex = {
    books: TORAH_BOOKS.map(book => ({
      id: book.id,
      english: book.english,
      hebrew: book.hebrew,
      russian: book.russian,
      transliteration: book.transliteration,
      chapters: book.chapters,
      totalVerses: book.totalVerses,
      description: book.description
    })),
    totalBooks: TORAH_BOOKS.length,
    totalChapters: TORAH_BOOKS.reduce((sum, book) => sum + book.chapters, 0),
    totalVerses: TORAH_BOOKS.reduce((sum, book) => sum + book.totalVerses, 0),
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(indexPath, JSON.stringify(booksIndex, null, 2), 'utf8');
  console.log(`✅ Создан индекс книг: ${indexPath}`);
}

function createBookMetadata(book) {
  const metadataPath = path.join(DATA_DIR, book.id, 'metadata.json');
  
  const metadata = {
    book: book.id,
    english: book.english,
    hebrew: book.hebrew,
    russian: book.russian,
    transliteration: book.transliteration,
    description: book.description,
    totalChapters: book.chapters,
    totalVerses: book.totalVerses,
    chapters: book.chapterInfo || [],
    availableChapters: book.chapterInfo ? book.chapterInfo.map(ch => ch.number) : [1, 2, 3],
    lastUpdated: new Date().toISOString(),
    dataVersion: '1.0.0'
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`✅ Создан метаданные ${book.id}: ${metadataPath}`);
}

function createEmptyChapterTemplate(bookId, chapterNum, chapterInfo) {
  const chapterPath = path.join(DATA_DIR, bookId, `chapter-${chapterNum.toString().padStart(3, '0')}.json`);
  
  // Если файл уже существует, не перезаписываем
  if (fs.existsSync(chapterPath)) {
    console.log(`⏩ Глава уже существует: ${chapterPath}`);
    return;
  }

  const chapterTemplate = {
    book: bookId,
    chapter: chapterNum,
    title: chapterInfo?.title || `Глава ${chapterNum}`,
    theme: chapterInfo?.theme || 'Тема не определена',
    totalVerses: chapterInfo?.verses || 31,
    verses: [
      {
        number: 1,
        hebrew: ['[ТРЕБУЕТСЯ_ЗАПОЛНЕНИЕ]'],
        russian: '[ТРЕБУЕТСЯ ПЕРЕВОД НА РУССКИЙ]',
        english: '[ТРЕБУЕТСЯ ПЕРЕВОД НА АНГЛИЙСКИЙ]',
        words: [
          {
            hebrew: '[ТРЕБУЕТСЯ_ЗАПОЛНЕНИЕ]',
            transliteration: '[ТРЕБУЕТСЯ_ТРАНСЛИТЕРАЦИЯ]',
            root: '[КОРЕНЬ]',
            translations: [
              {
                meaning: '[ТРЕБУЕТСЯ ПЕРЕВОД]',
                context: '[ТРЕБУЕТСЯ КОНТЕКСТ]',
                grammar: '[ТРЕБУЕТСЯ ГРАММАТИКА]',
                sources: ['[ИСТОЧНИК]']
              }
            ],
            morphology: {
              partOfSpeech: 'unknown',
              gender: null,
              number: 'singular'
            },
            occurrences: 1,
            frequency: 'unknown'
          }
        ],
        commentaries: {
          rashi: '[ТРЕБУЕТСЯ КОММЕНТАРИЙ РАШИ]',
          ramban: '[ТРЕБУЕТСЯ КОММЕНТАРИЙ РАМБАНА]',
          ibn_ezra: '[ТРЕБУЕТСЯ КОММЕНТАРИЙ ИБН ЭЗРЫ]'
        }
      }
    ],
    metadata: {
      availableVerses: [1],
      lastUpdated: new Date().toISOString(),
      dataVersion: '1.0.0',
      completeness: {
        verses: '1/' + (chapterInfo?.verses || 31) + ' (требуется заполнение)',
        words: 'требуется заполнение',
        translations: 'требуется заполнение',
        commentaries: 'требуется заполнение'
      }
    }
  };

  fs.writeFileSync(chapterPath, JSON.stringify(chapterTemplate, null, 2), 'utf8');
  console.log(`✅ Создан шаблон главы: ${chapterPath}`);
}

function createCommentatorsIndex() {
  const commentatorsPath = path.join(DATA_DIR, 'metadata', 'commentators.json');
  
  const commentators = {
    commentators: [
      {
        id: 'rashi',
        name: 'Раши',
        hebrewName: 'רש"י',
        fullName: 'Рабби Шломо Ицхаки',
        years: '1040-1105',
        description: 'Величайший комментатор Торы и Талмуда, объясняющий простой смысл текста',
        style: 'peshat',
        language: 'hebrew'
      },
      {
        id: 'ramban',
        name: 'Рамбан',
        hebrewName: 'רמב"ן',
        fullName: 'Рабби Моше бен Нахман',
        years: '1194-1270',
        description: 'Каббалист и комментатор, сочетающий простой и скрытый смысл',
        style: 'peshat-remez',
        language: 'hebrew'
      },
      {
        id: 'ibn_ezra',
        name: 'Ибн Эзра',
        hebrewName: 'אבן עזרא',
        fullName: 'Рабби Авраам Ибн Эзра',
        years: '1089-1167',
        description: 'Грамматик и философ, точный анализ текста',
        style: 'peshat-grammar',
        language: 'hebrew'
      },
      {
        id: 'sforno',
        name: 'Сфорно',
        hebrewName: 'ספורנו',
        fullName: 'Рабби Овадья Сфорно',
        years: '1475-1550',
        description: 'Итальянский комментатор эпохи Возрождения',
        style: 'peshat-philosophy',
        language: 'hebrew'
      },
      {
        id: 'kli_yakar',
        name: 'Кли Якар',
        hebrewName: 'כלי יקר',
        fullName: 'Рабби Шломо Эфраим Лунчиц',
        years: '1550-1619',
        description: 'Моралист и проповедник, извлекающий этические уроки',
        style: 'drash-ethics',
        language: 'hebrew'
      }
    ]
  };

  fs.writeFileSync(commentatorsPath, JSON.stringify(commentators, null, 2), 'utf8');
  console.log(`✅ Создан индекс комментаторов: ${commentatorsPath}`);
}

function createProgressTracker() {
  const progressPath = path.join(DATA_DIR, 'metadata', 'progress.json');
  
  const progress = {
    totalBooks: TORAH_BOOKS.length,
    totalChapters: TORAH_BOOKS.reduce((sum, book) => sum + book.chapters, 0),
    totalVerses: TORAH_BOOKS.reduce((sum, book) => sum + book.totalVerses, 0),
    completed: {
      books: 0,
      chapters: 0,
      verses: 15, // Уже существующие
      words: 0,
      translations: 0,
      commentaries: 0
    },
    progress: {
      overall: '0.26%', // 15/5852 стихов
      genesis: '6%', // 3/50 глав
      exodus: '7.5%', // 3/40 глав
      leviticus: '11.1%', // 3/27 глав
      numbers: '8.3%', // 3/36 глав
      deuteronomy: '8.8%' // 3/34 главы
    },
    lastUpdated: new Date().toISOString(),
    estimatedCompletion: {
      conservative: '2-3 года при активной работе',
      optimistic: '1-2 года при команде переводчиков',
      realistic: '2 года при систематической работе'
    },
    workRequired: {
      verses: TORAH_BOOKS.reduce((sum, book) => sum + book.totalVerses, 0) - 15,
      estimatedHoursPerVerse: 2,
      totalHours: (TORAH_BOOKS.reduce((sum, book) => sum + book.totalVerses, 0) - 15) * 2
    }
  };

  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2), 'utf8');
  console.log(`✅ Создан трекер прогресса: ${progressPath}`);
}

function main() {
  console.log('🚀 Создание модульной структуры данных Торы...\n');

  // Создаем базовые папки
  ensureDirectoryExists(path.join(DATA_DIR, 'metadata'));
  
  // Создаем папки для каждой книги
  TORAH_BOOKS.forEach(book => {
    ensureDirectoryExists(path.join(DATA_DIR, book.id));
  });

  // Создаем файлы метаданных
  console.log('\n📝 Создание файлов метаданных...');
  createBooksIndex();
  createCommentatorsIndex();
  createProgressTracker();

  // Создаем метаданные для каждой книги
  console.log('\n📚 Создание метаданных книг...');
  TORAH_BOOKS.forEach(book => {
    createBookMetadata(book);
  });

  // Создаем шаблоны глав
  console.log('\n📖 Создание шаблонов глав...');
  TORAH_BOOKS.forEach(book => {
    const chaptersToCreate = book.chapterInfo || [
      { number: 1, verses: 31, title: 'Глава 1' },
      { number: 2, verses: 25, title: 'Глава 2' },
      { number: 3, verses: 24, title: 'Глава 3' }
    ];
    
    chaptersToCreate.forEach(chapterInfo => {
      createEmptyChapterTemplate(book.id, chapterInfo.number, chapterInfo);
    });
  });

  console.log('\n✅ Модульная структура создана успешно!');
  console.log('\n📊 Статистика:');
  console.log(`   📚 Книг: ${TORAH_BOOKS.length}`);
  console.log(`   📖 Глав: ${TORAH_BOOKS.reduce((sum, book) => sum + (book.chapterInfo?.length || 3), 0)}`);
  console.log(`   📝 Стихов к заполнению: ${TORAH_BOOKS.reduce((sum, book) => sum + book.totalVerses, 0)}`);
  
  console.log('\n🎯 Следующие шаги:');
  console.log('   1. Заполните данные в созданных шаблонах глав');
  console.log('   2. Добавьте переводы и комментарии');
  console.log('   3. Протестируйте загрузку в приложении');
  console.log('   4. Используйте npm run data:validate для проверки');
}

if (require.main === module) {
  main();
}

module.exports = {
  TORAH_BOOKS,
  createBooksIndex,
  createBookMetadata,
  createEmptyChapterTemplate,
  createCommentatorsIndex,
  createProgressTracker
};