import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SellerAnalysisDialogProps {
  sellerId: string;
  sellerName: string;
}

interface AnalysisResult {
  analysis: string;
  recommendations: string[];
}

export function SellerAnalysisDialog({ sellerId, sellerName }: SellerAnalysisDialogProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/financial/seller-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao analisar vendedor");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Análise concluída",
        description: "A IA analisou o desempenho do vendedor.",
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-seller-analysis-${sellerId}`}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Análise IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Desempenho - {sellerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
            data-testid="button-run-seller-analysis"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar Desempenho
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Análise
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.analysis}
                </p>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Recomendações
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex gap-2">
                      <Badge variant="secondary" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
