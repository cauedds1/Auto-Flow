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
  DialogTrigger,
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
import { ImageUpload } from "./ImageUpload";
import { Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/use-permissions";
import { useFipeVehicleVersions, useFipePriceByVersion } from "@/hooks/use-fipe";
import type { FipeVersion } from "@/hooks/use-fipe";
import { useI18n } from "@/lib/i18n";

const vehicleFormSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.coerce.number().min(1900, "Ano inválido"),
  version: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  plate: z.string().min(7, "Placa inválida"),
  vehicleType: z.enum(["Carro", "Moto"]),
  status: z.string().min(1, "Status é obrigatório"),
  purchasePrice: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().nullable().optional()),
  salePrice: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().nullable().optional()),
  kmOdometer: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().nullable().optional()),
  fuelType: z.string().nullable().optional(),
  fipeReferencePrice: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface AddVehicleDialogProps {
  onAdd?: (data: VehicleFormData & { images: File[] }) => void;
}

export function AddVehicleDialog({ onAdd }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [fipeVersions, setFipeVersions] = useState<FipeVersion[]>([]);
  const [fipeMetadata, setFipeMetadata] = useState<{brandId: string} | null>(null);
  const { toast } = useToast();
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      version: "",
      color: "",
      plate: "",
      vehicleType: "Carro",
      status: "Entrada",
      purchasePrice: null,
      salePrice: null,
      kmOdometer: null,
      fuelType: null,
      fipeReferencePrice: "",
    },
  });

  const vehicleType = form.watch("vehicleType");
  const vehicleTypeMap: Record<string, string> = {
    "Carro": "carros",
    "Moto": "motos"
  };
  
  const versionsMutation = useFipeVehicleVersions();
  const priceMutation = useFipePriceByVersion();

  const watchedBrand = form.watch("brand");
  const watchedModel = form.watch("model");
  const watchedYear = form.watch("year");

  useEffect(() => {
    setFipeVersions([]);
    setFipeMetadata(null);
    form.setValue("version", "");
  }, [watchedBrand, watchedModel, watchedYear, vehicleType]);

  useEffect(() => {
    if (fipeVersions.length > 0) return;
    
    const brand = form.getValues("brand");
    const model = form.getValues("model");
    const year = form.getValues("year");
    
    if (!brand || !model || !year) return;

    const loadVersions = async () => {
      try {
        const fipeVehicleType = vehicleTypeMap[form.getValues("vehicleType")] || "carros";
        const yearNum = parseInt(String(year), 10);
        if (isNaN(yearNum)) return;
        
        const result = await versionsMutation.mutateAsync({ 
          brand, model, year: yearNum, vehicleType: fipeVehicleType
        });
        setFipeVersions(result.versions);
        setFipeMetadata({ brandId: result.brandId });
      } catch (e) {
      }
    };

    const timer = setTimeout(loadVersions, 300);
    return () => clearTimeout(timer);
  }, [watchedBrand, watchedModel, watchedYear]);

  const handleLoadVersions = async () => {
    const brand = form.getValues("brand");
    const model = form.getValues("model");
    const year = form.getValues("year");

    if (!brand || !model || !year) {
      toast({ title: t("addVehicle.incompleteFields"), variant: "destructive" });
      return;
    }

    if (fipeVersions.length > 0) return;

    try {
      const fipeVehicleType = vehicleTypeMap[form.getValues("vehicleType")] || "carros";
      const yearNum = parseInt(String(year), 10);
      const result = await versionsMutation.mutateAsync({ 
        brand, model, year: yearNum, vehicleType: fipeVehicleType
      });
      setFipeVersions(result.versions);
      setFipeMetadata({ brandId: result.brandId });
    } catch (error: any) {
      toast({ title: t("addVehicle.errorLoadingVersions"), variant: "destructive" });
    }
  };

  const handleVersionChange = async (versionJson: string) => {
    if (!fipeMetadata) return;

    try {
      const version: FipeVersion = JSON.parse(versionJson);
      form.setValue("version", versionJson);

      const vehicleTypeMap: Record<string, string> = {
        "Carro": "carros",
        "Moto": "motos"
      };
      const fipeVehicleType = vehicleTypeMap[vehicleType] || "carros";

      const result = await priceMutation.mutateAsync({ 
        brandId: fipeMetadata.brandId, 
        modelId: String(version.modelId), 
        versionCode: version.yearCode,
        vehicleType: fipeVehicleType
      });
      
      console.log("Resposta FIPE:", result);
      
      const resultAny = result as any;
      
      if (resultAny.error || resultAny.erro || resultAny.message) {
        const errorMsg = resultAny.error || resultAny.erro || resultAny.message;
        throw new Error(`API FIPE: ${errorMsg}`);
      }
      
      const valorField = result.Valor || resultAny.valor || '';
      const priceValue = (valorField || '').toString().replace("R$", "").replace("R$ ", "").trim();
      
      if (!priceValue) {
        console.error("Resposta FIPE sem valor:", result);
        throw new Error(t("addVehicle.fipeNoPriceReturned"));
      }
      
      form.setValue("fipeReferencePrice", priceValue);
      
      const marca = result.Marca || resultAny.marca || 'Veículo';
      const modelo = result.Modelo || resultAny.modelo || '';
      const valor = result.Valor || resultAny.valor || valorField;
      
      toast({
        title: t("addVehicle.fipePriceUpdated"),
        description: `${marca} ${modelo}: ${valor}`,
      });
    } catch (error: any) {
      console.error("Erro ao buscar preço FIPE:", error);
      toast({
        title: t("addVehicle.errorConsultingPrice"),
        description: error.message || t("addVehicle.couldNotConsultFipe"),
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const formData = new FormData();
      formData.append("brand", data.brand);
      formData.append("model", data.model);
      formData.append("year", String(data.year));
      formData.append("color", data.color);
      formData.append("plate", data.plate.toUpperCase());
      formData.append("vehicleType", data.vehicleType);
      formData.append("status", data.status);
      
      if (data.purchasePrice != null) {
        formData.append("purchasePrice", String(data.purchasePrice));
      }
      if (data.salePrice != null) {
        formData.append("salePrice", String(data.salePrice));
      }
      if (data.kmOdometer != null) {
        formData.append("kmOdometer", String(data.kmOdometer));
      }
      if (data.fuelType) formData.append("fuelType", data.fuelType);
      if (data.fipeReferencePrice) formData.append("fipeReferencePrice", data.fipeReferencePrice);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/vehicles", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("addVehicle.errorRegistering"));
      }

      toast({
        title: t("addVehicle.vehicleAdded"),
        description: t("addVehicle.vehicleAddedDesc"),
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      
      onAdd?.({ ...data, images });
      form.reset();
      setImages([]);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: t("addVehicle.errorAdding"),
        description: error.message || t("addVehicle.errorAddingDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="gap-2" data-testid="button-add-vehicle">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("vehicles.addVehicle")}</span>
          <span className="sm:hidden">{t("common.add")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full sm:max-w-[700px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("addVehicle.addNewVehicle")}</DialogTitle>
          <DialogDescription>
            {t("addVehicle.fillDataAndPhotos")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicles.brand")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.brandPlaceholder")}
                        {...field}
                        data-testid="input-brand"
                      />
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
                    <FormLabel>{t("vehicles.model")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.modelPlaceholder")}
                        {...field}
                        data-testid="input-model"
                      />
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
                    <FormLabel>{t("vehicles.year")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.yearPlaceholder")}
                        {...field}
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addVehicle.version")}</FormLabel>
                    <Select 
                      onValueChange={handleVersionChange}
                      value={field.value}
                      onOpenChange={(open) => { if (open) handleLoadVersions(); }}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-version">
                          <SelectValue placeholder={versionsMutation.isPending ? t("addVehicle.loadingVersions") : t("addVehicle.selectVersion")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fipeVersions.length > 0 ? (
                          fipeVersions.map((version, index) => (
                            <SelectItem key={`${version.modelId}-${version.yearCode}-${index}`} value={JSON.stringify(version)}>
                              {version.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {versionsMutation.isPending ? t("common.loading") : t("addVehicle.fillBrandModelYear")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {t("addVehicle.fillToLoadVersions")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicles.color")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.colorPlaceholder")}
                        {...field}
                        data-testid="input-color"
                      />
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
                    <FormLabel>{t("vehicles.plate")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC-1234"
                        {...field}
                        data-testid="input-plate"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.type")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-vehicle-type">
                          <SelectValue placeholder={t("addVehicle.selectType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Carro">{t("addVehicle.typeCar")}</SelectItem>
                        <SelectItem value="Moto">{t("addVehicle.typeMotorcycle")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addVehicle.initialStatus")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder={t("addVehicle.selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Entrada">{t("vehicles.status.intake")}</SelectItem>
                        <SelectItem value="Em Reparos">{t("vehicles.status.repair")}</SelectItem>
                        <SelectItem value="Em Higienização">{t("vehicles.status.cleaning")}</SelectItem>
                        <SelectItem value="Pronto para Venda">{t("vehicles.status.ready")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("addVehicle.fuel")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fuel">
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Gasolina">{t("addVehicle.fuelGasoline")}</SelectItem>
                        <SelectItem value="Etanol">{t("addVehicle.fuelEthanol")}</SelectItem>
                        <SelectItem value="Flex">{t("addVehicle.fuelFlex")}</SelectItem>
                        <SelectItem value="Diesel">{t("addVehicle.fuelDiesel")}</SelectItem>
                        <SelectItem value="Elétrico">{t("addVehicle.fuelElectric")}</SelectItem>
                        <SelectItem value="Híbrido">{t("addVehicle.fuelHybrid")}</SelectItem>
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
                    <FormLabel>{t("vehicles.mileage")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.mileagePlaceholder")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        data-testid="input-km"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {can.viewCosts && (
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addVehicle.purchasePrice")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("addVehicle.purchasePricePlaceholder")}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          data-testid="input-purchase-price"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("addVehicle.purchasePriceDesc")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {can.viewCosts && (
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("addVehicle.salePrice")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={t("addVehicle.salePricePlaceholder")}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          data-testid="input-sale-price"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("addVehicle.salePriceDesc")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="border-t border-border pt-4">
              <FormField
                control={form.control}
                name="fipeReferencePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t("addVehicle.fipeReferencePrice")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("addVehicle.fipePricePlaceholder")}
                        {...field}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-border pt-4">
              <FormLabel className="mb-2 block">{t("addVehicle.photos")}</FormLabel>
              <ImageUpload
                onFilesSelected={setImages}
                selectedFiles={images}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" data-testid="button-submit-vehicle">
                {t("addVehicle.register")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
