import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-elegant text-primary">
          Комментарии к {bookName} {verse}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {commentaries.map((commentary, index) => (
          <div key={index} className="border-l-4 border-accent pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-elegant text-xs">
                {commentary.author}
              </Badge>
            </div>
            <p className="text-commentary font-body leading-relaxed">
              {commentary.text}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};