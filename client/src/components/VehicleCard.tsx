import { memo, useMemo } from "react";
import { Clock, AlertTriangle, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useCompanyTheme } from "./CompanyThemeProvider";
import carPlaceholderImg from "@assets/image_1764256794100.png";

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
  salePrice?: number;
  status?: string;
}

const LOCATION_COLORS: Record<string, { bg: string; text: string }> = {
  "Entrada": { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  "Lavagem": { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300" },
  "Mecânica": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
  "Funilaria": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  "Documentação": { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
  "Pronto para Venda": { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  "Higienização": { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
};

function VehicleCardComponent({
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

  const displayImage = useMemo(
    () => image && image.trim() ? image : carPlaceholderImg,
    [image]
  );

  const handleClick = () => {
    setLocation(`/vehicles/${id}`);
  };

  const locationColors = LOCATION_COLORS[location] || { bg: "bg-muted", text: "text-muted-foreground" };

  return (
    <Card 
      onClick={handleClick}
      className="group relative overflow-hidden hover-elevate cursor-pointer transition-all border-border/60 hover:border-border" 
      data-testid={`card-vehicle-${plate}`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={`${brand} ${model}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {hasNotes && (
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive shadow-sm">
              <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-card-foreground truncate" data-testid="text-vehicle-name">
              {brand} {model}
            </h3>
            <span className="text-xs text-muted-foreground font-medium flex-shrink-0">{year}</span>
          </div>
          
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {plate && (
              <span className="font-mono bg-muted/80 dark:bg-muted/40 px-1.5 py-0.5 rounded text-[10px] font-medium">
                {plate}
              </span>
            )}
            <span className="truncate">{color}</span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            {status !== "Vendido" && status !== "Arquivado" && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${locationColors.bg} ${locationColors.text}`}>
                <MapPin className="h-2.5 w-2.5" />
                <span className="truncate max-w-[80px]">{location}</span>
              </div>
            )}
            
            {salePrice && salePrice > 0 ? (
              <span 
                className="text-xs font-bold ml-auto"
                style={{ color: changeIconColors ? "hsl(var(--badge-color-6))" : "hsl(var(--primary))" }}
              >
                R$ {Number(salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                <Clock className="h-2.5 w-2.5" />
                <span>{timeInStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export const VehicleCard = memo(VehicleCardComponent);
