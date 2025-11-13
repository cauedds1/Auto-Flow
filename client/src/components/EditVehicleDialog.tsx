import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Star } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const vehicleFormSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.coerce.number().min(1900),
  color: z.string().min(1, "Cor é obrigatória"),
  plate: z.string().min(7, "Placa inválida"),
  location: z.string().min(1, "Localização é obrigatória"),
  kmOdometer: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().nullable()),
  fuelType: z.string().nullable(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface EditVehicleDialogProps {
  vehicleId: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    location: string;
    kmOdometer?: number | null;
    fuelType?: string | null;
    images?: Array<{ id: string; imageUrl: string; order: number }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVehicleDialog({ vehicleId, vehicle, open, onOpenChange }: EditVehicleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("info");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; imageUrl: string; order: number }>>(vehicle.images || []);
  const [coverImageIndex, setCoverImageIndex] = useState(0);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plate: vehicle.plate,
      location: vehicle.location,
      kmOdometer: vehicle.kmOdometer || null,
      fuelType: vehicle.fuelType || null,
    },
  });

  useEffect(() => {
    form.reset({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      plate: vehicle.plate,
      location: vehicle.location,
      kmOdometer: vehicle.kmOdometer || null,
      fuelType: vehicle.fuelType || null,
    });
    setExistingImages(vehicle.images || []);
    setNewImages([]);
  }, [vehicle, form]);

  const removeExistingImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao remover imagem");

      toast({
        title: "Imagem removida!",
        description: "A imagem foi removida com sucesso.",
      });

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      await queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}`] });
    } catch (error) {
      toast({
        title: "Erro ao remover imagem",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  const uploadNewImages = async () => {
    if (newImages.length === 0) return;

    try {
      const formData = new FormData();
      newImages.forEach(image => formData.append("images", image));

      const response = await fetch(`/api/vehicles/${vehicleId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao enviar imagens");

      toast({
        title: "Imagens adicionadas!",
        description: `${newImages.length} nova(s) imagem(ns) adicionada(s).`,
      });

      setNewImages([]);
      await queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}`] });
    } catch (error) {
      toast({
        title: "Erro ao adicionar imagens",
        description: "Não foi possível adicionar as imagens.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      await uploadNewImages();
      
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar veículo");
      }

      toast({
        title: "Veículo atualizado!",
        description: "As informações foram atualizadas com sucesso.",
      });

      await queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar veículo",
        description: "Ocorreu um erro ao atualizar as informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Editar Veículo</DialogTitle>
          <DialogDescription>
            Atualize as informações e fotos do veículo
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="images">Fotos ({existingImages.length + newImages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Toyota" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Corolla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2020"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prata" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a localização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Higienização/Funilaria">Higienização/Funilaria</SelectItem>
                        <SelectItem value="Mecânica">Mecânica</SelectItem>
                        <SelectItem value="Documentação">Documentação</SelectItem>
                        <SelectItem value="Pronto para Venda">Pronto para Venda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kmOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quilometragem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 45000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Combustível</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Gasolina">Gasolina</SelectItem>
                        <SelectItem value="Etanol">Etanol</SelectItem>
                        <SelectItem value="Flex">Flex</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Elétrico">Elétrico</SelectItem>
                        <SelectItem value="Híbrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Fotos Atuais</h4>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Capa
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(img.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma foto atual</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Adicionar Novas Fotos</h4>
              <ImageUpload
                onImagesChange={setNewImages}
                maxImages={8}
                existingCount={existingImages.length}
              />
              {newImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {newImages.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Nova foto ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={() => { uploadNewImages(); onOpenChange(false); }}>
                Salvar Fotos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
