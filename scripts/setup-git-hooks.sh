#!/bin/bash
# Script para configurar os Git Hooks automaticamente

echo "🔧 Configurando Git Hooks para backup automático..."

# Configurar o diretório de hooks do Git
git config core.hooksPath .githooks

if [ $? -eq 0 ]; then
    echo "✅ Git Hooks configurados com sucesso!"
    echo ""
    echo "📦 A partir de agora, toda vez que você der 'git push':"
    echo "   1. Um backup do banco será criado automaticamente"
    echo "   2. O backup será adicionado ao commit"
    echo "   3. Tudo será enviado junto pro GitHub"
    echo ""
    echo "Você não precisa fazer NADA manualmente! 🎉"
else
    echo "❌ Erro ao configurar Git Hooks"
    exit 1
fi
