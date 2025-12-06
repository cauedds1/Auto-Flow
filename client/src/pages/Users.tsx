import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users as UsersIcon, UserPlus, Edit, XCircle, CheckCircle, DollarSign, Shield, Trash2, Target } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getRoleName, getRoleBadgeColor, AVAILABLE_PERMISSIONS, type UserRole } from "@/hooks/use-permissions";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import type { CustomPermissions } from "@shared/schema";
import { useI18n } from "@/lib/i18n";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  isActive: string;
  createdAt: string;
  createdBy?: string;
  comissaoFixa?: string | null;
  usarComissaoFixaGlobal?: string;
  customPermissions?: CustomPermissions;
  metaQuantidade?: number | null;
  metaValor?: string | null;
}

export default function Users() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const dateLocale = language === "pt-BR" ? ptBR : enUS;

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createUser = useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName?: string; role: string; password: string }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("users.errorCreating"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      toast({
        title: t("users.userCreated"),
        description: t("users.userCreatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("users.errorCreating"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...data }: Partial<User> & { id: string }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("users.errorUpdating"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: t("users.userUpdated"),
        description: t("users.userUpdatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("users.errorUpdating"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (user: User) => {
    const newStatus = user.isActive === "true" ? "false" : "true";
    updateUser.mutate({
      id: user.id,
      isActive: newStatus,
    });
  };

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("users.errorRemoving"));
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setUserToDelete(null);
      toast({
        title: t("users.userRemoved"),
        description: t("users.userRemovedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("users.errorRemoving"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">{t("users.loadingUsers")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("users.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("users.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("users.addUser")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UsersIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>{t("users.companyUsers")}</CardTitle>
              <CardDescription>
                {users.length === 1 
                  ? t("users.registeredCount", { count: users.length })
                  : t("users.registeredCountPlural", { count: users.length })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                      {user.firstName} {user.lastName || ""}
                    </h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleName(user.role)}
                    </Badge>
                    {user.isActive === "false" && (
                      <Badge variant="outline" className="text-red-600">
                        {t("users.inactive")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("users.createdAgo")} {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: dateLocale })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditDialogOpen(true);
                    }}
                    title={t("common.edit")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={user.isActive === "true" ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(user)}
                    title={user.isActive === "true" ? t("users.deactivateUser") : t("users.activateUser")}
                  >
                    {user.isActive === "true" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserToDelete(user)}
                    title={t("users.removeUser")}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("users.noUsersYet")}</p>
                <p className="text-sm mt-2">{t("users.clickToAdd")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(data) => createUser.mutate(data)}
        isLoading={createUser.isPending}
      />

      {selectedUser && (
        <EditUserDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={selectedUser}
          onSubmit={(data) => updateUser.mutate({ ...data, id: selectedUser.id })}
          isLoading={updateUser.isPending}
        />
      )}

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.removeUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.removeUserConfirm")}{" "}
              <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
              <br /><br />
              {t("users.removeUserWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUser.mutate(userToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUser.isPending ? t("users.removing") : t("users.removePermanently")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function AddUserDialog({ open, onOpenChange, onSubmit, isLoading }: AddUserDialogProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "vendedor",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ email: "", firstName: "", lastName: "", role: "vendedor", password: "" });
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "proprietario": return t("users.roleDescOwner");
      case "gerente": return t("users.roleDescManager");
      case "financeiro": return t("users.roleDescFinancial");
      case "vendedor": return t("users.roleDescSeller");
      case "motorista": return t("users.roleDescDriver");
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("users.addNewUser")}</DialogTitle>
          <DialogDescription>
            {t("users.fillEmployeeInfo")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">{t("users.firstName")} *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">{t("users.lastName")}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email")} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("users.temporaryPassword")} *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t("users.minCharacters")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">{t("users.systemRole")} *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietario">{t("users.roles.owner")}</SelectItem>
                  <SelectItem value="gerente">{t("users.roles.manager")}</SelectItem>
                  <SelectItem value="financeiro">{t("users.roles.financial")}</SelectItem>
                  <SelectItem value="vendedor">{t("users.roles.seller")}</SelectItem>
                  <SelectItem value="motorista">{t("users.roles.driver")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getRoleDescription(formData.role)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("users.creating") : t("users.createUser")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function EditUserDialog({ open, onOpenChange, user, onSubmit, isLoading }: EditUserDialogProps) {
  const { t } = useI18n();
  
  const normalizePermissions = (perms: any): CustomPermissions => {
    if (!perms) return {};
    const normalized: CustomPermissions = {};
    for (const key of Object.keys(perms)) {
      const value = perms[key];
      if (value === "true" || value === true) {
        normalized[key as keyof CustomPermissions] = true;
      } else if (value === "false" || value === false) {
        normalized[key as keyof CustomPermissions] = false;
      } else {
        normalized[key as keyof CustomPermissions] = value;
      }
    }
    return normalized;
  };

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName || "",
    role: user.role,
    usarComissaoFixaGlobal: user.usarComissaoFixaGlobal !== "false",
    comissaoFixa: user.comissaoFixa || "",
    metaQuantidade: user.metaQuantidade?.toString() || "",
    metaValor: user.metaValor || "",
  });

  const [customPermissions, setCustomPermissions] = useState<CustomPermissions>(
    normalizePermissions(user.customPermissions)
  );

  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName || "",
      role: user.role,
      usarComissaoFixaGlobal: user.usarComissaoFixaGlobal !== "false",
      comissaoFixa: user.comissaoFixa || "",
      metaQuantidade: user.metaQuantidade?.toString() || "",
      metaValor: user.metaValor || "",
    });
    setCustomPermissions(normalizePermissions(user.customPermissions));
    setActiveTab("info");
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const permissionsToSubmit: any = {};
    for (const [key, value] of Object.entries(customPermissions)) {
      permissionsToSubmit[key] = value === true ? "true" : value === false ? "false" : value;
    }
    const dataToSubmit = {
      ...formData,
      usarComissaoFixaGlobal: formData.usarComissaoFixaGlobal ? "true" : "false",
      comissaoFixa: formData.usarComissaoFixaGlobal ? null : (formData.comissaoFixa || null),
      metaQuantidade: formData.metaQuantidade ? parseInt(formData.metaQuantidade) : null,
      metaValor: formData.metaValor || null,
      customPermissions: permissionsToSubmit,
    };
    onSubmit(dataToSubmit);
  };

  const isVendedor = formData.role === "vendedor";

  const togglePermission = (key: keyof CustomPermissions) => {
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? true : !prev[key],
    }));
  };

  const resetPermissions = () => {
    setCustomPermissions({});
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "proprietario": return t("users.roleDescOwner");
      case "gerente": return t("users.roleDescManager");
      case "financeiro": return t("users.roleDescFinancial");
      case "vendedor": return t("users.roleDescSeller");
      case "motorista": return t("users.roleDescDriver");
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("users.editUser")}</DialogTitle>
          <DialogDescription>
            {t("users.updateInfo")} {user.firstName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">{t("users.info")}</TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("users.manageAccess")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-firstName">{t("users.firstName")}</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lastName">{t("users.lastName")}</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">{t("users.systemRole")}</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietario">{t("users.roles.owner")}</SelectItem>
                      <SelectItem value="gerente">{t("users.roles.manager")}</SelectItem>
                      <SelectItem value="financeiro">{t("users.roles.financial")}</SelectItem>
                      <SelectItem value="vendedor">{t("users.roles.seller")}</SelectItem>
                      <SelectItem value="motorista">{t("users.roles.driver")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {getRoleDescription(formData.role)}
                  </p>
                </div>

                {isVendedor && (
                  <div className="grid gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <Label className="text-base font-semibold">{t("users.commissionConfig")}</Label>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <Label htmlFor="usar-comissao-global" className="text-sm font-medium">
                          {t("users.useGlobalCommission")}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("users.useGlobalCommissionDesc")}
                        </p>
                      </div>
                      <Switch
                        id="usar-comissao-global"
                        checked={formData.usarComissaoFixaGlobal}
                        onCheckedChange={(checked) => setFormData({ ...formData, usarComissaoFixaGlobal: checked })}
                      />
                    </div>

                    {!formData.usarComissaoFixaGlobal && (
                      <div className="grid gap-2">
                        <Label htmlFor="comissao-fixa">Comissão Fixa Individual (R$)</Label>
                        <Input
                          id="comissao-fixa"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.comissaoFixa}
                          onChange={(e) => setFormData({ ...formData, comissaoFixa: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    <div className="grid gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <Label className="text-base font-semibold">Metas do Vendedor</Label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="meta-quantidade">Meta de Quantidade</Label>
                          <Input
                            id="meta-quantidade"
                            type="number"
                            min="0"
                            value={formData.metaQuantidade}
                            onChange={(e) => setFormData({ ...formData, metaQuantidade: e.target.value })}
                            placeholder="Ex: 10"
                          />
                          <p className="text-xs text-muted-foreground">Veículos por mês</p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="meta-valor">Meta de Valor (R$)</Label>
                          <Input
                            id="meta-valor"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.metaValor}
                            onChange={(e) => setFormData({ ...formData, metaValor: e.target.value })}
                            placeholder="Ex: 50000"
                          />
                          <p className="text-xs text-muted-foreground">Faturamento por mês</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Personalize os acessos deste usuário além do papel padrão
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={resetPermissions}
                >
                  Restaurar Padrão
                </Button>
              </div>
              
              <div className="grid gap-3">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div 
                    key={perm.key} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{perm.label}</p>
                      <p className="text-xs text-muted-foreground">{perm.description}</p>
                    </div>
                    <Switch
                      checked={customPermissions[perm.key] === true}
                      onCheckedChange={() => togglePermission(perm.key)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("settings.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
