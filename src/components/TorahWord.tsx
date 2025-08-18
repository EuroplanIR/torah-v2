import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Type, MessageCircle, Sparkles, Star, Scroll, Library, Eye, X } from "lucide-react";

interface Translation {
  meaning: string;
  context?: string;
  grammar?: string;
  sources?: string[];
}

interface PardesLevel {
  meaning: string;
  context: string;
  explanation?: string;
  gematria?: string;
  sefirot?: string;
  source?: string;
  sources?: string[];
}

interface PardesData {
  pshat?: PardesLevel | PardesLevel[];
  remez?: PardesLevel | PardesLevel[];
  drash?: PardesLevel[];
  sod?: PardesLevel | PardesLevel[];
}

interface TorahWordProps {
  hebrew: string;
  transliteration: string;
  translations: Translation[];
  pardes?: PardesData;
  verse: string;
  position: number;
  isActive: boolean;
  onToggle: (position: number) => void;
}

export const TorahWord = ({ hebrew, transliteration, translations, pardes, verse, position, isActive, onToggle }: TorahWordProps) => {
  const [popupStyle, setPopupStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const popupWidth = 800; // Увеличиваем ширину для нового макета
      const margin = 16; // 1rem margin
      
      let newStyle = {};
      
                        // Mobile: 90% width with some margins
                  if (viewportWidth < 768) {
                    newStyle = { 
                      left: `5vw`, 
                      right: `5vw`, 
                      width: '90vw',
                      transform: 'none',
                      position: 'fixed',
                      top: '3vh',
                      bottom: '3vh'
                    };
      }
      // Check if popup would overflow left edge
      else if (rect.left < popupWidth/2 + margin) {
        newStyle = { 
          left: `${margin}px`,
          transform: 'none'
        };
      }
      // Check if popup would overflow right edge
      else if (rect.right > viewportWidth - popupWidth/2 - margin) {
        newStyle = { 
          right: `${margin}px`,
          transform: 'none'
        };
      }
      // Center positioning (default)
      else {
        newStyle = {
          left: '50%',
          transform: 'translateX(-50%)'
        };
      }
      
      setPopupStyle(newStyle);
    }
  }, [isActive]);

  // Prevent body scroll on mobile when popup is active
  useEffect(() => {
    if (isActive && window.innerWidth < 768) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isActive]);

  const renderPardesLevels = (levels: PardesLevel | PardesLevel[], color: string, title: string, icon: React.ReactNode) => {
    const levelsArray = Array.isArray(levels) ? levels : [levels];
    
    // Предопределенные классы для корректной работы Tailwind
    const levelClasses = {
      'blue': 'bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-400',
      'green': 'bg-green-50 dark:bg-green-950/50 border-l-4 border-green-400',
      'orange': 'bg-orange-50 dark:bg-orange-950/50 border-l-4 border-orange-400',
      'purple': 'bg-purple-50 dark:bg-purple-950/50 border-l-4 border-purple-400'
    };

    const badgeClasses = {
      'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      'green': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'orange': 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100',
      'purple': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
    };

    const textClasses = {
      'blue': {
        title: 'text-blue-600 dark:text-blue-400',
        source: 'text-blue-500',
        heading: 'text-blue-900 dark:text-blue-100',
        body: 'text-blue-700 dark:text-blue-300',
        details: 'text-blue-600 dark:text-blue-400'
      },
      'green': {
        title: 'text-green-600 dark:text-green-400',
        source: 'text-green-500',
        heading: 'text-green-900 dark:text-green-100',
        body: 'text-green-700 dark:text-green-300',
        details: 'text-green-600 dark:text-green-400'
      },
      'orange': {
        title: 'text-orange-600 dark:text-orange-400',
        source: 'text-orange-500',
        heading: 'text-orange-900 dark:text-orange-100',
        body: 'text-orange-700 dark:text-orange-300',
        details: 'text-orange-600 dark:text-orange-400'
      },
      'purple': {
        title: 'text-purple-600 dark:text-purple-400',
        source: 'text-purple-500',
        heading: 'text-purple-900 dark:text-purple-100',
        body: 'text-purple-700 dark:text-purple-300',
        details: 'text-purple-600 dark:text-purple-400'
      }
    };

    return (
      <>
        {levelsArray.map((level, idx) => (
          <div key={idx} className={`p-3 md:p-4 rounded-lg ${levelClasses[color as keyof typeof levelClasses]}`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${badgeClasses[color as keyof typeof badgeClasses]}`}>
                {icon}
              </Badge>
              <span className={`text-xs ${textClasses[color as keyof typeof textClasses]?.title}`}>{title}</span>
              {level.source && <span className={`text-xs ${textClasses[color as keyof typeof textClasses]?.source}`}>({level.source})</span>}
            </div>
            <div className={`font-semibold mb-1 md:mb-2 text-sm md:text-base ${textClasses[color as keyof typeof textClasses]?.heading}`}>{level.meaning}</div>
            <div className={`text-xs md:text-sm ${textClasses[color as keyof typeof textClasses]?.body}`} dir="ltr">{level.context}</div>
            {level.explanation && (
              <div className={`text-xs mt-2 ${textClasses[color as keyof typeof textClasses]?.details}`} dir="ltr">{level.explanation}</div>
            )}
            {level.gematria && (
              <div className={`text-xs mt-2 font-mono ${textClasses[color as keyof typeof textClasses]?.details}`}>{level.gematria}</div>
            )}
            {level.sefirot && (
              <div className={`text-xs mt-2 ${textClasses[color as keyof typeof textClasses]?.details}`} dir="ltr">Сфира: {level.sefirot}</div>
            )}
            {level.sources && level.sources.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {level.sources.map((source, sidx) => (
                  <Badge key={sidx} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="relative inline-block mx-1">
      <button
        ref={buttonRef}
        onClick={() => onToggle(position)}
        className={`font-hebrew text-hebrew text-yellow-500 dark:text-yellow-400 hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/20 rounded-lg px-2 py-1 mx-0.5 transition-all duration-300 cursor-pointer border-2 relative group transform hover:scale-110 font-bold drop-shadow-sm ${
          isActive 
            ? 'border-primary bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg scale-105 text-yellow-400 dark:text-yellow-300' 
            : 'border-transparent hover:border-accent/50'
        }`}
      >
        {hebrew}
        {/* Enhanced tooltip */}
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Нажмите для перевода
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent"></div>
        </span>
      </button>
      
      {isActive && (
        <>
                                {/* Mobile backdrop */}
                      <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => onToggle(position)}
                      />
          <div 
            className="absolute md:top-full md:mt-4 z-50 w-[800px] max-w-[90vw] md:max-w-[95vw]"
            style={popupStyle}
          >
          <Card className="shadow-2xl border-0 bg-background backdrop-blur-sm animate-scale-in h-full md:h-auto flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>

                                    <CardContent className="relative p-3 md:p-4 flex-1 flex flex-col overflow-hidden h-full">
              {/* ПаРДеС layout with fixed header and scrollable content */}
              {pardes ? (
                <Tabs defaultValue="pshat" className="w-full flex flex-col flex-1">
                  {/* Fixed Header Section - Compact */}
                  <div className="flex-shrink-0 space-y-2 mb-3">
                    {/* Компактная строка: Кнопка + Слово + Транслитерация + Номер */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Кнопка закрыть только для мобильных */}
                      <div className="md:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggle(position)}
                          className="bg-pink-600 backdrop-blur-sm border-pink-700 hover:bg-pink-500 shadow-sm h-8 px-2 text-white"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Центральная часть - слово и транслитерация в одну строку */}
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="font-hebrew text-2xl md:text-3xl text-primary drop-shadow-sm">{hebrew}</span>
                          <span className="text-lg md:text-xl text-muted-foreground italic">({transliteration})</span>
                          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 shadow-sm">
                            #{position}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Пустое место для баланса на мобильных */}
                      <div className="md:hidden w-8"></div>
                    </div>
                    
                    {/* Строка 2: Табы ПаРДеС */}
                    <div className="border-t border-border/30 pt-2">
                      <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 shadow-sm h-9">
                        <TabsTrigger value="pshat" className="flex items-center gap-1 text-xs md:text-sm h-8 px-2">
                          <BookOpen className="w-3 h-3" />
                          <span className="hidden sm:inline">פשט</span>
                        </TabsTrigger>
                        <TabsTrigger value="remez" className="flex items-center gap-1 text-xs md:text-sm h-8 px-2">
                          <Eye className="w-3 h-3" />
                          <span className="hidden sm:inline">רמז</span>
                        </TabsTrigger>
                        <TabsTrigger value="drash" className="flex items-center gap-1 text-xs md:text-sm h-8 px-2">
                          <Scroll className="w-3 h-3" />
                          <span className="hidden sm:inline">דרש</span>
                        </TabsTrigger>
                        <TabsTrigger value="sod" className="flex items-center gap-1 text-xs md:text-sm h-8 px-2">
                          <Star className="w-3 h-3" />
                          <span className="hidden sm:inline">סוד</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                  
                  {/* Scrollable Content Section */}
                  <div 
                    className="flex-1 overflow-y-auto md:overflow-visible max-h-[70vh] md:max-h-96 min-h-0" 
                    data-popup-scroll
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {/* Пшат Tab */}
                    <TabsContent value="pshat" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-h-80 md:overflow-y-auto">
                        {pardes.pshat && renderPardesLevels(pardes.pshat, "blue", "Буквальный смысл", "פשט")}
                      </div>
                    </TabsContent>

                    {/* Ремез Tab */}
                    <TabsContent value="remez" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-h-80 md:overflow-y-auto">
                        {pardes.remez && renderPardesLevels(pardes.remez, "green", "Намёк", "רמז")}
                      </div>
                    </TabsContent>

                    {/* Драш Tab */}
                    <TabsContent value="drash" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-h-80 md:overflow-y-auto">
                        {pardes.drash && renderPardesLevels(pardes.drash, "orange", "Толкование", "דרש")}
                      </div>
                    </TabsContent>

                    {/* Сод Tab */}
                    <TabsContent value="sod" className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-h-80 md:overflow-y-auto">
                        {pardes.sod && renderPardesLevels(pardes.sod, "purple", "Тайный смысл", "סוד")}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                /* Layout for regular translations */
                <div className="flex flex-col flex-1">
                  {/* Fixed Header Section - Compact */}
                  <div className="flex-shrink-0 space-y-2 mb-3">
                    {/* Компактная строка: Кнопка + Слово + Транслитерация + Номер */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Кнопка закрыть только для мобильных */}
                      <div className="md:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggle(position)}
                          className="bg-pink-600 backdrop-blur-sm border-pink-700 hover:bg-pink-500 shadow-sm h-8 px-2 text-white"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Центральная часть - слово и транслитерация в одну строку */}
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="font-hebrew text-2xl md:text-3xl text-primary drop-shadow-sm">{hebrew}</span>
                          <span className="text-lg md:text-xl text-muted-foreground italic">({transliteration})</span>
                          <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 shadow-sm">
                            #{position}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Пустое место для баланса на мобильных */}
                      <div className="md:hidden w-8"></div>
                    </div>
                  </div>
                  
                  {/* Scrollable Content Section */}
                  <div 
                    className="flex-1 overflow-y-auto md:overflow-visible max-h-[70vh] md:max-h-96 min-h-0" 
                    data-popup-scroll
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {/* Обычные переводы в двух колонках */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:max-h-80 md:overflow-y-auto">
                      {translations.map((translation, index) => (
                        <div 
                          key={index} 
                          className="group relative rounded-xl bg-gradient-to-r from-card/60 to-accent/10 border border-accent/20 p-3 md:p-4 hover:from-accent/15 hover:to-primary/10 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="pl-3 md:pl-4">
                            <div className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2 group-hover:text-primary transition-colors leading-relaxed">
                              {translation.meaning}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {translation.context && (
                                <Badge variant="outline" className="text-xs bg-muted/60 text-muted-foreground border-muted-foreground/30 hover:bg-muted/80 transition-colors">
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  {translation.context}
                                </Badge>
                              )}
                              {translation.grammar && (
                                <Badge variant="outline" className="text-xs bg-accent/15 text-accent-foreground border-accent/40 hover:bg-accent/25 transition-colors">
                                  <Type className="w-3 h-3 mr-1" />
                                  {translation.grammar}
                                </Badge>
                              )}
                              {translation.sources && translation.sources.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {translation.sources.map((source, sidx) => (
                                    <Badge key={sidx} variant="outline" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Close hint */}
              <div className="text-center pt-3 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
                <p className="text-xs text-muted-foreground opacity-70 mt-3 hidden md:block">
                  Нажмите на слово еще раз, чтобы закрыть
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
    </div>
  );
};
