import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdGeneratorProps {
  vehicleId: string;
  vehicleData: {
    brand: string;
    model: string;
    year: number;
    color: string;
    features?: string[];
  };
}

export function AdGenerator({ vehicleId, vehicleData }: AdGeneratorProps) {
  const [generatedAd, setGeneratedAd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/generate-ad`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401 || errorData.error?.includes("chave de API")) {
          throw new Error("A chave da API da OpenAI não está configurada ou é inválida.");
        } else if (response.status === 429 || errorData.error?.includes("quota") || errorData.error?.includes("limite")) {
          throw new Error("Limite de uso da API da OpenAI excedido. Tente novamente mais tarde.");
        } else if (response.status === 500) {
          throw new Error("Erro no servidor ao gerar anúncio. Verifique os logs.");
        } else {
          throw new Error(errorData.error || "Erro ao gerar anúncio");
        }
      }

      const data = await response.json();
      setGeneratedAd(data.adText);
      
      toast({
        title: "Anúncio gerado com sucesso!",
        description: "O texto foi criado pela IA e está pronto para ser copiado.",
      });
    } catch (error) {
      console.error("Erro ao gerar anúncio:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível gerar o anúncio. Tente novamente.";
      
      toast({
        title: "Erro ao gerar anúncio",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedAd);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Gerador de Anúncios</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie textos persuasivos para Instagram, Facebook e OLX automaticamente
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
          data-testid="button-generate-ad"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isGenerating ? "Gerando anúncio..." : "Gerar Texto para Anúncio"}
        </Button>

        {generatedAd && (
          <div className="space-y-3">
            <Textarea
              value={generatedAd}
              readOnly
              className="min-h-[300px] font-mono text-sm"
              data-testid="textarea-generated-ad"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full"
              data-testid="button-copy-ad"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Texto
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
