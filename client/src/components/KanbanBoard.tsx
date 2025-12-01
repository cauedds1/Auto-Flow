import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { VehicleCard, VehicleCardProps } from "./VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_COLUMNS = [
  "Entrada",
  "Em Reparos",
  "Em Higienização",
  "Pronto para Venda",
];

const INITIAL_LIMIT = 50;
const LOAD_MORE_INCREMENT = 25;
const DEBOUNCE_DELAY = 300;

interface KanbanBoardProps {
  vehicles: VehicleCardProps[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function KanbanBoard({ vehicles }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);
  
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);
  
  const prevVehiclesLength = useRef(vehicles.length);
  useEffect(() => {
    if (vehicles.length !== prevVehiclesLength.current) {
      setDisplayLimit(INITIAL_LIMIT);
      prevVehiclesLength.current = vehicles.length;
    }
  }, [vehicles.length]);

  const filteredVehicles = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !searchLower ||
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.plate?.toLowerCase().includes(searchLower);
      
      const vehicleStatus = (vehicle as any).status;
      const matchesStatus =
        statusFilter === "all" || vehicleStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, debouncedSearchTerm, statusFilter]);

  const limitedVehicles = useMemo(() => {
    return filteredVehicles.slice(0, displayLimit);
  }, [filteredVehicles, displayLimit]);

  const hasMoreVehicles = useMemo(() => {
    return filteredVehicles.length > displayLimit;
  }, [filteredVehicles.length, displayLimit]);

  const remainingCount = useMemo(() => {
    return filteredVehicles.length - displayLimit;
  }, [filteredVehicles.length, displayLimit]);

  const handleLoadMore = useCallback(() => {
    setDisplayLimit(prev => prev + LOAD_MORE_INCREMENT);
  }, []);

  const vehiclesByStatus = useMemo(() => {
    const result: Record<string, VehicleCardProps[]> = {};
    STATUS_COLUMNS.forEach(status => {
      result[status] = limitedVehicles.filter((v) => (v as any).status === status);
    });
    return result;
  }, [limitedVehicles]);

  const totalCountByStatus = useMemo(() => {
    const result: Record<string, number> = {};
    STATUS_COLUMNS.forEach(status => {
      result[status] = filteredVehicles.filter((v) => (v as any).status === status).length;
    });
    return result;
  }, [filteredVehicles]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center bg-card/50 dark:bg-card/30 p-3 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por marca, modelo ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border/60"
            data-testid="input-search-vehicle"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-background border-border/60" data-testid="select-status-filter">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {STATUS_COLUMNS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredVehicles.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap" data-testid="text-vehicle-count">
                {limitedVehicles.length}/{filteredVehicles.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex h-full gap-3 pb-4 min-w-[900px] sm:min-w-0">
          {STATUS_COLUMNS.map((status) => {
            const vehiclesInStatus = vehiclesByStatus[status] || [];
            const totalInStatus = totalCountByStatus[status] || 0;
            return (
              <KanbanColumn
                key={status}
                title={status}
                count={totalInStatus}
              >
                {vehiclesInStatus.map((vehicle) => (
                  <VehicleCard key={vehicle.id} {...vehicle} />
                ))}
                {vehiclesInStatus.length < totalInStatus && (
                  <div className="text-center text-xs text-muted-foreground py-2 bg-muted/30 rounded-lg">
                    +{totalInStatus - vehiclesInStatus.length} mais veículos
                  </div>
                )}
                {vehiclesInStatus.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                      <LayoutGrid className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <span className="text-xs text-muted-foreground">Nenhum veículo</span>
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </div>

      {hasMoreVehicles && (
        <div className="flex justify-center py-4 mt-2">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            className="bg-card hover:bg-muted"
            data-testid="button-load-more"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            Carregar mais ({remainingCount} restantes)
          </Button>
        </div>
      )}
    </div>
  );
}
