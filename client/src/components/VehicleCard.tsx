import { Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useCompanyTheme } from "./CompanyThemeProvider";

export interface VehicleCardProps {
  id: string;
  image: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  location: string;
  timeInStatus: string;
  hasNotes?: boolean;
  plate?: string;
  salePrice?: number; // in cents
  status?: string; // status do veículo
}

export function VehicleCard({
  id,
  image,
  brand,
  model,
  year,
  color,
  location,
  timeInStatus,
  hasNotes = false,
  plate,
  salePrice,
  status,
}: VehicleCardProps) {
  const [, setLocation] = useLocation();
  const { changeIconColors } = useCompanyTheme();

  // Imagem genérica de carro como fallback
  const carPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250'%3E%3Crect fill='%231a1a1a' width='400' height='250'/%3E%3CradialGradient id='light' cx='50%25' cy='30%25'%3E%3Cstop offset='0%25' style='stop-color:%23404040;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%230a0a0a;stop-opacity:1'/%3E%3C/radialGradient%3E%3Crect fill='url(%23light)' width='400' height='250'/%3E%3Cpath d='M 80 140 Q 80 100 120 80 L 280 80 Q 320 100 320 140 L 320 170 Q 320 180 310 180 L 90 180 Q 80 180 80 170 Z' fill='%23222' stroke='%23444' stroke-width='2'/%3E%3Ccircle cx='130' cy='190' r='18' fill='%23111' stroke='%23555' stroke-width='2'/%3E%3Ccircle cx='270' cy='190' r='18' fill='%23111' stroke='%23555' stroke-width='2'/%3E%3Crect x='100' y='100' width='80' height='40' rx='5' fill='%23333' opacity='0.7'/%3E%3Crect x='220' y='100' width='80' height='40' rx='5' fill='%23333' opacity='0.7'/%3E%3C/svg%3E";

  const displayImage = image && image.trim() ? image : carPlaceholder;

  const handleClick = () => {
    setLocation(`/vehicles/${id}`);
  };
  const locationColors: Record<string, string> = {
    "Entrada": "hsl(var(--badge-color-1))",
    "Lavagem": "hsl(var(--badge-color-2))",
    "Mecânica": "hsl(var(--badge-color-3))",
    "Funilaria": "hsl(var(--badge-color-4))",
    "Documentação": "hsl(var(--badge-color-5))",
    "Pronto para Venda": "hsl(var(--badge-color-6))",
  };

  return (
    <Card 
      onClick={handleClick}
      className="group relative overflow-hidden hover-elevate cursor-pointer transition-all" 
      data-testid={`card-vehicle-${plate}`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={displayImage}
          alt={`${brand} ${model}`}
          className="h-full w-full object-cover"
        />
        {status !== "Vendido" && status !== "Arquivado" && (
          <Badge
            className="absolute left-2 top-2 text-white border-0"
            style={{ backgroundColor: locationColors[location] || "hsl(var(--muted))" }}
          >
            {location}
          </Badge>
        )}
        {hasNotes && (
          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base text-card-foreground" data-testid="text-vehicle-name">
          {brand} {model}
        </h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Ano:</span>
            <span className="ml-1 text-card-foreground font-medium">{year}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cor:</span>
            <span className="ml-1 text-card-foreground font-medium">{color}</span>
          </div>
        </div>
        {plate && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Placa:</span>
            <span className="ml-1 text-card-foreground font-medium">{plate}</span>
          </div>
        )}
        {salePrice && salePrice > 0 && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Preço:</span>
            <span className="ml-1 text-card-foreground font-bold" style={{ color: changeIconColors ? "hsl(var(--badge-color-6))" : "inherit" }}>
              R$ {Number(salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeInStatus}</span>
        </div>
      </div>
    </Card>
  );
}
