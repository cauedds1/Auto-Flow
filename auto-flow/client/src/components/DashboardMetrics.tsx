import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CostBreakdownDialog } from "@/components/CostBreakdownDialog";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

function MetricCard({ title, value, icon, onClick, clickable = false }: MetricCardProps) {
  return (
    <Card 
      className={`p-6 ${clickable ? 'cursor-pointer hover:shadow-lg transition-shadow hover:border-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-card-foreground" data-testid={`text-metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {value}
          </p>
          {clickable && (
            <p className="mt-1 text-xs text-primary">Clique para ver detalhes</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function DashboardMetrics() {
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Veículos"
          value={metrics?.totalVehicles || 0}
          icon={<svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <MetricCard
          title="Prontos para Venda"
          value={metrics?.readyForSale || 0}
          icon={<svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          title="Tempo Médio no Pipeline"
          value={metrics?.avgTime || "0 dias"}
          icon={<svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          title="Custo Médio"
          value={metrics?.avgCost || "R$ 0K"}
          icon={<svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          clickable
          onClick={() => setIsCostBreakdownOpen(true)}
        />
      </div>

      <CostBreakdownDialog
        open={isCostBreakdownOpen}
        onOpenChange={setIsCostBreakdownOpen}
      />
    </>
  );
}
