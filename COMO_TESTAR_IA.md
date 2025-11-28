# 🤖 Como Testar as Features de IA do VeloStock

As 5 features de IA foram implementadas e estão prontas para teste! Sua chave OpenAI já foi configurada.

## 🎯 Features de IA Implementadas

### 1️⃣ **LeadAssistant** - Gerador de Respostas para Leads
📍 **Local**: Página de Leads (`/leads`)
- Clique no botão **"Sugerir Resposta IA"** em qualquer lead
- Gera uma resposta personalizada pronta para enviar via WhatsApp
- Leve copy e paste para sua conversa!

### 2️⃣ **ChatbotWidget** - Assistente Virtual Flutuante
📍 **Local**: Canto inferior direito (visível quando logado)
- Botão flutuante aparece automaticamente
- Faça perguntas sobre carros, financiamento, documentação
- A IA responde em português natural!

### 3️⃣ **AdGeneratorMulti** - Anúncios Multi-Plataforma
📍 **Local**: Detalhes do Veículo → Aba "Anúncio"
- Clique em **"Gerar Anúncios para Todas Plataformas"**
- Gera textos otimizados para:
  - Instagram (Story + Feed)
  - Facebook
  - OLX
  - WhatsApp
  - SEO/Títulos para buscadores
- Cada um com limite de caracteres apropriado

### 4️⃣ **SellerAnalysisDialog** - Análise de Desempenho
📍 **Local**: Página de Relatórios
- Botão **"Análise IA"** em cada vendedor
- Análise completa:
  - Pontos fortes
  - Áreas de melhoria
  - 3 recomendações práticas

### 5️⃣ **CoachingCard** - Dicas de Coaching Diárias
📍 **Local**: Dashboard do Vendedor/Relatórios
- Card com dicas personalizadas
- Refresque para novas dicas
- Foco em melhorias específicas

---

## 🚀 Passo a Passo de Teste

### Teste 1: LeadAssistant
```
1. Acesse /leads
2. Crie um lead de teste (ex: "João Silva", interessado em Gol)
3. Clique em "Sugerir Resposta IA"
4. Veja a sugestão gerada
5. Copie e envie via WhatsApp (ou apenas copie!)
```

### Teste 2: ChatbotWidget
```
1. Faça login no sistema
2. Veja o botão de chat no canto inferior direito
3. Clique para abrir
4. Pergunte algo como:
   - "Quais documentos preciso para vender um carro?"
   - "Como funciona o financiamento?"
   - "Qual é o preço de um Gol 2020?"
5. A IA responde em segundos!
```

### Teste 3: AdGeneratorMulti
```
1. Acesse Veículos → Selecione um veículo
2. Vá para a aba "Anúncio"
3. Clique em "Gerar Anúncios para Todas Plataformas"
4. Veja os 6 textos gerados em abas diferentes
5. Copie cada um e veja como fica em cada plataforma
```

### Teste 4: Análise de Vendedor
```
1. Acesse Relatórios
2. Procure pela seção de "Ranking de Vendedores"
3. Clique em "Análise IA" para qualquer vendedor
4. Veja a análise completa com recomendações
```

### Teste 5: Coaching
```
1. Volte aos Relatórios ou Dashboard
2. Procure pelo card "Coaching IA"
3. Veja as dicas personalizadas
4. Clique no ícone de refresh para novas dicas
```

---

## ✅ O Que Esperar

Cada feature usa a IA para:
- **Economizar tempo**: Respostas prontas em segundos
- **Melhorar qualidade**: Textos profissionais otimizados
- **Aumentar vendas**: Coaching e análises práticas
- **Personalização**: Tudo adaptado aos dados reais do sistema

## ⚙️ Configuração

A chave da OpenAI (`OPENAI_API_KEY`) já foi configurada nas variáveis de ambiente. As features usam o modelo **GPT-4o-mini** para melhor performance e custo.

## 🔧 Troubleshooting

Se alguma feature não funcionar:
1. Verifique se o servidor está rodando: `npm run dev`
2. Abra o console do navegador (F12) para ver mensagens de erro
3. Verifique se você está logado no sistema
4. Tente recarregar a página

---

**Divirta-se testando! 🚀**
