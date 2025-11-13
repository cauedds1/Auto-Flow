import { VehicleCard } from "../VehicleCard";
import carImage from "@assets/stock_images/honda_civic_sedan_si_370a36d7.jpg";

export default function VehicleCardExample() {
  return (
    <div className="w-80">
      <VehicleCard
        id="1"
        image={carImage}
        brand="Honda"
        model="Civic"
        year={2020}
        color="Prata"
        location="Mecânica"
        timeInStatus="3 dias"
        hasNotes={true}
        plate="ABC-1234"
      />
    </div>
  );
}
