import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RecentActivity() {
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  // Pegar veículos criados recentemente (últimos 7 dias)
  const recentVehicles = vehicles
    .filter(v => {
      const created = new Date(v.createdAt);
      const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {recentVehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade nos últimos 7 dias
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
                        {vehicle.status}
                      </span>
                    </div>
                    {vehicle.salePrice && (
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(vehicle.salePrice / 100)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(vehicle.createdAt), {
                      addSuffix: true,
                      locale: ptBR
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
