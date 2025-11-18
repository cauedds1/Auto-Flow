import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCompany } from "../hooks/use-company";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";
import { Building2, Mail, Phone, MapPin, Palette, Bell } from "lucide-react";

const companySchema = z.object({
  nomeFantasia: z.string().min(1, "Nome fantasia é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  telefone2: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  corPrimaria: z.string().default("#8B5CF6"),
  corSecundaria: z.string().default("#10B981"),
  whatsappNumero: z.string().optional(),
  locaisComuns: z.string().optional(),
  alertaDiasParado: z.number().default(7),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanySetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanySetupDialog({ open, onOpenChange, onSuccess }: CompanySetupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCompany = useCreateCompany();
  const { toast } = useToast();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      corPrimaria: "#8B5CF6",
      corSecundaria: "#10B981",
      alertaDiasParado: 7,
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const locaisArray = data.locaisComuns
        ? data.locaisComuns.split(",").map((l) => l.trim()).filter(Boolean)
        : ["Matriz", "Filial", "Pátio Externo", "Oficina"];

      await createCompany.mutateAsync({
        ...data,
        locaisComuns: locaisArray,
      });

      toast({
        title: "Empresa cadastrada!",
        description: "Bem-vindo ao VeloStock",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toast({
        title: "Erro ao cadastrar",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DialogHeader className="space-y-3 pb-6 border-b">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">
            Configure sua Empresa
          </DialogTitle>
          <DialogDescription className="text-base">
            Preencha os dados abaixo para personalizar o VeloStock para sua empresa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção 1: Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Informações da Empresa</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomeFantasia" className="text-base font-medium">
                  Nome da Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nomeFantasia"
                  {...form.register("nomeFantasia")}
                  placeholder="Digite o nome da sua empresa"
                  className="h-11"
                />
                {form.formState.errors.nomeFantasia && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.nomeFantasia.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input
                  id="razaoSocial"
                  {...form.register("razaoSocial")}
                  placeholder="Razão social completa"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  {...form.register("cnpj")}
                  placeholder="00.000.000/0000-00"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone Principal</Label>
                <Input
                  id="telefone"
                  {...form.register("telefone")}
                  placeholder="(00) 0000-0000"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumero">WhatsApp</Label>
                <Input
                  id="whatsappNumero"
                  {...form.register("whatsappNumero")}
                  placeholder="(00) 00000-0000"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone2">Telefone Secundário</Label>
                <Input
                  id="telefone2"
                  {...form.register("telefone2")}
                  placeholder="(00) 0000-0000"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="contato@empresa.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  {...form.register("endereco")}
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Personalização */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Personalização Visual</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <div className="flex gap-3">
                  <Input
                    id="corPrimaria"
                    type="color"
                    {...form.register("corPrimaria")}
                    className="h-11 w-20 cursor-pointer"
                  />
                  <Input
                    {...form.register("corPrimaria")}
                    placeholder="#8B5CF6"
                    className="h-11 flex-1 font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor principal dos botões e destaques</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <div className="flex gap-3">
                  <Input
                    id="corSecundaria"
                    type="color"
                    {...form.register("corSecundaria")}
                    className="h-11 w-20 cursor-pointer"
                  />
                  <Input
                    {...form.register("corSecundaria")}
                    placeholder="#10B981"
                    className="h-11 flex-1 font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Cor secundária e acentos</p>
              </div>
            </div>
          </div>

          {/* Seção 4: Configurações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="alertaDiasParado">Alerta de Veículos Parados (dias)</Label>
                <Input
                  id="alertaDiasParado"
                  type="number"
                  {...form.register("alertaDiasParado", { valueAsNumber: true })}
                  placeholder="7"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Receba alertas quando um veículo ficar parado por este período
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locaisComuns">Locais Físicos (separados por vírgula)</Label>
                <Input
                  id="locaisComuns"
                  {...form.register("locaisComuns")}
                  placeholder="Matriz, Filial, Pátio Externo, Oficina"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Onde os veículos podem estar localizados fisicamente
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
            >
              {isSubmitting ? "Salvando..." : "Salvar Empresa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
