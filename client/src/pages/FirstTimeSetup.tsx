import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCurrentCompany } from "../hooks/use-company";
import { CompanySetupDialog } from "../components/CompanySetupDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Building2, CheckCircle } from "lucide-react";

export default function FirstTimeSetup() {
  const [, setLocation] = useLocation();
  const { hasCompany, isLoading } = useCurrentCompany();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (hasCompany) {
        setLocation("/");
      } else {
        setShowSetup(true);
      }
    }
  }, [hasCompany, isLoading, setLocation]);

  const handleSuccess = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao AutoFlow</CardTitle>
          <CardDescription className="text-base mt-2">
            Sistema de gestão para concessionárias de veículos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Gestão Completa de Veículos</h4>
                <p className="text-sm text-muted-foreground">
                  Controle total do estoque, custos, documentos e histórico
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Kanban Visual</h4>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o status de cada veículo em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Gerador de Anúncios com IA</h4>
                <p className="text-sm text-muted-foreground">
                  Crie anúncios profissionais automaticamente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Tema Customizável</h4>
                <p className="text-sm text-muted-foreground">
                  Personalize com as cores e logo da sua empresa
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Vamos começar configurando sua empresa no sistema
            </p>
          </div>
        </CardContent>
      </Card>

      <CompanySetupDialog
        open={showSetup}
        onOpenChange={setShowSetup}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
