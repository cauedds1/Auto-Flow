# Diretrizes de Design - AutoFlow

## Abordagem de Design

**Design System Híbrido**: Combinação de Material Design (para componentes de dados complexos) com estética inspirada em Linear/Notion para criar uma ferramenta moderna de gestão. Paleta customizada preta e vermelha conforme especificado.

## Elementos de Design Core

### A. Tipografia

**Fonte Principal**: Inter ou IBM Plex Sans via Google Fonts
- Títulos de Página (h1): font-bold text-3xl
- Títulos de Seção (h2): font-semibold text-xl
- Subtítulos/Cards (h3): font-medium text-lg
- Corpo de Texto: font-normal text-base
- Metadados/Labels: font-medium text-sm text-gray-400
- Números/Métricas: font-bold tabular-nums (para alinhamento)

### B. Sistema de Espaçamento

**Unidades Tailwind Principais**: 2, 4, 6, 8, 12, 16
- Padding interno de componentes: p-4 ou p-6
- Gaps em grids/flexbox: gap-4 ou gap-6
- Margens entre seções: mb-8 ou mb-12
- Espaçamento de dashboard: p-8 (desktop), p-4 (mobile)

**Containers**:
- Sidebar: w-64 (fixa)
- Conteúdo principal: flex-1 com max-width natural
- Cards/Modais: max-w-2xl a max-w-4xl conforme contexto

### C. Biblioteca de Componentes

**1. Kanban Board**
- Colunas verticais em grid horizontal scrollável
- Largura de coluna: w-80 (320px)
- Cards com sombra suave, bordas arredondadas (rounded-lg)
- Drag handles visíveis ao hover
- Header de coluna com contador de itens
- Espaçamento entre cards: gap-3

**2. Vehicle Cards**
- Layout vertical: Imagem (aspect-video) + Conteúdo
- Thumbnail: rounded-t-lg, object-cover
- Info grid: 2 colunas para dados principais
- Tag de localização: badge pequeno, posicionado absolute no topo da imagem
- Indicador de tempo: texto pequeno com ícone de relógio
- Warning icon (⚠️): absolute, canto superior direito se houver notas

**3. Detalhes do Veículo - Sistema de Abas**
- Tab navigation horizontal no topo
- Tabs: border-b-2 para ativa, texto normal para inativas
- Conteúdo da tab com padding uniforme (p-6 ou p-8)
- Transição suave entre abas (sem animação complexa)

**4. Forms & Inputs**
- Labels acima dos campos: text-sm font-medium mb-2
- Inputs: border, rounded-md, px-4 py-2
- Focus states: outline com cor de destaque
- Grupos de form: espaçamento vertical gap-4 ou gap-6

**5. Sidebar Navigation**
- Fixa à esquerda, altura total
- Items de menu: px-4 py-3, rounded-md ao hover/ativo
- Ícones alinhados à esquerda (size-5), texto à direita
- Espaçamento entre grupos: mt-8

**6. Dashboard Métricas**
- Cards de estatísticas em grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Cada card métrico: padding generoso (p-6), rounded-lg
- Número grande no topo, label pequeno embaixo
- Ícone ou indicador visual no canto

**7. Timeline de Histórico**
- Lista vertical com linha conectora à esquerda
- Ícones circulares para cada evento
- Timestamp em texto pequeno
- Descrição do evento com hierarquia clara

**8. Galeria de Mídia**
- Grid responsivo: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Thumbnails quadrados (aspect-square), rounded
- Upload zone com border-dashed

**9. Modais e Overlays**
- Backdrop semi-transparente
- Modal centralizado: max-w-2xl, rounded-lg
- Header com título e botão fechar
- Footer com ações alinhadas à direita

**10. Botões**
- Primário: px-6 py-2.5, rounded-md, font-medium
- Secundário: variante outline com border
- Ícone + Texto: gap-2 entre elementos
- Tamanhos: sm (py-1.5 px-4), md (py-2.5 px-6), lg (py-3 px-8)

**11. Tabelas de Custos**
- Cabeçalhos fixos com fundo diferenciado
- Células: px-4 py-3
- Alinhamento: texto à esquerda, números à direita
- Row hover para feedback
- Totais em footer com destaque visual

### D. Ícones

**Biblioteca**: Lucide React (via npm) ou Heroicons
- Tamanhos consistentes: size-4 (pequenos), size-5 (médios), size-6 (grandes)
- Stroke width: 2 para consistência

### E. Animações

**Uso Mínimo e Estratégico**:
- Transições de estado: transition-colors duration-200
- Drag and drop: cursor-grab/grabbing apenas
- Modais: fade-in simples
- **Evitar**: animações complexas, parallax, scroll effects

## Layout Específico por Seção

**Dashboard Kanban**:
- Layout: Sidebar (w-64) + Main content (flex-1)
- Topo: Barra de filtros/busca (h-16, border-b)
- Área de colunas: overflow-x-auto com padding lateral

**Página de Detalhes**:
- Header fixo: Foto principal + Info básica (grid 2 cols em desktop)
- Tabs navegáveis logo abaixo
- Conteúdo da tab com max-width para legibilidade
- Botão "Gerar Anúncio" destacado na tab Anúncio

**Configurações (DONO)**:
- Layout de formulário em 2 colunas onde apropriado
- Seções agrupadas visualmente com cards
- Salvamento automático ou botão fixo no topo

## Imagens

**Fotos de Veículos**:
- Hero na página de detalhes: imagem grande, aspect-video ou aspect-[16/10]
- Cards Kanban: thumbnail menor, aspect-video, object-cover
- Galeria: grid de thumbnails uniformes
- Placeholder para veículos sem foto: ícone de carro centralizado em fundo neutro

---

**Princípios Guia**: Clareza sobre ornamentação, eficiência de espaço, hierarquia visual forte, consistência absoluta de padrões. Sistema deve parecer profissional, rápido e confiável - não experimental ou "artístico".