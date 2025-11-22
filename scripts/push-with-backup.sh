#!/bin/bash
# Script para fazer push com backup automático
# Uso: npm run push

echo ""
echo "📦 Sistema de Push Automático com Backup"
echo "=========================================="
echo ""

# 1. Criar backup do banco de dados
echo "🔄 Passo 1/4: Criando backup do banco de dados..."
npm run db:backup --silent

# Pegar o backup mais recente
LATEST_BACKUP=$(ls -t backups/velostock_backup_*.sql 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "⚠️  Aviso: Não foi possível criar backup do banco de dados"
    echo "   Continuando sem backup..."
else
    echo "✅ Backup criado: $LATEST_BACKUP"
    
    # 2. Adicionar backup ao staging
    echo ""
    echo "📝 Passo 2/4: Adicionando backup ao Git..."
    git add "$LATEST_BACKUP"
    
    # Verificar se precisa commitar o backup
    if ! git diff --cached --quiet "$LATEST_BACKUP" 2>/dev/null; then
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
        git commit -m "🗄️ Backup automático do banco - $TIMESTAMP"
        echo "✅ Backup commitado"
    else
        echo "ℹ️  Backup já estava no Git"
    fi
fi

# 3. Fazer push de tudo
echo ""
echo "📤 Passo 3/4: Enviando tudo para o GitHub..."

# Verificar se há algo para dar push
if git diff origin/$(git branch --show-current) --quiet 2>/dev/null; then
    echo "ℹ️  Nada novo para enviar"
else
    git push "$@"
    
    if [ $? -eq 0 ]; then
        echo "✅ Push concluído com sucesso!"
    else
        echo "❌ Erro ao fazer push"
        exit 1
    fi
fi

# 4. Resumo final
echo ""
echo "🎉 Passo 4/4: Concluído!"
echo "=========================================="
echo ""
echo "✅ Seu código está no GitHub"
echo "✅ Backup do banco de dados incluído"
echo "✅ Todos os dados preservados"
echo ""
echo "💡 O dono da revenda pode clonar este projeto em"
echo "   qualquer plataforma e ter TODOS os dados!"
echo ""
