import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
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
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências do Sistema</CardTitle>
            <CardDescription>
              Personalize a experiência de uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">
                  Receber alertas sobre veículos
                </p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">
                  Modo claro ou escuro
                </p>
              </div>
              <Button variant="outline">Alterar</Button>
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
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status da API</p>
                <p className="text-sm text-muted-foreground">
                  OpenAI API está configurada e ativa
                </p>
              </div>
              <div className="flex h-3 w-3 rounded-full bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
