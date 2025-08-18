import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollText, User, Quote, BookOpen } from "lucide-react";

interface CommentaryItem {
  author: string;
  text: string;
  category: string;
}

interface CommentaryProps {
  verse: string;
  bookName: string;
  commentaries: CommentaryItem[];
}

export const Commentary = ({ verse, bookName, commentaries }: CommentaryProps) => {
  // Группируем комментарии по авторам для лучшего отображения
  const commentaryCards = commentaries.map((commentary, index) => ({
    ...commentary,
    id: `commentary-${index}`,
    shortText: commentary.text.length > 150 ? commentary.text.substring(0, 150) + "..." : commentary.text
  }));

  // Цвета для разных типов комментариев
  const getAuthorColor = (author: string) => {
    const colors = {
      'rashi': 'blue',
      'ramban': 'green', 
      'onkelos': 'purple',
      'ibn_ezra': 'orange',
      'sforno': 'red',
      'or_hachaim': 'teal',
      'kli_yakar': 'indigo',
      'ralbag': 'pink',
      'abravanel': 'yellow'
    };
    
    const authorKey = author.toLowerCase().replace(' ', '_').replace('-', '_');
    return colors[authorKey as keyof typeof colors] || 'gray';
  };

  const getAuthorDisplayName = (author: string) => {
    const names = {
      'rashi': 'Раши',
      'ramban': 'Рамбан',
      'onkelos': 'Онкелос',
      'ibn_ezra': 'Ибн Эзра',
      'sforno': 'Сфорно',
      'or_hachaim': 'Ор ха-Хаим',
      'kli_yakar': 'Кли Якар',
      'ralbag': 'Ральбаг',
      'abravanel': 'Абраванель'
    };
    
    const authorKey = author.toLowerCase().replace(' ', '_').replace('-', '_');
    return names[authorKey as keyof typeof names] || author;
  };

  if (!commentaries || commentaries.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-elegant text-primary flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Комментарии к {bookName} {verse}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Комментарии к этому стиху загружаются...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-elegant text-primary flex items-center gap-2">
          <ScrollText className="w-6 h-6" />
          Комментарии к {bookName} {verse}
          <Badge variant="secondary" className="ml-auto text-xs">
            {commentaries.length} комментариев
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Горизонтальная сетка для больших экранов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commentaryCards.map((commentary) => {
            const color = getAuthorColor(commentary.author);
            const displayName = getAuthorDisplayName(commentary.author);
            
            return (
              <Card key={commentary.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 border-${color}-400 bg-gradient-to-br from-${color}-50/50 to-background dark:from-${color}-950/30 dark:to-background hover:scale-[1.02]`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                    <Badge 
                      variant="secondary" 
                      className={`font-elegant text-xs bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-200 border-${color}-200 dark:border-${color}-700`}
                    >
                      {displayName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="content" className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2">
                        <div className="text-left">
                          <Quote className={`w-4 h-4 inline mr-2 text-${color}-500`} />
                          <span className="text-sm font-body leading-relaxed line-clamp-3">
                            {commentary.shortText}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className={`text-sm font-body leading-relaxed p-4 rounded-lg bg-${color}-50/50 dark:bg-${color}-950/30 border border-${color}-200/50 dark:border-${color}-800/50`}>
                          {commentary.text}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Альтернативный вид - Аккордеон для мобильных */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {commentaryCards.map((commentary) => {
              const color = getAuthorColor(commentary.author);
              const displayName = getAuthorDisplayName(commentary.author);
              
              return (
                <AccordionItem 
                  key={commentary.id} 
                  value={commentary.id}
                  className={`border border-${color}-200 dark:border-${color}-800 rounded-lg overflow-hidden bg-gradient-to-r from-${color}-50/30 to-background dark:from-${color}-950/20 dark:to-background`}
                >
                  <AccordionTrigger className={`px-4 hover:bg-${color}-50 dark:hover:bg-${color}-950/30 transition-colors`}>
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                      <Badge 
                        variant="secondary" 
                        className={`font-elegant text-xs bg-${color}-100 text-${color}-800 dark:bg-${color}-900/50 dark:text-${color}-200`}
                      >
                        {displayName}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className={`p-4 rounded-lg bg-${color}-50/50 dark:bg-${color}-950/30 border border-${color}-200/50 dark:border-${color}-800/50`}>
                      <Quote className={`w-4 h-4 inline mr-2 text-${color}-500 float-left mt-1`} />
                      <p className="text-sm font-body leading-relaxed">
                        {commentary.text}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};
