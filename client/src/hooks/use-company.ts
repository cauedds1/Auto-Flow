import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Company {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  telefone?: string | null;
  telefone2?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  corPrimaria: string;
  corSecundaria: string;
  whatsappNumero?: string | null;
  locaisComuns: string[];
  alertaDiasParado: number;
  createdAt: string;
  updatedAt: string;
}

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Erro ao carregar empresas");
      }
      return response.json();
    },
  });
}

export function useCompany(id: string | undefined) {
  return useQuery<Company>({
    queryKey: [`/api/companies/${id}`],
    queryFn: async () => {
      if (!id) throw new Error("ID não fornecido");
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar empresa");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar empresa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Empresa criada!",
        description: "A empresa foi cadastrada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar empresa",
        description: "Não foi possível criar a empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const response = await fetch(`/api/companies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar empresa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${id}`] });
      toast({
        title: "Empresa atualizada!",
        description: "As informações foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar empresa",
        description: "Não foi possível atualizar a empresa. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useCurrentCompany() {
  const { data: companies, isLoading } = useCompanies();
  
  const currentCompany = companies?.[0];
  
  return {
    company: currentCompany,
    isLoading,
    hasCompany: !!currentCompany,
  };
}
