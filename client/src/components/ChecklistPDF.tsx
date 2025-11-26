import { getChecklistCategories, getChecklistItems, ChecklistData } from "@shared/checklistUtils";

// Logo VeloStock em SVG para facilitar a impressão
const VELOSTOCK_LOGO = `
<svg viewBox="0 0 120 40" width="100" height="33" xmlns="http://www.w3.org/2000/svg">
  <!-- Círculos coloridos -->
  <circle cx="15" cy="12" r="6" fill="#667eea"/>
  <circle cx="28" cy="8" r="6" fill="#52c41a"/>
  <circle cx="38" cy="15" r="6" fill="#ff7875"/>
  <circle cx="32" cy="26" r="6" fill="#faad14"/>
  
  <!-- Texto VeloStock -->
  <text x="50" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">
    <tspan fill="#667eea">Velo</tspan><tspan fill="#52c41a">Stock</tspan>
  </text>
</svg>
`;

export function generateChecklistPDF(vehicle: any, checklist: ChecklistData) {
  const vehicleType = (vehicle?.vehicleType || "Carro") as "Carro" | "Moto";
  const categories = getChecklistCategories(vehicleType);
  const items = getChecklistItems(vehicleType);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Checklist - ${vehicle.brand} ${vehicle.model}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background: white;
          color: #000;
        }
        .page {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
          page-break-after: always;
        }
        .page:last-child {
          page-break-after: avoid;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #000;
        }
        .logo {
          flex-shrink: 0;
        }
        .header-text h1 {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        .header-text p {
          font-size: 14px;
          color: #666;
        }
        .vehicle-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
          border: 2px solid #000;
          padding: 10px;
        }
        .info-field {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 2px;
        }
        .info-value {
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          min-height: 18px;
          font-size: 12px;
        }
        .section-header {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 8px;
          margin-top: 12px;
          padding-bottom: 5px;
          border-bottom: 2px solid #000;
        }
        .checklist-section {
          margin-bottom: 10px;
          page-break-inside: avoid;
        }
        .category-title {
          font-size: 11px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 4px;
          margin-bottom: 6px;
          border: 1px solid #999;
        }
        .items-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          font-size: 11px;
        }
        .checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid #000;
          margin-right: 6px;
          flex-shrink: 0;
        }
        .item-label {
          min-width: 80px;
        }
        .item-line {
          border-bottom: 1px solid #999;
          flex: 1;
          margin-left: 4px;
        }
        
        /* Tabela de Histórico */
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 11px;
        }
        .table th {
          border: 1px solid #000;
          padding: 6px;
          background: #f0f0f0;
          font-weight: bold;
          text-align: left;
        }
        .table td {
          border: 1px solid #000;
          padding: 8px 6px;
          min-height: 30px;
        }
        .table-row {
          page-break-inside: avoid;
        }
        
        /* Caixa de observações */
        .obs-box {
          border: 2px solid #000;
          padding: 10px;
          min-height: 80px;
          margin-bottom: 12px;
        }
        
        /* Footer */
        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
          font-size: 11px;
        }
        .footer-field {
          display: flex;
          flex-direction: column;
        }
        .footer-line {
          border-bottom: 1px solid #000;
          margin-bottom: 3px;
          min-height: 25px;
        }
        .footer-label {
          font-size: 10px;
          margin-top: 2px;
        }
        
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .page { margin: 0; padding: 15mm; }
        }
      </style>
    </head>
    <body>
      <!-- PÁGINA 1: CHECKLIST DE INSPEÇÃO -->
      <div class="page">
        <div class="header">
          <div class="logo">
            ${VELOSTOCK_LOGO}
          </div>
          <div class="header-text">
            <h1>Checklist de Inspeção de Veículos</h1>
          </div>
        </div>

        <div class="vehicle-info">
          <div class="info-field">
            <div class="info-label">MARCA:</div>
            <div class="info-value">${vehicle.brand || ''}</div>
          </div>
          <div class="info-field">
            <div class="info-label">MODELO:</div>
            <div class="info-value">${vehicle.model || ''}</div>
          </div>
          <div class="info-field">
            <div class="info-label">ANO:</div>
            <div class="info-value">${vehicle.year || ''}</div>
          </div>
          <div class="info-field">
            <div class="info-label">PLACA:</div>
            <div class="info-value">${vehicle.plate || ''}</div>
          </div>
          <div class="info-field">
            <div class="info-label">COR:</div>
            <div class="info-value">${vehicle.color || ''}</div>
          </div>
          <div class="info-field">
            <div class="info-label">KM:</div>
            <div class="info-value">${vehicle.kmOdometer ? vehicle.kmOdometer.toLocaleString('pt-BR') : ''}</div>
          </div>
        </div>

        <div class="section-header">CHECKLIST DE INSPEÇÃO</div>

        ${(Object.keys(categories) as Array<keyof typeof categories>)
          .map((category) => {
            const categoryItems = items[category] || [];
            return `
              <div class="checklist-section">
                <div class="category-title">${categories[category]}</div>
                <div class="items-grid">
                  ${categoryItems
                    .map(
                      (itemName) => `
                    <div class="checkbox-item">
                      <div class="checkbox"></div>
                      <div class="item-label">${itemName}</div>
                      <div class="item-line"></div>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `;
          })
          .join('')}

        <div class="footer">
          <div class="footer-field">
            <div>Responsável pela Inspeção:</div>
            <div class="footer-line"></div>
          </div>
          <div class="footer-field">
            <div>Data: ___/___/_____</div>
            <div class="footer-line"></div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 2: HISTÓRICO E OBSERVAÇÕES -->
      <div class="page">
        <div class="header">
          <div class="logo">
            ${VELOSTOCK_LOGO}
          </div>
          <div class="header-text">
            <h1>Histórico e Observações</h1>
          </div>
        </div>

        <div class="section-header">HISTÓRICO DE SERVIÇOS</div>
        <table class="table">
          <thead>
            <tr>
              <th style="width: 25%">Tipo de Serviço</th>
              <th style="width: 15%">Data</th>
              <th style="width: 20%">Local</th>
              <th style="width: 40%">Observações</th>
            </tr>
          </thead>
          <tbody>
            ${Array(4)
              .fill(null)
              .map(
                () => `
              <tr class="table-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="section-header">OBSERVAÇÕES GERAIS</div>
        <div class="obs-box"></div>

        <div class="footer">
          <div class="footer-field">
            <div>Responsável pela Inspeção:</div>
            <div class="footer-line"></div>
          </div>
          <div class="footer-field">
            <div>Data: ___/___/_____</div>
            <div class="footer-line"></div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          const opt = {
            margin: 0,
            filename: 'checklist-${vehicle.brand}-${vehicle.model}-${vehicle.plate}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'portrait' }
          };
          html2pdf().set(opt).from(document.body).save();
          setTimeout(() => window.close(), 1000);
        };
      </script>
    </body>
    </html>
  `;

  return html;
}

export async function downloadChecklistPDF(vehicle: any, checklist: ChecklistData) {
  try {
    const htmlContent = generateChecklistPDF(vehicle, checklist);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
