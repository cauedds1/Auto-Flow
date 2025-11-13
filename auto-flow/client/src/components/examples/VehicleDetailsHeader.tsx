import { VehicleDetailsHeader } from "../VehicleDetailsHeader";
import carImage from "@assets/stock_images/bmw_320i_black_luxur_4b30c2e9.jpg";

export default function VehicleDetailsHeaderExample() {
  return (
    <VehicleDetailsHeader
      image={carImage}
      brand="BMW"
      model="320i"
      year={2021}
      plate="DEF-9012"
      color="Preto"
      location="Mecânica"
      onBack={() => console.log("Voltar clicado")}
      onEdit={() => console.log("Editar clicado")}
    />
  );
}
