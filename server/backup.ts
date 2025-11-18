import { db } from "./db";
import { 
  users, 
  vehicles, 
  vehicleImages, 
  vehicleHistory, 
  vehicleCosts, 
  vehicleDocuments, 
  storeObservations, 
  companySettings,
  companies
} from "../shared/schema";
import { writeFile, readdir, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export interface BackupData {
  timestamp: string;
  version: string;
  data: {
    companies: any[];
    users: any[];
    vehicles: any[];
    vehicleImages: any[];
    vehicleHistory: any[];
    vehicleCosts: any[];
    vehicleDocuments: any[];
    storeObservations: any[];
    companySettings: any[];
  };
}

export async function createBackup(reason: string = "manual"): Promise<string> {
  console.log(`[BACKUP] Iniciando backup: ${reason}`);
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${reason}-${timestamp}.json`;
    const backupPath = path.join(process.cwd(), "backups", filename);

    let companiesData: any[] = [];
    try {
      companiesData = await db.select().from(companies);
    } catch (error) {
      console.log("[BACKUP] Tabela companies não existe ainda, pulando...");
    }

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        companies: companiesData,
        users: await db.select().from(users),
        vehicles: await db.select().from(vehicles),
        vehicleImages: await db.select().from(vehicleImages),
        vehicleHistory: await db.select().from(vehicleHistory),
        vehicleCosts: await db.select().from(vehicleCosts),
        vehicleDocuments: await db.select().from(vehicleDocuments),
        storeObservations: await db.select().from(storeObservations),
        companySettings: await db.select().from(companySettings),
      },
    };

    await writeFile(backupPath, JSON.stringify(backupData, null, 2), "utf-8");
    
    console.log(`[BACKUP] Backup criado com sucesso: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error("[BACKUP] Erro ao criar backup:", error);
    throw new Error("Falha ao criar backup");
  }
}

export async function listBackups(): Promise<Array<{ filename: string; size: number; created: Date; reason: string }>> {
  const backupsDir = path.join(process.cwd(), "backups");
  
  if (!existsSync(backupsDir)) {
    return [];
  }

  const files = await readdir(backupsDir);
  const backups = [];

  for (const file of files) {
    if (file.endsWith(".json") && file.startsWith("backup-")) {
      const filePath = path.join(backupsDir, file);
      const stats = await stat(filePath);
      
      const reasonMatch = file.match(/backup-([^-]+)-/);
      const reason = reasonMatch ? reasonMatch[1] : "manual";

      backups.push({
        filename: file,
        size: stats.size,
        created: stats.mtime,
        reason,
      });
    }
  }

  return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
}

export async function getBackupPath(filename: string): Promise<string> {
  return path.join(process.cwd(), "backups", filename);
}
