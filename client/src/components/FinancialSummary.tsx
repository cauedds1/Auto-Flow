import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, PiggyBank } from "lucide-react";

export function FinancialSummary() {
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: allCosts = [] } = useQuery<any[]>({
    queryKey: ["/api/costs/all"],
  });

  const activeVehicles = vehicles.filter(v => 
    v.status !== "Vendido" && v.status !== "Arquivado"
  );

  const readyForSale = vehicles.filter(v => v.status === "Pronto para Venda");

  // Calcular valor total do estoque (apenas veículos com preço definido e prontos para venda)
  const inventoryValue = readyForSale.reduce((sum, v) => {
    return sum + (v.salePrice || 0);
  }, 0);

  // Calcular custos totais APENAS dos veículos prontos para venda (mesma coorte)
  const totalCosts = allCosts
    .filter((cost: any) => {
      const vehicle = readyForSale.find(v => v.id === cost.vehicleId);
      return !!vehicle;
    })
    .reduce((sum, cost: any) => sum + cost.value, 0);

  // Margem esperada (valor de venda - custos)
  const expectedMargin = inventoryValue - totalCosts;
  const marginPercentage = inventoryValue > 0 
    ? ((expectedMargin / inventoryValue) * 100).toFixed(1)
    : "0";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor do Estoque
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(inventoryValue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {readyForSale.length} {readyForSale.length === 1 ? 'veículo pronto' : 'veículos prontos'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Investimento Total
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalCosts)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Custos de {readyForSale.length} {readyForSale.length === 1 ? 'veículo' : 'veículos'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
