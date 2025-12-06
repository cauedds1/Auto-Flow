import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format } from "date-fns";
import type { StoreObservation } from "@shared/schema";
import { StoreObservationDialog } from "@/components/StoreObservationDialog";
import { RemindersTab } from "@/components/RemindersTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";

export default function Notes() {
  const { t } = useI18n();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObservation, setEditingObservation] = useState<StoreObservation | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: observations = [], isLoading } = useQuery<StoreObservation[]>({
    queryKey: ["/api/store-observations"],
  });

  const { data: reminders = [], isLoading: isLoadingReminders } = useQuery<any[]>({
    queryKey: ["/api/reminders"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/store-observations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar observação");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store-observations"] });
      toast({
        title: t("notes.observationDeleted"),
        description: t("notes.observationDeletedDesc"),
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("notes.deleteError"),
        description: t("notes.deleteErrorDesc"),
      });
    },
  });

  const filteredObservations = observations.filter((obs) => {
    const matchesCategory = categoryFilter === "all" || obs.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || obs.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const pendingCount = observations.filter(o => o.status === "Pendente").length;
  const resolvedCount = observations.filter(o => o.status === "Resolvido").length;

  const pendingRemindersCount = reminders.filter(r => r.status === "Pendente").length;
  const completedRemindersCount = reminders.filter(r => r.status === "Concluído").length;

  const uniqueCategories = Array.from(
    new Set(observations.map(o => o.category).filter(Boolean))
  ).sort();

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("notes.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("notes.subtitle")}
          </p>
          <div className="mt-4 flex gap-4">
            <Badge variant="outline" className="text-sm">
              <AlertCircle className="mr-1 h-3 w-3" />
              {pendingCount} {pendingCount !== 1 ? t("notes.pendingPlural") : t("notes.pending")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {resolvedCount} {resolvedCount !== 1 ? t("notes.resolvedPlural") : t("notes.resolved")}
            </Badge>
          </div>
        </div>
        <Button onClick={() => {
          setEditingObservation(undefined);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t("notes.newObservation")}
        </Button>
      </div>

      <Tabs defaultValue="observacoes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="observacoes" data-testid="tab-store-observations">
            <div className="flex items-center gap-2">
              <span>{t("notes.storeObservations")}</span>
              <Badge variant="outline" className="text-xs">
                <AlertCircle className="mr-1 h-3 w-3" />
                {pendingCount}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger value="lembretes" data-testid="tab-personal-reminders">
            <div className="flex items-center gap-2">
              <Clock className="mr-2 h-4 w-4" />
              <span>{t("notes.myReminders")}</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {pendingRemindersCount}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="observacoes">
          <div className="mb-6 flex gap-4 items-center">
            <Badge variant="outline" className="text-sm">
              <AlertCircle className="mr-1 h-3 w-3" />
              {pendingCount} {pendingCount !== 1 ? t("notes.pendingPlural") : t("notes.pending")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {resolvedCount} {resolvedCount !== 1 ? t("notes.resolvedPlural") : t("notes.resolved")}
            </Badge>
          </div>

          <div className="mb-6 flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("notes.filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allCategories")}</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("notes.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allStatus")}</SelectItem>
                <SelectItem value="Pendente">{t("notes.pending")}</SelectItem>
                <SelectItem value="Resolvido">{t("notes.resolved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          ) : filteredObservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <StickyNote className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {observations.length === 0 
                  ? t("notes.noObservations")
                  : t("notes.noObservationsFiltered")}
              </p>
              {observations.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("notes.clickNewObservation")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredObservations.map((obs) => (
                <Card key={obs.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {obs.status === "Pendente" ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          <CardTitle className="text-lg">
                            {obs.category ? obs.category : t("notes.noCategory")}
                          </CardTitle>
                          <Badge 
                            variant={obs.status === "Pendente" ? "default" : "outline"}
                            className={obs.status === "Pendente" ? "bg-yellow-500 text-white" : ""}
                          >
                            {obs.status === "Pendente" ? t("notes.pending") : t("notes.resolved")}
                          </Badge>
                          {obs.expenseCost && (
                            <Badge variant="secondary">
                              R$ {parseFloat(obs.expenseCost as any).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("notes.createdOn")} {format(new Date(obs.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                          {obs.resolvedAt && (
                            <> • {t("notes.resolvedOn")} {format(new Date(obs.resolvedAt), "dd/MM/yyyy 'às' HH:mm")}</>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingObservation(obs);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteId(obs.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {obs.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredObservations.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("notes.showingCount", { 
                count: filteredObservations.length, 
                total: observations.length, 
                label: observations.length === 1 ? t("notes.observation") : t("notes.observations") 
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lembretes">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Badge variant="outline" className="text-sm">
                <Clock className="mr-1 h-3 w-3" />
                {pendingRemindersCount} {pendingRemindersCount !== 1 ? t("notes.pendingPlural") : t("notes.pending")}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {completedRemindersCount} {completedRemindersCount !== 1 ? t("notes.completedPlural") : t("notes.completed")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("notes.reminderNote")}
            </p>
            <RemindersTab vehicleId="" />
          </div>
        </TabsContent>
      </Tabs>

      <StoreObservationDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingObservation(undefined);
        }}
        observation={editingObservation}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("notes.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("notes.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
