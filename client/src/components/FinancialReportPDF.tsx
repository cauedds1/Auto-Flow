import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, Printer } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";

type VeiculoVendido = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  precoCompra: number;
  precoVenda: number;
  custoTotal: number;
  lucro: number;
  margem: number;
  vendedorNome: string;
  dataVenda: string | null;
  repassado: boolean;
  custosDetalhados: { categoria: string; descricao: string; valor: number }[];
};

type Highlight = {
  maiorVenda: { veiculo: string; placa: string; valor: number; vendedor: string } | null;
  veiculoMaisCustoso: { veiculo: string; placa: string; custoTotal: number } | null;
  veiculoMaiorLucro: { veiculo: string; placa: string; lucro: number; margem: number } | null;
  melhorVendedor: { nome: string; vendas: number; receita: number } | null;
  contasVencidasAlerta: number;
};

type EstatisticasContas = {
  pagar: {
    total: number;
    pagas: number;
    pendentes: number;
    vencidas: number;
    valorTotal: number;
    valorPago: number;
    valorPendente: number;
    valorVencido: number;
  };
  receber: {
    total: number;
    recebidas: number;
    pendentes: number;
    vencidas: number;
    valorTotal: number;
    valorRecebido: number;
    valorPendente: number;
    valorVencido: number;
  };
};

type ComissaoDetalhada = {
  nome: string;
  email: string;
  vendas: number;
  receita: number;
  comissaoTotal: number;
  comissaoPaga: number;
  comissaoAPagar: number;
  quantidadeComissoes: number;
};

type ReportData = {
  empresa: { nome: string; logo: string | null };
  periodo: { tipo: string; mes: number; ano: number; dataInicio: string; dataFim: string };
  resumoFinanceiro: {
    receitaTotal: number;
    custoAquisicao: number;
    custoOperacional: number;
    despesasOperacionais: number;
    comissoes: number;
    custoTotal: number;
    lucroLiquido: number;
    margemLucro: number;
  };
  vendas: { quantidade: number; receitaTotal: number; ticketMedio: number };
  comissoes: { total: number; pagas: number; aPagar: number; quantidade: number };
  contasPagar: { lista: any[]; total: number; vencidas: number; valorVencido: number };
  contasReceber: { lista: any[]; total: number; vencidas: number; valorVencido: number };
  despesasOperacionais: { lista: any[]; total: number };
  custosPorCategoria: { categoria: string; total: number; quantidade: number }[];
  rankingVendedores: { nome: string; email: string; vendas: number; receita: number; comissao: number }[];
  observacoesPendentes: number;
  dataGeracao: string;
  veiculosVendidos: VeiculoVendido[];
  veiculosPorCusto: VeiculoVendido[];
  veiculosPorLucro: VeiculoVendido[];
  estatisticasContas: EstatisticasContas;
  comissoesDetalhadas: ComissaoDetalhada[];
  despesasPorTipo: { tipo: string; total: number; quantidade: number }[];
  highlights: Highlight;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function FinancialReportPDF() {
  const [open, setOpen] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("mensal");
  const [mesAno, setMesAno] = useState<string>(`${new Date().getMonth() + 1}-${new Date().getFullYear()}`);
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const buildReportUrl = () => {
    const params = new URLSearchParams();
    
    if (tipoRelatorio === "personalizado" && dataInicio && dataFim) {
      params.set("startDate", dataInicio);
      params.set("endDate", dataFim);
      params.set("tipo", "personalizado");
    } else if (tipoRelatorio === "ultimos3meses") {
      const now = new Date();
      const start = subMonths(now, 3);
      params.set("startDate", start.toISOString());
      params.set("endDate", now.toISOString());
      params.set("tipo", "ultimos3meses");
    } else if (tipoRelatorio === "mespassado") {
      const lastMonth = subMonths(new Date(), 1);
      params.set("mes", String(lastMonth.getMonth() + 1));
      params.set("ano", String(lastMonth.getFullYear()));
      params.set("tipo", "mespassado");
    } else {
      const [mes, ano] = mesAno.split("-");
      params.set("mes", mes);
      params.set("ano", ano);
      params.set("tipo", "mensal");
    }
    
    return `/api/financial/report/complete?${params.toString()}`;
  };

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: [buildReportUrl()],
    enabled: open,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const getPeriodoLabel = () => {
    if (!reportData) return "";
    const { tipo, mes, ano, dataInicio, dataFim } = reportData.periodo;
    
    if (tipo === "personalizado" || tipo === "ultimos3meses") {
      return `${formatDate(dataInicio)} a ${formatDate(dataFim)}`;
    }
    return `${MESES[mes - 1]} de ${ano}`;
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    const element = reportRef.current;
    const opt = {
      margin: [6, 6, 6, 6] as [number, number, number, number],
      filename: `Relatorio_Financeiro_${reportData?.empresa.nome || "Empresa"}_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - ${reportData?.empresa.nome}</title>
          <style>
            ${getReportStyles()}
          </style>
        </head>
        <body>
          ${reportRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getReportStyles = () => `
    @page { size: A4 portrait; margin: 6mm; }
    * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, Arial, sans-serif; margin: 0; padding: 0; }
    body { color: #1a1a1a; line-height: 1.25; font-size: 8px; }
    
    .report-container { width: 198mm; margin: 0 auto; }
    
    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: linear-gradient(135deg, #7c3aed, #9333ea);
      border-radius: 6px;
      margin-bottom: 8px;
      color: white;
    }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .logo-box {
      width: 36px; height: 36px;
      background: white;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #7c3aed; font-size: 18px;
    }
    .header-title h1 { font-size: 14px; font-weight: 700; margin-bottom: 1px; }
    .header-title .subtitle { font-size: 9px; opacity: 0.9; }
    .header-right { text-align: right; font-size: 8px; }
    .header-right .periodo { font-size: 10px; font-weight: 600; }
    
    /* KPI GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .kpi-card {
      background: #f8f5ff;
      border: 1px solid #e9d5ff;
      border-radius: 5px;
      padding: 8px;
      text-align: center;
    }
    .kpi-card.highlight {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border-color: #86efac;
    }
    .kpi-card.alert {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border-color: #fca5a5;
    }
    .kpi-label { font-size: 7px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
    .kpi-value { font-size: 12px; font-weight: 700; color: #1a1a1a; }
    .kpi-value.green { color: #16a34a; }
    .kpi-value.red { color: #dc2626; }
    .kpi-detail { font-size: 7px; color: #888; margin-top: 2px; }
    
    /* HIGHLIGHTS */
    .highlights-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .highlight-card {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 5px;
      padding: 6px 8px;
      border-left: 3px solid #7c3aed;
    }
    .highlight-label { font-size: 7px; color: #7c3aed; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
    .highlight-value { font-size: 9px; font-weight: 700; color: #1a1a1a; }
    .highlight-sub { font-size: 7px; color: #666; }
    
    /* SECTION */
    .section { margin-bottom: 8px; }
    .section-header {
      background: #7c3aed;
      color: white;
      font-size: 8px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px 4px 0 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .section-content {
      border: 1px solid #e5e5e5;
      border-top: none;
      border-radius: 0 0 4px 4px;
      background: white;
    }
    
    /* TABLES */
    table { width: 100%; border-collapse: collapse; font-size: 7px; }
    th {
      background: #f5f3ff;
      color: #5b21b6;
      font-weight: 700;
      padding: 4px 5px;
      text-align: left;
      font-size: 6px;
      text-transform: uppercase;
      border-bottom: 1px solid #e5e5e5;
    }
    td { padding: 3px 5px; border-bottom: 1px solid #f0f0f0; color: #333; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafaf8; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .text-green { color: #16a34a; }
    .text-red { color: #dc2626; }
    .text-muted { color: #999; }
    
    /* TWO COLUMN LAYOUT */
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .three-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    
    /* FLUXO DE CAIXA */
    .fluxo-box {
      background: #fafafa;
      border: 1px solid #e5e5e5;
      border-radius: 5px;
      padding: 8px;
    }
    .fluxo-box.entrada { border-left: 3px solid #16a34a; }
    .fluxo-box.saida { border-left: 3px solid #dc2626; }
    .fluxo-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e5e5;
    }
    .fluxo-icon {
      width: 16px; height: 16px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: white;
    }
    .fluxo-icon.entrada { background: #16a34a; }
    .fluxo-icon.saida { background: #dc2626; }
    .fluxo-title { font-size: 9px; font-weight: 700; }
    .fluxo-item { display: flex; justify-content: space-between; padding: 2px 0; font-size: 7px; }
    .fluxo-total {
      display: flex; justify-content: space-between;
      margin-top: 6px; padding-top: 4px;
      border-top: 2px solid #e5e5e5;
      font-weight: 700; font-size: 9px;
    }
    
    /* SALDO BOX */
    .saldo-box {
      background: linear-gradient(135deg, #f8f5ff, #ede9fe);
      border: 2px solid #7c3aed;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      margin-bottom: 8px;
    }
    .saldo-label { font-size: 9px; color: #5b21b6; font-weight: 600; text-transform: uppercase; }
    .saldo-value { font-size: 22px; font-weight: 700; }
    .saldo-value.positivo { color: #16a34a; }
    .saldo-value.negativo { color: #dc2626; }
    
    /* BADGE */
    .badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 6px;
      font-weight: 600;
    }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    
    /* FOOTER */
    .footer {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 7px;
      color: #999;
    }
    
    /* PAGE BREAK */
    .page-break { page-break-before: always; padding-top: 8px; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const generateMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    for (let y = currentYear; y >= currentYear - 2; y--) {
      for (let m = (y === currentYear ? currentMonth : 11); m >= 0; m--) {
        options.push({ value: `${m + 1}-${y}`, label: `${MESES[m]} ${y}` });
      }
    }
    return options;
  };

  // Calcular totais de fluxo de caixa
  const calcularFluxo = () => {
    if (!reportData) return { entradas: 0, saidas: 0, saldo: 0 };
    
    const entradas = 
      reportData.vendas.receitaTotal + 
      (reportData.estatisticasContas?.receber?.valorRecebido || 0);
    
    const saidas = 
      reportData.resumoFinanceiro.custoAquisicao +
      reportData.resumoFinanceiro.custoOperacional +
      reportData.resumoFinanceiro.despesasOperacionais +
      reportData.comissoes.pagas +
      (reportData.estatisticasContas?.pagar?.valorPago || 0);
    
    return {
      entradas,
      saidas,
      saldo: entradas - saidas
    };
  };

  const fluxo = calcularFluxo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório Financeiro Completo
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={(v) => { setTipoRelatorio(v); refetch(); }}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="mespassado">Mês Passado</SelectItem>
                  <SelectItem value="ultimos3meses">Últimos 3 Meses</SelectItem>
                  <SelectItem value="personalizado">Por Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {tipoRelatorio === "mensal" && (
              <div className="space-y-2">
                <Label>Mês/Ano</Label>
                <Select value={mesAno} onValueChange={(v) => { setMesAno(v); refetch(); }}>
                  <SelectTrigger data-testid="select-month-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {tipoRelatorio === "personalizado" && (
              <>
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Input 
                    type="date" 
                    value={dataInicio} 
                    onChange={(e) => setDataInicio(e.target.value)}
                    data-testid="input-date-start"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input 
                    type="date" 
                    value={dataFim} 
                    onChange={(e) => setDataFim(e.target.value)}
                    data-testid="input-date-end"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end gap-2">
              <Button onClick={generatePDF} disabled={isGenerating || isLoading || !reportData} data-testid="button-download-pdf">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                <span className="hidden sm:inline">Baixar PDF</span>
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={isLoading || !reportData} data-testid="button-print">
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto border rounded-lg bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando dados...</span>
            </div>
          ) : reportData ? (
            <div ref={reportRef} style={{ backgroundColor: 'white', color: '#1a1a1a', padding: '12px' }}>
              <style>{getReportStyles()}</style>
              <div className="report-container">
                
                {/* ==================== PÁGINA 1 ==================== */}
                
                {/* HEADER */}
                <div className="header">
                  <div className="header-left">
                    <div className="logo-box">V</div>
                    <div className="header-title">
                      <h1>{reportData.empresa.nome}</h1>
                      <div className="subtitle">Relatório Financeiro Completo</div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="periodo">{getPeriodoLabel()}</div>
                    <div>Gerado em: {format(new Date(reportData.dataGeracao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                  </div>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                  <div className="kpi-card highlight">
                    <div className="kpi-label">Lucro Líquido</div>
                    <div className={`kpi-value ${reportData.resumoFinanceiro.lucroLiquido >= 0 ? 'green' : 'red'}`}>
                      {formatCurrency(reportData.resumoFinanceiro.lucroLiquido)}
                    </div>
                    <div className="kpi-detail">Margem: {reportData.resumoFinanceiro.margemLucro.toFixed(1)}%</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Receita Total</div>
                    <div className="kpi-value green">{formatCurrency(reportData.resumoFinanceiro.receitaTotal)}</div>
                    <div className="kpi-detail">{reportData.vendas.quantidade} veículos</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Custo Total</div>
                    <div className="kpi-value red">{formatCurrency(reportData.resumoFinanceiro.custoTotal)}</div>
                    <div className="kpi-detail">Aquisição + Operacional</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-label">Ticket Médio</div>
                    <div className="kpi-value">{formatCurrency(reportData.vendas.ticketMedio)}</div>
                    <div className="kpi-detail">Por venda</div>
                  </div>
                  <div className={`kpi-card ${(reportData.highlights?.contasVencidasAlerta || 0) > 0 ? 'alert' : ''}`}>
                    <div className="kpi-label">Contas Vencidas</div>
                    <div className={`kpi-value ${(reportData.highlights?.contasVencidasAlerta || 0) > 0 ? 'red' : ''}`}>
                      {reportData.highlights?.contasVencidasAlerta || 0}
                    </div>
                    <div className="kpi-detail">Pagar + Receber</div>
                  </div>
                </div>

                {/* HIGHLIGHTS */}
                {reportData.highlights && (
                  <div className="highlights-row">
                    {reportData.highlights.maiorVenda && (
                      <div className="highlight-card">
                        <div className="highlight-label">Maior Venda</div>
                        <div className="highlight-value">{formatCurrency(reportData.highlights.maiorVenda.valor)}</div>
                        <div className="highlight-sub">{reportData.highlights.maiorVenda.veiculo}</div>
                      </div>
                    )}
                    {reportData.highlights.veiculoMaisCustoso && (
                      <div className="highlight-card">
                        <div className="highlight-label">Maior Custo</div>
                        <div className="highlight-value">{formatCurrency(reportData.highlights.veiculoMaisCustoso.custoTotal)}</div>
                        <div className="highlight-sub">{reportData.highlights.veiculoMaisCustoso.veiculo}</div>
                      </div>
                    )}
                    {reportData.highlights.veiculoMaiorLucro && (
                      <div className="highlight-card">
                        <div className="highlight-label">Maior Lucro</div>
                        <div className="highlight-value">{formatCurrency(reportData.highlights.veiculoMaiorLucro.lucro)}</div>
                        <div className="highlight-sub">{reportData.highlights.veiculoMaiorLucro.veiculo} ({reportData.highlights.veiculoMaiorLucro.margem.toFixed(1)}%)</div>
                      </div>
                    )}
                    {reportData.highlights.melhorVendedor && (
                      <div className="highlight-card">
                        <div className="highlight-label">Top Vendedor</div>
                        <div className="highlight-value">{reportData.highlights.melhorVendedor.nome}</div>
                        <div className="highlight-sub">{reportData.highlights.melhorVendedor.vendas} vendas - {formatCurrency(reportData.highlights.melhorVendedor.receita)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* FLUXO DE CAIXA */}
                <div className="saldo-box">
                  <div className="saldo-label">Saldo do Período (Entradas - Saídas)</div>
                  <div className={`saldo-value ${fluxo.saldo >= 0 ? 'positivo' : 'negativo'}`}>
                    {formatCurrency(fluxo.saldo)}
                  </div>
                </div>

                <div className="two-cols">
                  <div className="fluxo-box entrada">
                    <div className="fluxo-header">
                      <div className="fluxo-icon entrada">+</div>
                      <div className="fluxo-title">ENTRADAS</div>
                    </div>
                    <div className="fluxo-item">
                      <span>Receitas de Vendas ({reportData.vendas.quantidade} veículos)</span>
                      <span className="font-bold">{formatCurrency(reportData.vendas.receitaTotal)}</span>
                    </div>
                    <div className="fluxo-item">
                      <span>Contas Recebidas ({reportData.estatisticasContas?.receber?.recebidas || 0} contas)</span>
                      <span className="font-bold">{formatCurrency(reportData.estatisticasContas?.receber?.valorRecebido || 0)}</span>
                    </div>
                    <div className="fluxo-total" style={{ color: '#16a34a' }}>
                      <span>TOTAL ENTRADAS</span>
                      <span>{formatCurrency(fluxo.entradas)}</span>
                    </div>
                  </div>

                  <div className="fluxo-box saida">
                    <div className="fluxo-header">
                      <div className="fluxo-icon saida">-</div>
                      <div className="fluxo-title">SAÍDAS</div>
                    </div>
                    <div className="fluxo-item">
                      <span>Custo de Aquisição</span>
                      <span className="font-bold">{formatCurrency(reportData.resumoFinanceiro.custoAquisicao)}</span>
                    </div>
                    <div className="fluxo-item">
                      <span>Custos Operacionais</span>
                      <span className="font-bold">{formatCurrency(reportData.resumoFinanceiro.custoOperacional)}</span>
                    </div>
                    <div className="fluxo-item">
                      <span>Despesas Operacionais</span>
                      <span className="font-bold">{formatCurrency(reportData.resumoFinanceiro.despesasOperacionais)}</span>
                    </div>
                    <div className="fluxo-item">
                      <span>Comissões Pagas ({reportData.comissoes.quantidade || 0})</span>
                      <span className="font-bold">{formatCurrency(reportData.comissoes.pagas)}</span>
                    </div>
                    <div className="fluxo-item">
                      <span>Contas Pagas ({reportData.estatisticasContas?.pagar?.pagas || 0} contas)</span>
                      <span className="font-bold">{formatCurrency(reportData.estatisticasContas?.pagar?.valorPago || 0)}</span>
                    </div>
                    <div className="fluxo-total" style={{ color: '#dc2626' }}>
                      <span>TOTAL SAÍDAS</span>
                      <span>{formatCurrency(fluxo.saidas)}</span>
                    </div>
                  </div>
                </div>

                {/* VEÍCULOS VENDIDOS */}
                {reportData.veiculosVendidos && reportData.veiculosVendidos.length > 0 && (
                  <div className="section" style={{ marginTop: '8px' }}>
                    <div className="section-header">Veículos Vendidos no Período ({reportData.veiculosVendidos.length})</div>
                    <div className="section-content">
                      <table>
                        <thead>
                          <tr>
                            <th>Veículo</th>
                            <th>Placa</th>
                            <th className="text-right">Compra</th>
                            <th className="text-right">Custos</th>
                            <th className="text-right">Venda</th>
                            <th className="text-right">Lucro</th>
                            <th className="text-center">Margem</th>
                            <th>Vendedor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.veiculosVendidos.slice(0, 10).map((v, idx) => (
                            <tr key={idx}>
                              <td className="font-bold">{v.marca} {v.modelo} {v.ano}</td>
                              <td>{v.placa}</td>
                              <td className="text-right">{formatCurrency(v.precoCompra)}</td>
                              <td className="text-right text-red">{formatCurrency(v.custoTotal)}</td>
                              <td className="text-right text-green">{formatCurrency(v.precoVenda)}</td>
                              <td className={`text-right font-bold ${v.lucro >= 0 ? 'text-green' : 'text-red'}`}>
                                {formatCurrency(v.lucro)}
                              </td>
                              <td className="text-center">
                                <span className={`badge ${v.margem >= 10 ? 'badge-green' : v.margem >= 0 ? 'badge-yellow' : 'badge-red'}`}>
                                  {v.margem.toFixed(1)}%
                                </span>
                              </td>
                              <td className="text-muted">{v.vendedorNome}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ==================== PÁGINA 2 ==================== */}
                <div className="page-break"></div>

                {/* HEADER PÁGINA 2 */}
                <div className="header" style={{ marginBottom: '8px' }}>
                  <div className="header-left">
                    <div className="logo-box">V</div>
                    <div className="header-title">
                      <h1>{reportData.empresa.nome}</h1>
                      <div className="subtitle">Detalhamento Financeiro - {getPeriodoLabel()}</div>
                    </div>
                  </div>
                  <div className="header-right">
                    <div>Página 2/2</div>
                  </div>
                </div>

                {/* CUSTOS + COMISSÕES */}
                <div className="two-cols">
                  {/* CUSTOS POR CATEGORIA */}
                  <div className="section">
                    <div className="section-header">Custos por Categoria</div>
                    <div className="section-content">
                      {reportData.custosPorCategoria.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Categoria</th>
                              <th className="text-center">Qtd</th>
                              <th className="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.custosPorCategoria.slice(0, 8).map((cat, idx) => (
                              <tr key={idx}>
                                <td className="font-bold">{cat.categoria}</td>
                                <td className="text-center">{cat.quantidade}</td>
                                <td className="text-right text-red">{formatCurrency(cat.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '8px' }}>
                          Nenhum custo registrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COMISSÕES POR VENDEDOR */}
                  <div className="section">
                    <div className="section-header">Comissões por Vendedor</div>
                    <div className="section-content">
                      {reportData.comissoesDetalhadas && reportData.comissoesDetalhadas.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Vendedor</th>
                              <th className="text-center">Vendas</th>
                              <th className="text-right">Paga</th>
                              <th className="text-right">A Pagar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.comissoesDetalhadas.slice(0, 8).map((v, idx) => (
                              <tr key={idx}>
                                <td className="font-bold">{v.nome}</td>
                                <td className="text-center">{v.vendas}</td>
                                <td className="text-right text-green">{formatCurrency(v.comissaoPaga)}</td>
                                <td className="text-right text-red">{formatCurrency(v.comissaoAPagar)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '8px' }}>
                          Nenhuma comissão registrada
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CONTAS */}
                <div className="two-cols" style={{ marginTop: '8px' }}>
                  {/* CONTAS A PAGAR */}
                  <div className="section">
                    <div className="section-header">Contas a Pagar</div>
                    <div className="section-content">
                      <table>
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th className="text-center">Qtd</th>
                            <th className="text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span className="badge badge-green">Pagas</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.pagar?.pagas || 0}</td>
                            <td className="text-right text-green">{formatCurrency(reportData.estatisticasContas?.pagar?.valorPago || 0)}</td>
                          </tr>
                          <tr>
                            <td><span className="badge badge-yellow">Pendentes</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.pagar?.pendentes || 0}</td>
                            <td className="text-right">{formatCurrency(reportData.estatisticasContas?.pagar?.valorPendente || 0)}</td>
                          </tr>
                          <tr>
                            <td><span className="badge badge-red">Vencidas</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.pagar?.vencidas || 0}</td>
                            <td className="text-right text-red">{formatCurrency(reportData.estatisticasContas?.pagar?.valorVencido || 0)}</td>
                          </tr>
                          <tr style={{ background: '#f5f3ff' }}>
                            <td className="font-bold">TOTAL</td>
                            <td className="text-center font-bold">{reportData.estatisticasContas?.pagar?.total || 0}</td>
                            <td className="text-right font-bold">{formatCurrency(reportData.estatisticasContas?.pagar?.valorTotal || 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* CONTAS A RECEBER */}
                  <div className="section">
                    <div className="section-header">Contas a Receber</div>
                    <div className="section-content">
                      <table>
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th className="text-center">Qtd</th>
                            <th className="text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><span className="badge badge-green">Recebidas</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.receber?.recebidas || 0}</td>
                            <td className="text-right text-green">{formatCurrency(reportData.estatisticasContas?.receber?.valorRecebido || 0)}</td>
                          </tr>
                          <tr>
                            <td><span className="badge badge-yellow">Pendentes</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.receber?.pendentes || 0}</td>
                            <td className="text-right">{formatCurrency(reportData.estatisticasContas?.receber?.valorPendente || 0)}</td>
                          </tr>
                          <tr>
                            <td><span className="badge badge-red">Vencidas</span></td>
                            <td className="text-center">{reportData.estatisticasContas?.receber?.vencidas || 0}</td>
                            <td className="text-right text-red">{formatCurrency(reportData.estatisticasContas?.receber?.valorVencido || 0)}</td>
                          </tr>
                          <tr style={{ background: '#f5f3ff' }}>
                            <td className="font-bold">TOTAL</td>
                            <td className="text-center font-bold">{reportData.estatisticasContas?.receber?.total || 0}</td>
                            <td className="text-right font-bold">{formatCurrency(reportData.estatisticasContas?.receber?.valorTotal || 0)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* VEÍCULOS POR CUSTO + LUCRO */}
                <div className="two-cols" style={{ marginTop: '8px' }}>
                  {/* TOP VEÍCULOS POR CUSTO */}
                  <div className="section">
                    <div className="section-header">Veículos com Maior Custo (Top 5)</div>
                    <div className="section-content">
                      {reportData.veiculosPorCusto && reportData.veiculosPorCusto.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Veículo</th>
                              <th>Placa</th>
                              <th className="text-right">Custo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.veiculosPorCusto.slice(0, 5).map((v, idx) => (
                              <tr key={idx}>
                                <td className="font-bold">{v.marca} {v.modelo}</td>
                                <td>{v.placa}</td>
                                <td className="text-right text-red font-bold">{formatCurrency(v.custoTotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '8px' }}>
                          Sem dados
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TOP VEÍCULOS POR LUCRO */}
                  <div className="section">
                    <div className="section-header">Veículos com Maior Lucro (Top 5)</div>
                    <div className="section-content">
                      {reportData.veiculosPorLucro && reportData.veiculosPorLucro.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Veículo</th>
                              <th>Placa</th>
                              <th className="text-right">Lucro</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.veiculosPorLucro.slice(0, 5).map((v, idx) => (
                              <tr key={idx}>
                                <td className="font-bold">{v.marca} {v.modelo}</td>
                                <td>{v.placa}</td>
                                <td className="text-right text-green font-bold">{formatCurrency(v.lucro)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '8px' }}>
                          Sem dados
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DESPESAS OPERACIONAIS */}
                {reportData.despesasPorTipo && reportData.despesasPorTipo.length > 0 && (
                  <div className="section" style={{ marginTop: '8px' }}>
                    <div className="section-header">Despesas Operacionais por Tipo</div>
                    <div className="section-content">
                      <table>
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th className="text-center">Qtd</th>
                            <th className="text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.despesasPorTipo.slice(0, 6).map((d, idx) => (
                            <tr key={idx}>
                              <td className="font-bold">{d.tipo}</td>
                              <td className="text-center">{d.quantidade}</td>
                              <td className="text-right text-red">{formatCurrency(d.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="footer">
                  Relatório gerado pelo VeloStock em {format(new Date(reportData.dataGeracao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
