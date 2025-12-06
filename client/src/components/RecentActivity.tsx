import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useCompanyTheme } from "./CompanyThemeProvider";
import { useI18n } from "@/lib/i18n";

export function RecentActivity() {
  const { changeIconColors, secondaryColor } = useCompanyTheme();
  const { t, language } = useI18n();
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const recentVehicles = vehicles
    .filter(v => {
      const created = new Date(v.createdAt);
      const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusTranslation = (status: string) => {
    const statusMap: Record<string, string> = {
      "Entrada": t("vehicles.status.intake"),
      "Em Preparação": t("vehicles.status.preparation"),
      "Em Reparos": t("vehicles.status.repair"),
      "Em Higienização": t("vehicles.status.cleaning"),
      "Pronto para Venda": t("vehicles.status.ready"),
      "Vendido": t("vehicles.status.sold"),
      "Arquivado": t("vehicles.status.archived"),
    };
    return statusMap[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity 
              className="h-5 w-5"
              style={{ color: changeIconColors ? secondaryColor : undefined }}
            />
            {t("dashboard.recentActivity")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {recentVehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noActivityLast7Days")}
          </p>
        ) : (
          <div className="space-y-3">
            {recentVehicles.map((vehicle: any) => (
              <Link key={vehicle.id} href={`/veiculo/${vehicle.id}`}>
                <div className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {vehicle.brand} {vehicle.model}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {vehicle.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {vehicle.plate}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-primary">
                        {getStatusTranslation(vehicle.status)}
                      </span>
                    </div>
                    {vehicle.salePrice && (
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign 
                          className="h-3 w-3"
                          style={{ color: changeIconColors ? secondaryColor : "#22c55e" }}
                        />
                        <span 
                          className="text-xs font-medium"
                          style={{ color: changeIconColors ? secondaryColor : "#22c55e" }}>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(Number(vehicle.salePrice))}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(vehicle.createdAt), {
                      addSuffix: true,
                      locale: language === 'pt-BR' ? ptBR : enUS
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
