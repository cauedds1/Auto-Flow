import { db, pool } from "./db";
import { 
  users, 
  vehicles, 
  vehicleImages, 
  vehicleHistory, 
  vehicleCosts,
  companies,
  advancedCompanySettings,
  leads,
  followUps,
  billsPayable,
  commissionPayments,
  operationalExpenses,
  storeObservations,
  reminders,
  salesTargets
} from "@shared/schema";
import bcrypt from "bcrypt";

const EMPRESA_ID = "empresa-auto-elite-001";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function seed() {
  console.log("🌱 Iniciando seed completo do VeloStock...");
  console.log("📅 Simulando 9 meses de uso (Fevereiro 2025 - Novembro 2025)");

  // ============================================
  // 1. CRIAR EMPRESA
  // ============================================
  console.log("\n🏢 Criando empresa...");
  
  await db.insert(companies).values({
    id: EMPRESA_ID,
    nomeFantasia: "Auto Elite Veículos",
    razaoSocial: "Auto Elite Comércio de Veículos LTDA",
    cnpj: "12.345.678/0001-90",
    endereco: "Av. Brasil, 1500 - Centro, São Paulo - SP",
    telefone: "(11) 3456-7890",
    telefone2: "(11) 98765-4321",
    email: "contato@autoelite.com.br",
    whatsappNumero: "5511987654321",
    corPrimaria: "#7c3aed",
    corSecundaria: "#1e1b4b",
    locaisComuns: ["Matriz", "Pátio Externo", "Oficina Parceira", "Estética"],
    alertaDiasParado: 7,
    comissaoFixaGlobal: "500.00",
    createdAt: new Date("2025-02-15"),
  }).onConflictDoNothing();

  await db.insert(advancedCompanySettings).values({
    empresaId: EMPRESA_ID,
    categoriasCustos: ["Mecânica", "Funilaria", "Pintura", "Estética", "Documentação", "Elétrica", "Pneus", "Outros"],
    origensLeads: ["WhatsApp", "Site", "Indicação", "Loja Física", "Instagram", "Facebook", "OLX", "Telefone"],
    localizacoes: ["Matriz", "Pátio Externo", "Oficina Parceira", "Estética", "Despachante"],
    prazoPreparacaoVeiculo: 5,
    prazoValidadeOrcamento: 15,
    prazoAlertaVeiculoParado: 7,
  }).onConflictDoNothing();

  console.log("✅ Empresa criada: Auto Elite Veículos");

  // ============================================
  // 2. CRIAR USUÁRIOS
  // ============================================
  console.log("\n👥 Criando usuários...");
  
  const passwordHash = await hashPassword("123456");
  
  const usersData = [
    {
      id: "user-owner-001",
      empresaId: EMPRESA_ID,
      email: "carlos@autoelite.com.br",
      firstName: "Carlos",
      lastName: "Oliveira",
      role: "proprietario" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      comissaoFixa: null,
      usarComissaoFixaGlobal: "false",
      createdAt: new Date("2025-02-15"),
    },
    {
      id: "user-manager-001",
      empresaId: EMPRESA_ID,
      email: "fernanda@autoelite.com.br",
      firstName: "Fernanda",
      lastName: "Santos",
      role: "gerente" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      comissaoFixa: null,
      usarComissaoFixaGlobal: "false",
      createdBy: "user-owner-001",
      createdAt: new Date("2025-02-16"),
    },
    {
      id: "user-financial-001",
      empresaId: EMPRESA_ID,
      email: "patricia@autoelite.com.br",
      firstName: "Patrícia",
      lastName: "Lima",
      role: "financeiro" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      createdBy: "user-owner-001",
      createdAt: new Date("2025-02-17"),
    },
    {
      id: "user-seller-001",
      empresaId: EMPRESA_ID,
      email: "rafael@autoelite.com.br",
      firstName: "Rafael",
      lastName: "Costa",
      role: "vendedor" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      comissaoFixa: "600.00",
      usarComissaoFixaGlobal: "false",
      createdBy: "user-owner-001",
      createdAt: new Date("2025-02-18"),
    },
    {
      id: "user-seller-002",
      empresaId: EMPRESA_ID,
      email: "juliana@autoelite.com.br",
      firstName: "Juliana",
      lastName: "Almeida",
      role: "vendedor" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      comissaoFixa: null,
      usarComissaoFixaGlobal: "true",
      createdBy: "user-owner-001",
      createdAt: new Date("2025-03-01"),
    },
    {
      id: "user-seller-003",
      empresaId: EMPRESA_ID,
      email: "marcos@autoelite.com.br",
      firstName: "Marcos",
      lastName: "Pereira",
      role: "vendedor" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      comissaoFixa: "550.00",
      usarComissaoFixaGlobal: "false",
      createdBy: "user-manager-001",
      createdAt: new Date("2025-04-15"),
    },
    {
      id: "user-driver-001",
      empresaId: EMPRESA_ID,
      email: "jose@autoelite.com.br",
      firstName: "José",
      lastName: "Silva",
      role: "motorista" as const,
      passwordHash,
      authProvider: "local",
      isActive: "true",
      emailVerified: "true",
      createdBy: "user-manager-001",
      createdAt: new Date("2025-02-20"),
    },
  ];

  for (const user of usersData) {
    await db.insert(users).values(user).onConflictDoNothing();
    console.log(`✅ Usuário criado: ${user.firstName} ${user.lastName} (${user.role})`);
  }

  // ============================================
  // 3. VEÍCULOS VENDIDOS (Histórico de 9 meses)
  // ============================================
  console.log("\n🚗 Criando veículos vendidos...");

  const soldVehicles = [
    // Fevereiro 2025
    { brand: "Hyundai", model: "HB20 1.0 Sense", year: 2021, color: "Branco", plate: "FGH2A34", km: 45000, fuel: "Flex", purchase: 52000, sale: 62000, soldDate: new Date("2025-02-28"), seller: "user-seller-001", buyer: "João da Silva", payment: "Financiado" },
    { brand: "Fiat", model: "Argo 1.0 Drive", year: 2020, color: "Prata", plate: "JKL5B67", km: 62000, fuel: "Flex", purchase: 48000, sale: 57000, soldDate: new Date("2025-02-25"), seller: "user-seller-001", buyer: "Maria Santos", payment: "À Vista" },
    
    // Março 2025
    { brand: "Volkswagen", model: "Polo 1.0 TSI", year: 2022, color: "Cinza", plate: "MNO8C90", km: 28000, fuel: "Flex", purchase: 72000, sale: 85000, soldDate: new Date("2025-03-10"), seller: "user-seller-002", buyer: "Pedro Oliveira", payment: "Financiado" },
    { brand: "Chevrolet", model: "Onix 1.0 LT", year: 2021, color: "Preto", plate: "PQR1D23", km: 38000, fuel: "Flex", purchase: 55000, sale: 65000, soldDate: new Date("2025-03-18"), seller: "user-seller-001", buyer: "Ana Costa", payment: "Financiado" },
    { brand: "Toyota", model: "Corolla XEi 2.0", year: 2020, color: "Prata", plate: "STU4E56", km: 52000, fuel: "Flex", purchase: 98000, sale: 115000, soldDate: new Date("2025-03-25"), seller: "user-seller-002", buyer: "Carlos Mendes", payment: "À Vista" },
    
    // Abril 2025
    { brand: "Honda", model: "Civic EXL", year: 2021, color: "Branco", plate: "VWX7F89", km: 35000, fuel: "Flex", purchase: 105000, sale: 125000, soldDate: new Date("2025-04-05"), seller: "user-seller-001", buyer: "Fernanda Lima", payment: "Financiado" },
    { brand: "Jeep", model: "Renegade Sport", year: 2020, color: "Vermelho", plate: "YZA0G12", km: 48000, fuel: "Flex", purchase: 78000, sale: 92000, soldDate: new Date("2025-04-12"), seller: "user-seller-002", buyer: "Roberto Alves", payment: "Financiado" },
    { brand: "Nissan", model: "Kicks S", year: 2021, color: "Azul", plate: "BCD3H45", km: 32000, fuel: "Flex", purchase: 82000, sale: 98000, soldDate: new Date("2025-04-20"), seller: "user-seller-001", buyer: "Lucia Ferreira", payment: "À Vista" },
    
    // Maio 2025
    { brand: "Fiat", model: "Pulse Drive", year: 2022, color: "Laranja", plate: "EFG6I78", km: 18000, fuel: "Flex", purchase: 85000, sale: 102000, soldDate: new Date("2025-05-08"), seller: "user-seller-003", buyer: "Marcos Paulo", payment: "Financiado" },
    { brand: "Renault", model: "Kwid Zen", year: 2022, color: "Branco", plate: "HIJ9J01", km: 22000, fuel: "Flex", purchase: 42000, sale: 52000, soldDate: new Date("2025-05-15"), seller: "user-seller-002", buyer: "Carla Dias", payment: "À Vista" },
    { brand: "Volkswagen", model: "T-Cross 200 TSI", year: 2021, color: "Prata", plate: "KLM2K34", km: 40000, fuel: "Flex", purchase: 95000, sale: 112000, soldDate: new Date("2025-05-22"), seller: "user-seller-001", buyer: "Felipe Santos", payment: "Financiado" },
    { brand: "Chevrolet", model: "Tracker LT", year: 2022, color: "Preto", plate: "NOP5L67", km: 25000, fuel: "Flex", purchase: 98000, sale: 118000, soldDate: new Date("2025-05-30"), seller: "user-seller-003", buyer: "Amanda Ribeiro", payment: "Financiado" },
    
    // Junho 2025
    { brand: "Hyundai", model: "Creta Action", year: 2021, color: "Cinza", plate: "QRS8M90", km: 42000, fuel: "Flex", purchase: 88000, sale: 105000, soldDate: new Date("2025-06-05"), seller: "user-seller-002", buyer: "Ricardo Nunes", payment: "À Vista" },
    { brand: "Toyota", model: "Yaris XL", year: 2020, color: "Vermelho", plate: "TUV1N23", km: 55000, fuel: "Flex", purchase: 62000, sale: 75000, soldDate: new Date("2025-06-12"), seller: "user-seller-001", buyer: "Patricia Gomes", payment: "Financiado" },
    { brand: "Ford", model: "Ka SE 1.5", year: 2019, color: "Branco", plate: "WXY4O56", km: 68000, fuel: "Flex", purchase: 38000, sale: 47000, soldDate: new Date("2025-06-20"), seller: "user-seller-003", buyer: "Bruno Castro", payment: "À Vista" },
    
    // Julho 2025
    { brand: "Honda", model: "HR-V EX", year: 2021, color: "Branco Pérola", plate: "ZAB7P89", km: 38000, fuel: "Flex", purchase: 115000, sale: 135000, soldDate: new Date("2025-07-02"), seller: "user-seller-001", buyer: "Daniela Souza", payment: "Financiado" },
    { brand: "Volkswagen", model: "Virtus Comfortline", year: 2022, color: "Cinza Platinum", plate: "CDE0Q12", km: 22000, fuel: "Flex", purchase: 85000, sale: 102000, soldDate: new Date("2025-07-10"), seller: "user-seller-002", buyer: "Eduardo Lima", payment: "Financiado" },
    { brand: "Fiat", model: "Strada Freedom", year: 2022, color: "Vermelho", plate: "FGH3R45", km: 28000, fuel: "Flex", purchase: 92000, sale: 108000, soldDate: new Date("2025-07-18"), seller: "user-seller-003", buyer: "Gabriel Rocha", payment: "À Vista" },
    { brand: "Chevrolet", model: "S10 LT 2.8", year: 2020, color: "Prata", plate: "IJK6S78", km: 75000, fuel: "Diesel", purchase: 145000, sale: 168000, soldDate: new Date("2025-07-25"), seller: "user-seller-001", buyer: "Henrique Martins", payment: "Financiado" },
    
    // Agosto 2025
    { brand: "Toyota", model: "Hilux SRV", year: 2021, color: "Branco", plate: "LMN9T01", km: 58000, fuel: "Diesel", purchase: 195000, sale: 225000, soldDate: new Date("2025-08-05"), seller: "user-seller-002", buyer: "Ivan Cardoso", payment: "À Vista" },
    { brand: "Hyundai", model: "HB20S Evolution", year: 2022, color: "Azul", plate: "OPQ2U34", km: 18000, fuel: "Flex", purchase: 72000, sale: 88000, soldDate: new Date("2025-08-12"), seller: "user-seller-001", buyer: "Julia Fernandes", payment: "Financiado" },
    { brand: "Renault", model: "Duster Iconic", year: 2021, color: "Marrom", plate: "RST5V67", km: 45000, fuel: "Flex", purchase: 78000, sale: 95000, soldDate: new Date("2025-08-20"), seller: "user-seller-003", buyer: "Kleber Santos", payment: "Financiado" },
    { brand: "Jeep", model: "Compass Limited", year: 2022, color: "Preto", plate: "UVW8X90", km: 28000, fuel: "Flex", purchase: 142000, sale: 165000, soldDate: new Date("2025-08-28"), seller: "user-seller-002", buyer: "Laura Oliveira", payment: "Financiado" },
    
    // Setembro 2025
    { brand: "Fiat", model: "Toro Freedom", year: 2021, color: "Cinza", plate: "XYZ1A23", km: 52000, fuel: "Diesel", purchase: 118000, sale: 138000, soldDate: new Date("2025-09-05"), seller: "user-seller-001", buyer: "Mateus Costa", payment: "À Vista" },
    { brand: "Volkswagen", model: "Nivus Highline", year: 2022, color: "Branco", plate: "ABC4B56", km: 20000, fuel: "Flex", purchase: 105000, sale: 125000, soldDate: new Date("2025-09-12"), seller: "user-seller-003", buyer: "Natalia Alves", payment: "Financiado" },
    { brand: "Honda", model: "City EXL", year: 2021, color: "Prata", plate: "DEF7C89", km: 32000, fuel: "Flex", purchase: 92000, sale: 110000, soldDate: new Date("2025-09-20"), seller: "user-seller-002", buyer: "Otavio Pereira", payment: "Financiado" },
    { brand: "Chevrolet", model: "Spin Premier", year: 2022, color: "Cinza", plate: "GHI0D12", km: 25000, fuel: "Flex", purchase: 88000, sale: 105000, soldDate: new Date("2025-09-28"), seller: "user-seller-001", buyer: "Paula Ribeiro", payment: "À Vista" },
    
    // Outubro 2025
    { brand: "Toyota", model: "SW4 SRX", year: 2020, color: "Preto", plate: "JKL3E45", km: 68000, fuel: "Diesel", purchase: 248000, sale: 285000, soldDate: new Date("2025-10-05"), seller: "user-seller-002", buyer: "Quintino Moura", payment: "Financiado" },
    { brand: "Hyundai", model: "Tucson GLS", year: 2021, color: "Branco", plate: "MNO6F78", km: 42000, fuel: "Flex", purchase: 135000, sale: 158000, soldDate: new Date("2025-10-12"), seller: "user-seller-001", buyer: "Renata Silva", payment: "Financiado" },
    { brand: "Fiat", model: "Fastback Limited", year: 2023, color: "Vermelho", plate: "PQR9G01", km: 12000, fuel: "Flex", purchase: 118000, sale: 138000, soldDate: new Date("2025-10-20"), seller: "user-seller-003", buyer: "Sergio Nunes", payment: "À Vista" },
    { brand: "Nissan", model: "Frontier Attack", year: 2021, color: "Cinza", plate: "STU2H34", km: 55000, fuel: "Diesel", purchase: 168000, sale: 195000, soldDate: new Date("2025-10-28"), seller: "user-seller-002", buyer: "Tatiana Gomes", payment: "Financiado" },
    
    // Novembro 2025 (até dia 28)
    { brand: "Volkswagen", model: "Taos Comfortline", year: 2022, color: "Azul", plate: "VWX5I67", km: 28000, fuel: "Flex", purchase: 138000, sale: 162000, soldDate: new Date("2025-11-05"), seller: "user-seller-001", buyer: "Ulisses Ferreira", payment: "Financiado" },
    { brand: "Chevrolet", model: "Montana LT", year: 2023, color: "Branco", plate: "YZA8J90", km: 15000, fuel: "Flex", purchase: 105000, sale: 125000, soldDate: new Date("2025-11-12"), seller: "user-seller-003", buyer: "Vanessa Lima", payment: "À Vista" },
    { brand: "Honda", model: "WR-V EXL", year: 2022, color: "Prata", plate: "BCD1K23", km: 22000, fuel: "Flex", purchase: 98000, sale: 118000, soldDate: new Date("2025-11-18"), seller: "user-seller-002", buyer: "Wagner Santos", payment: "Financiado" },
  ];

  const carImages: Record<string, string> = {
    "HB20": "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    "Argo": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
    "Polo": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800",
    "Onix": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    "Corolla": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    "Civic": "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    "Renegade": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    "Kicks": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    "Pulse": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    "Kwid": "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
    "T-Cross": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    "Tracker": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    "Creta": "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
    "Yaris": "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
    "Ka": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
    "HR-V": "https://images.unsplash.com/photo-1568844293986-8c3a48f869f6?w=800",
    "Virtus": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
    "Strada": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
    "S10": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "Hilux": "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800",
    "HB20S": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    "Duster": "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800",
    "Compass": "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800",
    "Toro": "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800",
    "Nivus": "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
    "City": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
    "Spin": "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
    "SW4": "https://images.unsplash.com/photo-1625231334168-14161a255843?w=800",
    "Tucson": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800",
    "Fastback": "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800",
    "Frontier": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    "Taos": "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800",
    "Montana": "https://images.unsplash.com/photo-1619976215249-0ce1777be1f3?w=800",
    "WR-V": "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800",
  };

  for (const v of soldVehicles) {
    const vehicleId = `vehicle-sold-${v.plate}`;
    const modelKey = v.model.split(" ")[0];
    const imageUrl = carImages[modelKey] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
    
    const checklistComplete = {
      pneus: [
        { item: "Pneu dianteiro esquerdo", observation: "OK - Bom estado" },
        { item: "Pneu dianteiro direito", observation: "OK" },
        { item: "Pneu traseiro esquerdo", observation: "OK" },
        { item: "Pneu traseiro direito", observation: "OK" },
        { item: "Estepe", observation: "Presente e calibrado" },
      ],
      interior: [
        { item: "Bancos", observation: "Sem rasgos ou manchas" },
        { item: "Painel", observation: "Funcionando corretamente" },
        { item: "Ar condicionado", observation: "Gelando bem" },
        { item: "Tapetes", observation: "Originais" },
      ],
      somEletrica: [
        { item: "Som/Multimídia", observation: "Funcionando" },
        { item: "Vidros elétricos", observation: "OK" },
        { item: "Travas elétricas", observation: "OK" },
        { item: "Faróis", observation: "OK" },
      ],
      lataria: [
        { item: "Para-choque dianteiro", observation: "Sem amassados" },
        { item: "Para-choque traseiro", observation: "OK" },
        { item: "Portas", observation: "Sem amassados" },
        { item: "Capô", observation: "OK" },
        { item: "Pintura", observation: "Original" },
      ],
      documentacao: [
        { item: "CRLV", observation: "Em dia" },
        { item: "Multas", observation: "Nenhuma pendente" },
        { item: "IPVA", observation: "Pago" },
        { item: "Licenciamento", observation: "Em dia" },
      ],
    };

    await db.insert(vehicles).values({
      id: vehicleId,
      empresaId: EMPRESA_ID,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
      plate: v.plate,
      vehicleType: "Carro",
      status: "Vendido",
      physicalLocation: "Entregue",
      kmOdometer: v.km,
      fuelType: v.fuel,
      purchasePrice: v.purchase.toString(),
      salePrice: (v.sale - 2000).toString(),
      valorVenda: v.sale.toString(),
      mainImageUrl: imageUrl,
      features: ["Ar Condicionado", "Direção Elétrica", "Vidros Elétricos", "Travas Elétricas"],
      checklist: checklistComplete,
      vendedorId: v.seller,
      vendedorNome: v.seller === "user-seller-001" ? "Rafael Costa" : v.seller === "user-seller-002" ? "Juliana Almeida" : "Marcos Pereira",
      dataVenda: v.soldDate,
      formaPagamento: v.payment,
      observacoesVenda: `Venda realizada para ${v.buyer}. Cliente satisfeito.`,
      createdAt: addDays(v.soldDate, -15),
    }).onConflictDoNothing();

    await db.insert(vehicleImages).values({
      vehicleId: vehicleId,
      imageUrl: imageUrl,
      order: 0,
    }).onConflictDoNothing();

    const preparationCosts = [
      { category: "Mecânica", description: "Revisão completa", value: Math.floor(Math.random() * 800) + 400 },
      { category: "Estética", description: "Polimento e higienização", value: Math.floor(Math.random() * 400) + 200 },
      { category: "Documentação", description: "Vistoria e transferência", value: Math.floor(Math.random() * 200) + 150 },
    ];

    for (const cost of preparationCosts) {
      await db.insert(vehicleCosts).values({
        vehicleId: vehicleId,
        category: cost.category,
        description: cost.description,
        value: cost.value.toString(),
        date: addDays(v.soldDate, -10),
        paymentMethod: "Cartão Loja",
        paidBy: "Auto Elite",
      }).onConflictDoNothing();
    }

    await db.insert(vehicleHistory).values({
      vehicleId: vehicleId,
      fromStatus: "Pronto para Venda",
      toStatus: "Vendido",
      fromPhysicalLocation: "Matriz",
      toPhysicalLocation: "Entregue",
      userId: v.seller,
      notes: `Veículo vendido para ${v.buyer}`,
      movedAt: v.soldDate,
    }).onConflictDoNothing();

    console.log(`✅ Veículo vendido: ${v.brand} ${v.model} (${v.plate}) - ${v.soldDate.toLocaleDateString('pt-BR')}`);
  }

  // ============================================
  // 4. VEÍCULOS EM ESTOQUE (Atual)
  // ============================================
  console.log("\n🚙 Criando veículos em estoque...");

  const stockVehicles = [
    { brand: "Hyundai", model: "HB20 1.0 Comfort", year: 2023, color: "Branco", plate: "EFG1L56", km: 18000, fuel: "Flex", purchase: 68000, sale: 82000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-11-10") },
    { brand: "Volkswagen", model: "Gol 1.0 MPI", year: 2022, color: "Prata", plate: "HIJ4M89", km: 35000, fuel: "Flex", purchase: 52000, sale: 62000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-11-05") },
    { brand: "Fiat", model: "Mobi Like", year: 2023, color: "Vermelho", plate: "KLM7N12", km: 12000, fuel: "Flex", purchase: 48000, sale: 58000, status: "Em Higienização" as const, location: "Estética", createdAt: new Date("2025-11-20") },
    { brand: "Chevrolet", model: "Onix Plus LTZ", year: 2023, color: "Preto", plate: "NOP0O45", km: 22000, fuel: "Flex", purchase: 78000, sale: 92000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-10-28") },
    { brand: "Toyota", model: "Corolla Cross XRE", year: 2022, color: "Cinza Grafite", plate: "QRS3P78", km: 32000, fuel: "Híbrido", purchase: 155000, sale: 182000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-11-01") },
    { brand: "Honda", model: "Fit EXL", year: 2021, color: "Azul", plate: "TUV6Q01", km: 45000, fuel: "Flex", purchase: 82000, sale: 98000, status: "Em Reparos" as const, location: "Oficina Parceira", createdAt: new Date("2025-11-15") },
    { brand: "Jeep", model: "Compass Sport", year: 2023, color: "Branco", plate: "WXY9R34", km: 18000, fuel: "Flex", purchase: 148000, sale: 175000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-11-08") },
    { brand: "Fiat", model: "Cronos Drive", year: 2022, color: "Prata", plate: "ZAB2S67", km: 38000, fuel: "Flex", purchase: 62000, sale: 75000, status: "Entrada" as const, location: "Matriz", createdAt: new Date("2025-11-25") },
    { brand: "Nissan", model: "Versa Advance", year: 2022, color: "Branco", plate: "CDE5T90", km: 28000, fuel: "Flex", purchase: 72000, sale: 88000, status: "Em Reparos" as const, location: "Oficina Parceira", createdAt: new Date("2025-11-18") },
    { brand: "Renault", model: "Logan Life", year: 2023, color: "Prata", plate: "FGH8U23", km: 15000, fuel: "Flex", purchase: 58000, sale: 72000, status: "Em Higienização" as const, location: "Estética", createdAt: new Date("2025-11-22") },
    { brand: "Volkswagen", model: "Saveiro Robust", year: 2022, color: "Branco", plate: "IJK1V56", km: 42000, fuel: "Flex", purchase: 78000, sale: 95000, status: "Pronto para Venda" as const, location: "Pátio Externo", createdAt: new Date("2025-10-15") },
    { brand: "Chevrolet", model: "Cruze LT", year: 2021, color: "Preto", plate: "LMN4W89", km: 52000, fuel: "Flex", purchase: 92000, sale: 112000, status: "Pronto para Venda" as const, location: "Matriz", createdAt: new Date("2025-11-02") },
  ];

  for (const v of stockVehicles) {
    const vehicleId = `vehicle-stock-${v.plate}`;
    const modelKey = v.model.split(" ")[0];
    const imageUrl = carImages[modelKey] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";

    const checklistIncomplete = v.status === "Entrada" || v.status === "Em Reparos" ? {
      pneus: [
        { item: "Pneu dianteiro esquerdo", observation: "Verificar desgaste" },
        { item: "Pneu dianteiro direito" },
        { item: "Pneu traseiro esquerdo" },
        { item: "Pneu traseiro direito" },
      ],
      interior: [
        { item: "Bancos", observation: "Precisa limpeza profunda" },
        { item: "Painel" },
      ],
      lataria: [
        { item: "Para-choque dianteiro", observation: "Pequeno risco a polir" },
      ],
    } : {
      pneus: [
        { item: "Pneu dianteiro esquerdo", observation: "OK" },
        { item: "Pneu dianteiro direito", observation: "OK" },
        { item: "Pneu traseiro esquerdo", observation: "OK" },
        { item: "Pneu traseiro direito", observation: "OK" },
        { item: "Estepe", observation: "OK" },
      ],
      interior: [
        { item: "Bancos", observation: "Excelente estado" },
        { item: "Painel", observation: "OK" },
        { item: "Ar condicionado", observation: "Funcionando" },
        { item: "Tapetes", observation: "Originais" },
      ],
      somEletrica: [
        { item: "Som/Multimídia", observation: "OK" },
        { item: "Vidros elétricos", observation: "OK" },
        { item: "Travas elétricas", observation: "OK" },
      ],
      lataria: [
        { item: "Para-choque dianteiro", observation: "OK" },
        { item: "Para-choque traseiro", observation: "OK" },
        { item: "Portas", observation: "OK" },
        { item: "Pintura", observation: "Original" },
      ],
      documentacao: [
        { item: "CRLV", observation: "Em dia" },
        { item: "IPVA", observation: "Pago" },
      ],
    };

    await db.insert(vehicles).values({
      id: vehicleId,
      empresaId: EMPRESA_ID,
      brand: v.brand,
      model: v.model,
      year: v.year,
      color: v.color,
      plate: v.plate,
      vehicleType: "Carro",
      status: v.status,
      physicalLocation: v.location,
      kmOdometer: v.km,
      fuelType: v.fuel,
      purchasePrice: v.purchase.toString(),
      salePrice: v.sale.toString(),
      mainImageUrl: imageUrl,
      features: ["Ar Condicionado", "Direção Elétrica", "Vidros Elétricos"],
      checklist: checklistIncomplete,
      notes: v.status === "Em Reparos" ? "Aguardando conclusão dos reparos" : v.status === "Entrada" ? "Veículo recém chegado, aguardando vistoria completa" : null,
      createdAt: v.createdAt,
    }).onConflictDoNothing();

    await db.insert(vehicleImages).values({
      vehicleId: vehicleId,
      imageUrl: imageUrl,
      order: 0,
    }).onConflictDoNothing();

    if (v.status !== "Entrada") {
      const costs = [
        { category: "Mecânica", description: "Troca de óleo e filtros", value: Math.floor(Math.random() * 300) + 200 },
        { category: "Estética", description: "Lavagem e aspiração", value: 150 },
      ];
      for (const cost of costs) {
        await db.insert(vehicleCosts).values({
          vehicleId: vehicleId,
          category: cost.category,
          description: cost.description,
          value: cost.value.toString(),
          date: addDays(v.createdAt, 2),
          paymentMethod: "Cartão Loja",
          paidBy: "Auto Elite",
        }).onConflictDoNothing();
      }
    }

    console.log(`✅ Veículo em estoque: ${v.brand} ${v.model} (${v.plate}) - ${v.status}`);
  }

  // ============================================
  // 5. COMISSÕES
  // ============================================
  console.log("\n💰 Criando comissões...");

  const commissions = [
    { seller: "user-seller-001", vehicle: "vehicle-sold-FGH2A34", value: 600, status: "Paga" as const, paidDate: new Date("2025-03-05") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-JKL5B67", value: 600, status: "Paga" as const, paidDate: new Date("2025-03-05") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-MNO8C90", value: 500, status: "Paga" as const, paidDate: new Date("2025-03-20") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-PQR1D23", value: 600, status: "Paga" as const, paidDate: new Date("2025-03-25") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-STU4E56", value: 500, status: "Paga" as const, paidDate: new Date("2025-04-01") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-VWX7F89", value: 600, status: "Paga" as const, paidDate: new Date("2025-04-15") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-YZA0G12", value: 500, status: "Paga" as const, paidDate: new Date("2025-04-20") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-BCD3H45", value: 600, status: "Paga" as const, paidDate: new Date("2025-04-28") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-EFG6I78", value: 550, status: "Paga" as const, paidDate: new Date("2025-05-15") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-HIJ9J01", value: 500, status: "Paga" as const, paidDate: new Date("2025-05-22") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-KLM2K34", value: 600, status: "Paga" as const, paidDate: new Date("2025-05-30") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-NOP5L67", value: 550, status: "Paga" as const, paidDate: new Date("2025-06-08") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-QRS8M90", value: 500, status: "Paga" as const, paidDate: new Date("2025-06-15") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-TUV1N23", value: 600, status: "Paga" as const, paidDate: new Date("2025-06-22") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-WXY4O56", value: 550, status: "Paga" as const, paidDate: new Date("2025-06-28") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-ZAB7P89", value: 600, status: "Paga" as const, paidDate: new Date("2025-07-10") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-CDE0Q12", value: 500, status: "Paga" as const, paidDate: new Date("2025-07-18") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-FGH3R45", value: 550, status: "Paga" as const, paidDate: new Date("2025-07-25") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-IJK6S78", value: 600, status: "Paga" as const, paidDate: new Date("2025-08-01") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-LMN9T01", value: 500, status: "Paga" as const, paidDate: new Date("2025-08-12") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-OPQ2U34", value: 600, status: "Paga" as const, paidDate: new Date("2025-08-20") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-RST5V67", value: 550, status: "Paga" as const, paidDate: new Date("2025-08-28") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-UVW8X90", value: 500, status: "Paga" as const, paidDate: new Date("2025-09-05") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-XYZ1A23", value: 600, status: "Paga" as const, paidDate: new Date("2025-09-12") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-ABC4B56", value: 550, status: "Paga" as const, paidDate: new Date("2025-09-20") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-DEF7C89", value: 500, status: "Paga" as const, paidDate: new Date("2025-09-28") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-GHI0D12", value: 600, status: "Paga" as const, paidDate: new Date("2025-10-05") },
    { seller: "user-seller-002", vehicle: "vehicle-sold-JKL3E45", value: 500, status: "Paga" as const, paidDate: new Date("2025-10-12") },
    { seller: "user-seller-001", vehicle: "vehicle-sold-MNO6F78", value: 600, status: "Paga" as const, paidDate: new Date("2025-10-20") },
    { seller: "user-seller-003", vehicle: "vehicle-sold-PQR9G01", value: 550, status: "Paga" as const, paidDate: new Date("2025-10-28") },
    // Comissões a pagar (novembro)
    { seller: "user-seller-002", vehicle: "vehicle-sold-STU2H34", value: 500, status: "A Pagar" as const, paidDate: null },
    { seller: "user-seller-001", vehicle: "vehicle-sold-VWX5I67", value: 600, status: "A Pagar" as const, paidDate: null },
    { seller: "user-seller-003", vehicle: "vehicle-sold-YZA8J90", value: 550, status: "A Pagar" as const, paidDate: null },
    { seller: "user-seller-002", vehicle: "vehicle-sold-BCD1K23", value: 500, status: "A Pagar" as const, paidDate: null },
  ];

  for (const c of commissions) {
    await db.insert(commissionPayments).values({
      empresaId: EMPRESA_ID,
      vendedorId: c.seller,
      veiculoId: c.vehicle,
      percentualAplicado: "0",
      valorBase: "0",
      valorComissao: c.value.toString(),
      status: c.status,
      dataPagamento: c.paidDate,
      formaPagamento: c.paidDate ? "PIX" : null,
      criadoPor: "user-owner-001",
    }).onConflictDoNothing();
  }
  console.log(`✅ ${commissions.length} comissões criadas`);

  // ============================================
  // 6. DESPESAS OPERACIONAIS
  // ============================================
  console.log("\n📊 Criando despesas operacionais...");

  const monthlyExpenses = [
    { category: "Aluguel" as const, description: "Aluguel do galpão", value: 8500 },
    { category: "Energia" as const, description: "Conta de luz", value: 1200 },
    { category: "Água" as const, description: "Conta de água", value: 350 },
    { category: "Internet" as const, description: "Internet empresarial", value: 450 },
    { category: "Telefone" as const, description: "Telefone fixo e celular", value: 380 },
    { category: "Salários" as const, description: "Folha de pagamento", value: 28000 },
    { category: "Marketing" as const, description: "Anúncios online", value: 2500 },
  ];

  const months = [
    { month: 2, year: 2025 },
    { month: 3, year: 2025 },
    { month: 4, year: 2025 },
    { month: 5, year: 2025 },
    { month: 6, year: 2025 },
    { month: 7, year: 2025 },
    { month: 8, year: 2025 },
    { month: 9, year: 2025 },
    { month: 10, year: 2025 },
    { month: 11, year: 2025 },
  ];

  for (const { month, year } of months) {
    for (const expense of monthlyExpenses) {
      const dueDate = new Date(year, month - 1, 10);
      const isPaid = month < 11 || (month === 11 && expense.category !== "Salários");
      const paidDate = isPaid ? new Date(year, month - 1, 8) : null;
      
      await db.insert(operationalExpenses).values({
        empresaId: EMPRESA_ID,
        categoria: expense.category,
        descricao: `${expense.description} - ${month.toString().padStart(2, '0')}/${year}`,
        valor: (expense.value + Math.floor(Math.random() * 200) - 100).toString(),
        dataVencimento: dueDate,
        dataPagamento: paidDate,
        pago: isPaid ? "true" : "false",
        formaPagamento: isPaid ? "Transferência" : null,
        criadoPor: "user-financial-001",
      }).onConflictDoNothing();
    }
  }
  console.log(`✅ Despesas operacionais criadas para ${months.length} meses`);

  // ============================================
  // 7. CONTAS A PAGAR E RECEBER
  // ============================================
  console.log("\n💳 Criando contas a pagar e receber...");

  const bills = [
    // Contas a pagar
    { tipo: "a_pagar" as const, descricao: "Seguro do estabelecimento", categoria: "Seguros", valor: 2800, vencimento: new Date("2025-12-05"), status: "pendente" as const },
    { tipo: "a_pagar" as const, descricao: "Licença software gestão", categoria: "Software", valor: 450, vencimento: new Date("2025-12-01"), status: "pendente" as const },
    { tipo: "a_pagar" as const, descricao: "Manutenção ar condicionado", categoria: "Manutenção", valor: 850, vencimento: new Date("2025-11-30"), status: "pendente" as const },
    { tipo: "a_pagar" as const, descricao: "Contador mensal", categoria: "Contabilidade", valor: 1200, vencimento: new Date("2025-12-10"), status: "pendente" as const },
    { tipo: "a_pagar" as const, descricao: "IPTU parcela 11/12", categoria: "Impostos", valor: 890, vencimento: new Date("2025-11-15"), status: "pago" as const, pagamento: new Date("2025-11-14") },
    { tipo: "a_pagar" as const, descricao: "Fornecedor peças", categoria: "Fornecedores", valor: 3500, vencimento: new Date("2025-11-20"), status: "pago" as const, pagamento: new Date("2025-11-19") },
    // Contas a receber
    { tipo: "a_receber" as const, descricao: "Financiamento HB20 - João Silva", categoria: "Vendas", valor: 55000, vencimento: new Date("2025-12-15"), status: "pendente" as const },
    { tipo: "a_receber" as const, descricao: "Entrada Compass - pendente banco", categoria: "Vendas", valor: 35000, vencimento: new Date("2025-12-01"), status: "pendente" as const },
    { tipo: "a_receber" as const, descricao: "Cheque pré-datado - Corolla", categoria: "Vendas", valor: 25000, vencimento: new Date("2025-11-25"), status: "pago" as const, pagamento: new Date("2025-11-25") },
  ];

  for (const bill of bills) {
    await db.insert(billsPayable).values({
      empresaId: EMPRESA_ID,
      tipo: bill.tipo,
      descricao: bill.descricao,
      categoria: bill.categoria,
      valor: bill.valor.toString(),
      dataVencimento: bill.vencimento,
      dataPagamento: (bill as any).pagamento || null,
      status: bill.status,
      criadoPor: "user-financial-001",
    }).onConflictDoNothing();
  }
  console.log(`✅ ${bills.length} contas criadas`);

  // ============================================
  // 8. LEADS
  // ============================================
  console.log("\n👤 Criando leads...");

  const leadsData = [
    { nome: "André Martins", telefone: "(11) 98888-1111", email: "andre.m@email.com", status: "Novo" as const, origem: "WhatsApp", interesse: "vehicle-stock-EFG1L56", vendedor: "user-seller-001", createdAt: new Date("2025-11-27") },
    { nome: "Beatriz Souza", telefone: "(11) 97777-2222", email: "bia.souza@email.com", status: "Contatado" as const, origem: "Instagram", interesse: "vehicle-stock-QRS3P78", vendedor: "user-seller-002", createdAt: new Date("2025-11-25") },
    { nome: "Caio Ferreira", telefone: "(11) 96666-3333", email: "caio.f@email.com", status: "Visitou Loja" as const, origem: "Site", interesse: "vehicle-stock-WXY9R34", vendedor: "user-seller-001", createdAt: new Date("2025-11-20") },
    { nome: "Diana Costa", telefone: "(11) 95555-4444", email: null, status: "Proposta Enviada" as const, origem: "Indicação", interesse: "vehicle-stock-LMN4W89", vendedor: "user-seller-003", valorProposta: "108000", createdAt: new Date("2025-11-18") },
    { nome: "Eduardo Lima", telefone: "(11) 94444-5555", email: "edu.lima@email.com", status: "Negociando" as const, origem: "OLX", interesse: "vehicle-stock-NOP0O45", vendedor: "user-seller-002", valorProposta: "88000", createdAt: new Date("2025-11-15") },
    { nome: "Fabiana Alves", telefone: "(11) 93333-6666", email: "fabi@email.com", status: "Convertido" as const, origem: "Loja Física", interesse: "vehicle-sold-BCD1K23", vendedor: "user-seller-002", createdAt: new Date("2025-11-10") },
    { nome: "Gustavo Rocha", telefone: "(11) 92222-7777", email: null, status: "Perdido" as const, origem: "Telefone", interesse: null, vendedor: "user-seller-001", motivoPerdido: "Optou por outra loja", createdAt: new Date("2025-11-08") },
    { nome: "Helena Santos", telefone: "(11) 91111-8888", email: "helena.s@email.com", status: "Novo" as const, origem: "Facebook", interesse: null, vendedor: "user-seller-003", createdAt: new Date("2025-11-26") },
    { nome: "Igor Pereira", telefone: "(11) 90000-9999", email: "igor.p@email.com", status: "Contatado" as const, origem: "WhatsApp", interesse: "vehicle-stock-HIJ4M89", vendedor: "user-seller-001", createdAt: new Date("2025-11-24") },
    { nome: "Joana Ribeiro", telefone: "(11) 98765-1234", email: null, status: "Visitou Loja" as const, origem: "Site", interesse: "vehicle-stock-IJK1V56", vendedor: "user-seller-002", createdAt: new Date("2025-11-22") },
  ];

  for (const lead of leadsData) {
    const interestName = lead.interesse ? stockVehicles.find(v => `vehicle-stock-${v.plate}` === lead.interesse)?.model || soldVehicles.find(v => `vehicle-sold-${v.plate}` === lead.interesse)?.model : null;
    
    await db.insert(leads).values({
      empresaId: EMPRESA_ID,
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      status: lead.status,
      veiculoInteresse: lead.interesse,
      veiculoInteresseNome: interestName,
      origem: lead.origem,
      vendedorResponsavel: lead.vendedor,
      valorProposta: (lead as any).valorProposta || null,
      motivoPerdido: (lead as any).motivoPerdido || null,
      criadoPor: lead.vendedor,
      createdAt: lead.createdAt,
    }).onConflictDoNothing();
    console.log(`✅ Lead criado: ${lead.nome} (${lead.status})`);
  }

  // ============================================
  // 9. FOLLOW-UPS
  // ============================================
  console.log("\n📅 Criando follow-ups...");

  const followUpsData = [
    { titulo: "Ligar para André sobre HB20", descricao: "Cliente interessado no HB20 Comfort, retornar contato", data: new Date("2025-11-28T10:00:00"), assignedTo: "user-seller-001", status: "Pendente" as const },
    { titulo: "Enviar fotos para Beatriz", descricao: "Enviar mais fotos do Corolla Cross pelo WhatsApp", data: new Date("2025-11-28T14:00:00"), assignedTo: "user-seller-002", status: "Pendente" as const },
    { titulo: "Reagendar visita Caio", descricao: "Cliente quer voltar para test drive do Compass", data: new Date("2025-11-29T11:00:00"), assignedTo: "user-seller-001", status: "Pendente" as const },
    { titulo: "Negociar proposta Diana", descricao: "Tentar fechar negócio do Cruze LT", data: new Date("2025-11-28T16:00:00"), assignedTo: "user-seller-003", status: "Pendente" as const },
    { titulo: "Contraproposta Eduardo", descricao: "Apresentar contraproposta para o Onix Plus", data: new Date("2025-11-29T09:00:00"), assignedTo: "user-seller-002", status: "Pendente" as const },
    { titulo: "Acompanhar financiamento", descricao: "Verificar status do financiamento no banco", data: new Date("2025-11-26T10:00:00"), assignedTo: "user-seller-002", status: "Concluído" as const, resultado: "Financiamento aprovado, entrega agendada" },
    { titulo: "Ligar para Helena", descricao: "Novo lead do Facebook, fazer primeiro contato", data: new Date("2025-11-28T11:00:00"), assignedTo: "user-seller-003", status: "Pendente" as const },
  ];

  for (const fu of followUpsData) {
    await db.insert(followUps).values({
      empresaId: EMPRESA_ID,
      titulo: fu.titulo,
      descricao: fu.descricao,
      dataAgendada: fu.data,
      assignedTo: fu.assignedTo,
      status: fu.status,
      resultado: (fu as any).resultado || null,
      concluidoEm: fu.status === "Concluído" ? fu.data : null,
      criadoPor: fu.assignedTo,
    }).onConflictDoNothing();
  }
  console.log(`✅ ${followUpsData.length} follow-ups criados`);

  // ============================================
  // 10. OBSERVAÇÕES DA LOJA
  // ============================================
  console.log("\n📝 Criando observações da loja...");

  const observations = [
    { description: "Lâmpada do estacionamento queimada", category: "Manutenção", status: "Pendente" as const, createdAt: new Date("2025-11-25") },
    { description: "Verificar estoque de produtos de limpeza", category: "Estoque", status: "Pendente" as const, createdAt: new Date("2025-11-26") },
    { description: "Porta do banheiro com problema na fechadura", category: "Manutenção", status: "Resolvido" as const, resolvedAt: new Date("2025-11-27"), cost: 150, createdAt: new Date("2025-11-20") },
    { description: "Comprar café e água para clientes", category: "Estoque", status: "Resolvido" as const, resolvedAt: new Date("2025-11-26"), cost: 85, createdAt: new Date("2025-11-24") },
    { description: "Ar condicionado da sala de vendas com ruído", category: "Manutenção", status: "Pendente" as const, createdAt: new Date("2025-11-27") },
    { description: "Organizar documentos do arquivo morto", category: "Outro", status: "Pendente" as const, createdAt: new Date("2025-11-22") },
  ];

  for (const obs of observations) {
    await db.insert(storeObservations).values({
      empresaId: EMPRESA_ID,
      description: obs.description,
      category: obs.category,
      status: obs.status,
      expenseCost: (obs as any).cost?.toString() || null,
      resolvedAt: (obs as any).resolvedAt || null,
      createdAt: obs.createdAt,
    }).onConflictDoNothing();
  }
  console.log(`✅ ${observations.length} observações criadas`);

  // ============================================
  // 11. LEMBRETES
  // ============================================
  console.log("\n🔔 Criando lembretes...");

  const remindersData = [
    { titulo: "Renovar IPVA Saveiro", descricao: "IPVA vence em dezembro", dataLimite: new Date("2025-12-10"), vehicleId: "vehicle-stock-IJK1V56", userId: "user-owner-001", status: "Pendente" as const },
    { titulo: "Vistoria Fit na oficina", descricao: "Buscar resultado da vistoria mecânica", dataLimite: new Date("2025-11-29"), vehicleId: "vehicle-stock-TUV6Q01", userId: "user-manager-001", status: "Pendente" as const },
    { titulo: "Licenciamento Versa", descricao: "Licenciamento vence mês que vem", dataLimite: new Date("2025-12-15"), vehicleId: "vehicle-stock-CDE5T90", userId: "user-manager-001", status: "Pendente" as const },
    { titulo: "Fotos profissionais Compass", descricao: "Agendar sessão de fotos para anúncio", dataLimite: new Date("2025-11-30"), vehicleId: "vehicle-stock-WXY9R34", userId: "user-seller-001", status: "Pendente" as const },
    { titulo: "Verificar garantia Corolla Cross", descricao: "Verificar cobertura da garantia de fábrica", dataLimite: new Date("2025-12-05"), vehicleId: "vehicle-stock-QRS3P78", userId: "user-seller-002", status: "Pendente" as const },
  ];

  for (const reminder of remindersData) {
    await db.insert(reminders).values({
      empresaId: EMPRESA_ID,
      vehicleId: reminder.vehicleId,
      userId: reminder.userId,
      titulo: reminder.titulo,
      descricao: reminder.descricao,
      dataLimite: reminder.dataLimite,
      status: reminder.status,
    }).onConflictDoNothing();
  }
  console.log(`✅ ${remindersData.length} lembretes criados`);

  // ============================================
  // 12. METAS DE VENDAS
  // ============================================
  console.log("\n🎯 Criando metas de vendas...");

  for (const { month, year } of months) {
    await db.insert(salesTargets).values({
      empresaId: EMPRESA_ID,
      vendedorId: null,
      mesReferencia: month,
      anoReferencia: year,
      metaQuantidade: 8,
      metaValor: "800000",
      observacoes: `Meta da loja para ${month.toString().padStart(2, '0')}/${year}`,
    }).onConflictDoNothing();
  }
  console.log(`✅ Metas de vendas criadas para ${months.length} meses`);

  console.log("\n🎉 Seed completo finalizado com sucesso!");
  console.log("📊 Resumo:");
  console.log(`   - 1 empresa`);
  console.log(`   - 7 usuários`);
  console.log(`   - ${soldVehicles.length} veículos vendidos`);
  console.log(`   - ${stockVehicles.length} veículos em estoque`);
  console.log(`   - ${commissions.length} comissões`);
  console.log(`   - Despesas operacionais de ${months.length} meses`);
  console.log(`   - ${bills.length} contas a pagar/receber`);
  console.log(`   - ${leadsData.length} leads`);
  console.log(`   - ${followUpsData.length} follow-ups`);
  console.log(`   - ${observations.length} observações`);
  console.log(`   - ${remindersData.length} lembretes`);
  
  await pool.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao executar seed:", error);
  process.exit(1);
});
