import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { z } from "zod";
import { insertVehicleSchema, insertVehicleCostSchema, insertStoreObservationSchema, updateVehicleHistorySchema, insertCommissionPaymentSchema, insertReminderSchema, commissionsConfig, commissionPayments, users, companies, storeObservations, operationalExpenses } from "@shared/schema";
import { isNotNull } from "drizzle-orm";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";
import { existsSync, createReadStream } from "fs";
import { createBackup, listBackups, getBackupPath } from "./backup";
import { requireProprietario, requireProprietarioOrGerente, requireFinancialAccess, PERMISSIONS } from "./middleware/roleCheck";
import bcrypt from "bcrypt";
import financialRoutes from "./routes/financial";
import leadsRoutes from "./routes/leads";
import followupsRoutes from "./routes/followups";
import activityLogRoutes from "./routes/activityLog";
import costApprovalsRoutes from "./routes/costApprovals";
import billsRoutes from "./routes/bills";
import { registerAIRoutes } from "./routes/ai";
import { registerAdminRoutes } from "./routes/admin";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { generateVerificationCode, getVerificationCodeExpiry } from "./utils/verificationCode";
import { sendEmail } from "./utils/replitmail";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const documentUpload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const vehicleId = req.params.id;
      const uploadDir = path.join(process.cwd(), "uploads", "vehicles", vehicleId);
      
      if (!existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos PDF são permitidos"), false);
    }
  },
});

export function createExpressServer(): Server {
  const app = require("express")();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Middleware
  setupAuth(app);
  app.use(require("express").json());

  // ============================================
  // HEALTH CHECK
  // ============================================
  app.get("/api/health", (req: any, res) => {
    res.json({ status: "ok" });
  });

  // ============================================
  // COMPANIES
  // ============================================
  
  app.post("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      // Sanitizar e validar comissãoFixaGlobal rigorosamente
      const companyData = { ...req.body };
      if ('comissaoFixaGlobal' in companyData) {
        if (companyData.comissaoFixaGlobal === null || companyData.comissaoFixaGlobal === '') {
          companyData.comissaoFixaGlobal = null;
        } else {
          const valor = Number(companyData.comissaoFixaGlobal);
          if (!Number.isFinite(valor) || valor < 0 || valor > 999999.99) {
            return res.status(400).json({ error: "Comissão fixa global deve ser um número válido entre 0 e R$ 999.999,99" });
          }
          companyData.comissaoFixaGlobal = valor;
        }
      }

      const company = await storage.createCompany(companyData);
      
      // Criar usuário de proprietário automaticamente
      const firstUser = await storage.createUser({
        empresaId: company.id,
        email: req.body.email || `admin@${company.id}`,
        firstName: req.user.firstName || "Admin",
        lastName: req.user.lastName || "",
        passwordHash: req.user.passwordHash,
        role: "proprietario",
      });
      
      io.emit("company:created", company);
      res.status(201).json(company);
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      res.status(500).json({ error: "Erro ao criar empresa" });
    }
  });

  // PATCH /api/companies/:id - Atualizar empresa (COM VALIDAÇÃO DE PROPRIETÁRIO)
  app.patch("/api/companies/:id", isAuthenticated, requireProprietario, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      // Validar que o usuário está editando sua própria empresa
      if (req.params.id !== userCompany.empresaId) {
        return res.status(403).json({ error: "Acesso negado. Você não pode editar outra empresa." });
      }

      // Sanitizar e validar comissãoFixaGlobal rigorosamente
      const updateData = { ...req.body };
      if ('comissaoFixaGlobal' in updateData) {
        if (updateData.comissaoFixaGlobal === null || updateData.comissaoFixaGlobal === '') {
          updateData.comissaoFixaGlobal = null;
        } else {
          const valor = Number(updateData.comissaoFixaGlobal);
          // Validação robusta: rejeita NaN, Infinity, -Infinity, negativos e valores extremos
          if (!Number.isFinite(valor) || valor < 0 || valor > 999999.99) {
            return res.status(400).json({ error: "Comissão fixa global deve ser um número válido entre 0 e R$ 999.999,99" });
          }
          // Armazenar como número, não string
          updateData.comissaoFixaGlobal = valor;
        }
      }

      const company = await storage.updateCompany(req.params.id, updateData);
      if (!company) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      
      console.log("[COMPANY] Empresa atualizada:", {
        id: company.id,
        nome: company.nomeFantasia,
        corPrimaria: company.corPrimaria,
        corSecundaria: company.corSecundaria,
      });
      
      io.emit("company:updated", company);
      res.json(company);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      res.status(500).json({ error: "Erro ao atualizar empresa" });
    }
  });

  // Buscar empresa do usuário autenticado
  app.get("/api/me/company", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(404).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const company = await storage.getCompany(userCompany.empresaId);
      res.json(company);
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
      res.status(500).json({ error: "Erro ao buscar empresa" });
    }
  });

  // ============================================
  // FINANCIAL ROUTES
  // ============================================
  app.use("/api/financial", isAuthenticated, financialRoutes);

  // ============================================
  // LEADS E CRM
  // ============================================
  app.use("/api/leads", isAuthenticated, leadsRoutes);

  // ============================================
  // FOLLOW-UPS
  // ============================================
  app.use("/api/followups", isAuthenticated, followupsRoutes);

  // ============================================
  // ACTIVITY LOG (AUDITORIA)
  // ============================================
  app.use("/api/activity", isAuthenticated, activityLogRoutes);

  // ============================================
  // APROVAÇÕES DE CUSTOS
  // ============================================
  app.use("/api/approvals", isAuthenticated, costApprovalsRoutes);

  // ============================================
  // CONTAS A PAGAR E A RECEBER (Proprietário e Financeiro)
  // ============================================
  app.use("/api/bills", isAuthenticated, requireFinancialAccess, billsRoutes);

  // AI Routes
  registerAIRoutes(app);

  // Admin Routes
  registerAdminRoutes(app);

  // ============================================
  // GERENCIAR ACESSOS (Permissões Customizadas - Proprietário apenas)
  // ============================================
  
  // Buscar permissões de um usuário
  app.get("/api/users/:userId/permissions", isAuthenticated, requireProprietario, async (req: any, res) => {
    try {
      const userInfo = await getUserWithCompany(req);
      if (!userInfo) {
        return res.status(403).json({ error: "Usuário não está vinculado a uma empresa" });
      }
      const { empresaId } = userInfo;
      const { userId } = req.params;

      const permissions = await storage.getUserPermissions(userId, empresaId);
      
      res.json(permissions || {
        // Valores padrão se não houver permissões customizadas
        userId,
        empresaId,
        acessarDashboard: "true",
        acessarVeiculos: "true",
        acessarCustos: "true",
        acessarAlerts: "true",
        acessarObservacoes: "true",
        acessarConfiguracoes: "false",
        acessarUsuarios: "false",
        acessarFinanceiro: "false",
        acessarDashboardFinanceiro: "false",
        acessarComissoes: "false",
        acessarDespesas: "false",
        acessarRelatorios: "false",
        criarVeiculos: "true",
        editarVeiculos: "true",
        deletarVeiculos: "false",
        verCustosVeiculos: "true",
        editarCustosVeiculos: "true",
        verMargensLucro: "false",
        usarSugestaoPreco: "true",
        usarGeracaoAnuncios: "true",
      });
    } catch (error) {
      console.error("Erro ao buscar permissões do usuário:", error);
      res.status(500).json({ error: "Erro ao buscar permissões" });
    }
  });

  // Atualizar permissões de um usuário
  app.put("/api/users/:userId/permissions", isAuthenticated, requireProprietario, async (req: any, res) => {
    try {
      const userInfo = await getUserWithCompany(req);
      if (!userInfo) {
        return res.status(403).json({ error: "Usuário não está vinculado a uma empresa" });
      }
      const { empresaId, userId: proprietarioId } = userInfo;
      const { userId } = req.params;
      const permissions = req.body;

      // Validar que o usuário pertence à mesma empresa
      const targetUser = await storage.getUser(userId);
      if (!targetUser || targetUser.empresaId !== empresaId) {
        return res.status(403).json({ error: "Usuário não pertence a esta empresa" });
      }

      const updated = await storage.updateUserPermissions(userId, empresaId, {
        ...permissions,
        criadoPor: proprietarioId,
      });

      res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar permissões do usuário:", error);
      res.status(500).json({ error: "Erro ao atualizar permissões" });
    }
  });

  return httpServer;
}

// Função auxiliar para obter usuário e empresa
async function getUserWithCompany(req: any) {
  if (!req.user || !req.user.id) return null;
  
  const user = await storage.getUser(req.user.id);
  if (!user) return null;
  
  return {
    userId: user.id,
    empresaId: user.empresaId,
    role: user.role,
  };
}
