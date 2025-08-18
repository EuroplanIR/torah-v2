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

  // Предопределенные классы для стилизации
  const cardClasses = {
    'blue': 'border-l-4 border-blue-400 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/30 dark:to-background',
    'green': 'border-l-4 border-green-400 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/30 dark:to-background',
    'purple': 'border-l-4 border-purple-400 bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/30 dark:to-background',
    'orange': 'border-l-4 border-orange-400 bg-gradient-to-br from-orange-50/50 to-background dark:from-orange-950/30 dark:to-background',
    'red': 'border-l-4 border-red-400 bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/30 dark:to-background',
    'teal': 'border-l-4 border-teal-400 bg-gradient-to-br from-teal-50/50 to-background dark:from-teal-950/30 dark:to-background',
    'indigo': 'border-l-4 border-indigo-400 bg-gradient-to-br from-indigo-50/50 to-background dark:from-indigo-950/30 dark:to-background',
    'pink': 'border-l-4 border-pink-400 bg-gradient-to-br from-pink-50/50 to-background dark:from-pink-950/30 dark:to-background',
    'yellow': 'border-l-4 border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-background dark:from-yellow-950/30 dark:to-background',
    'gray': 'border-l-4 border-gray-400 bg-gradient-to-br from-gray-50/50 to-background dark:from-gray-950/30 dark:to-background'
  };

  const badgeClasses = {
    'blue': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    'green': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-700',
    'purple': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    'orange': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    'red': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-700',
    'teal': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border-teal-200 dark:border-teal-700',
    'indigo': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
    'pink': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200 border-pink-200 dark:border-pink-700',
    'yellow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    'gray': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-700'
  };

  const iconClasses = {
    'blue': 'text-blue-600 dark:text-blue-400',
    'green': 'text-green-600 dark:text-green-400',
    'purple': 'text-purple-600 dark:text-purple-400',
    'orange': 'text-orange-600 dark:text-orange-400',
    'red': 'text-red-600 dark:text-red-400',
    'teal': 'text-teal-600 dark:text-teal-400',
    'indigo': 'text-indigo-600 dark:text-indigo-400',
    'pink': 'text-pink-600 dark:text-pink-400',
    'yellow': 'text-yellow-600 dark:text-yellow-400',
    'gray': 'text-gray-600 dark:text-gray-400'
  };

  const contentClasses = {
    'blue': 'bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50',
    'green': 'bg-green-50/50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50',
    'purple': 'bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/50',
    'orange': 'bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/50',
    'red': 'bg-red-50/50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50',
    'teal': 'bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/50',
    'indigo': 'bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50',
    'pink': 'bg-pink-50/50 dark:bg-pink-950/30 border border-pink-200/50 dark:border-pink-800/50',
    'yellow': 'bg-yellow-50/50 dark:bg-yellow-950/30 border border-yellow-200/50 dark:border-yellow-800/50',
    'gray': 'bg-gray-50/50 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50'
  };

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
        {/* Горизонтальная сетка для больших экранов - скрыта на мобильных */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commentaryCards.map((commentary) => {
            const color = getAuthorColor(commentary.author);
            const displayName = getAuthorDisplayName(commentary.author);
            
            return (
              <Card key={commentary.id} className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${cardClasses[color as keyof typeof cardClasses]}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${iconClasses[color as keyof typeof iconClasses]}`} />
                    <Badge 
                      variant="secondary" 
                      className={`font-elegant text-xs ${badgeClasses[color as keyof typeof badgeClasses]}`}
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
                          <Quote className={`w-4 h-4 inline mr-2 ${iconClasses[color as keyof typeof iconClasses]}`} />
                          <span className="text-sm font-body leading-relaxed line-clamp-3">
                            {commentary.shortText}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className={`text-sm font-body leading-relaxed p-4 rounded-lg ${contentClasses[color as keyof typeof contentClasses]}`}>
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

        {/* Аккордеон для мобильных - скрыт на больших экранах */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {commentaryCards.map((commentary) => {
              const color = getAuthorColor(commentary.author);
              const displayName = getAuthorDisplayName(commentary.author);
              
              return (
                <AccordionItem 
                  key={commentary.id} 
                  value={commentary.id}
                  className={`border rounded-lg overflow-hidden ${cardClasses[color as keyof typeof cardClasses]}`}
                >
                  <AccordionTrigger className="px-4 hover:bg-opacity-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${iconClasses[color as keyof typeof iconClasses]}`} />
                      <Badge 
                        variant="secondary" 
                        className={`font-elegant text-xs ${badgeClasses[color as keyof typeof badgeClasses]}`}
                      >
                        {displayName}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className={`p-4 rounded-lg ${contentClasses[color as keyof typeof contentClasses]}`}>
                      <Quote className={`w-4 h-4 inline mr-2 ${iconClasses[color as keyof typeof iconClasses]} float-left mt-1`} />
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
