import { VehicleCosts } from "../VehicleCosts";

export default function VehicleCostsExample() {
  const mockCosts = [
    {
      id: "1",
      category: "Mecânica",
      description: "Troca de óleo e filtros",
      value: 450.0,
      date: "10/01/2025",
    },
    {
      id: "2",
      category: "Estética",
      description: "Polimento e cristalização",
      value: 800.0,
      date: "09/01/2025",
    },
    {
      id: "3",
      category: "Mecânica",
      description: "Substituição de pastilhas de freio",
      value: 620.0,
      date: "09/01/2025",
    },
    {
      id: "4",
      category: "Documentação",
      description: "Transferência de propriedade",
      value: 350.0,
      date: "08/01/2025",
    },
  ];

  return <VehicleCosts costs={mockCosts} onAddCost={() => console.log("Adicionar custo")} />;
}
