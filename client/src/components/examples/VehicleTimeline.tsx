import { VehicleTimeline } from "../VehicleTimeline";

export default function VehicleTimelineExample() {
  const mockEvents = [
    {
      id: "1",
      status: "Mecânica",
      date: "11/01/2025 14:30",
      user: "João Silva",
      notes: "Veículo movido para manutenção preventiva",
    },
    {
      id: "2",
      status: "Lavagem",
      date: "09/01/2025 10:15",
      user: "Maria Santos",
    },
    {
      id: "3",
      status: "Entrada",
      date: "08/01/2025 09:00",
      user: "Carlos Oliveira",
      notes: "Veículo recebido com documentação completa",
    },
  ];

  return <VehicleTimeline events={mockEvents} />;
}
