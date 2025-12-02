import { useLocation } from "wouter";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect } from "react";
import { AlertCircle, ShieldX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PermissionKey = 
  | "manageUsers"
  | "companySettings"
  | "viewFinancialMetrics"
  | "viewCosts"
  | "editPrices"
  | "addCosts"
  | "editVehicles"
  | "deleteVehicles"
  | "viewBills"
  | "viewFinancialReports"
  | "viewOperationalReports"
  | "viewLeads"
  | "viewDashboard"
  | "viewDriverDashboard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionKey;
  requiredPermissions?: PermissionKey[];
  requireAll?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { can, role } = usePermissions();

  const permissions = requiredPermission 
    ? [requiredPermission] 
    : requiredPermissions;

  const hasAccess = permissions.length === 0 
    ? true 
    : requireAll 
      ? permissions.every(p => can[p as keyof typeof can])
      : permissions.some(p => can[p as keyof typeof can]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Esta área é restrita. Se você acredita que deveria ter acesso, 
                entre em contato com o administrador do sistema.
              </p>
            </div>
            <Button 
              onClick={() => setLocation(fallbackPath)} 
              className="w-full"
              data-testid="button-go-back"
            >
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: PermissionKey
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
