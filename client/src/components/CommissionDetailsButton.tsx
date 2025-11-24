import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { CommissionDetailsDialog } from "./CommissionDetailsDialog";

interface FinancialMetrics {
  comissoes: {
    aPagar: number;
    total: number;
  };
}

interface CommissionDetailsButtonProps {
  financialMetrics: FinancialMetrics | undefined;
}

export function CommissionDetailsButton({ financialMetrics }: CommissionDetailsButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card 
        className="p-6 hover-elevate transition-all duration-300 cursor-pointer" 
        data-testid="card-comissoes-pagar"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 transition-colors">
            <DollarSign className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Comissões a Pagar</p>
        </div>
        <p className="text-2xl font-bold text-orange-600 transition-all">
          R$ {financialMetrics?.comissoes.aPagar.toLocaleString('pt-BR')}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Total: R$ {financialMetrics?.comissoes.total.toLocaleString('pt-BR')}
        </p>
      </Card>
      
      <CommissionDetailsDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
}
