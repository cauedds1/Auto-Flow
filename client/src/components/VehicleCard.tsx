import { Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

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
}: VehicleCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/vehicles/${id}`);
  };
  const locationColors: Record<string, string> = {
    "Entrada": "bg-blue-600",
    "Lavagem": "bg-cyan-600",
    "Mecânica": "bg-amber-600",
    "Funilaria": "bg-orange-600",
    "Documentação": "bg-purple-600",
    "Pronto para Venda": "bg-green-600",
  };

  return (
    <Card 
      onClick={handleClick}
      className="group relative overflow-hidden hover-elevate cursor-pointer transition-all" 
      data-testid={`card-vehicle-${plate}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={`${brand} ${model}`}
          className="h-full w-full object-cover"
        />
        <Badge
          className={`absolute left-2 top-2 ${locationColors[location] || "bg-gray-600"} text-white border-0`}
        >
          {location}
        </Badge>
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
            <span className="ml-1 text-card-foreground font-bold text-green-600">
              R$ {(salePrice / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
