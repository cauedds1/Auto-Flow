import { db } from "./db";
import { vehicles, vehicleHistory } from "@shared/schema";
import { eq } from "drizzle-orm";

// Mapeamento de location antiga para novo status
const locationToStatusMap: Record<string, string> = {
  "Entrada": "Entrada",
  "Higienização/Funilaria": "Em Higienização",
  "Mecânica": "Em Reparos",
  "Oficina": "Em Reparos",
  "Documentação": "Em Documentação",
  "Pátio da Loja": "Pronto para Venda",
  "Pronto para Venda": "Pronto para Venda",
  "Vendido": "Vendido",
  "Casa": "Entrada", // default
};

// Lista de localizações físicas reconhecidas
const physicalLocations = [
  "Pátio da Loja",
  "Outra Loja",
  "Higienização",
  "Funilaria",
  "Mecânica/Oficina",
  "Documentação",
  "Casa",
  "Test-drive",
  "Em Transporte",
];

async function migrateVehicles() {
  console.log("🚀 Iniciando migração de localização para status...\n");

  // Buscar todos os veículos
  const allVehicles = await db.select().from(vehicles);
  console.log(`📦 Encontrados ${allVehicles.length} veículos para migrar\n`);

  let migrated = 0;
  let skipped = 0;

  for (const vehicle of allVehicles) {
    if (!vehicle.location) {
      skipped++;
      continue;
    }

    // Parse da location antiga
    const parts = vehicle.location.split(" - ");
    const baseLocation = parts[0];
    const detail = parts.length > 1 ? parts.slice(1).join(" - ") : null;

    // Determinar status
    let status = locationToStatusMap[baseLocation] || "Entrada";
    
    // Determinar localização física
    let physicalLocation = null;
    let physicalLocationDetail = null;

    // Se o base é uma localização física reconhecida
    if (physicalLocations.some(loc => baseLocation.includes(loc.split("/")[0]))) {
      physicalLocation = baseLocation;
      physicalLocationDetail = detail;
    } else if (detail) {
      // Se tem detalhe, provavelmente é uma localização física com subcampo
      physicalLocation = baseLocation;
      physicalLocationDetail = detail;
    } else {
      // Senão, deixa apenas o status (veículo pode estar no pátio por padrão)
      if (status === "Pronto para Venda") {
        physicalLocation = "Pátio da Loja";
      }
    }

    // Atualizar veículo
    await db.update(vehicles)
      .set({
        status: status as any,
        physicalLocation,
        physicalLocationDetail,
      })
      .where(eq(vehicles.id, vehicle.id));

    migrated++;
    console.log(`✅ ${vehicle.plate}: "${vehicle.location}" → status: "${status}", local: "${physicalLocation}${physicalLocationDetail ? ' - ' + physicalLocationDetail : ''}"`);
  }

  console.log(`\n📊 Migração concluída:`);
  console.log(`   ✅ ${migrated} veículos migrados`);
  console.log(`   ⏭️  ${skipped} veículos pulados (sem location)`);
}

async function migrateHistory() {
  console.log("\n🚀 Iniciando migração de histórico...\n");

  const allHistory = await db.select().from(vehicleHistory);
  console.log(`📦 Encontrados ${allHistory.length} registros de histórico\n`);

  let migrated = 0;

  for (const record of allHistory) {
    let fromStatus = null;
    let toStatus = null;
    let fromPhysicalLocation = null;
    let toPhysicalLocation = null;

    // Parse fromLocation
    if (record.fromLocation) {
      const parts = record.fromLocation.split(" - ");
      const baseLocation = parts[0];
      const detail = parts.length > 1 ? parts.slice(1).join(" - ") : null;

      fromStatus = locationToStatusMap[baseLocation] || "Entrada";
      
      if (physicalLocations.some(loc => baseLocation.includes(loc.split("/")[0])) || detail) {
        fromPhysicalLocation = detail ? `${baseLocation} - ${detail}` : baseLocation;
      }
    }

    // Parse toLocation
    if (record.toLocation) {
      const parts = record.toLocation.split(" - ");
      const baseLocation = parts[0];
      const detail = parts.length > 1 ? parts.slice(1).join(" - ") : null;

      toStatus = locationToStatusMap[baseLocation] || "Entrada";
      
      if (physicalLocations.some(loc => baseLocation.includes(loc.split("/")[0])) || detail) {
        toPhysicalLocation = detail ? `${baseLocation} - ${detail}` : baseLocation;
      }
    }

    // Atualizar histórico
    await db.update(vehicleHistory)
      .set({
        fromStatus: fromStatus as any,
        toStatus: toStatus as any,
        fromPhysicalLocation,
        toPhysicalLocation,
      })
      .where(eq(vehicleHistory.id, record.id));

    migrated++;
  }

  console.log(`📊 ${migrated} registros de histórico migrados`);
}

async function main() {
  try {
    await migrateVehicles();
    await migrateHistory();
    console.log("\n✨ Migração concluída com sucesso!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erro durante migração:", error);
    process.exit(1);
  }
}

main();
