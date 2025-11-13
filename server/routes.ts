import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertVehicleSchema, insertVehicleCostSchema, insertStoreObservationSchema } from "@shared/schema";
import OpenAI from "openai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Cliente conectado ao WebSocket");
    
    socket.on("disconnect", () => {
      console.log("Cliente desconectado do WebSocket");
    });
  });

  // GET /api/vehicles - Listar todos os veículos
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      
      const vehiclesWithImages = await Promise.all(
        vehicles.map(async (vehicle) => {
          const images = await storage.getVehicleImages(vehicle.id);
          const now = new Date();
          const timeDiff = now.getTime() - vehicle.locationChangedAt.getTime();
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          return {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            plate: vehicle.plate,
            location: vehicle.status, // deprecated - returns status for compatibility
            status: vehicle.status,
            physicalLocation: vehicle.physicalLocation,
            physicalLocationDetail: vehicle.physicalLocationDetail,
            salePrice: vehicle.salePrice,
            notes: vehicle.notes,
            checklist: vehicle.checklist || {},
            createdAt: vehicle.createdAt,
            locationChangedAt: vehicle.locationChangedAt,
            image: images[0]?.imageUrl || null,
            timeInStatus: days === 0 ? "Hoje" : `${days} ${days === 1 ? "dia" : "dias"}`,
            hasNotes: !!vehicle.notes,
          };
        })
      );
      
      res.json(vehiclesWithImages);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      res.status(500).json({ error: "Erro ao buscar veículos" });
    }
  });

  // GET /api/vehicles/:id - Buscar veículo por ID
  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }
      
      const images = await storage.getVehicleImages(vehicle.id);
      res.json({ ...vehicle, images });
    } catch (error) {
      console.error("Erro ao buscar veículo:", error);
      res.status(500).json({ error: "Erro ao buscar veículo" });
    }
  });

  // POST /api/vehicles - Criar novo veículo
  app.post("/api/vehicles", upload.array("images", 8), async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse({
        brand: req.body.brand,
        model: req.body.model,
        year: parseInt(req.body.year),
        color: req.body.color,
        plate: req.body.plate,
        status: req.body.status || "Entrada",
        physicalLocation: req.body.physicalLocation || null,
        physicalLocationDetail: req.body.physicalLocationDetail || null,
        kmOdometer: req.body.kmOdometer != null && req.body.kmOdometer !== "" ? parseInt(req.body.kmOdometer) : null,
        fuelType: req.body.fuelType || null,
        features: req.body.features ? JSON.parse(req.body.features) : null,
        notes: req.body.notes || null,
        mainImageUrl: null,
      });

      const vehicle = await storage.createVehicle(vehicleData);

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const imageUrl = `data:${files[i].mimetype};base64,${files[i].buffer.toString("base64")}`;
          await storage.addVehicleImage({
            vehicleId: vehicle.id,
            imageUrl,
            order: i,
          });

          if (i === 0) {
            await storage.updateVehicle(vehicle.id, { mainImageUrl: imageUrl });
          }
        }
      }

      io.emit("vehicle:created", vehicle);

      const updatedVehicle = await storage.getVehicle(vehicle.id);
      const images = await storage.getVehicleImages(vehicle.id);
      
      res.json({ ...updatedVehicle, images });
    } catch (error) {
      console.error("Erro ao criar veículo:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar veículo" });
    }
  });

  // PATCH /api/vehicles/:id - Atualizar veículo
  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const existingVehicle = await storage.getVehicle(req.params.id);
      if (!existingVehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const updates = req.body;
      
      // Detectar mudanças significativas em status ou localização física base
      const statusChanged = updates.status && updates.status !== existingVehicle.status;
      const physicalLocationChanged = 
        updates.physicalLocation !== undefined && updates.physicalLocation !== existingVehicle.physicalLocation;

      // Atualizar locationChangedAt apenas quando status muda
      if (statusChanged) {
        updates.locationChangedAt = new Date();
      }

      const updatedVehicle = await storage.updateVehicle(req.params.id, updates);

      // Criar histórico apenas se status OU localização física BASE mudaram
      // (mudanças apenas em detail não geram histórico separado)
      if (statusChanged || physicalLocationChanged) {
        const newPhysicalLocation = updates.physicalLocation !== undefined 
          ? updates.physicalLocation 
          : existingVehicle.physicalLocation;
        
        const newPhysicalLocationDetail = updates.physicalLocationDetail !== undefined
          ? updates.physicalLocationDetail
          : existingVehicle.physicalLocationDetail;
        
        await storage.addVehicleHistory({
          vehicleId: req.params.id,
          fromStatus: existingVehicle.status || null,
          toStatus: updates.status || existingVehicle.status,
          fromPhysicalLocation: existingVehicle.physicalLocation || null,
          toPhysicalLocation: newPhysicalLocation,
          fromPhysicalLocationDetail: existingVehicle.physicalLocationDetail || null,
          toPhysicalLocationDetail: newPhysicalLocationDetail,
          userId: req.body.userId || "system",
          notes: req.body.moveNotes || req.body.historyNotes || null,
        });
      }

      io.emit("vehicle:updated", updatedVehicle);

      res.json(updatedVehicle);
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      res.status(500).json({ error: "Erro ao atualizar veículo" });
    }
  });

  // DELETE /api/vehicles/:id - Deletar veículo
  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      io.emit("vehicle:deleted", req.params.id);

      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar veículo:", error);
      res.status(500).json({ error: "Erro ao deletar veículo" });
    }
  });

  // GET /api/vehicles/:id/history - Buscar histórico do veículo
  app.get("/api/vehicles/:id/history", async (req, res) => {
    try {
      const history = await storage.getVehicleHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  });

  // PUT /api/vehicles/:vehicleId/history/:historyId - Atualizar entrada do histórico
  app.put("/api/vehicles/:vehicleId/history/:historyId", async (req, res) => {
    try {
      const historyEntry = await storage.getHistoryEntry(req.params.historyId);
      
      if (!historyEntry) {
        return res.status(404).json({ error: "Entrada de histórico não encontrada" });
      }
      
      if (historyEntry.vehicleId !== req.params.vehicleId) {
        return res.status(404).json({ error: "Entrada de histórico não encontrada" });
      }

      const updates: any = {};
      
      if (req.body.toStatus !== undefined) updates.toStatus = req.body.toStatus;
      if (req.body.toPhysicalLocation !== undefined) updates.toPhysicalLocation = req.body.toPhysicalLocation;
      if (req.body.toPhysicalLocationDetail !== undefined) updates.toPhysicalLocationDetail = req.body.toPhysicalLocationDetail;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;

      const updatedHistory = await storage.updateVehicleHistory(req.params.historyId, req.params.vehicleId, updates);
      
      if (!updatedHistory) {
        return res.status(404).json({ error: "Erro ao atualizar histórico" });
      }

      io.emit("history:updated", { vehicleId: req.params.vehicleId, history: updatedHistory });

      res.json(updatedHistory);
    } catch (error) {
      console.error("Erro ao atualizar histórico:", error);
      res.status(500).json({ error: "Erro ao atualizar histórico" });
    }
  });

  // GET /api/costs/all - Buscar todos os custos (para análise geral)
  app.get("/api/costs/all", async (req, res) => {
    try {
      const costs = await storage.getAllCosts();
      res.json(costs);
    } catch (error) {
      console.error("Erro ao buscar todos os custos:", error);
      res.status(500).json({ error: "Erro ao buscar todos os custos" });
    }
  });

  // GET /api/vehicles/:id/costs - Buscar custos do veículo
  app.get("/api/vehicles/:id/costs", async (req, res) => {
    try {
      const costs = await storage.getVehicleCosts(req.params.id);
      res.json(costs);
    } catch (error) {
      console.error("Erro ao buscar custos:", error);
      res.status(500).json({ error: "Erro ao buscar custos" });
    }
  });

  // POST /api/vehicles/:id/costs - Adicionar custo
  app.post("/api/vehicles/:id/costs", async (req, res) => {
    try {
      const costData = insertVehicleCostSchema.parse({
        vehicleId: req.params.id,
        category: req.body.category,
        description: req.body.description,
        value: Math.round(req.body.value * 100),
        date: new Date(req.body.date),
      });

      const cost = await storage.addVehicleCost(costData);

      io.emit("cost:added", cost);

      res.json(cost);
    } catch (error) {
      console.error("Erro ao adicionar custo:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erro ao adicionar custo" });
    }
  });

  // PATCH /api/vehicles/:id/costs/:costId - Atualizar custo
  app.patch("/api/vehicles/:id/costs/:costId", async (req, res) => {
    try {
      const updates: Partial<any> = {};
      
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.value !== undefined) updates.value = req.body.value;
      if (req.body.date !== undefined) updates.date = new Date(req.body.date);

      const cost = await storage.updateVehicleCost(req.params.costId, updates);

      if (!cost) {
        return res.status(404).json({ error: "Custo não encontrado" });
      }

      io.emit("cost:updated", cost);

      res.json(cost);
    } catch (error) {
      console.error("Erro ao atualizar custo:", error);
      res.status(500).json({ error: "Erro ao atualizar custo" });
    }
  });

  // POST /api/vehicles/:id/images - Adicionar imagens ao veículo
  app.post("/api/vehicles/:id/images", upload.array("images", 8), async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      const existingImages = await storage.getVehicleImages(req.params.id);
      const startOrder = existingImages.length;

      const addedImages = [];
      for (let i = 0; i < files.length; i++) {
        const imageUrl = `data:${files[i].mimetype};base64,${files[i].buffer.toString("base64")}`;
        const image = await storage.addVehicleImage({
          vehicleId: req.params.id,
          imageUrl,
          order: startOrder + i,
        });
        addedImages.push(image);

        if (existingImages.length === 0 && i === 0) {
          await storage.updateVehicle(req.params.id, { mainImageUrl: imageUrl });
        }
      }

      io.emit("vehicle:images:updated", req.params.id);

      res.json({ images: addedImages });
    } catch (error) {
      console.error("Erro ao adicionar imagens:", error);
      res.status(500).json({ error: "Erro ao adicionar imagens" });
    }
  });

  // DELETE /api/vehicles/:id/images/:imageId - Remover imagem do veículo
  app.delete("/api/vehicles/:id/images/:imageId", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const success = await storage.deleteVehicleImage(req.params.imageId);
      if (!success) {
        return res.status(404).json({ error: "Imagem não encontrada" });
      }

      let remainingImages = await storage.getVehicleImages(req.params.id);
      
      for (let i = 0; i < remainingImages.length; i++) {
        if (remainingImages[i].order !== i) {
          await storage.updateVehicleImage(remainingImages[i].id, { order: i });
        }
      }
      
      remainingImages = await storage.getVehicleImages(req.params.id);
      
      const updatedVehicle = await storage.getVehicle(req.params.id);
      if (remainingImages.length > 0) {
        const stillHasCover = remainingImages.find(img => img.imageUrl === updatedVehicle?.mainImageUrl);
        if (!stillHasCover) {
          await storage.updateVehicle(req.params.id, { mainImageUrl: remainingImages[0].imageUrl });
        }
      } else {
        await storage.updateVehicle(req.params.id, { mainImageUrl: null });
      }

      io.emit("vehicle:images:updated", req.params.id);

      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      res.status(500).json({ error: "Erro ao remover imagem" });
    }
  });

  // GET /api/metrics - Métricas do dashboard
  app.get("/api/metrics", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      
      const totalVehicles = vehicles.length;
      const readyForSale = vehicles.filter(v => v.status === "Pronto para Venda").length;
      
      // Calcular custo médio por veículo (apenas do mês atual)
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const allCosts = await Promise.all(
        vehicles.map(async (v) => {
          const costs = await storage.getVehicleCosts(v.id);
          return { vehicleId: v.id, costs };
        })
      );
      
      // Calcular custo total de cada veículo no mês atual
      const vehicleCostsThisMonth = allCosts.map(({ vehicleId, costs }) => {
        const monthCosts = costs.filter(cost => {
          const costDate = new Date(cost.date);
          return costDate >= startOfCurrentMonth;
        });
        const totalCost = monthCosts.reduce((sum, cost) => sum + cost.value, 0) / 100;
        return { vehicleId, totalCost };
      }).filter(v => v.totalCost > 0); // Apenas veículos com custos
      
      const avgCostCurrentMonth = vehicleCostsThisMonth.length > 0
        ? vehicleCostsThisMonth.reduce((sum, v) => sum + v.totalCost, 0) / vehicleCostsThisMonth.length
        : 0;
      
      const times = vehicles.map(v => {
        const diff = now.getTime() - v.locationChangedAt.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      });
      const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

      res.json({
        totalVehicles,
        readyForSale,
        avgTime: `${avgTime} dias`,
        avgCost: avgCostCurrentMonth >= 1000 
          ? `R$ ${(avgCostCurrentMonth / 1000).toFixed(1)}K`
          : `R$ ${avgCostCurrentMonth.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Erro ao calcular métricas:", error);
      res.status(500).json({ error: "Erro ao calcular métricas" });
    }
  });

  // POST /api/vehicles/:id/generate-ad - Gerar anúncio com OpenAI
  app.post("/api/vehicles/:id/generate-ad", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "Chave da API OpenAI não configurada" });
      }

      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const features = vehicle.features?.join(", ") || "Informações não disponíveis";
      const notes = vehicle.notes || "Nenhuma observação adicional";

      const prompt = `Você é um redator de publicidade especialista em vendas de carros para a loja 'Capoeiras Automóveis'. Crie um texto de anúncio curto, persuasivo e otimizado para redes sociais (Instagram/Facebook) para o seguinte veículo. Use emojis apropriados para chamar a atenção e termine com um chamado para ação, incluindo o nome da loja.

**Dados do Veículo:**
- Marca: ${vehicle.brand}
- Modelo: ${vehicle.model}
- Ano: ${vehicle.year}
- Cor: ${vehicle.color}
- Combustível: ${vehicle.fuelType || "Não informado"}
- Quilometragem: ${vehicle.kmOdometer ? vehicle.kmOdometer + " km" : "Não informada"}
- Opcionais Principais: ${features}
- Observações: ${notes}

Gere apenas o texto do anúncio.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em copywriting automotivo para redes sociais.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const adText = completion.choices[0]?.message?.content || "";

      res.json({ adText });
    } catch (error: any) {
      console.error("Erro ao gerar anúncio:", error);
      
      if (error.status === 429 || error.code === 'insufficient_quota') {
        return res.status(429).json({ 
          error: "A chave da API OpenAI está sem créditos. Por favor, adicione créditos na sua conta OpenAI para usar esta funcionalidade." 
        });
      }
      
      if (error.status === 401 || error.code === 'invalid_api_key') {
        return res.status(401).json({ 
          error: "Chave da API OpenAI inválida. Verifique a configuração." 
        });
      }
      
      res.status(500).json({ 
        error: "Erro ao gerar anúncio com IA. Tente novamente mais tarde." 
      });
    }
  });

  // Store Observations endpoints

  // GET /api/store-observations - Listar todas as observações da loja
  app.get("/api/store-observations", async (req, res) => {
    try {
      const observations = await storage.getAllStoreObservations();
      res.json(observations);
    } catch (error) {
      console.error("Erro ao buscar observações da loja:", error);
      res.status(500).json({ error: "Erro ao buscar observações da loja" });
    }
  });

  // GET /api/store-observations/:id - Buscar observação por ID
  app.get("/api/store-observations/:id", async (req, res) => {
    try {
      const observation = await storage.getStoreObservation(req.params.id);
      if (!observation) {
        return res.status(404).json({ error: "Observação não encontrada" });
      }
      res.json(observation);
    } catch (error) {
      console.error("Erro ao buscar observação:", error);
      res.status(500).json({ error: "Erro ao buscar observação" });
    }
  });

  // POST /api/store-observations - Criar nova observação
  app.post("/api/store-observations", async (req, res) => {
    try {
      const observationData = insertStoreObservationSchema.parse(req.body);
      const newObservation = await storage.createStoreObservation(observationData);
      
      io.emit("storeObservationCreated", newObservation);
      
      res.status(201).json(newObservation);
    } catch (error) {
      console.error("Erro ao criar observação:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar observação" });
    }
  });

  // PATCH /api/store-observations/:id - Atualizar observação
  app.patch("/api/store-observations/:id", async (req, res) => {
    try {
      const updates = insertStoreObservationSchema.partial().parse(req.body);
      const updatedObservation = await storage.updateStoreObservation(req.params.id, updates);
      
      if (!updatedObservation) {
        return res.status(404).json({ error: "Observação não encontrada" });
      }
      
      io.emit("storeObservationUpdated", updatedObservation);
      
      res.json(updatedObservation);
    } catch (error) {
      console.error("Erro ao atualizar observação:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar observação" });
    }
  });

  // DELETE /api/store-observations/:id - Deletar observação
  app.delete("/api/store-observations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStoreObservation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Observação não encontrada" });
      }
      
      io.emit("storeObservationDeleted", req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar observação:", error);
      res.status(500).json({ error: "Erro ao deletar observação" });
    }
  });

  return httpServer;
}
