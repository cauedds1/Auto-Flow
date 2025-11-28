import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2, RefreshCw, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoachingCardProps {
  sellerId: string;
}

interface CoachingResult {
  tips: string[];
  focusArea: string;
}

export function CoachingCard({ sellerId }: CoachingCardProps) {
  const [result, setResult] = useState<CoachingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCoaching = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/financial/seller-coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar coaching");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaching();
  }, [sellerId]);

  return (
    <Card data-testid="card-coaching">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Coaching IA
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchCoaching}
          disabled={isLoading}
          data-testid="button-refresh-coaching"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !result ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : result ? (
          <div className="space-y-3">
            <Badge variant="secondary" className="mb-2">
              Foco: {result.focusArea}
            </Badge>
            <div className="space-y-2">
              {result.tips.map((tip, index) => (
                <div key={index} className="flex gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar as dicas de coaching.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
