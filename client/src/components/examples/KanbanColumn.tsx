import { KanbanColumn } from "../KanbanColumn";
import { VehicleCard } from "../VehicleCard";
import carImage from "@assets/stock_images/ford_ranger_pickup_t_f9264f19.jpg";

export default function KanbanColumnExample() {
  return (
    <div className="h-[600px]">
      <KanbanColumn title="Mecânica" count={2}>
        <VehicleCard
          id="1"
          image={carImage}
          brand="Toyota"
          model="Corolla"
          year={2019}
          color="Vermelho"
          location="Mecânica"
          timeInStatus="2 dias"
          plate="XYZ-5678"
        />
        <VehicleCard
          id="2"
          image={carImage}
          brand="Ford"
          model="Ranger"
          year={2021}
          color="Preto"
          location="Mecânica"
          timeInStatus="5 dias"
          hasNotes={true}
          plate="DEF-9012"
        />
      </KanbanColumn>
    </div>
  );
}
