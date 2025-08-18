import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Type, MessageCircle, Sparkles, Star, Scroll, Library, Eye } from "lucide-react";

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
      
      // Mobile: full width with margins
      if (viewportWidth < 768) {
        newStyle = { 
          left: `${margin}px`, 
          right: `${margin}px`, 
          width: 'auto',
          transform: 'none'
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

  const renderPardesLevels = (levels: PardesLevel | PardesLevel[], color: string, title: string, icon: React.ReactNode) => {
    const levelsArray = Array.isArray(levels) ? levels : [levels];
    
    return (
      <div className="grid md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
        {levelsArray.map((level, idx) => (
          <div key={idx} className={`bg-${color}-50 p-4 rounded-lg border-l-4 border-${color}-400 dark:bg-${color}-950/50`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`bg-${color}-100 text-${color}-800 text-xs dark:bg-${color}-800 dark:text-${color}-100`}>
                {icon}
              </Badge>
              <span className={`text-xs text-${color}-600 dark:text-${color}-400`}>{title}</span>
              {level.source && <span className={`text-xs text-${color}-500`}>({level.source})</span>}
            </div>
            <div className={`font-semibold text-${color}-900 dark:text-${color}-100 mb-2`}>{level.meaning}</div>
            <div className={`text-sm text-${color}-700 dark:text-${color}-300`} dir="ltr">{level.context}</div>
            {level.explanation && (
              <div className={`text-xs text-${color}-600 dark:text-${color}-400 mt-2`} dir="ltr">{level.explanation}</div>
            )}
            {level.gematria && (
              <div className={`text-xs text-${color}-600 dark:text-${color}-400 mt-2 font-mono`}>{level.gematria}</div>
            )}
            {level.sefirot && (
              <div className={`text-xs text-${color}-600 dark:text-${color}-400 mt-2`} dir="ltr">Сфира: {level.sefirot}</div>
            )}
            {level.sources && level.sources.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {level.sources.map((source, sidx) => (
                  <Badge key={sidx} variant="outline" className={`text-xs bg-${color}-100 text-${color}-700 dark:bg-${color}-900 dark:text-${color}-300`}>
                    {source}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
        <div 
          className="absolute top-full mt-4 z-50 w-[800px] max-w-[95vw]"
          style={popupStyle}
        >
          <Card className="shadow-2xl border-0 bg-background backdrop-blur-sm animate-scale-in overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
            <CardContent className="relative p-6">
              <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center pb-4 relative">
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                  <div className="relative">
                    <div className="font-hebrew text-4xl text-primary mb-3 drop-shadow-sm">{hebrew}</div>
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 shadow-sm">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {position}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-2xl text-muted-foreground italic mb-3">
                    <Type className="w-4 h-4" />
                    {transliteration}
                  </div>
                  <Badge variant="secondary" className="text-xs bg-accent/20 text-accent-foreground shadow-sm">
                    Стих {verse}
                  </Badge>
                </div>
                
                {/* Translations Section with Tabs */}
                <div className="space-y-4">
                  {/* ПаРДеС отображение с табами */}
                  {pardes ? (
                    <Tabs defaultValue="pshat" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <TabsTrigger value="pshat" className="flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4" />
                          פשט
                        </TabsTrigger>
                        <TabsTrigger value="remez" className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          רמז
                        </TabsTrigger>
                        <TabsTrigger value="drash" className="flex items-center gap-2 text-sm">
                          <Scroll className="w-4 h-4" />
                          דרש
                        </TabsTrigger>
                        <TabsTrigger value="sod" className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4" />
                          סוד
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Пшат Tab */}
                      <TabsContent value="pshat" className="mt-4">
                        {pardes.pshat && renderPardesLevels(pardes.pshat, "blue", "Буквальный смысл", "פשט")}
                      </TabsContent>

                      {/* Ремез Tab */}
                      <TabsContent value="remez" className="mt-4">
                        {pardes.remez && renderPardesLevels(pardes.remez, "green", "Намёк", "רמז")}
                      </TabsContent>

                      {/* Драш Tab */}
                      <TabsContent value="drash" className="mt-4">
                        {pardes.drash && renderPardesLevels(pardes.drash, "orange", "Толкование", "דרש")}
                      </TabsContent>

                      {/* Сод Tab */}
                      <TabsContent value="sod" className="mt-4">
                        {pardes.sod && renderPardesLevels(pardes.sod, "purple", "Тайный смысл", "סוד")}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    /* Обычные переводы в двух колонках */
                    <div className="grid md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                      {translations.map((translation, index) => (
                        <div 
                          key={index} 
                          className="group relative rounded-xl bg-gradient-to-r from-card/60 to-accent/10 border border-accent/20 p-4 hover:from-accent/15 hover:to-primary/10 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-accent rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="pl-4">
                            <div className="font-semibold text-foreground text-base mb-2 group-hover:text-primary transition-colors leading-relaxed">
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
                  )}
                </div>
                
                {/* Close hint */}
                <div className="text-center pt-3 relative">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
                  <p className="text-xs text-muted-foreground opacity-70 mt-3">
                    Нажмите на слово еще раз, чтобы закрыть
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
