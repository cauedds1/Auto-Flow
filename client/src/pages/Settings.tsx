import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, Palette, MapPin, Phone, Mail, Settings as SettingsIcon, Plus, X, DollarSign, Clock, Bell, Database, Lock, AlertCircle } from "lucide-react";
import { useCurrentCompany, useUpdateCompany } from "@/hooks/use-company";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

const companySchema = z.object({
  nomeFantasia: z.string().min(1, "Nome fantasia é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  telefone2: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  whatsappNumero: z.string().optional(),
  corPrimaria: z.string(),
  corSecundaria: z.string(),
  alertaDiasParado: z.number(),
  locaisComuns: z.string().optional(),
  comissaoFixaGlobal: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, { message: "Comissão deve ser um número válido maior ou igual a zero" }),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function Settings() {
  const { company, isLoading } = useCurrentCompany();
  const updateCompany = useUpdateCompany(company?.id || "");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: advancedSettings, refetch: refetchAdvanced } = useQuery({
    queryKey: ["/api/settings/advanced"],
  });

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customOrigins, setCustomOrigins] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newOrigin, setNewOrigin] = useState("");

  useEffect(() => {
    if (advancedSettings) {
      setCustomCategories((advancedSettings as any).customCategories || []);
      setCustomOrigins((advancedSettings as any).customLeadOrigins || []);
    }
  }, [advancedSettings]);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    values: company ? {
      nomeFantasia: company.nomeFantasia,
      razaoSocial: company.razaoSocial || "",
      cnpj: company.cnpj || "",
      endereco: company.endereco || "",
      telefone: company.telefone || "",
      telefone2: company.telefone2 || "",
      email: company.email || "",
      whatsappNumero: company.whatsappNumero || "",
      corPrimaria: company.corPrimaria,
      corSecundaria: company.corSecundaria,
      alertaDiasParado: company.alertaDiasParado,
      locaisComuns: company.locaisComuns.join(", "),
      comissaoFixaGlobal: (company as any).comissaoFixaGlobal || "",
    } : {
      nomeFantasia: "",
      corPrimaria: "#8B5CF6",
      corSecundaria: "#10B981",
      alertaDiasParado: 7,
      comissaoFixaGlobal: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const locaisArray = data.locaisComuns
        ? data.locaisComuns.split(",").map((l) => l.trim()).filter(Boolean)
        : ["Matriz", "Filial", "Pátio Externo", "Oficina"];

      // Preparar dados com conversões de tipo apropriadas
      const updateData: any = {
        ...data,
        locaisComuns: locaisArray,
        alertaDiasParado: Number(data.alertaDiasParado),
      };
      
      // Converter comissão fixa global para número ou null
      if (data.comissaoFixaGlobal && data.comissaoFixaGlobal !== "") {
        updateData.comissaoFixaGlobal = parseFloat(data.comissaoFixaGlobal);
      } else {
        updateData.comissaoFixaGlobal = null;
      }

      await updateCompany.mutateAsync(updateData);
      
      // Toast já é exibido pelo hook useUpdateCompany
      // Forçar reload da página para aplicar cores imediatamente
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Nenhuma empresa cadastrada</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie as informações da sua empresa e personalizações
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Informações da Empresa</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção 1: Informações Básicas */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Informações da Empresa</CardTitle>
                    <CardDescription>Dados principais da concessionária</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome da Empresa *</Label>
                    <Input
                      id="nomeFantasia"
                      {...form.register("nomeFantasia")}
                      placeholder="Digite o nome da sua empresa"
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      {...form.register("cnpj")}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      {...form.register("endereco")}
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Contato */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Informações de Contato</CardTitle>
                    <CardDescription>Telefones e e-mail</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone Principal</Label>
                    <Input
                      id="telefone"
                      {...form.register("telefone")}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumero">WhatsApp</Label>
                    <Input
                      id="whatsappNumero"
                      {...form.register("whatsappNumero")}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone2">Telefone Secundário</Label>
                    <Input
                      id="telefone2"
                      {...form.register("telefone2")}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 3: Locais Físicos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>Locais e alertas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="locaisComuns">Locais Físicos (separados por vírgula)</Label>
                  <Input
                    id="locaisComuns"
                    {...form.register("locaisComuns")}
                    placeholder="Matriz, Filial, Pátio Externo, Oficina"
                  />
                  <p className="text-xs text-muted-foreground">
                    Onde os veículos podem estar localizados fisicamente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertaDiasParado">Alerta de Veículos Parados (dias)</Label>
                  <Input
                    id="alertaDiasParado"
                    type="number"
                    {...form.register("alertaDiasParado", { valueAsNumber: true })}
                    placeholder="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Receba alertas quando um veículo ficar parado por este período
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Personalização de Cores</CardTitle>
                    <CardDescription>
                      Escolha as cores que representam sua marca
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="corPrimaria">Cor Primária</Label>
                    <div className="flex gap-3">
                      <Input
                        id="corPrimaria"
                        type="color"
                        value={form.watch("corPrimaria")}
                        onChange={(e) => form.setValue("corPrimaria", e.target.value)}
                        className="h-14 w-24 cursor-pointer"
                      />
                      <Input
                        value={form.watch("corPrimaria")}
                        onChange={(e) => form.setValue("corPrimaria", e.target.value)}
                        placeholder="#8B5CF6"
                        className="h-14 flex-1 font-mono text-lg uppercase"
                        maxLength={7}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cor principal dos botões, links e destaques do sistema
                    </p>
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-muted-foreground">Preview:</p>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          style={{ backgroundColor: form.watch("corPrimaria") }}
                          className="text-white"
                        >
                          Botão Primário
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="corSecundaria">Cor Secundária</Label>
                    <div className="flex gap-3">
                      <Input
                        id="corSecundaria"
                        type="color"
                        value={form.watch("corSecundaria")}
                        onChange={(e) => form.setValue("corSecundaria", e.target.value)}
                        className="h-14 w-24 cursor-pointer"
                      />
                      <Input
                        value={form.watch("corSecundaria")}
                        onChange={(e) => form.setValue("corSecundaria", e.target.value)}
                        placeholder="#10B981"
                        className="h-14 flex-1 font-mono text-lg uppercase"
                        maxLength={7}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cor secundária para acentos e elementos complementares
                    </p>
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-muted-foreground">Preview:</p>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          style={{ borderColor: form.watch("corSecundaria"), color: form.watch("corSecundaria") }}
                        >
                          Botão Secundário
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">💡 Dica de Cores</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use o modo claro/escuro no canto superior direito para ver como as cores ficam em cada tema.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    As cores serão aplicadas em todo o sistema: botões, links, destaques e sidebar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
              >
                {isSubmitting ? "Salvando..." : "Salvar Cores"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Detalhes e integr ações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Versão do VeloStock</p>
                  <p className="text-sm text-muted-foreground">1.0.0 - Controle Interno</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">OpenAI API</p>
                  <p className="text-sm text-muted-foreground">
                    Geração de anúncios e sugestão de preços
                  </p>
                </div>
                <div className="flex h-3 w-3 rounded-full bg-green-500" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Integração FIPE</p>
                  <p className="text-sm text-muted-foreground">
                    Consulta de preços de referência
                  </p>
                </div>
                <div className="flex h-3 w-3 rounded-full bg-green-500" />
              </div>
            </CardContent>
          </Card>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Comissão Fixa Global</CardTitle>
                    <CardDescription>Valor padrão de comissão para vendedores</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comissao-global">Comissão Fixa Global (R$)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="comissao-global"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10"
                      {...form.register("comissaoFixaGlobal")}
                      data-testid="input-comissao-global"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este valor será usado como padrão para todos os vendedores, a menos que uma comissão individual seja definida.
                  </p>
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Como funciona
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                    <li>Vendedores com "Usar comissão global" ativado receberão este valor por venda</li>
                    <li>Você pode definir comissões individuais diferentes na gestão de usuários</li>
                    <li>O valor é fixo em Reais (R$), não é porcentagem</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Comissão"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o VeloStock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">VeloStock</strong> é um sistema completo de controle 
                interno para lojas e concessionárias de veículos.
              </p>
              <p className="text-sm text-muted-foreground">
                Gerencie onde cada veículo está, o que precisa ser comprado (copos, material de limpeza), 
                checklists de preparação e muito mais - tudo em um único lugar.
              </p>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Sistema focado em controle operacional interno, não é um sistema de gestão comercial.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Linha 1: Categorias e Origens lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categorias de Custos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Categorias de Custos</CardTitle>
                    <CardDescription className="text-xs">Personalizadas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nova categoria..."
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
                          setCustomCategories([...customCategories, newCategory.trim()]);
                          setNewCategory("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
                        setCustomCategories([...customCategories, newCategory.trim()]);
                        setNewCategory("");
                      }
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {customCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded text-xs border border-blue-200 dark:border-blue-800">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => setCustomCategories(customCategories.filter((c) => c !== cat))}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {customCategories.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma adicionada</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Origens de Leads */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <SettingsIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Origens de Leads</CardTitle>
                    <CardDescription className="text-xs">Personalizadas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    placeholder="Nova origem..."
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newOrigin.trim() && !customOrigins.includes(newOrigin.trim())) {
                          setCustomOrigins([...customOrigins, newOrigin.trim()]);
                          setNewOrigin("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newOrigin.trim() && !customOrigins.includes(newOrigin.trim())) {
                        setCustomOrigins([...customOrigins, newOrigin.trim()]);
                        setNewOrigin("");
                      }
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {customOrigins.map((origin) => (
                    <div key={origin} className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-950/30 rounded text-xs border border-green-200 dark:border-green-800">
                      <span>{origin}</span>
                      <button
                        type="button"
                        onClick={() => setCustomOrigins(customOrigins.filter((o) => o !== origin))}
                        className="ml-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {customOrigins.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma adicionada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha 2: Configurações de Notificações e Prazos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notificações</CardTitle>
                    <CardDescription className="text-xs">Alertas do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Alertas de veículos parados</span>
                    <div className="flex h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Notificação de prazos</span>
                    <div className="flex h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Avisos de custos altos</span>
                    <div className="flex h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Prazos Padrão</CardTitle>
                    <CardDescription className="text-xs">Períodos do sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Preparação de veículo</span>
                    <span className="font-medium">7 dias</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Validade de orçamento</span>
                    <span className="font-medium">30 dias</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Alerta veículo parado</span>
                    <span className="font-medium">7 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha 3: Dados e Segurança */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Gestão de Dados</CardTitle>
                    <CardDescription className="text-xs">Backup e limpeza</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <Database className="w-3 h-3 mr-2" />
                    Fazer backup dos dados
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    Limpar dados antigos
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Último backup: 26 de nov às 19:00
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Segurança</CardTitle>
                    <CardDescription className="text-xs">Privacidade e proteção</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <Lock className="w-3 h-3 mr-2" />
                    Alterar senha
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    Sessões ativas
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sessões: 1 ativa
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={async () => {
                try {
                  const res = await fetch("/api/settings/advanced", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      customCategories,
                      customLeadOrigins: customOrigins,
                    }),
                  });
                  if (!res.ok) throw new Error();
                  await refetchAdvanced();
                  toast({ title: "Configurações atualizadas!" });
                } catch {
                  toast({ title: "Erro ao salvar", variant: "destructive" });
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
            >
              Salvar Configurações Avançadas
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
