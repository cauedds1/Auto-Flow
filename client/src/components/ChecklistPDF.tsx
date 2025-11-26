import { getChecklistCategories, getChecklistItems, ChecklistData } from "@shared/checklistUtils";

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
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #000;
        }
        .container {
          max-width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #000;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #667eea;
        }
        .title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
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
          font-size: 12px;
          margin-bottom: 3px;
        }
        .info-value {
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
          min-height: 20px;
          font-size: 13px;
        }
        .checklist-section {
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          background: #f0f0f0;
          padding: 5px;
          margin-bottom: 8px;
          border-bottom: 2px solid #000;
        }
        .items-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          font-size: 12px;
        }
        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #000;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .item-label {
          flex: 1;
        }
        .item-line {
          border-bottom: 1px solid #999;
          flex: 1;
          margin-left: 5px;
        }
        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 30px;
          font-size: 12px;
        }
        .footer-field {
          display: flex;
          flex-direction: column;
        }
        .footer-line {
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
          min-height: 30px;
        }
        .footer-label {
          font-size: 11px;
          margin-top: 3px;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .container { max-width: 100%; height: auto; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">VeloStock</div>
          <div class="title">Checklist de Inspeção de Veículos</div>
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

        <div style="font-weight: bold; font-size: 13px; margin-bottom: 10px;">CHECKLIST DE INSPEÇÃO</div>

        ${(Object.keys(categories) as Array<keyof typeof categories>)
          .map((category) => {
            const categoryItems = items[category] || [];
            return `
              <div class="checklist-section">
                <div class="section-title">${categories[category]}</div>
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
