import { AddVehicleDialog } from "../AddVehicleDialog";

export default function AddVehicleDialogExample() {
  return (
    <AddVehicleDialog
      onAdd={(data) => console.log("Veículo adicionado:", data)}
    />
  );
}
