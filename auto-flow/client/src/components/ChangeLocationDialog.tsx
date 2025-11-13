import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

interface ChangeLocationDialogProps {
  vehicleId: string;
  currentStatus: string;
  currentPhysicalLocation?: string | null;
  currentPhysicalLocationDetail?: string | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChangeLocationDialog({ 
  vehicleId, 
  currentStatus,
  currentPhysicalLocation,
  currentPhysicalLocationDetail,
  trigger,
  open: controlledOpen,
  onOpenChange 
}: ChangeLocationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    status: currentStatus,
    physicalLocation: currentPhysicalLocation || "__none__",
    physicalLocationDetail: currentPhysicalLocationDetail || "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        status: currentStatus,
        physicalLocation: currentPhysicalLocation || "__none__",
        physicalLocationDetail: currentPhysicalLocationDetail || "",
        notes: "",
      });
    }
  }, [open, currentStatus, currentPhysicalLocation, currentPhysicalLocationDetail]);

  const statusOptions = [
    "Entrada",
    "Em Reparos",
    "Aguardando Peças",
    "Em Higienização",
    "Em Documentação",
    "Pronto para Venda",
    "Vendido",
    "Arquivado",
  ];

  const physicalLocationOptions = [
    { value: "__none__", label: "Não especificado" },
    { value: "Pátio da Loja", label: "Pátio da Loja" },
    { value: "Casa", label: "Casa" },
    { value: "Oficina", label: "Oficina" },
    { value: "Higienização", label: "Higienização" },
    { value: "Outra Loja", label: "Outra Loja" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        status: formData.status,
        moveNotes: formData.notes || null,
      };

      // Convert __none__ to null, otherwise use the value
      if (formData.physicalLocation && formData.physicalLocation !== "__none__") {
        payload.physicalLocation = formData.physicalLocation;
        payload.physicalLocationDetail = formData.physicalLocationDetail.trim() || null;
      } else {
        payload.physicalLocation = null;
        payload.physicalLocationDetail = null;
      }

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar veículo");
      }

      // Build description for toast
      let description = `Status: ${formData.status}`;
      if (formData.physicalLocation && formData.physicalLocation !== "__none__") {
        description += formData.physicalLocationDetail
          ? ` | Local: ${formData.physicalLocation} - ${formData.physicalLocationDetail}`
          : ` | Local: ${formData.physicalLocation}`;
      }

      toast({
        title: "Veículo atualizado!",
        description,
      });

      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/history`] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });

      setOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar veículo",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <MapPin className="mr-2 h-4 w-4" />
      Mudar Localização
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Atualizar Status e Localização</DialogTitle>
          <DialogDescription>
            Altere o status do veículo no pipeline e sua localização física
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status do Veículo</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="physicalLocation">Localização Física (opcional)</Label>
            <Select
              value={formData.physicalLocation}
              onValueChange={(value) => setFormData({ ...formData, physicalLocation: value, physicalLocationDetail: "" })}
            >
              <SelectTrigger id="physicalLocation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {physicalLocationOptions.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.physicalLocation && formData.physicalLocation !== "__none__" && (
            <div className="space-y-2">
              <Label htmlFor="physicalLocationDetail">
                Detalhe da Localização (opcional)
              </Label>
              <Input
                id="physicalLocationDetail"
                placeholder={
                  formData.physicalLocation === "Oficina" 
                    ? "Ex: Paulo, Pensin, Adailton..." 
                    : formData.physicalLocation === "Higienização"
                    ? "Ex: Lavagem do João, Estética Car..."
                    : formData.physicalLocation === "Outra Loja"
                    ? "Ex: Loja do João..."
                    : "Ex: Especifique o local..."
                }
                value={formData.physicalLocationDetail}
                onChange={(e) => setFormData({ ...formData, physicalLocationDetail: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Veículo enviado para conserto do motor"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
