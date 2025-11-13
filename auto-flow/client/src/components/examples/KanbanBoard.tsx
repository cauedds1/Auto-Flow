import { KanbanBoard } from "../KanbanBoard";
import civicImg from "@assets/stock_images/honda_civic_sedan_si_370a36d7.jpg";
import corollaImg from "@assets/stock_images/toyota_corolla_sedan_c907029a.jpg";
import bmwImg from "@assets/stock_images/bmw_320i_black_luxur_4b30c2e9.jpg";
import golImg from "@assets/stock_images/volkswagen_gol_white_6fdc5bf0.jpg";
import argoImg from "@assets/stock_images/fiat_argo_silver_hat_388780f3.jpg";
import onixImg from "@assets/stock_images/chevrolet_onix_red_h_0a4fa842.jpg";

export default function KanbanBoardExample() {
  const mockVehicles = [
    {
      id: "1",
      image: civicImg,
      brand: "Honda",
      model: "Civic",
      year: 2020,
      color: "Prata",
      location: "Entrada",
      timeInStatus: "1 dia",
      plate: "ABC-1234",
    },
    {
      id: "2",
      image: corollaImg,
      brand: "Toyota",
      model: "Corolla",
      year: 2019,
      color: "Vermelho",
      location: "Lavagem",
      timeInStatus: "2 dias",
      plate: "XYZ-5678",
    },
    {
      id: "3",
      image: bmwImg,
      brand: "BMW",
      model: "320i",
      year: 2021,
      color: "Preto",
      location: "Mecânica",
      timeInStatus: "5 dias",
      hasNotes: true,
      plate: "DEF-9012",
    },
    {
      id: "4",
      image: golImg,
      brand: "Volkswagen",
      model: "Gol",
      year: 2018,
      color: "Branco",
      location: "Funilaria",
      timeInStatus: "3 dias",
      plate: "GHI-3456",
    },
    {
      id: "5",
      image: argoImg,
      brand: "Fiat",
      model: "Argo",
      year: 2020,
      color: "Prata",
      location: "Documentação",
      timeInStatus: "1 dia",
      plate: "JKL-7890",
    },
    {
      id: "6",
      image: onixImg,
      brand: "Chevrolet",
      model: "Onix",
      year: 2022,
      color: "Vermelho",
      location: "Pronto para Venda",
      timeInStatus: "2 dias",
      plate: "MNO-1234",
    },
  ];

  return (
    <div className="h-[600px]">
      <KanbanBoard vehicles={mockVehicles} />
    </div>
  );
}
