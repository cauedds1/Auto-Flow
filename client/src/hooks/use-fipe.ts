import { useQuery, useMutation } from "@tanstack/react-query";

export interface FipeBrand {
  codigo: string;
  nome: string;
}

export interface FipeModel {
  codigo: number;
  nome: string;
}

export interface FipeYear {
  codigo: string;
  nome: string;
}

export interface FipePrice {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (url: string, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      credentials: "include"
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const fetchWithRetry = async (url: string, maxRetries = 2, baseDelay = 1000): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, 20000);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status === 503) {
        if (attempt < maxRetries - 1) {
          await delay(baseDelay * (attempt + 1));
          continue;
        }
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await delay(baseDelay * (attempt + 1));
      }
    }
  }
  
  throw lastError || new Error("Falha apos multiplas tentativas");
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const cloned = response.clone();
    const data = await cloned.json();
    return data.message || "Erro desconhecido";
  } catch {
    return "Servico temporariamente indisponivel";
  }
};

export function useFipeBrands(vehicleType: string = "carros") {
  return useQuery<FipeBrand[]>({
    queryKey: ["/api/fipe/brands", vehicleType],
    queryFn: async () => {
      const response = await fetchWithRetry(`/api/fipe/brands?type=${encodeURIComponent(vehicleType)}`);
      if (!response.ok) {
        const errorMsg = await parseErrorMessage(response);
        throw new Error(errorMsg);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
}

export function useFipeModels(brandCode: string | null, vehicleType: string = "carros") {
  return useQuery<{ modelos: FipeModel[] }>({
    queryKey: ["/api/fipe/models", brandCode, vehicleType],
    queryFn: async () => {
      if (!brandCode) throw new Error("Codigo da marca nao fornecido");
      const response = await fetchWithRetry(
        `/api/fipe/models?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(brandCode)}`
      );
      if (!response.ok) {
        const errorMsg = await parseErrorMessage(response);
        throw new Error(errorMsg);
      }
      return response.json();
    },
    enabled: !!brandCode,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
}

export function useFipeYears(brandCode: string | null, modelCode: string | null, vehicleType: string = "carros") {
  return useQuery<FipeYear[]>({
    queryKey: ["/api/fipe/years", brandCode, modelCode, vehicleType],
    queryFn: async () => {
      if (!brandCode || !modelCode) throw new Error("Codigo da marca ou modelo nao fornecido");
      const response = await fetchWithRetry(
        `/api/fipe/years?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(brandCode)}&modelCode=${encodeURIComponent(modelCode)}`
      );
      if (!response.ok) {
        const errorMsg = await parseErrorMessage(response);
        throw new Error(errorMsg);
      }
      return response.json();
    },
    enabled: !!brandCode && !!modelCode,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
}

export function useFipePrice(
  brandCode: string | null,
  modelCode: string | null,
  yearCode: string | null,
  vehicleType: string = "carros"
) {
  return useQuery<FipePrice>({
    queryKey: ["/api/fipe/value", brandCode, modelCode, yearCode, vehicleType],
    queryFn: async () => {
      if (!brandCode || !modelCode || !yearCode) {
        throw new Error("Parametros incompletos para consulta FIPE");
      }
      const response = await fetchWithRetry(
        `/api/fipe/value?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(brandCode)}&modelCode=${encodeURIComponent(modelCode)}&yearCode=${encodeURIComponent(yearCode)}`
      );
      if (!response.ok) {
        const errorMsg = await parseErrorMessage(response);
        throw new Error(errorMsg);
      }
      return response.json();
    },
    enabled: !!brandCode && !!modelCode && !!yearCode,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const BRAND_ALIASES: Record<string, string[]> = {
  "chevrolet": ["gm", "chevy", "general motors"],
  "volkswagen": ["vw", "volks"],
  "mercedes-benz": ["mercedes", "benz"],
  "land rover": ["landrover"],
  "gm": ["chevrolet", "chevy", "general motors"],
  "vw": ["volkswagen", "volks"],
  "mercedes": ["mercedes-benz", "benz"],
};

export interface FipeVersion {
  label: string;
  modelId: number;
  modelName: string;
  yearCode: string;
  yearLabel: string;
}

export function useFipeVehicleVersions() {
  return useMutation({
    mutationFn: async ({ brand, model, year, vehicleType = "carros" }: { brand: string; model: string; year: number; vehicleType?: string }) => {
      if (!brand || !model || !year) {
        throw new Error("Marca, modelo ou ano nao fornecidos");
      }

      const brandsResponse = await fetchWithRetry(`/api/fipe/brands?type=${encodeURIComponent(vehicleType)}`);
      if (!brandsResponse.ok) throw new Error("Erro ao buscar marcas");
      const brands: FipeBrand[] = await brandsResponse.json();

      const normalizedBrand = normalizeString(brand);
      
      const matchedBrand = brands.find((b) => {
        const normalizedBrandName = normalizeString(b.nome);
        
        if (normalizedBrandName.includes(normalizedBrand) || normalizedBrand.includes(normalizedBrandName)) {
          return true;
        }
        
        for (const [canonical, aliases] of Object.entries(BRAND_ALIASES)) {
          const allVariants = [canonical, ...aliases];
          
          const inputMatchesGroup = allVariants.some(v => normalizedBrand.includes(v) || v.includes(normalizedBrand));
          const fipeMatchesGroup = allVariants.some(v => normalizedBrandName.includes(v) || v.includes(normalizedBrandName));
          
          if (inputMatchesGroup && fipeMatchesGroup) {
            return true;
          }
        }
        
        return false;
      });

      if (!matchedBrand) {
        throw new Error(`Marca "${brand}" nao encontrada na tabela FIPE`);
      }

      await delay(300);

      const modelsResponse = await fetchWithRetry(
        `/api/fipe/models?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(matchedBrand.codigo)}`
      );
      if (!modelsResponse.ok) throw new Error("Erro ao buscar modelos");
      const modelsData: { modelos: FipeModel[] } = await modelsResponse.json();

      const normalizedModel = normalizeString(model);
      
      const candidateModels = modelsData.modelos.filter((m) => {
        const normalizedModelName = normalizeString(m.nome);
        
        if (normalizedModelName === normalizedModel) return true;
        
        const words = normalizedModelName.split(/\s+/);
        if (words.some(word => word === normalizedModel)) return true;
        
        if (normalizedModelName.startsWith(normalizedModel)) return true;
        
        return false;
      });

      if (candidateModels.length === 0) {
        throw new Error(`Modelo "${model}" nao encontrado para a marca ${matchedBrand.nome}`);
      }

      const limitedModels = candidateModels.slice(0, 50);
      
      const allVersions: FipeVersion[] = [];
      
      for (let i = 0; i < limitedModels.length; i++) {
        const candidateModel = limitedModels[i];
        try {
          if (i > 0) {
            await delay(150);
          }
          
          const yearsResponse = await fetchWithRetry(
            `/api/fipe/years?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(matchedBrand.codigo)}&modelCode=${encodeURIComponent(candidateModel.codigo.toString())}`
          );
          
          if (!yearsResponse.ok) continue;
          
          const years: FipeYear[] = await yearsResponse.json();
          
          const matchingYears = years.filter(y => y.nome.includes(year.toString()));
          
          for (const yearData of matchingYears) {
            allVersions.push({
              label: `${candidateModel.nome} ${yearData.nome}`,
              modelId: candidateModel.codigo,
              modelName: candidateModel.nome,
              yearCode: yearData.codigo,
              yearLabel: yearData.nome,
            });
          }
        } catch (error) {
          console.error(`Erro ao buscar anos para modelo ${candidateModel.nome}:`, error);
        }
      }

      if (allVersions.length === 0) {
        throw new Error(`Nenhuma versao encontrada para ${matchedBrand.nome} ${model} ${year}`);
      }

      allVersions.sort((a, b) => a.label.localeCompare(b.label));

      return {
        brandId: matchedBrand.codigo,
        brandName: matchedBrand.nome,
        year,
        versions: allVersions,
      };
    },
  });
}

export function useFipePriceByVersion() {
  return useMutation({
    mutationFn: async ({ brandId, modelId, versionCode, vehicleType = "carros" }: { brandId: string; modelId: string; versionCode: string; vehicleType?: string }) => {
      const priceResponse = await fetchWithRetry(
        `/api/fipe/value?type=${encodeURIComponent(vehicleType)}&brandCode=${encodeURIComponent(brandId)}&modelCode=${encodeURIComponent(modelId)}&yearCode=${encodeURIComponent(versionCode)}`
      );
      if (!priceResponse.ok) {
        const data = await priceResponse.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao consultar preco FIPE");
      }
      const priceData: FipePrice = await priceResponse.json();
      return priceData;
    },
  });
}

export function useFipePriceByVehicle() {
  return useFipeVehicleVersions();
}
