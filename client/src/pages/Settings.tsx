import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Moon, Zap, Database, FileText, Download } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function Settings() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="mt-2 text-muted-foreground">
          Configure o sistema conforme suas preferências
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Dados da concessionária exibidos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                defaultValue="Capoeiras Automóveis"
                placeholder="Nome da empresa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input
                id="company-phone"
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-email">E-mail</Label>
              <Input
                id="company-email"
                type="email"
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-address">Endereço</Label>
              <Input
                id="company-address"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company-cnpj">CNPJ</Label>
              <Input
                id="company-cnpj"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações e Alertas
            </CardTitle>
            <CardDescription>
              Configure quando e como você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Alertas de Tarefas Pendentes</p>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificação ao abrir o sistema
                </p>
              </div>
              <Switch
                checked={settings.taskAlerts}
                onCheckedChange={(checked) => updateSetting('taskAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Veículos Parados há Muito Tempo</p>
                <p className="text-sm text-muted-foreground">
                  Alertar sobre veículos no mesmo status por mais de 7 dias
                </p>
              </div>
              <Switch
                checked={settings.stuckVehicleAlerts}
                onCheckedChange={(checked) => updateSetting('stuckVehicleAlerts', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Veículos Prontos para Venda</p>
                <p className="text-sm text-muted-foreground">
                  Notificar quando um veículo estiver pronto
                </p>
              </div>
              <Switch
                checked={settings.readyForSaleAlerts}
                onCheckedChange={(checked) => updateSetting('readyForSaleAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Preferências do Sistema
            </CardTitle>
            <CardDescription>
              Personalize a experiência de uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Ativar tema escuro
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Confirmação de Exclusão</p>
                <p className="text-sm text-muted-foreground">
                  Pedir confirmação antes de excluir veículos
                </p>
              </div>
              <Switch
                checked={settings.deleteConfirmation}
                onCheckedChange={(checked) => updateSetting('deleteConfirmation', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Atualização Automática</p>
                <p className="text-sm text-muted-foreground">
                  Atualizar dados automaticamente a cada 30 segundos
                </p>
              </div>
              <Switch
                checked={settings.autoUpdate}
                onCheckedChange={(checked) => updateSetting('autoUpdate', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dados e Backup
            </CardTitle>
            <CardDescription>
              Gerencie seus dados e faça backups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Exportar Dados</p>
                  <p className="text-sm text-muted-foreground">
                    Baixar todos os dados em formato CSV
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Exportar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Relatório Geral</p>
                  <p className="text-sm text-muted-foreground">
                    Gerar relatório completo em PDF
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Gerar PDF</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração OpenAI</CardTitle>
            <CardDescription>
              Configuração do gerador de anúncios com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status da API</p>
                <p className="text-sm text-muted-foreground">
                  OpenAI API está configurada e ativa
                </p>
              </div>
              <div className="flex h-3 w-3 rounded-full bg-green-500" />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="ai-model">Modelo de IA</Label>
              <Input
                id="ai-model"
                defaultValue="GPT-4"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Modelo otimizado para gerar anúncios persuasivos e únicos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
