import { useQuery } from "@tanstack/react-query";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { FinancialSummary } from "@/components/FinancialSummary";
import { RecentActivity } from "@/components/RecentActivity";
import { KanbanBoard } from "@/components/KanbanBoard";
import { AddVehicleDialog } from "@/components/AddVehicleDialog";
import { PendingTasksNotification } from "@/components/PendingTasksNotification";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: vehicles = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
  });

  return (
    <div className="flex h-full flex-col p-8">
      <PendingTasksNotification />
      
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
          <p className="mt-2 text-muted-foreground">
            Visão geral do estoque e movimentação de veículos
          </p>
        </div>
        <AddVehicleDialog onAdd={(data) => console.log("Novo veículo:", data)} />
      </div>

      <div className="space-y-6 mb-8">
        {/* Métricas principais - mantido */}
        <DashboardMetrics />
        
        {/* NOVO: Resumo Financeiro */}
        <FinancialSummary />
        
        {/* NOVO: Alertas e Avisos */}
        <DashboardAlerts />
        
        {/* NOVO: Atividade Recente */}
        <RecentActivity />
      </div>

      {/* Kanban Board - mantido */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard vehicles={vehicles} />
        </div>
      )}
    </div>
  );
}
