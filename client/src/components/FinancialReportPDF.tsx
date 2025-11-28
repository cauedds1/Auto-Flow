import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";

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
  comissoes: { total: number; pagas: number; aPagar: number };
  contasPagar: { lista: any[]; total: number; vencidas: number; valorVencido: number };
  contasReceber: { lista: any[]; total: number; vencidas: number; valorVencido: number };
  despesasOperacionais: { lista: any[]; total: number };
  custosPorCategoria: { categoria: string; total: number; quantidade: number }[];
  rankingVendedores: { nome: string; email: string; vendas: number; receita: number; comissao: number }[];
  observacoesPendentes: number;
  dataGeracao: string;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const VELOSTOCK_LOGO = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect width="60" height="60" fill="#7c3aed" rx="8"/>
  <text x="50%" y="50%" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">V</text>
</svg>`;

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

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
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
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `Relatorio_Financeiro_${reportData?.empresa.nome || "Empresa"}_${format(new Date(), "yyyy-MM-dd")}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
            ${getPrintStyles()}
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

  const getPrintStyles = () => `
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #1a1a1a; line-height: 1.5; }
    .report-container { width: 100%; max-width: 210mm; margin: 0 auto; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #7c3aed; }
    .logo { width: 50px; height: 50px; background: #7c3aed; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 24px; }
    .header-info h1 { font-size: 20px; color: #1a1a1a; margin: 0 0 3px 0; font-weight: 700; }
    .header-info p { color: #666; margin: 2px 0; font-size: 11px; }
    .section { margin-bottom: 16px; page-break-inside: avoid; }
    .section-title { font-size: 13px; font-weight: 700; color: #fff; background: #7c3aed; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; }
    .metric-card { background: #f9f7ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 10px; }
    .metric-label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 3px; }
    .metric-value { font-size: 16px; font-weight: 700; color: #1a1a1a; }
    .metric-value.positive { color: #16a34a; }
    .metric-value.negative { color: #dc2626; }
    .highlight-box { background: linear-gradient(135deg, #f0e7ff, #e9d5ff); border: 2px solid #7c3aed; border-radius: 8px; padding: 15px; text-align: center; margin: 15px 0; }
    .highlight-box .label { font-size: 12px; color: #5b21b6; font-weight: 600; margin-bottom: 5px; }
    .highlight-box .value { font-size: 28px; font-weight: 700; color: #7c3aed; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 8px; }
    th, td { padding: 7px 8px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f0e7ff; font-weight: 700; color: #5b21b6; text-transform: uppercase; font-size: 9px; }
    tr:nth-child(even) { background: #fafaf8; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e5e5; font-size: 9px; color: #999; text-align: center; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .summary-box { background: #f9f7ff; border-radius: 6px; padding: 12px; }
    .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e9d5ff; }
    .summary-item:last-child { border-bottom: none; }
    .summary-label { font-size: 10px; color: #666; }
    .summary-value { font-size: 11px; font-weight: 700; color: #1a1a1a; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório Financeiro
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
                Baixar PDF
              </Button>
              <Button variant="outline" onClick={handlePrint} disabled={isLoading || !reportData} data-testid="button-print">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
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
            <div ref={reportRef} className="p-8" style={{ backgroundColor: 'white', color: '#1a1a1a' }}>
              <style>{getPrintStyles()}</style>
              <div className="report-container">
                {/* Header com Logo */}
                <div className="header-top">
                  <div className="logo">V</div>
                  <div className="header-info">
                    <h1>{reportData.empresa.nome}</h1>
                    <p style={{ color: '#333', fontWeight: 500 }}>Relatório Financeiro Completo</p>
                    <p style={{ color: '#333', fontWeight: 500 }}>Período: {getPeriodoLabel()}</p>
                    <p style={{ color: '#999' }}>Gerado em: {format(new Date(reportData.dataGeracao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>

                {/* Resultado Principal */}
                <div className="highlight-box">
                  <div className="label">Resultado do Período (Lucro Líquido)</div>
                  <div className="value" style={{ color: reportData.resumoFinanceiro.lucroLiquido >= 0 ? '#16a34a' : '#dc2626' }}>
                    {formatCurrency(reportData.resumoFinanceiro.lucroLiquido)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                    Margem de Lucro: {reportData.resumoFinanceiro.margemLucro.toFixed(1)}% | {reportData.vendas.quantidade} veículos vendidos
                  </div>
                </div>

                {/* Resumo Financeiro Executivo */}
                <div className="section">
                  <div className="section-title">Resumo Financeiro Executivo</div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Receita Total</div>
                      <div className="metric-value positive">{formatCurrency(reportData.resumoFinanceiro.receitaTotal)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Custo Total</div>
                      <div className="metric-value negative">{formatCurrency(reportData.resumoFinanceiro.custoTotal)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Valor Gasto em Aquisição</div>
                      <div className="metric-value">{formatCurrency(reportData.resumoFinanceiro.custoAquisicao)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Lucro Bruto</div>
                      <div className="metric-value positive">{formatCurrency(reportData.resumoFinanceiro.receitaTotal - reportData.resumoFinanceiro.custoAquisicao)}</div>
                    </div>
                  </div>
                </div>

                {/* Custos Detalhados */}
                <div className="section">
                  <div className="section-title">Custos Operacionais</div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Custo Operacional</div>
                      <div className="metric-value">{formatCurrency(reportData.resumoFinanceiro.custoOperacional)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Despesas Operacionais</div>
                      <div className="metric-value">{formatCurrency(reportData.resumoFinanceiro.despesasOperacionais)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Comissões (Total)</div>
                      <div className="metric-value">{formatCurrency(reportData.comissoes.total)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Comissões Pagas</div>
                      <div className="metric-value positive">{formatCurrency(reportData.comissoes.pagas)}</div>
                    </div>
                  </div>
                </div>

                {/* Vendas */}
                <div className="section">
                  <div className="section-title">Dados de Vendas</div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Quantidade de Vendas</div>
                      <div className="metric-value">{reportData.vendas.quantidade}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Receita de Vendas</div>
                      <div className="metric-value positive">{formatCurrency(reportData.vendas.receitaTotal)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Ticket Médio</div>
                      <div className="metric-value">{formatCurrency(reportData.vendas.ticketMedio)}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Comissões Pendentes</div>
                      <div className="metric-value negative">{formatCurrency(reportData.comissoes.aPagar)}</div>
                    </div>
                  </div>
                </div>

                {/* Contas Financeiras */}
                <div className="section">
                  <div className="section-title">Contas Financeiras</div>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-label">Contas Pagas (a Pagar)</div>
                      <div className="metric-value negative">{formatCurrency(reportData.contasPagar.total)}</div>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '3px' }}>{reportData.contasPagar.quantidade} contas</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Contas Recebidas (a Receber)</div>
                      <div className="metric-value positive">{formatCurrency(reportData.contasReceber.total)}</div>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '3px' }}>{reportData.contasReceber.quantidade} contas</div>
                    </div>
                  </div>
                </div>

                {/* Custos por Categoria */}
                {reportData.custosPorCategoria.length > 0 && (
                  <div className="section">
                    <div className="section-title">Custos por Categoria</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th className="text-right">Quantidade</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.custosPorCategoria.map((cat, idx) => (
                          <tr key={idx}>
                            <td>{cat.categoria}</td>
                            <td className="text-right">{cat.quantidade}</td>
                            <td className="text-right">{formatCurrency(cat.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Ranking de Vendedores */}
                {reportData.rankingVendedores.length > 0 && (
                  <div className="section">
                    <div className="section-title">Ranking de Vendedores</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Vendedor</th>
                          <th className="text-right">Vendas</th>
                          <th className="text-right">Receita</th>
                          <th className="text-right">Comissão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.rankingVendedores.map((vendor, idx) => (
                          <tr key={idx}>
                            <td>{vendor.nome}</td>
                            <td className="text-right">{vendor.vendas}</td>
                            <td className="text-right">{formatCurrency(vendor.receita)}</td>
                            <td className="text-right">{formatCurrency(vendor.comissao)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                <div className="footer">
                  <p>Relatório confidencial - VeloStock Sistema de Gestão de Revenda</p>
                  <p>Este documento foi gerado automaticamente pelo sistema</p>
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
