import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, DollarSign, Clock } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export function DashboardAlerts() {
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const activeVehicles = vehicles.filter(v => v.status !== "Vendido" && v.status !== "Arquivado");

  const vehiclesWithoutPrice = activeVehicles.filter(v => !v.salePrice);
  const vehiclesWithoutPhotos = activeVehicles.filter(v => !v.image);
  
  const stalledVehicles = activeVehicles.filter(v => {
    const timeInStatus = v.timeInStatus || "";
    const days = parseInt(timeInStatus);
    return !isNaN(days) && days > 30 && v.status !== "Pronto para Venda" && v.status !== "Vendido";
  });

  const vehiclesWithNotes = activeVehicles.filter(v => v.notes && v.notes.trim() !== "");

  const alerts = [
    {
      id: "no-price",
      title: "Sem Preço Definido",
      count: vehiclesWithoutPrice.length,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      vehicles: vehiclesWithoutPrice,
      show: vehiclesWithoutPrice.length > 0
    },
    {
      id: "no-photos",
      title: "Sem Fotos",
      count: vehiclesWithoutPhotos.length,
      icon: Camera,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      vehicles: vehiclesWithoutPhotos,
      show: vehiclesWithoutPhotos.length > 0
    },
    {
      id: "stalled",
      title: "Parados há 30+ Dias",
      count: stalledVehicles.length,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      vehicles: stalledVehicles,
      show: stalledVehicles.length > 0
    },
    {
      id: "with-notes",
      title: "Com Observações",
      count: vehiclesWithNotes.length,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      vehicles: vehiclesWithNotes,
      show: vehiclesWithNotes.length > 0
    }
  ];

  const visibleAlerts = alerts.filter(a => a.show);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {visibleAlerts.map((alert) => (
        <Card key={alert.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {alert.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${alert.bgColor}`}>
                <alert.icon className={`h-4 w-4 ${alert.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alert.count}</div>
            <div className="mt-3 space-y-1">
              {alert.vehicles.slice(0, 2).map((v: any) => (
                <Link key={v.id} href={`/veiculo/${v.id}`}>
                  <div className="text-xs text-muted-foreground hover:text-foreground cursor-pointer truncate">
                    • {v.brand} {v.model} - {v.plate}
                  </div>
                </Link>
              ))}
              {alert.vehicles.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  + {alert.vehicles.length - 2} mais
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
