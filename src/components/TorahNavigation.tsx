import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Parasha } from "../types/torah";
import { getDataPath } from "@/utils/pathUtils";

interface TorahNavigationProps {
  currentBook: string;
  currentParasha?: string;
  currentChapter: number;
  currentVerse: number;
  onNavigate: (book: string, chapter: number, verse: number, parasha?: string) => void;
  availableParashas: Parasha[];
  availableChapters: number[];
  availableVerses: number[];
}

const TORAH_BOOKS = [
  { hebrew: "בראשית", russian: "Берешит", english: "Genesis" },
  { hebrew: "שמות", russian: "Шмот", english: "Exodus" },
  { hebrew: "ויקרא", russian: "Вайикра", english: "Leviticus" },
  { hebrew: "במדבר", russian: "Бамидбар", english: "Numbers" },
  { hebrew: "דברים", russian: "Дварим", english: "Deuteronomy" }
];

export const TorahNavigation = ({ 
  currentBook, 
  currentParasha,
  currentChapter, 
  currentVerse, 
  onNavigate,
  availableParashas,
  availableChapters,
  availableVerses
}: TorahNavigationProps) => {
  const currentBookData = TORAH_BOOKS.find(book => book.english === currentBook);
  
  // Состояния для полной структуры Торы
  const [torahStructure, setTorahStructure] = useState<any>(null);
  const [allParashas, setAllParashas] = useState<Parasha[]>(availableParashas);
  const [allChapters, setAllChapters] = useState<number[]>([]);
  const [allVerses, setAllVerses] = useState<number[]>([]);
  
  // Fallback данные для случая, когда загрузка не удалась
  // defaultChapters больше не нужен - используем данные из torah-structure.json
  // Будет определяться динамически на основе текущей главы

  // Загружаем полную структуру Торы
  useEffect(() => {
    const loadTorahStructure = async () => {
      try {
        const timestamp = Date.now();
                const [structureResponse, parashasResponse] = await Promise.all([
          fetch(`${getDataPath('metadata/torah-structure.json')}?v=${timestamp}&cache=false`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }),
          fetch(`${getDataPath('metadata/parashas.json')}?v=${timestamp}&cache=false`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache', 
              'Expires': '0'
            }
          })
        ]);
        
        if (structureResponse.ok && parashasResponse.ok) {
          const structure = await structureResponse.json();
          const parashas = await parashasResponse.json();
          

          
          setTorahStructure(structure);
          
          // Устанавливаем парашот для текущей книги (приводим к нижнему регистру)
          const bookKey = currentBook.toLowerCase();
          const bookParashas = parashas[bookKey] || [];

          
          // Всегда используем структурные данные, если они есть
          if (bookParashas.length > 0) {
            setAllParashas(bookParashas);
          } else {

            setAllParashas(availableParashas);
          }
          
          // Устанавливаем главы для текущей книги (приводим к нижнему регистру)
          const bookStructure = structure.books[bookKey];
          if (bookStructure) {
            const chapters = [];
            for (let i = 1; i <= bookStructure.chapters; i++) {
              chapters.push(i);
            }
            setAllChapters(chapters);
          }
          
          // Устанавливаем стихи для текущей главы
          if (bookStructure && bookStructure.chaptersData[currentChapter]) {
            const verseCount = bookStructure.chaptersData[currentChapter].verses;
            const verses = [];
            for (let i = 1; i <= verseCount; i++) {
              verses.push(i);
            }
            setAllVerses(verses);
          }
        }
      } catch (error) {
        console.error('Error loading Torah structure:', error);
        // Fallback - используем доступные данные
        setAllParashas(availableParashas);
        setAllChapters(availableChapters.length > 0 ? availableChapters : [1]);
        setAllVerses(availableVerses.length > 0 ? availableVerses : [1]); // Только стих 1 как fallback
      }
    };
    
    loadTorahStructure();
  }, [currentBook, availableParashas, availableChapters, availableVerses, currentChapter]);

  // Обновляем главы при смене парши
  useEffect(() => {
    if (currentParasha && allParashas.length > 0) {
      const parasha = allParashas.find(p => p.id === currentParasha);
      if (parasha) {
        const chapters = [];
        for (let i = parasha.startChapter; i <= parasha.endChapter; i++) {
          chapters.push(i);
        }
        setAllChapters(chapters);
      }
    }
  }, [currentParasha, allParashas]);

  // УНИВЕРСАЛЬНАЯ система обновления стихов для всех 22 пересечений
  useEffect(() => {

    if (torahStructure && currentChapter && allParashas.length > 0) {
      try {
        // Если парша не выбрана, используем fallback
        if (!currentParasha) {
          const bookStructure = torahStructure.books[currentBook];
          if (bookStructure && bookStructure.chaptersData[currentChapter]) {
            const verseCount = bookStructure.chaptersData[currentChapter].verses;
            const verses = [];
            for (let i = 1; i <= verseCount; i++) {
              verses.push(i);
            }
            console.log('📊 TorahNavigation: Setting verses for full chapter', currentChapter, ':', verses);
            setAllVerses(verses);
          }
          return;
        }

        // Находим данные парши из allParashas
        const parasha = allParashas.find((p: any) => p.id === currentParasha);
        
        if (parasha) {
          let verseStart = 1;
          const bookStructure = torahStructure.books[currentBook.toLowerCase()];
          
          // Проверяем специальную запись для пересекающихся глав (например, 6_noach)
          const specialKey = `${currentChapter}_${currentParasha}`;
          let verseEnd;
          if (bookStructure?.chaptersData?.[specialKey]) {
            verseEnd = bookStructure.chaptersData[specialKey].verses;
          } else {
            verseEnd = bookStructure?.chaptersData?.[currentChapter]?.verses || 1;
          }
          
          // Если используем специальный ключ (например, 6_noach), то он уже содержит правильные данные
          if (bookStructure?.chaptersData?.[specialKey]) {
            verseStart = bookStructure.chaptersData[specialKey].startVerse || parasha.startVerse;
            verseEnd = bookStructure.chaptersData[specialKey].endVerse || bookStructure.chaptersData[specialKey].verses;
          } else {
            // Обычная логика для парши
            if (currentChapter === parasha.startChapter) {
              verseStart = parasha.startVerse;
              // Если это также последняя глава парши
              if (currentChapter === parasha.endChapter) {
                verseEnd = parasha.endVerse;
              }
            }
            // Последняя глава парши (но не первая)
            else if (currentChapter === parasha.endChapter) {
              verseEnd = parasha.endVerse;
            }
          }
          
          const verses = [];
          for (let i = verseStart; i <= verseEnd; i++) {
            verses.push(i);
          }

          setAllVerses(verses);
          return;
        }
      } catch (error) {
        console.error('Error calculating verse range:', error);
      }
    }
    
    // Fallback для полной главы
    if (torahStructure && currentChapter) {
      const bookStructure = torahStructure.books[currentBook];
      if (bookStructure && bookStructure.chaptersData[currentChapter]) {
        const verseCount = bookStructure.chaptersData[currentChapter].verses;
        const verses = [];
        for (let i = 1; i <= verseCount; i++) {
          verses.push(i);
        }
        console.log('📊 TorahNavigation: Setting fallback verses for chapter', currentChapter, ':', verses);
        setAllVerses(verses);
      } else {
        console.log('❌ TorahNavigation: No chapter data found - setting [1]');
        setAllVerses([1]);
      }
    }
  }, [torahStructure, currentBook, currentChapter, currentParasha, allParashas]);
  


  // Функция для определения парши по главе
  const getParashaByChapter = (chapter: number): string | undefined => {
    return allParashas.find(p => 
      chapter >= p.startChapter && 
      chapter <= p.endChapter
    )?.id;
  };
  
  // Функция для получения глав парши
  const getChaptersForParasha = (parashaId: string): number[] => {
    const parasha = allParashas.find(p => p.id === parashaId);
    if (!parasha) return allChapters;
    
    const chapters = [];
    for (let i = parasha.startChapter; i <= parasha.endChapter; i++) {
      chapters.push(i);
    }
    return chapters;
  };

  return (
    <Card className="mb-6 israeli-gradient tehelet-shadow">
      <CardContent className="p-4">
        {/* Navigation Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-4 overflow-x-auto">
            {/* Book Selection */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-elegant text-blue-200 text-left">Книга</h3>
              <Select value={currentBook} onValueChange={(value) => onNavigate(value, 1, 1)}>
                <SelectTrigger className="w-full lg:w-56 bg-gradient-to-r from-blue-500/30 to-blue-400/20 border-2 border-blue-300/50 text-primary-foreground shadow-lg backdrop-blur-sm hover:from-blue-500/40 hover:to-blue-400/30 transition-all duration-300 text-sm h-auto py-2">
                  <SelectValue placeholder="Книга" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-300/30 shadow-xl">
                  {TORAH_BOOKS.map((book) => (
                    <SelectItem key={book.english} value={book.english} className="hover:bg-blue-50">
                      <div className="flex items-center gap-1 max-w-52">
                        <span className="font-hebrew text-blue-600 text-sm truncate">{book.hebrew}</span>
                        <span className="font-elegant text-blue-800 text-sm truncate">• {book.russian}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parasha Selection */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-elegant text-blue-200 text-left">Недельная глава</h3>
              <Select 
                value={currentParasha || ""} 
                onValueChange={(value) => {
                  const parasha = allParashas.find(p => p.id === value);
                  if (parasha) {
                    onNavigate(currentBook, parasha.startChapter, 1, value);
                  }
                }}
              >
                <SelectTrigger className="w-full lg:w-56 bg-gradient-to-r from-blue-500/30 to-blue-400/20 border-2 border-blue-300/50 text-primary-foreground shadow-lg backdrop-blur-sm hover:from-blue-500/40 hover:to-blue-400/30 transition-all duration-300 text-sm h-auto py-2">
                  <SelectValue placeholder="Глава">
                    {currentParasha && allParashas.length > 0 && (() => {
                      const parasha = allParashas.find(p => p.id === currentParasha);
                      if (parasha) {
                        return (
                          <div className="flex items-center gap-1 max-w-52">
                            <span className="font-hebrew text-blue-600 text-sm truncate">{parasha.hebrew}</span>
                            <span className="font-elegant text-blue-800 text-sm truncate">• {parasha.russian}</span>
                            <span className="text-blue-500 text-xs hidden lg:inline">
                              • Главы {parasha.startChapter === parasha.endChapter 
                                ? `${parasha.startChapter}`
                                : `${parasha.startChapter}-${parasha.endChapter}`}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-300/30 shadow-xl max-h-64 overflow-y-auto">
                  {(allParashas.length > 0 ? allParashas : availableParashas).map((parasha) => (
                    <SelectItem key={parasha.id} value={parasha.id} className="hover:bg-blue-50">
                      <div className="flex flex-col gap-1 max-w-52">
                        <div className="flex items-center gap-1">
                          <span className="font-hebrew text-blue-600 text-sm truncate">{parasha.hebrew}</span>
                          <span className="font-elegant text-blue-800 text-sm truncate">• {parasha.russian}</span>
                        </div>
                        <span className="text-xs text-blue-500">
                          {parasha.startChapter === parasha.endChapter 
                            ? `Глава ${parasha.startChapter}`
                            : `Главы ${parasha.startChapter}-${parasha.endChapter}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Chapter Selection */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-elegant text-blue-200 text-left">Глава</h3>
              <Select 
                value={currentChapter.toString()} 
                onValueChange={(value) => {
                  const newChapter = parseInt(value);
                  const newParasha = getParashaByChapter(newChapter);
                  onNavigate(currentBook, newChapter, 1, newParasha);
                }}
              >
                <SelectTrigger className="w-full lg:w-32 bg-gradient-to-r from-blue-500/30 to-blue-400/20 border-2 border-blue-300/50 text-primary-foreground shadow-lg backdrop-blur-sm hover:from-blue-500/40 hover:to-blue-400/30 transition-all duration-300 text-sm h-auto py-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-300/30 shadow-xl max-h-64 overflow-y-auto">
                  {/* Показываем главы для текущей парши, если она выбрана */}
                  {(currentParasha ? getChaptersForParasha(currentParasha) : (allChapters.length > 0 ? allChapters : [1])).map((chapter) => (
                    <SelectItem key={chapter} value={chapter.toString()} className="hover:bg-blue-50">
                      <span className="font-elegant text-blue-800">Глава {chapter}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Verse Selection */}
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-elegant text-blue-200 text-left">Стих</h3>
              <Select 
                value={currentVerse.toString()} 
                onValueChange={(value) => onNavigate(currentBook, currentChapter, parseInt(value), currentParasha)}
              >
                <SelectTrigger className="w-full lg:w-32 bg-gradient-to-r from-blue-500/30 to-blue-400/20 border-2 border-blue-300/50 text-primary-foreground shadow-lg backdrop-blur-sm hover:from-blue-500/40 hover:to-blue-400/30 transition-all duration-300 text-sm h-auto py-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-blue-300/30 shadow-xl max-h-64 overflow-y-auto">
                  {allVerses.length > 0 ? allVerses.map((verse) => (
                    <SelectItem key={verse} value={verse.toString()} className="hover:bg-blue-50">
                      <span className="font-elegant text-blue-800">Стих {verse}</span>
                    </SelectItem>
                  )) : (
                    <SelectItem value="1" className="hover:bg-blue-50">
                      <span className="font-elegant text-blue-800">Загрузка стихов...</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navigation Arrows - отдельная строка для мобильных */}
          <div className="flex items-center justify-center lg:justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const versesArray = allVerses.length > 0 ? allVerses : [1];
                const currentIndex = versesArray.indexOf(currentVerse);
                if (currentIndex > 0) {
                  onNavigate(currentBook, currentChapter, versesArray[currentIndex - 1], currentParasha);
                }
              }}
              disabled={currentVerse <= 1}
              className="text-primary-foreground hover:bg-white/20 bg-white/10 border border-white/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const versesArray = allVerses.length > 0 ? allVerses : [1];
                const currentIndex = versesArray.indexOf(currentVerse);
                if (currentIndex < versesArray.length - 1) {
                  onNavigate(currentBook, currentChapter, versesArray[currentIndex + 1], currentParasha);
                }
              }}
              disabled={currentVerse >= (allVerses.length > 0 ? Math.max(...allVerses) : 1)}
              className="text-primary-foreground hover:bg-white/20 bg-white/10 border border-white/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Current Parasha Info */}
        {currentParasha && (
          <div className="mt-4 p-3 bg-white/20 rounded-lg border border-white/30 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-sm text-primary-foreground/80 mb-1">Недельная глава:</div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="font-hebrew text-lg text-white">
                  {allParashas.find(p => p.id === currentParasha)?.hebrew}
                </div>
                <div className="text-white">•</div>
                <div className="font-elegant text-lg text-white">
                  {allParashas.find(p => p.id === currentParasha)?.russian}
                </div>
              </div>
              <div className="text-xs text-primary-foreground/70 px-2">
                {allParashas.find(p => p.id === currentParasha)?.theme}
              </div>
            </div>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};