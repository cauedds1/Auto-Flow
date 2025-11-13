import { AdGenerator } from "../AdGenerator";

export default function AdGeneratorExample() {
  const mockVehicle = {
    brand: "BMW",
    model: "320i",
    year: 2021,
    color: "Preto",
    features: [
      "Ar condicionado digital",
      "Direção elétrica",
      "Bancos de couro",
      "Rodas de liga leve",
      "Sensor de estacionamento",
      "Multimídia com tela touch",
    ],
  };

  return <AdGenerator vehicleData={mockVehicle} />;
}
