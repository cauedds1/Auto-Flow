import { db } from "./db";
import { createBackup } from "./backup";
import { companies, users, vehicles, storeObservations } from "../shared/schema";
import { sql } from "drizzle-orm";

async function migrateToMultiTenant() {
  console.log("🚀 Iniciando migração para multi-tenant...");
  
  try {
    console.log("📦 Criando backup automático antes da migração...");
    const backupPath = await createBackup("antes-multi-tenant");
    console.log(`✅ Backup criado: ${backupPath}`);

    console.log("\n1️⃣ Criando tabela companies se não existir...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        nome_fantasia TEXT NOT NULL,
        razao_social TEXT,
        cnpj TEXT,
        endereco TEXT,
        telefone TEXT,
        telefone2 TEXT,
        email TEXT,
        logo_url TEXT,
        cor_primaria TEXT DEFAULT '#dc2626',
        cor_secundaria TEXT DEFAULT '#000000',
        whatsapp_numero TEXT,
        locais_comuns JSON DEFAULT '[]',
        alerta_dias_parado INTEGER DEFAULT 7,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log("✅ Tabela companies criada/verificada");

    console.log("\n2️⃣ Verificando se já existe empresa Capoeiras...");
    const existingCompanies = await db.select().from(companies);
    
    let capoeirasId: string;
    
    if (existingCompanies.length === 0) {
      console.log("📝 Criando empresa Capoeiras Automóveis...");
      const [capoeiras] = await db.insert(companies).values({
        nomeFantasia: "Capoeiras Automóveis",
        razaoSocial: "Capoeiras Automóveis LTDA",
        corPrimaria: "#dc2626",
        corSecundaria: "#000000",
        locaisComuns: ["Matriz", "Filial", "Pátio Externo", "Oficina"],
        alertaDiasParado: 7,
      }).returning();
      capoeirasId = capoeiras.id;
      console.log(`✅ Empresa Capoeiras criada com ID: ${capoeirasId}`);
    } else {
      capoeirasId = existingCompanies[0].id;
      console.log(`✅ Empresa já existe com ID: ${capoeirasId}`);
    }

    console.log("\n3️⃣ Adicionando campo empresa_id nas tabelas...");
    
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS empresa_id VARCHAR
    `);
    console.log("✅ Campo empresa_id adicionado em users");

    await db.execute(sql`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS empresa_id VARCHAR
    `);
    console.log("✅ Campo empresa_id adicionado em vehicles");

    await db.execute(sql`
      ALTER TABLE store_observations 
      ADD COLUMN IF NOT EXISTS empresa_id VARCHAR
    `);
    console.log("✅ Campo empresa_id adicionado em store_observations");

    console.log("\n4️⃣ Migrando dados existentes para Capoeiras Automóveis...");
    
    await db.execute(sql`
      UPDATE users 
      SET empresa_id = ${capoeirasId}
      WHERE empresa_id IS NULL
    `);
    console.log("✅ Usuários migrados");

    await db.execute(sql`
      UPDATE vehicles 
      SET empresa_id = ${capoeirasId}
      WHERE empresa_id IS NULL
    `);
    console.log("✅ Veículos migrados");

    await db.execute(sql`
      UPDATE store_observations 
      SET empresa_id = ${capoeirasId}
      WHERE empresa_id IS NULL
    `);
    console.log("✅ Observações migradas");

    console.log("\n📦 Criando backup pós-migração...");
    const postBackupPath = await createBackup("apos-multi-tenant");
    console.log(`✅ Backup pós-migração criado: ${postBackupPath}`);

    console.log("\n✨ Migração multi-tenant concluída com sucesso!");
    console.log(`\n📊 Estatísticas:`);
    console.log(`   - Empresa ID: ${capoeirasId}`);
    console.log(`   - Backups criados em /backups`);
    
  } catch (error) {
    console.error("\n❌ Erro durante migração:", error);
    console.error("⚠️  RESTAURE O BACKUP IMEDIATAMENTE!");
    throw error;
  }
}

migrateToMultiTenant()
  .then(() => {
    console.log("\n✅ Processo finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro fatal:", error);
    process.exit(1);
  });

export { migrateToMultiTenant };
