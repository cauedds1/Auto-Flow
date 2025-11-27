import { useAuth } from "./useAuth";
import type { CustomPermissions } from "@shared/schema";

export type UserRole = "proprietario" | "gerente" | "financeiro" | "vendedor" | "motorista";

/**
 * Hook para verificar permissões do usuário
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;
  const customPermissions = (user as any)?.customPermissions as CustomPermissions | undefined;

  const isProprietario = role === "proprietario";
  const isGerente = role === "gerente";
  const isFinanceiro = role === "financeiro";
  const isVendedor = role === "vendedor";
  const isMotorista = role === "motorista";

  // Helper para verificar permissão com override customizado
  const hasPermission = (defaultValue: boolean, permissionKey: keyof CustomPermissions): boolean => {
    if (customPermissions && customPermissions[permissionKey] !== undefined) {
      return customPermissions[permissionKey] as boolean;
    }
    return defaultValue;
  };

  // Funções de verificação de permissão
  const can = {
    // Gestão de usuários - Apenas proprietário (gerente pode ver, não gerenciar)
    manageUsers: hasPermission(isProprietario, "manageUsers"),
    
    // Configurações da empresa - Apenas proprietário
    companySettings: hasPermission(isProprietario, "companySettings"),
    
    // Métricas financeiras de vendas (receita, vendas) - Gerente e Financeiro podem ver
    viewFinancialMetrics: hasPermission(isProprietario || isGerente || isFinanceiro, "viewFinancialMetrics"),
    
    // Ver custos de veículos e margens - Gerente e Financeiro podem ver
    viewCosts: hasPermission(isProprietario || isGerente || isFinanceiro, "viewCosts"),
    
    // Editar preços
    editPrices: hasPermission(isProprietario || isGerente, "editPrices"),
    
    // Adicionar custos de veículos (peças, abastecimento) - Motorista também pode
    addCosts: hasPermission(isProprietario || isGerente || isMotorista, "addCosts"),
    
    // Editar veículos
    editVehicles: hasPermission(isProprietario || isGerente || isVendedor, "editVehicles"),
    
    // Excluir veículos (APENAS Gerente e Proprietário)
    deleteVehicles: hasPermission(isProprietario || isGerente, "deleteVehicles"),
    
    // Atualizar localização física
    updateLocation: true, // Todos podem
    
    // Upload de fotos
    uploadPhotos: true, // Todos podem
    
    // Ver veículos - Financeiro pode ver para acessar custos e relatórios
    viewVehicles: true, // Todos podem ver
    
    // Ver dashboard
    viewDashboard: isProprietario || isGerente || isVendedor || isFinanceiro,
    
    // Ver dashboard do motorista
    viewDriverDashboard: isMotorista,
    
    // Contas a Pagar/Receber/Comissões - Proprietário e Financeiro
    viewBills: hasPermission(isProprietario || isFinanceiro, "viewBills"),
    
    // Ver relatórios FINANCEIROS (contas, comissões) - Proprietário e Financeiro
    viewFinancialReports: hasPermission(isProprietario || isFinanceiro, "viewFinancialReports"),
    
    // Ver relatórios OPERACIONAIS (gastos com peças, custos de veículos) - Gerente e Financeiro podem ver
    viewOperationalReports: hasPermission(isProprietario || isGerente || isFinanceiro, "viewOperationalReports"),
    
    // Ver Leads (proprietário, gerente e vendedor - SEM motorista e SEM financeiro)
    viewLeads: hasPermission(isProprietario || isGerente || isVendedor, "viewLeads"),
    
    // Ver abas de veículos - Financeiro tem acesso total para visualizar custos e informações financeiras
    viewOverviewTab: true, // Financeiro pode ver visão geral
    viewHistoryTab: isProprietario || isGerente || isFinanceiro, // Financeiro pode ver histórico
    viewCostsTab: true, // Todos podem ver custos
    viewNotesTab: isProprietario || isGerente || isFinanceiro, // Financeiro pode ver observações
    viewPriceTab: hasPermission(isProprietario || isGerente || isFinanceiro, "viewPriceTab"),
    viewAdTab: hasPermission(isProprietario || isGerente || isVendedor, "viewAdTab"),
    viewMediaTab: hasPermission(isProprietario || isGerente || isVendedor, "viewMediaTab"),
    viewDocumentsTab: hasPermission(isProprietario || isGerente || isVendedor || isFinanceiro, "viewDocumentsTab"),
    viewChecklistTab: isProprietario || isGerente || isVendedor, // Financeiro não precisa ver checklist
    
    // Marcar como vendido
    markAsSold: hasPermission(isProprietario || isGerente || isVendedor, "markAsSold"),
  };

  return {
    role,
    isProprietario,
    isGerente,
    isFinanceiro,
    isVendedor,
    isMotorista,
    customPermissions,
    can,
  };
}

/**
 * Helper para exibir nomes amigáveis dos papéis
 */
export function getRoleName(role: UserRole | null | undefined): string {
  switch (role) {
    case "proprietario":
      return "Proprietário";
    case "gerente":
      return "Gerente";
    case "financeiro":
      return "Financeiro";
    case "vendedor":
      return "Vendedor";
    case "motorista":
      return "Motorista";
    default:
      return "Usuário";
  }
}

/**
 * Helper para obter badge de cor por papel
 */
export function getRoleBadgeColor(role: UserRole | null | undefined): string {
  switch (role) {
    case "proprietario":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "gerente":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "financeiro":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "vendedor":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "motorista":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

/**
 * Lista de todas as permissões disponíveis para gerenciamento
 */
export const AVAILABLE_PERMISSIONS = [
  { key: "viewFinancialMetrics", label: "Ver métricas financeiras", description: "Acesso a receitas e vendas" },
  { key: "viewCosts", label: "Ver custos", description: "Acesso a custos e margens" },
  { key: "editPrices", label: "Editar preços", description: "Alterar preços de veículos" },
  { key: "addCosts", label: "Adicionar custos", description: "Registrar custos de veículos" },
  { key: "editVehicles", label: "Editar veículos", description: "Alterar dados de veículos" },
  { key: "deleteVehicles", label: "Excluir veículos", description: "Remover veículos do sistema" },
  { key: "viewBills", label: "Ver contas", description: "Acessar contas a pagar/receber" },
  { key: "viewFinancialReports", label: "Ver relatórios financeiros", description: "Acessar relatórios de finanças" },
  { key: "viewOperationalReports", label: "Ver relatórios operacionais", description: "Acessar relatórios de operações" },
  { key: "viewLeads", label: "Ver leads", description: "Acessar lista de leads" },
  { key: "manageUsers", label: "Gerenciar usuários", description: "Adicionar e editar usuários" },
  { key: "companySettings", label: "Configurações da empresa", description: "Alterar configurações" },
  { key: "viewPriceTab", label: "Ver aba de preços", description: "Acessar aba de preços do veículo" },
  { key: "viewAdTab", label: "Ver aba de anúncios", description: "Acessar aba de anúncios" },
  { key: "viewMediaTab", label: "Ver aba de mídia", description: "Acessar fotos e vídeos" },
  { key: "viewDocumentsTab", label: "Ver aba de documentos", description: "Acessar documentos" },
  { key: "markAsSold", label: "Marcar como vendido", description: "Registrar vendas" },
] as const;
