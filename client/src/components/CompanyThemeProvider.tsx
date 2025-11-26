import { createContext, useContext, useEffect, ReactNode } from "react";
import { useCurrentCompany } from "../hooks/use-company";

interface CompanyThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  logoUrl?: string | null;
  isCustomTheme: boolean;
}

// Cores padrão do VeloStock (violeta e verde)
const DEFAULT_PRIMARY = "#8B5CF6";
const DEFAULT_SECONDARY = "#10B981";

const CompanyThemeContext = createContext<CompanyThemeContextType>({
  primaryColor: DEFAULT_PRIMARY,
  secondaryColor: DEFAULT_SECONDARY,
  companyName: "VeloStock",
  logoUrl: null,
  isCustomTheme: false,
});

export function useCompanyTheme() {
  return useContext(CompanyThemeContext);
}

interface CompanyThemeProviderProps {
  children: ReactNode;
}

export function CompanyThemeProvider({ children }: CompanyThemeProviderProps) {
  const { company } = useCurrentCompany();

  // Verificar se tem cores personalizadas
  const primaryColor = company?.corPrimaria || DEFAULT_PRIMARY;
  const secondaryColor = company?.corSecundaria || DEFAULT_SECONDARY;
  const isCustomTheme = 
    (company?.corPrimaria && company.corPrimaria !== DEFAULT_PRIMARY) ||
    (company?.corSecundaria && company.corSecundaria !== DEFAULT_SECONDARY) || false;

  const themeValue: CompanyThemeContextType = {
    primaryColor,
    secondaryColor,
    companyName: company?.nomeFantasia || "VeloStock",
    logoUrl: company?.logoUrl,
    isCustomTheme,
  };

  useEffect(() => {
    const applyTheme = (primary: string, secondary: string) => {
      const primaryHSL = hexToHSL(primary);
      const secondaryHSL = hexToHSL(secondary);
      
      // Cores derivadas da primária
      if (primaryHSL) {
        const { h, s, l } = parseHSL(primaryHSL);
        
        // Cor primária principal
        document.documentElement.style.setProperty("--primary", primaryHSL);
        document.documentElement.style.setProperty("--sidebar-primary", primaryHSL);
        document.documentElement.style.setProperty("--ring", primaryHSL);
        document.documentElement.style.setProperty("--sidebar-ring", primaryHSL);
        
        // Cores de destaque derivadas (mais claras/escuras)
        const lighterL = Math.min(l + 20, 95);
        const darkerL = Math.max(l - 15, 20);
        
        // Chart colors baseadas na primária
        document.documentElement.style.setProperty("--chart-1", `${h} ${s}% ${l}%`);
        document.documentElement.style.setProperty("--chart-2", `${(h + 12) % 360} ${Math.max(s - 8, 50)}% ${l + 4}%`);
        document.documentElement.style.setProperty("--chart-3", `${(h + 24) % 360} ${Math.max(s - 14, 45)}% ${l + 8}%`);
        
        // Destructive com a mesma saturação da primária mas em vermelho
        document.documentElement.style.setProperty("--destructive", `0 ${s}% ${l}%`);
      }
      
      // Cores secundárias
      if (secondaryHSL) {
        const { h, s, l } = parseHSL(secondaryHSL);
        
        document.documentElement.style.setProperty("--secondary", secondaryHSL);
        
        // Chart colors complementares
        document.documentElement.style.setProperty("--chart-4", `${h} ${Math.max(s - 20, 30)}% ${l + 10}%`);
        document.documentElement.style.setProperty("--chart-5", `${(h + 15) % 360} ${Math.max(s - 25, 25)}% ${l + 15}%`);
      }
    };

    applyTheme(primaryColor, secondaryColor);
  }, [company, primaryColor, secondaryColor]);

  return <CompanyThemeContext.Provider value={themeValue}>{children}</CompanyThemeContext.Provider>;
}

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

function parseHSL(hslString: string): { h: number; s: number; l: number } {
  const parts = hslString.split(' ');
  return {
    h: parseInt(parts[0]) || 0,
    s: parseInt(parts[1]) || 0,
    l: parseInt(parts[2]) || 50,
  };
}

// Exportar cores padrão para uso em outros componentes
export const DEFAULT_THEME_COLORS = {
  primary: DEFAULT_PRIMARY,
  secondary: DEFAULT_SECONDARY,
};
