/**
 * Obtém a URL de conexão do banco de dados
 * 
 * O Replit automaticamente injeta DATABASE_URL como variável de ambiente
 * tanto em desenvolvimento quanto em produção (Replit Deploy).
 * Cada ambiente tem seu próprio banco de dados com connection string separada.
 */
export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      '[Database] DATABASE_URL não encontrada! ' +
      'Verifique se o banco de dados PostgreSQL foi provisionado no Replit.'
    );
  }

  const isDev = process.env.NODE_ENV === 'development';
  const env = isDev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO';
  
  console.log(`[Database] ✓ Conectando ao banco de dados de ${env}`);

  return databaseUrl;
}
