import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Target, TrendingUp, Check, AlertCircle } from "lucide-react";

type SellerDashboardData = {
  meta: {
    metaQuantidade: number | null;
    metaValor: number | null;
    quantidadeVendas: number;
    receitaTotal: number;
  };
  comissoes: {
    total: number;
    pagas: number;
    aPagar: number;
    percentualComissao: number;
  };
};

export function SellerDashboard() {
  const { data, isLoading } = useQuery<SellerDashboardData>({
    queryKey: ["/api/financial/seller-dashboard"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const metaQuantidade = data.meta.metaQuantidade || 0;
  const metaValor = data.meta.metaValor || 0;
  const quantidadeAtingida = data.meta.quantidadeVendas;
  const receitaAtingida = data.meta.receitaTotal;

  const percentualQuantidade = metaQuantidade > 0 ? (quantidadeAtingida / metaQuantidade) * 100 : 0;
  const percentualValor = metaValor > 0 ? (receitaAtingida / metaValor) * 100 : 0;

  const atingiuMetaQuantidade = quantidadeAtingida >= metaQuantidade && metaQuantidade > 0;
  const atingiuMetaValor = receitaAtingida >= metaValor && metaValor > 0;

  return (
    <div className="space-y-6">
      {/* Meta de Quantidade */}
      {metaQuantidade > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Meta de Veículos</p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {quantidadeAtingida}/{metaQuantidade}
                </p>
              </div>
              {atingiuMetaQuantidade && <Check className="h-8 w-8 text-green-600" />}
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(percentualQuantidade, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{percentualQuantidade.toFixed(0)}% da meta</p>
              {atingiuMetaQuantidade && <p className="text-sm font-semibold text-green-600">🎉 Meta atingida!</p>}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Meta de Valor */}
      {metaValor > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Meta de Faturamento</p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  R$ {receitaAtingida.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              {atingiuMetaValor && <Check className="h-8 w-8 text-green-600" />}
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min(percentualValor, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                de R$ {metaValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm font-medium text-foreground">{percentualValor.toFixed(0)}% da meta</p>
            </div>

            {atingiuMetaValor && <p className="text-sm font-semibold text-green-600 mt-2">🎉 Meta atingida!</p>}
          </Card>
        </motion.div>
      )}

      {/* Comissões */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-muted-foreground">Comissões ({data.comissoes.percentualComissao.toFixed(1)}%)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total a Receber</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {data.comissoes.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Já Recebidas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {data.comissoes.pagas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Pendentes de Pagamento</p>
            <p className="text-xl font-bold text-orange-600">
              R$ {data.comissoes.aPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
