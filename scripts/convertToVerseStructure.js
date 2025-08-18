import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Скрипт для конвертации структуры "глава -> файл" в "стих -> файл"
 * Новый формат: {parasha}-{chapter:03d}-{verse:03d}.json
 */

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

async function convertChapterToVerses(bookId, parashaId, chapterNumber) {
  const parashaDir = path.join(DATA_DIR, bookId, parashaId);
  const chapterFilePath = path.join(parashaDir, `chapter-${chapterNumber.toString().padStart(3, '0')}.json`);
  
  console.log(`🔄 Конвертирую ${chapterFilePath}...`);
  
  // Проверяем существование файла главы
  if (!fs.existsSync(chapterFilePath)) {
    console.log(`⚠️  Файл ${chapterFilePath} не найден, пропускаю`);
    return;
  }
  
  try {
    // Читаем файл главы
    const chapterData = JSON.parse(fs.readFileSync(chapterFilePath, 'utf8'));
    
    if (!chapterData.verses || !Array.isArray(chapterData.verses)) {
      console.log(`⚠️  В файле ${chapterFilePath} нет массива verses`);
      return;
    }
    
    // Конвертируем каждый стих в отдельный файл
    for (const verse of chapterData.verses) {
      const verseFileName = `${parashaId}-${chapterNumber.toString().padStart(3, '0')}-${verse.number.toString().padStart(3, '0')}.json`;
      const verseFilePath = path.join(parashaDir, verseFileName);
      
      // Создаем структуру данных для стиха
      const verseData = {
        book: chapterData.book || bookId,
        parasha: chapterData.parasha || parashaId,
        chapter: chapterData.chapter || chapterNumber,
        verse: verse.number,
        hebrew: verse.hebrew || [],
        words: verse.words || [],
        commentaries: verse.commentaries || {},
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataVersion: "3.0.0",
          completeness: {
            words: verse.words && verse.words.length > 0 ? "complete" : "partial",
            translations: verse.words && verse.words.some(w => w.pardes) ? "pardes" : "basic",
            commentaries: Object.keys(verse.commentaries || {}).length > 0 ? "complete" : "partial"
          },
          convertedFrom: `chapter-${chapterNumber.toString().padStart(3, '0')}.json`
        }
      };
      
      // Сохраняем файл стиха
      fs.writeFileSync(verseFilePath, JSON.stringify(verseData, null, 2), 'utf8');
      console.log(`✅ Создан ${verseFileName}`);
    }
    
    // Создаем резервную копию исходного файла
    const backupPath = path.join(parashaDir, `backup-chapter-${chapterNumber.toString().padStart(3, '0')}.json`);
    fs.copyFileSync(chapterFilePath, backupPath);
    console.log(`💾 Создана резервная копия: backup-chapter-${chapterNumber.toString().padStart(3, '0')}.json`);
    
  } catch (error) {
    console.error(`❌ Ошибка при конвертации ${chapterFilePath}:`, error.message);
  }
}

async function convertBook(bookId) {
  const bookDir = path.join(DATA_DIR, bookId);
  
  if (!fs.existsSync(bookDir)) {
    console.log(`⚠️  Папка ${bookDir} не найдена`);
    return;
  }
  
  // Получаем список парашот
  const parashas = fs.readdirSync(bookDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
    
  for (const parashaId of parashas) {
    console.log(`\n📖 Обрабатываю паршу: ${bookId}/${parashaId}`);
    
    const parashaDir = path.join(bookDir, parashaId);
    
    // Ищем файлы глав
    const chapterFiles = fs.readdirSync(parashaDir)
      .filter(file => file.startsWith('chapter-') && file.endsWith('.json'))
      .sort();
      
    for (const chapterFile of chapterFiles) {
      const match = chapterFile.match(/chapter-(\d+)\.json/);
      if (match) {
        const chapterNumber = parseInt(match[1], 10);
        await convertChapterToVerses(bookId, parashaId, chapterNumber);
      }
    }
  }
}

async function main() {
  console.log('🚀 Начинаю конвертацию структуры данных...\n');
  
  // Пока конвертируем только genesis
  await convertBook('genesis');
  
  console.log('\n✅ Конвертация завершена!');
  console.log('\n📋 Что дальше:');
  console.log('1. Проверьте созданные файлы стихов');
  console.log('2. Обновите компоненты для загрузки отдельных стихов');
  console.log('3. Удалите старые chapter-XXX.json файлы после проверки');
}

main().catch(console.error);