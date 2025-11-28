import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { generateCompletion, generateJSON, handleOpenAIError } from "../utils/openai";
import { db } from "../db";
import { leads, followUps, vehicles, storeObservations, billsPayable, users } from "@shared/schema";
import { eq, and, desc, isNull, lt, gte } from "drizzle-orm";

async function getUserWithCompany(req: any): Promise<{ userId: string; empresaId: string } | null> {
  const userId = req.user?.claims?.id || req.user?.claims?.sub;
  if (!userId) return null;
  
  const user = await storage.getUser(userId);
  if (!user?.empresaId) return null;
  
  return { userId, empresaId: user.empresaId };
}

export function registerAIRoutes(app: Express) {
  
  // POST /api/vehicles/:id/generate-ad-multi - Gerar anúncios multi-plataforma
  app.post("/api/vehicles/:id/generate-ad-multi", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const vehicle = await storage.getVehicle(req.params.id, userCompany.empresaId);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const companies = await storage.getAllCompanies();
      const company = companies.find(c => c.id === userCompany.empresaId);
      const companyName = company?.nomeFantasia || "Nossa Loja";

      const features = vehicle.features?.join(", ") || "";
      const salePrice = Number(vehicle.salePrice) || 0;
      const hasPriceSet = salePrice > 0;
      const priceInfo = hasPriceSet 
        ? `Preço: R$ ${salePrice.toLocaleString('pt-BR')}`
        : "Preço sob consulta";
      
      const kmOdometer = Number(vehicle.kmOdometer) || 0;
      const kmInfo = kmOdometer > 0 ? `KM: ${kmOdometer.toLocaleString('pt-BR')}` : '';

      const prompt = `Gere anúncios para o veículo ${vehicle.brand} ${vehicle.model} ${vehicle.year} (${vehicle.color}) para a loja "${companyName}".
${kmInfo}
${vehicle.fuelType ? `Combustível: ${vehicle.fuelType}` : ''}
${features ? `Opcionais: ${features}` : ''}
${priceInfo}

Gere um objeto JSON com os seguintes campos:
- instagram_story: Texto curto e impactante para Story (máx 50 caracteres)
- instagram_feed: Texto engajador para Feed (máx 150 caracteres)  
- facebook: Post completo e persuasivo (máx 200 caracteres)
- olx_title: Título SEO otimizado para OLX (máx 60 caracteres)
- whatsapp: Mensagem conversacional e amigável para WhatsApp (máx 100 caracteres)
- seo_title: Título otimizado para buscadores (máx 60 caracteres)

Use linguagem brasileira natural. Não use emojis excessivos.`;

      const result = await generateJSON(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.8,
        maxTokens: 600,
        systemPrompt: "Você é um copywriter especialista em vendas de veículos. Retorne apenas JSON válido.",
      });

      res.json(result);
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/leads/:id/suggest-response - Sugerir resposta para lead
  app.post("/api/leads/:id/suggest-response", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      // Buscar lead diretamente do banco
      const leadResult = await db.select().from(leads)
        .where(and(eq(leads.id, req.params.id), eq(leads.empresaId, userCompany.empresaId)));
      
      const lead = leadResult[0];
      if (!lead) {
        return res.status(404).json({ error: "Lead não encontrado" });
      }

      // Buscar follow-ups do lead
      const followupsResult = await db.select().from(followUps)
        .where(eq(followUps.leadId, lead.id))
        .orderBy(desc(followUps.createdAt))
        .limit(5);

      const historyText = followupsResult
        .map((f: any) => `${new Date(f.createdAt).toLocaleDateString('pt-BR')}: ${f.notes || f.tipo}`)
        .join("\n");

      const companies = await storage.getAllCompanies();
      const company = companies.find(c => c.id === userCompany.empresaId);
      const companyName = company?.nomeFantasia || "Nossa Loja";

      // Construir descrição do veículo com dados detalhados do frontend, se fornecido
      const veiculoData = req.body?.veiculoData;
      let veiculoDescricao = lead.veiculoInteresseNome || "veículos";
      
      if (veiculoData && veiculoData.brand && veiculoData.model) {
        // Usar dados detalhados se disponíveis
        veiculoDescricao = `${veiculoData.brand} ${veiculoData.model} ${veiculoData.year}${veiculoData.color ? ` (${veiculoData.color})` : ""}`;
      }

      const prompt = `Você é um vendedor da "${companyName}". O lead "${lead.nome}" está interessado em um ${veiculoDescricao}.

Histórico de contatos:
${historyText || "Nenhum contato anterior registrado."}

Status atual: ${lead.status}
Contato: ${lead.telefone || lead.email}

Sugira uma resposta profissional, persuasiva e personalizada para continuar a negociação, mencionando especificamente o ${veiculoDescricao} se relevante. A resposta deve ser pronta para enviar via WhatsApp ou email.`;

      const suggestedResponse = await generateCompletion(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 400,
        systemPrompt: "Você é um vendedor experiente de veículos. Gere respostas naturais, profissionais e que estimulem a conversão.",
      });

      res.json({ suggestedResponse });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/financial/seller-analysis - Análise de desempenho do vendedor
  app.post("/api/financial/seller-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const { sellerId } = req.body;
      if (!sellerId) {
        return res.status(400).json({ error: "ID do vendedor é obrigatório" });
      }

      const seller = await storage.getUser(sellerId);
      if (!seller || seller.empresaId !== userCompany.empresaId) {
        return res.status(404).json({ error: "Vendedor não encontrado" });
      }

      const vehicles = await storage.getAllVehicles(userCompany.empresaId);
      const soldVehicles = vehicles.filter((v: any) => 
        v.status === "Vendido" && v.vendedorId === sellerId
      );
      
      const totalSales = soldVehicles.length;
      const totalValue = soldVehicles.reduce((sum: number, v: any) => sum + (Number(v.valorVenda || v.salePrice) || 0), 0);
      
      // Buscar leads do vendedor
      const leadsResult = await db.select().from(leads)
        .where(and(
          eq(leads.empresaId, userCompany.empresaId),
          eq(leads.vendedorResponsavel, sellerId)
        ));
      
      const convertedLeads = leadsResult.filter((l: any) => l.status === "Convertido");
      const conversionRate = leadsResult.length > 0 
        ? (convertedLeads.length / leadsResult.length * 100).toFixed(1)
        : "0";

      const prompt = `Analise o desempenho do vendedor com os seguintes dados:

Nome: ${seller.firstName} ${seller.lastName}
Total de Vendas: ${totalSales} veículos
Valor Total: R$ ${totalValue.toLocaleString('pt-BR')}
Taxa de Conversão: ${conversionRate}%
Leads Atribuídos: ${leadsResult.length}
Leads Convertidos: ${convertedLeads.length}

Forneça uma análise completa incluindo:
1. Pontos fortes
2. Áreas de melhoria
3. 3 recomendações práticas de treinamento ou ação

Retorne um JSON com: { "analysis": "texto da análise", "recommendations": ["rec1", "rec2", "rec3"] }`;

      const result = await generateJSON(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 600,
        systemPrompt: "Você é um consultor de vendas automotivas. Analise métricas e forneça insights acionáveis.",
      });

      res.json(result);
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/chatbot/message - Chatbot FAQ com contexto completo do sistema
  app.post("/api/chatbot/message", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const { message, conversationHistory = [] } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
      }

      // Sanitize and validate message length
      const sanitizedMessage = message.trim().slice(0, 500);
      if (!sanitizedMessage) {
        return res.status(400).json({ error: "Mensagem inválida" });
      }

      const companies = await storage.getAllCompanies();
      const company = companies.find(c => c.id === userCompany.empresaId);
      const companyName = company?.nomeFantasia || "Nossa Loja";

      // Buscar usuário para verificar permissões
      const currentUser = await storage.getUser(userCompany.userId);
      const userRole = currentUser?.role || "vendedor";
      const userPermissions = currentUser?.customPermissions || {};

      // Validate and sanitize conversation history (only allow valid structure)
      const validHistory = Array.isArray(conversationHistory) 
        ? conversationHistory
            .filter((m: any) => 
              m && 
              typeof m === 'object' &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              m.content.length <= 500
            )
            .slice(-5)
            .map((m: any) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content.trim().slice(0, 500)
            }))
        : [];

      const historyText = validHistory
        .map((m) => `${m.role === 'user' ? 'Cliente' : 'Assistente'}: ${m.content}`)
        .join("\n");

      // ====== BUSCAR DADOS DO SISTEMA ======
      // Veículos com detalhes
      const allVehicles = await db.select({
        id: vehicles.id,
        brand: vehicles.brand,
        model: vehicles.model,
        year: vehicles.year,
        color: vehicles.color,
        status: vehicles.status,
        location: vehicles.physicalLocation,
        plate: vehicles.plate,
      }).from(vehicles).where(eq(vehicles.empresaId, userCompany.empresaId));

      // Observações pendentes
      const pendingObservations = await db.select({
        id: storeObservations.id,
        description: storeObservations.description,
        status: storeObservations.status,
        createdAt: storeObservations.createdAt,
      }).from(storeObservations).where(
        and(
          eq(storeObservations.empresaId, userCompany.empresaId),
          eq(storeObservations.status, "Pendente")
        )
      ).limit(10);

      // Contas a pagar (apenas se usuário tem permissão)
      let billsContext = "";
      const canViewBills = userRole === "proprietario" || userRole === "gerente" || userPermissions?.viewBills;
      if (canViewBills) {
        const bills = await db.select({
          id: billsPayable.id,
          descricao: billsPayable.descricao,
          valor: billsPayable.valor,
          dataVencimento: billsPayable.dataVencimento,
          status: billsPayable.status,
        }).from(billsPayable).where(
          and(
            eq(billsPayable.empresaId, userCompany.empresaId),
            eq(billsPayable.status, "pendente")
          )
        ).orderBy(billsPayable.dataVencimento).limit(10);
        
        billsContext = bills.length > 0 ? `\n## CONTAS A PAGAR (Pendentes):\n${bills.map(b => 
          `- ${b.descricao}: R$ ${Number(b.valor).toFixed(2)} (Vence: ${new Date(b.dataVencimento).toLocaleDateString('pt-BR')})`
        ).join("\n")}` : "\n## CONTAS: Nenhuma conta pendente";
      } else {
        billsContext = "\n[Usuário sem permissão para visualizar contas financeiras]";
      }

      // Leads ativos (do vendedor ou de todos, dependendo do role)
      let leadsContext = "";
      const userLeads = userRole === "proprietario" || userRole === "gerente" 
        ? await db.select({
            nome: leads.nome,
            status: leads.status,
            veiculoInteresseNome: leads.veiculoInteresseNome,
          }).from(leads).where(
            and(
              eq(leads.empresaId, userCompany.empresaId),
              eq(leads.status, "Negociando")
            )
          ).limit(5)
        : await db.select({
            nome: leads.nome,
            status: leads.status,
            veiculoInteresseNome: leads.veiculoInteresseNome,
          }).from(leads).where(
            and(
              eq(leads.empresaId, userCompany.empresaId),
              eq(leads.status, "Negociando"),
              eq(leads.vendedorResponsavel, userCompany.userId)
            )
          ).limit(5);

      if (userLeads.length > 0) {
        leadsContext = `\n## LEADS EM NEGOCIAÇÃO:\n${userLeads.map(l => 
          `- ${l.nome} (${l.veiculoInteresseNome || "Veículo não especificado"})`
        ).join("\n")}`;
      }

      // Formatar dados de veículos
      const vehiclesContext = allVehicles.length > 0 ? `\n## ESTOQUE DE VEÍCULOS:\n${allVehicles.slice(0, 15).map(v => 
        `- ${v.brand} ${v.model} ${v.year} (${v.color}) - Placa: ${v.plate || "N/A"} - Status: ${v.status} - Local: ${v.location || "N/A"}`
      ).join("\n")}` : "\n## ESTOQUE: Sem veículos cadastrados";

      const observationsContext = pendingObservations.length > 0 ? `\n## OBSERVAÇÕES PENDENTES:\n${pendingObservations.map(o => 
        `- ${o.description} (Criada em: ${new Date(o.createdAt).toLocaleDateString('pt-BR')})`
      ).join("\n")}` : "\n## OBSERVAÇÕES: Nenhuma observação pendente";

      const systemContext = `${vehiclesContext}${leadsContext}${observationsContext}${billsContext}`;

      const prompt = `${historyText ? `Histórico:\n${historyText}\n\n` : ''}CONTEXTO DO SISTEMA:\n${systemContext}\n\nUsuário: ${sanitizedMessage}

Responda com base nos dados do sistema acima. Seja específico com details como marca, modelo, ano, placa e localização de veículos.`;

      const veloStockSystemPrompt = `Você é o assistente virtual especializado do VeloStock - um sistema completo de gestão de revenda de veículos da "${companyName}".

## VISÃO GERAL
VeloStock é uma plataforma profissional que você domina completamente. Você conhece todos os veículos em estoque, observações pendentes, leads em negociação, contas a pagar e toda a operação do negócio.

## DADOS DO SISTEMA QUE VOCÊ TEM ACESSO
${systemContext}

## ROLE DO USUÁRIO ATUAL
Papel: ${userRole}
Permissões de Visualização de Contas: ${canViewBills ? 'SIM' : 'NÃO'}

## COMPORTAMENTO OBRIGATÓRIO
1. **Você é o MESTRE do sistema** - responde tudo com detalhes específicos (marca, modelo, ano, placa, localização)
2. **Respeite permissões**: Se o usuário pergunta sobre contas (boletos, pagamentos, faturamento) e não tem permissão, recuse educadamente
3. **Sempre cite detalhes**: Quando mencionar um veículo, inclua: marca + modelo + ano + cor + placa + status + localização
4. **Para observações pendentes**: Liste descricao e quando foram criadas
5. **Para contas a pagar**: Só mostre se o usuário tem permissão (role proprietario/gerente OU permissão customizada)

## EXEMPLOS DE RESPOSTAS ESPERADAS
- Pergunta: "Onde está o onix prata?"
  Resposta: "Onix 2017 prata Placa OKG-0935 está em [localização]. Onix 2022 prata Placa RYT-7648 está em [localização]."
- Pergunta: "Quais observações estão pendentes?"
  Resposta: "[Lista de observações com detalhes]"
- Pergunta: "Quais contas devo pagar?"
  Resposta: Se tem permissão: "[Lista de contas com prazos]" | Se não tem: "Desculpe, você não tem acesso aos dados financeiros da loja"

## PARA CLIENTES/COMPRADORES
Se reconhecer que é um cliente externo (não está no sistema):
1. Responda sobre veículos disponíveis com detalhes técnicos
2. Seja persuasivo mas honesto
3. Direcione para contato com vendedor conforme necessário`;

      const response = await generateCompletion(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 300,
        systemPrompt: veloStockSystemPrompt,
      });

      res.json({ response });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/checklists/suggest-observation - Sugestão de observação para checklist
  app.post("/api/checklists/suggest-observation", isAuthenticated, async (req: any, res) => {
    try {
      const { itemName, category, vehicleBrand, vehicleModel } = req.body;
      
      if (!itemName) {
        return res.status(400).json({ error: "Nome do item é obrigatório" });
      }

      const prompt = `Item do checklist: "${itemName}"
Categoria: ${category || "Geral"}
Veículo: ${vehicleBrand || ""} ${vehicleModel || ""}

Sugira uma observação técnica profissional para este item que foi marcado como "Fazer Reparo". A observação deve:
1. Ser objetiva e técnica
2. Descrever o problema encontrado
3. Sugerir a ação necessária
4. Ter no máximo 2 linhas

Retorne apenas a observação, sem formatação adicional.`;

      const observation = await generateCompletion(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.5,
        maxTokens: 150,
        systemPrompt: "Você é um mecânico automotivo experiente. Forneça observações técnicas precisas e profissionais.",
      });

      res.json({ observation: observation.trim() });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/leads/generate-email-campaign - Gerar campanha de email marketing
  app.post("/api/leads/generate-email-campaign", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const { leadIds, campaignType = "followup" } = req.body;
      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ error: "IDs dos leads são obrigatórios" });
      }

      const companies = await storage.getAllCompanies();
      const company = companies.find(c => c.id === userCompany.empresaId);
      const companyName = company?.nomeFantasia || "Nossa Loja";

      const emails = [];

      for (const leadId of leadIds.slice(0, 10)) { // Máx 10 leads por vez
        const leadResult = await db.select().from(leads)
          .where(and(eq(leads.id, leadId), eq(leads.empresaId, userCompany.empresaId)));
        
        const lead = leadResult[0];
        if (!lead) continue;

        const typeDescriptions: Record<string, string> = {
          followup: "acompanhamento de negociação em andamento",
          promotion: "promoção especial com oferta limitada",
          reactivation: "reativação de cliente que não comprou há algum tempo",
        };

        const prompt = `Crie um email de ${typeDescriptions[campaignType] || "acompanhamento"} para:
Nome: ${lead.nome}
Interesse: ${lead.veiculoInteresseNome || "veículos em geral"}
Loja: ${companyName}

O email deve ter:
- Assunto atrativo (máx 50 caracteres)
- Corpo do email personalizado e persuasivo
- Tom profissional mas amigável
- Call-to-action claro

Retorne JSON: { "subject": "...", "body": "..." }`;

        const result = await generateJSON(prompt, {
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 400,
          systemPrompt: "Você é um especialista em email marketing para concessionárias de veículos.",
        });

        emails.push({
          leadId: lead.id,
          leadName: lead.nome,
          leadEmail: lead.email,
          ...result,
        });
      }

      res.json({ emails });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/financial/seller-coaching - Coaching de vendedor
  app.post("/api/financial/seller-coaching", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const { sellerId } = req.body;
      if (!sellerId) {
        return res.status(400).json({ error: "ID do vendedor é obrigatório" });
      }

      const seller = await storage.getUser(sellerId);
      if (!seller || seller.empresaId !== userCompany.empresaId) {
        return res.status(404).json({ error: "Vendedor não encontrado" });
      }

      // Obter vendas do mês atual
      const vehicles = await storage.getAllVehicles(userCompany.empresaId);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const soldThisMonth = vehicles.filter((v: any) => {
        if (v.status !== "Vendido" || v.vendedorId !== sellerId) return false;
        const soldDate = v.dataVenda ? new Date(v.dataVenda) : null;
        return soldDate && soldDate.getMonth() === currentMonth && soldDate.getFullYear() === currentYear;
      });

      // Buscar leads ativos do vendedor
      const leadsResult = await db.select().from(leads)
        .where(and(
          eq(leads.empresaId, userCompany.empresaId),
          eq(leads.vendedorResponsavel, sellerId)
        ));
      
      const activeLeads = leadsResult.filter((l: any) => 
        l.status !== "Convertido" && l.status !== "Perdido"
      );

      const leadsByStatus = activeLeads.reduce((acc: Record<string, number>, l: any) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {});

      const prompt = `Vendedor: ${seller.firstName} ${seller.lastName}
Vendas este mês: ${soldThisMonth.length}
Leads ativos no pipeline: ${activeLeads.length}
Leads por status: ${JSON.stringify(leadsByStatus)}

Forneça:
1. 3 dicas específicas e práticas para melhorar as vendas
2. Uma área de foco principal

Retorne JSON: { "tips": ["dica1", "dica2", "dica3"], "focusArea": "área de foco" }`;

      const result = await generateJSON(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 400,
        systemPrompt: "Você é um coach de vendas automotivas. Forneça conselhos práticos e acionáveis.",
      });

      res.json(result);
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });

  // POST /api/vehicles/:id/suggest-price-dynamic - Sugestão de preço dinâmica
  app.post("/api/vehicles/:id/suggest-price-dynamic", isAuthenticated, async (req: any, res) => {
    try {
      const userCompany = await getUserWithCompany(req);
      if (!userCompany) {
        return res.status(403).json({ error: "Usuário não vinculado a uma empresa" });
      }

      const vehicle = await storage.getVehicle(req.params.id, userCompany.empresaId);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      const { fipePrice, targetMarginPercent = 20 } = req.body;

      // Buscar veículos similares
      const allVehicles = await storage.getAllVehicles(userCompany.empresaId);
      const similarVehicles = allVehicles.filter((v: any) => 
        v.id !== vehicle.id &&
        v.brand === vehicle.brand &&
        Math.abs(v.year - vehicle.year) <= 2 &&
        v.salePrice && Number(v.salePrice) > 0
      ).slice(0, 5);

      const similarPrices = similarVehicles.map((v: any) => ({
        model: v.model,
        year: v.year,
        price: Number(v.salePrice),
        status: v.status,
      }));

      // Calcular dias parado
      const entryDate = vehicle.createdAt ? new Date(vehicle.createdAt) : new Date();
      const daysInStock = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

      // Custos
      const costs = await storage.getVehicleCosts(vehicle.id);
      const totalCosts = costs.reduce((sum: number, c: any) => sum + Number(c.value), 0) + Number(vehicle.purchasePrice || 0);

      const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });

      const prompt = `Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
Cor: ${vehicle.color}
KM: ${vehicle.kmOdometer || 'N/A'}
Custo total (compra + preparação): R$ ${totalCosts.toLocaleString('pt-BR')}
Dias no estoque: ${daysInStock}
Mês atual: ${currentMonth}
${fipePrice ? `Preço FIPE: R$ ${fipePrice}` : ''}
Margem desejada: ${targetMarginPercent}%

Veículos similares em estoque:
${similarPrices.length > 0 ? similarPrices.map((v: any) => `- ${v.model} ${v.year}: R$ ${v.price.toLocaleString('pt-BR')} (${v.status})`).join('\n') : 'Nenhum similar encontrado'}

Considerando:
- Se está há mais de 30 dias: sugerir desconto para girar estoque
- Sazonalidade (fim de ano, férias, etc)
- Margem desejada
- Preços de similares

Sugira um preço estratégico e justifique sua recomendação.

Retorne JSON: { "suggestedPrice": 00000.00, "reasoning": "justificativa", "recommendation": "recomendação de ação" }`;

      const result = await generateJSON(prompt, {
        model: "gpt-4o-mini",
        temperature: 0.5,
        maxTokens: 500,
        systemPrompt: "Você é um consultor de precificação de veículos seminovos. Forneça análises precisas e estratégicas.",
      });

      res.json({
        ...result,
        daysInStock,
        totalCosts,
        similarVehiclesCount: similarVehicles.length,
      });
    } catch (error) {
      handleOpenAIError(error, res);
    }
  });
}
