import { useState, useEffect } from "react";
import { TorahWord } from "@/components/TorahWord";
import { Commentary } from "@/components/Commentary";
import { TorahNavigation } from "@/components/TorahNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Bookmark, Settings, RefreshCw } from "lucide-react";
import { useModularTorahData } from "@/hooks/useModularTorahData";
import { Verse, HebrewWord } from "@/types/torah";

const Index = () => {
  const [currentBookId, setCurrentBookId] = useState("genesis");
  const [currentChapterNum, setCurrentChapterNum] = useState(1);
  const [currentVerseNum, setCurrentVerseNum] = useState(1);
  const [currentParashaId, setCurrentParashaId] = useState<string | undefined>(undefined);
  const [activeWordPosition, setActiveWordPosition] = useState<number | null>(null);
  const [availableChapters, setAvailableChapters] = useState<number[]>([]);
  const [availableVerses, setAvailableVerses] = useState<number[]>([]);

  // Используем новый модульный хук
  const { 
    booksIndex,
    currentBookMetadata,
    currentChapter,
    currentVerseFile, // Новое поле для отдельного стиха
    currentVerse,
    currentBookParashas,
    currentParasha,
    isLoading,
    error,
    progress,
    navigateToVerse,
    loadVerse, // Новый метод
    getAvailableChapters,
    getAvailableVerses,
    getBookParashas,
    clearCache
  } = useModularTorahData();

  // Загружаем доступные главы, стихи и парашот при изменении навигации
  useEffect(() => {
    const loadNavigation = async () => {
      if (currentBookId) {
        // Загружаем парашот для книги
        const parashas = await getBookParashas(currentBookId);
        
        // Если парша не установлена, устанавливаем первую доступную
        if (!currentParashaId && parashas.length > 0) {
          setCurrentParashaId(parashas[0].id);
        }
        
        const chapters = await getAvailableChapters(currentBookId);
        setAvailableChapters(chapters);
        
        const verses = await getAvailableVerses(currentBookId, currentChapterNum, currentParashaId);
        setAvailableVerses(verses);
      }
    };
    
    loadNavigation();
  }, [currentBookId, currentChapterNum, currentParashaId, getAvailableChapters, getAvailableVerses, getBookParashas]);

  // Автоматическая навигация к стиху при изменении координат
  useEffect(() => {
    console.log('🔄 Navigation changed:', { currentBookId, currentChapterNum, currentVerseNum, currentParashaId });
    if (currentBookId && currentChapterNum && currentVerseNum) {
      console.log('📥 Loading verse:', currentBookId, currentChapterNum, currentVerseNum, currentParashaId);
      navigateToVerse(currentBookId, currentChapterNum, currentVerseNum, currentParashaId);
    }
  }, [currentBookId, currentChapterNum, currentVerseNum, currentParashaId, navigateToVerse]);

  // Синхронизация ID парши с загруженной паршей
  useEffect(() => {
    if (currentParasha) {
      setCurrentParashaId(currentParasha.id);
    }
  }, [currentParasha]);

  const getCurrentBookMeta = () => {
    if (currentBookMetadata) {
      return {
        hebrew: currentBookMetadata.hebrew,
        russian: currentBookMetadata.russian,
        english: currentBookMetadata.english
      };
    }
    
    // Возвращаем базовую информацию по ID
    const bookMap: Record<string, { hebrew: string; russian: string; english: string }> = {
      "genesis": { hebrew: "בראשית", russian: "Берешит", english: "Genesis" },
      "exodus": { hebrew: "שמות", russian: "Шмот", english: "Exodus" },
      "leviticus": { hebrew: "ויקרא", russian: "Ваикра", english: "Leviticus" },
      "numbers": { hebrew: "במדבר", russian: "Бемидбар", english: "Numbers" },
      "deuteronomy": { hebrew: "דברים", russian: "Дварим", english: "Deuteronomy" }
    };
    return bookMap[currentBookId] || { hebrew: "...", russian: "...", english: "..." };
  };

  const currentBookMeta = getCurrentBookMeta();



  // УНИВЕРСАЛЬНАЯ функция получения начального стиха для всех 22 пересечений
  const getInitialVerse = (bookId: string, chapter: number, parasha?: string): number => {
    if (!parasha) return 1;
    
    // Хардкодим известные пересечения для быстрого исправления
    const knownOverlaps: Record<string, Record<string, number>> = {
      'genesis': {
        'noach': chapter === 6 ? 9 : 1, // Ноах 6 начинается с стиха 9
        'toldot': chapter === 25 ? 19 : 1, // Толдот 25 начинается с стиха 19
        'vayetzei': chapter === 28 ? 10 : 1, // Ваеце 28 начинается с стиха 10
        'vayishlach': chapter === 32 ? 4 : 1, // Ваишлах 32 начинается с стиха 4
        'vayigash': chapter === 44 ? 18 : 1, // Ваигаш 44 начинается с стиха 18
        'vayechi': chapter === 47 ? 28 : 1, // Ваехи 47 начинается с стиха 28
      },
      'exodus': {
        'vaera': chapter === 6 ? 2 : 1, // Ваера 6 начинается с стиха 2
        'beshalach': chapter === 13 ? 17 : 1, // Бешалах 13 начинается с стиха 17
        'tetzaveh': chapter === 27 ? 20 : 1, // Тецаве 27 начинается с стиха 20
        'ki_tisa': chapter === 30 ? 11 : 1, // Ки тиса 30 начинается с стиха 11
        'pekudei': chapter === 38 ? 21 : 1, // Пекудей 38 начинается с стиха 21
      },
      'leviticus': {
        'bechukotai': chapter === 26 ? 11 : 1, // Бехукотай 26 начинается с стиха 11
      },
      'numbers': {
        'nasso': chapter === 4 ? 21 : 1, // Насо 4 начинается с стиха 21
        'balak': chapter === 22 ? 2 : 1, // Балак 22 начинается с стиха 2
        'pinchas': chapter === 25 ? 10 : 1, // Пинхас 25 начинается с стиха 10
        'matot': chapter === 30 ? 2 : 1, // Матот 30 начинается с стиха 2
      },
      'deuteronomy': {
        'vaetchanan': chapter === 3 ? 23 : 1, // Ваетханан 3 начинается с стиха 23
        'eikev': chapter === 7 ? 12 : 1, // Эйкев 7 начинается с стиха 12
        'reeh': chapter === 11 ? 26 : 1, // Реэ 11 начинается с стиха 26
        'shoftim': chapter === 16 ? 18 : 1, // Шофтим 16 начинается с стиха 18
        'ki_teitzei': chapter === 21 ? 10 : 1, // Ки теце 21 начинается с стиха 10
        'nitzavim': chapter === 29 ? 9 : 1, // Ницавим 29 начинается с стиха 9
      }
    };
    
    return knownOverlaps[bookId]?.[parasha] || 1;
  };

  const handleNavigate = async (bookEnglish: string, chapter: number, verse: number, parasha?: string) => {
    // Конвертируем английское название в ID
    const bookIdMap: Record<string, string> = {
      "Genesis": "genesis",
      "Exodus": "exodus", 
      "Leviticus": "leviticus",
      "Numbers": "numbers",
      "Deuteronomy": "deuteronomy"
    };
    
    const bookId = bookIdMap[bookEnglish] || "genesis";
    const prevBookId = currentBookId;
    const prevParashaId = currentParashaId;
    const prevChapterNum = currentChapterNum;
    
    // Логика установки значений по умолчанию
    if (bookId !== prevBookId) {
      // При смене книги: сбрасываем на первую паршу, первую главу, первый стих
      setCurrentBookId(bookId);
      setCurrentParashaId(undefined); // будет установлена автоматически
      setCurrentChapterNum(1);
      setCurrentVerseNum(1);
    } else if (parasha && parasha !== prevParashaId) {
      // При смене парши: сбрасываем на первую главу парши, правильный первый стих
      const initialVerse = await getInitialVerse(bookId, chapter, parasha);
      setCurrentBookId(bookId);
      setCurrentParashaId(parasha);
      setCurrentChapterNum(chapter); // уже первая глава парши
      setCurrentVerseNum(initialVerse);
    } else if (chapter !== prevChapterNum) {
      // При смене главы: сбрасываем на правильный первый стих
      const initialVerse = getInitialVerse(bookId, chapter, parasha);
      setCurrentBookId(bookId);
      setCurrentParashaId(parasha);
      setCurrentChapterNum(chapter);
      setCurrentVerseNum(initialVerse);
    } else {
      // Обычная навигация - устанавливаем все как есть
      setCurrentBookId(bookId);
      setCurrentParashaId(parasha);
      setCurrentChapterNum(chapter);
      setCurrentVerseNum(verse);
    }
    
    setActiveWordPosition(null);
  };

  const handleWordToggle = (position: number) => {
    setActiveWordPosition(activeWordPosition === position ? null : position);
  };

  const getNavigationChapters = (): number[] => {
    return availableChapters.length > 0 ? availableChapters : [1];
  };

  const getNavigationVerses = (): number[] => {
    return availableVerses.length > 0 ? availableVerses : [1];
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header - в стиле флага Израиля */}
      <header className="israeli-gradient border-b-2 border-accent tehelet-shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-elegant font-bold text-primary-foreground drop-shadow-sm">
                תורה Torah
              </h1>
              <Badge variant="secondary" className="font-body star-david-accent">
                Подстрочный перевод • תרגום מילה במילה
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <TorahNavigation
          currentBook={currentBookMeta.english}
          currentParasha={currentParashaId}
          currentChapter={currentChapterNum}
          currentVerse={currentVerseNum}
          onNavigate={handleNavigate}
          availableParashas={currentBookParashas}
          availableChapters={availableChapters}
          availableVerses={availableVerses}
        />

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-lg font-medium">{progress.currentOperation}</p>
                  <p className="text-sm text-muted-foreground">
                    {progress.loaded} из {progress.total} завершено
                  </p>
                  <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Ошибка загрузки данных: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - показываем только когда данные загружены */}
        {!isLoading && (currentVerse || currentVerseFile) && (
          <div className="space-y-6">
            {/* Main Text - Full Width */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="font-elegant text-primary">
                      {currentBookMeta.hebrew} {currentChapterNum}:{currentVerseNum} • {currentBookMeta.russian} {currentChapterNum}:{currentVerseNum}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hebrew and Russian Text Side by Side */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Hebrew Text */}
                  <div className="order-1">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg h-full flex flex-col">
                      <h3 className="text-sm font-elegant text-blue-600 dark:text-blue-400 mb-3 text-center flex items-center justify-center gap-2">
                        עברית • Иврит
                        <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-full">Кликните на слова</span>
                      </h3>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-right leading-loose text-xl" dir="rtl">
                            {(currentVerseFile?.words || currentVerse?.words || []).map((word, index) => (
                            <TorahWord
                              key={word.position || index}
                              hebrew={word.hebrew}
                              transliteration={word.transliteration}
                              translations={word.translations}
                              pardes={(word as any).pardes}
                              verse={`${currentChapterNum}:${currentVerseNum}`}
                              position={word.position || index + 1}
                              isActive={activeWordPosition === (word.position || index + 1)}
                              onToggle={handleWordToggle}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Russian Translation */}
                  <div className="order-2">
                    <div className="bg-gradient-to-bl from-yellow-50 to-amber-100 dark:from-yellow-950 dark:to-amber-900 p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 shadow-lg h-full flex flex-col">
                      <h3 className="text-sm font-elegant text-amber-600 dark:text-amber-400 mb-3 text-center">
                        Русский перевод
                      </h3>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="font-body text-lg leading-relaxed text-center text-amber-900 dark:text-amber-100">
                          {currentVerseFile?.russian || 
                           'Русский перевод будет добавлен в ближайшее время'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commentary Section - Full Width Below Main Text */}
            <Commentary
                verse={`${currentChapterNum}:${currentVerseNum}`}
                bookName={currentBookMeta.russian}
                commentaries={(currentVerseFile?.commentaries || currentVerse?.commentaries) ? Object.entries(currentVerseFile?.commentaries || currentVerse?.commentaries || {}).map(([author, text]) => ({
                  author,
                  text: text || "",
                  category: ""
                })) : []}
              />
          </div>
        )}

        {/* Fallback when verse is not found */}
        {!isLoading && !currentVerse && !currentVerseFile && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">
                Стих {currentChapterNum}:{currentVerseNum} не найден в книге {currentBookMeta.russian}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Попробуйте выбрать другой стих или главу
              </p>
              <Button 
                onClick={() => {
                  // Очистка всех типов кэша
                  clearCache();
                  localStorage.clear();
                  sessionStorage.clear();
                  
                  // Принудительная очистка кэша браузера
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      names.forEach(function(name) {
                        caches.delete(name);
                      });
                    });
                  }
                  
                  // Перезагрузка с принудительной очисткой кэша
                  window.location.reload();
                }} 
                variant="outline" 
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                🔄 Очистить весь кэш
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;