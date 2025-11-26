import { getChecklistCategories, getChecklistItems, ChecklistData } from "@shared/checklistUtils";

// Logo VeloStock corrigida
const VELOSTOCK_LOGO = `
<svg viewBox="0 0 150 50" width="120" height="40" xmlns="http://www.w3.org/2000/svg">
  <!-- Círculos coloridos -->
  <circle cx="20" cy="15" r="7" fill="#6366f1"/>
  <circle cx="35" cy="10" r="7" fill="#10b981"/>
  <circle cx="48" cy="18" r="7" fill="#f472b6"/>
  <circle cx="38" cy="32" r="7" fill="#06b6d4"/>
  
  <!-- Texto VeloStock -->
  <text x="65" y="28" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333">
    <tspan fill="#6366f1">Velo</tspan><tspan fill="#10b981">Stock</tspan>
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
        .container {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 12mm;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000;
        }
        .logo {
          flex-shrink: 0;
          width: 100px;
        }
        .header-text h1 {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }
        .vehicle-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 8px;
          border: 2px solid #000;
          padding: 8px;
        }
        .info-field {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          font-size: 10px;
          margin-bottom: 1px;
        }
        .info-value {
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          min-height: 15px;
          font-size: 11px;
        }
        .section-title {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 5px;
          margin-top: 5px;
          padding-bottom: 3px;
          border-bottom: 1px solid #000;
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-size: 10px;
        }
        .checklist-columns {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 5px;
        }
        .checklist-section {
          page-break-inside: avoid;
        }
        .category-title {
          font-size: 9px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 2px 3px;
          margin-bottom: 3px;
          border: 1px solid #999;
        }
        .items-list {
          font-size: 9px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
          page-break-inside: avoid;
        }
        .checkbox {
          width: 12px;
          height: 12px;
          border: 1px solid #000;
          margin-right: 4px;
          flex-shrink: 0;
        }
        .item-label {
          flex: 1;
        }
        .item-line {
          border-bottom: 1px solid #999;
          flex: 2;
          margin-left: 2px;
        }
        .bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }
        .service-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8px;
          border: 1px solid #000;
        }
        .service-table th {
          border: 1px solid #000;
          padding: 2px;
          background: #f0f0f0;
          font-weight: bold;
          text-align: left;
        }
        .service-table td {
          border: 1px solid #000;
          padding: 1px 2px;
          height: 12px;
        }
        .obs-box {
          border: 1px solid #000;
          padding: 4px;
          min-height: 35px;
          background: white;
        }
        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
          font-size: 9px;
        }
        .footer-field {
          display: flex;
          flex-direction: column;
        }
        .footer-line {
          border-bottom: 1px solid #000;
          margin-bottom: 1px;
          min-height: 15px;
        }
        .footer-label {
          font-size: 8px;
          margin-top: 1px;
        }
        
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .container { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
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

        <div class="section-title">CHECKLIST DE INSPEÇÃO</div>

        <div class="checklist-columns">
          ${(Object.keys(categories) as Array<keyof typeof categories>)
            .map((category) => {
              const categoryItems = items[category] || [];
              return `
                <div class="checklist-section">
                  <div class="category-title">${categories[category]}</div>
                  <div class="items-list">
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
        </div>

        <div class="section-title">HISTÓRICO DE SERVIÇOS</div>
        <table class="service-table">
          <thead>
            <tr>
              <th style="width: 20%">Tipo de Serviço</th>
              <th style="width: 15%">Data</th>
              <th style="width: 15%">Local</th>
              <th style="width: 50%">Observações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td></td><td></td><td></td><td></td></tr>
            <tr><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>

        <div class="section-title">OBSERVAÇÕES GERAIS</div>
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
          html2pdf().set(opt).from(document.querySelector('.container')).save();
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
