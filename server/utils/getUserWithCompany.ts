import { storage } from "../storage";

/**
 * Helper para validar autenticação e obter empresaId do usuário logado
 * Retorna userId e empresaId ou lança erro 403 se usuário não estiver vinculado
 */
export async function getUserWithCompany(req: any): Promise<{ userId: string; empresaId: string }> {
  const userId = req.user?.claims?.id || req.user?.claims?.sub;
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  // Buscar user completo do banco com empresaId
  const user = await storage.getUser(userId);
  
  if (!user?.empresaId) {
    throw new Error("User not linked to a company");
  }
  
  return { userId, empresaId: user.empresaId };
}
