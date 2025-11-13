import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ChecklistObservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  currentObservation?: string;
  onSave: (observation: string) => void;
}

export function ChecklistObservationDialog({
  open,
  onOpenChange,
  itemName,
  currentObservation = "",
  onSave,
}: ChecklistObservationDialogProps) {
  const [observation, setObservation] = useState(currentObservation);

  useEffect(() => {
    setObservation(currentObservation);
  }, [currentObservation, itemName, open]);

  const handleSave = () => {
    onSave(observation.trim());
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setObservation(currentObservation);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Observação - {itemName}</DialogTitle>
          <DialogDescription>
            Adicione observações específicas sobre este item do checklist.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="observation">Observação</Label>
            <Textarea
              id="observation"
              placeholder="Ex: Pneu dianteiro direito desgastado, precisa trocar em breve..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Observação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
