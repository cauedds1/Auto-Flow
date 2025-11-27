import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Wallet } from "lucide-react";
import { useCompanyTheme } from "./CompanyThemeProvider";

export function FinancialSummary() {
  const { changeIconColors, primaryColor, secondaryColor } = useCompanyTheme();
  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  const readyForSale = vehicles.filter(v => v.status === "Pronto para Venda");
  const sold = vehicles.filter(v => v.status === "Vendido");

  const inventoryValue = readyForSale.reduce((sum, v) => {
    return sum + Number(v.salePrice || 0);
  }, 0);

  const totalRevenue = sold.reduce((sum, v) => {
    return sum + Number(v.salePrice || 0);
  }, 0);

  const totalCosts = vehicles.reduce((sum, v) => {
    return sum + Number(v.totalCost || 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const stats = [
    {
      label: "Valor do Estoque",
      value: formatCurrency(inventoryValue),
      subtext: `${readyForSale.length} ${readyForSale.length === 1 ? 'veículo' : 'veículos'} disponíveis`,
      icon: Package,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      colorOverride: primaryColor,
    },
    {
      label: "Receita Total",
      value: formatCurrency(totalRevenue),
      subtext: `${sold.length} ${sold.length === 1 ? 'venda' : 'vendas'} realizadas`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      colorOverride: secondaryColor,
    },
    {
      label: "Custos Totais",
      value: formatCurrency(totalCosts),
      subtext: "Investimentos em veículos",
      icon: Wallet,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
      colorOverride: primaryColor,
    },
  ];

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: changeIconColors ? primaryColor : undefined }}
          >
            <DollarSign 
              className="h-5 w-5 text-white"
              style={{ color: changeIconColors ? "white" : undefined }}
            />
          </div>
          <CardTitle className="text-xl font-bold">Resumo Financeiro</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${stat.bgGradient} border border-border/50 hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtext}
                  </p>
                </div>
                <div 
                className={`p-3 rounded-xl shadow-md`}
                style={{ backgroundColor: changeIconColors ? stat.colorOverride : undefined }}
              >
                  <stat.icon 
                    className="h-6 w-6 text-white"
                    style={{ color: changeIconColors ? "white" : undefined }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
