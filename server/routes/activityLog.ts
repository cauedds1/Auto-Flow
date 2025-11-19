import { Router } from "express";
import { db } from "../db";
import { activityLog } from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { requireCompanyUser } from "../middleware/dataIsolation";

const router = Router();

router.use(requireCompanyUser);

// ============================================
// ACTIVITY LOG (AUDITORIA)
// ============================================

// Listar atividades
router.get("/", async (req: any, res) => {
  try {
    const { userId, empresaId, role } = req.companyUser;
    const { startDate, endDate, entityType, limit = "50" } = req.query;
    
    let query = db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(parseInt(limit));
    
    // Vendedor: vê apenas suas próprias ações
    // Gerente/Proprietário: vê todas as ações da empresa
    if (role === "Vendedor" || role === "Motorista") {
      query = query.where(
        and(
          eq(activityLog.empresaId, empresaId),
          eq(activityLog.userId, userId),
          startDate ? gte(activityLog.createdAt, new Date(startDate as string)) : undefined,
          endDate ? lte(activityLog.createdAt, new Date(endDate as string)) : undefined,
          entityType ? eq(activityLog.entityType, entityType as string) : undefined
        )
      ) as any;
    } else {
      query = query.where(
        and(
          eq(activityLog.empresaId, empresaId),
          startDate ? gte(activityLog.createdAt, new Date(startDate as string)) : undefined,
          endDate ? lte(activityLog.createdAt, new Date(endDate as string)) : undefined,
          entityType ? eq(activityLog.entityType, entityType as string) : undefined
        )
      ) as any;
      
      // Para gerentes, sanitizar metadata sensível se necessário
      // (remover PII como valores de custos se não tiver permissão)
    }
    
    const activities = await query;
    
    // Sanitizar metadata para vendedores (remover informações sensíveis)
    const sanitized = activities.map(activity => {
      if (role === "Vendedor" || role === "Motorista") {
        try {
          const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
          // Remover campos sensíveis
          delete metadata.costValue;
          delete metadata.salePrice;
          delete metadata.margin;
          activity.metadata = JSON.stringify(metadata);
        } catch (e) {
          // Se não for JSON válido, manter como está
        }
      }
      return activity;
    });
    
    res.json(sanitized);
  } catch (error) {
    console.error("Erro ao listar atividades:", error);
    res.status(500).json({ error: "Erro ao listar atividades" });
  }
});

// Atividades recentes de uma entidade específica
router.get("/entity/:entityType/:entityId", async (req: any, res) => {
  try {
    const { userId, empresaId, role } = req.companyUser;
    const { entityType, entityId } = req.params;
    
    let query = db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.empresaId, empresaId),
          eq(activityLog.entityType, entityType),
          eq(activityLog.entityId, entityId)
        )
      )
      .orderBy(desc(activityLog.createdAt))
      .limit(20);
    
    const activities = await query;
    res.json(activities);
  } catch (error) {
    console.error("Erro ao buscar atividades da entidade:", error);
    res.status(500).json({ error: "Erro ao buscar atividades" });
  }
});

export default router;
