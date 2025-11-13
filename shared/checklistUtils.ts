export type ChecklistItem = {
  item: string;
  observation?: string;
};

export type ChecklistData = {
  pneus: ChecklistItem[];
  interior: ChecklistItem[];
  somEletrica: ChecklistItem[];
  lataria: ChecklistItem[];
  documentacao: ChecklistItem[];
};

export const checklistCategories = {
  pneus: "PNEUS",
  interior: "INTERIOR / BANCOS",
  somEletrica: "SOM / ELÉTRICA",
  lataria: "LATARIA / PINTURA",
  documentacao: "DOCUMENTAÇÃO"
} as const;

export const checklistItems = {
  pneus: ["Tração", "Calibragem"],
  interior: ["Limpeza", "Estado dos bancos", "Tapetes", "Porta-objetos"],
  somEletrica: ["Funcionamento do som", "Vidros elétricos", "Ar-condicionado", "Travas elétricas"],
  lataria: ["Arranhões", "Amassados", "Pintura desbotada"],
  documentacao: ["Documento do veículo", "IPVA", "Licenciamento"]
} as const;

export function normalizeChecklistData(rawChecklist: any): ChecklistData {
  const normalized: ChecklistData = {
    pneus: [],
    interior: [],
    somEletrica: [],
    lataria: [],
    documentacao: []
  };

  if (!rawChecklist) return normalized;

  for (const category of Object.keys(checklistCategories) as Array<keyof typeof checklistCategories>) {
    const categoryData = rawChecklist[category];
    
    if (Array.isArray(categoryData)) {
      normalized[category] = categoryData
        .filter(item => item !== null && item !== undefined)
        .map(item => {
          if (typeof item === 'string') {
            return { item };
          }
          if (typeof item === 'object' && item.item) {
            return {
              item: item.item,
              observation: item.observation || undefined
            };
          }
          return null;
        })
        .filter((item): item is ChecklistItem => item !== null);
    }
  }

  return normalized;
}

export function getChecklistItemStatus(
  category: keyof ChecklistData,
  itemName: string,
  checklist: ChecklistData
): 'checked' | 'attention' | 'pending' {
  const categoryItems = checklist[category] || [];
  const foundItem = categoryItems.find(ci => ci.item === itemName);
  
  if (!foundItem) return 'pending';
  if (foundItem.observation && foundItem.observation.trim().length > 0) return 'attention';
  return 'checked';
}

export function getChecklistStats(checklist: ChecklistData) {
  let totalItems = 0;
  let checkedItems = 0;
  let attentionItems = 0;
  let pendingItems = 0;

  for (const category of Object.keys(checklistItems) as Array<keyof typeof checklistItems>) {
    const categoryItemNames = checklistItems[category];
    totalItems += categoryItemNames.length;

    for (const itemName of categoryItemNames) {
      const status = getChecklistItemStatus(category, itemName, checklist);
      if (status === 'checked') checkedItems++;
      else if (status === 'attention') attentionItems++;
      else pendingItems++;
    }
  }

  return {
    totalItems,
    checkedItems,
    attentionItems,
    pendingItems,
    completionPercentage: totalItems > 0 ? Math.round(((checkedItems + attentionItems) / totalItems) * 100) : 0
  };
}
