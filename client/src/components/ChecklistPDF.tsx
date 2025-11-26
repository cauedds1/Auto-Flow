import { getChecklistCategories, getChecklistItems, ChecklistData } from "@shared/checklistUtils";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateChecklistPDF(vehicle: any, checklist: ChecklistData) {
  const vehicleType = (vehicle?.vehicleType || "Carro") as "Carro" | "Moto";
  const categories = getChecklistCategories(vehicleType);
  const items = getChecklistItems(vehicleType);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Checklist - ${escapeHtml(vehicle.brand || '')} ${escapeHtml(vehicle.model || '')}</title>
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background: white;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 15mm 18mm;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: white;
        }
        
        /* HEADER / LOGO */
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .logo-icon {
          width: 48px;
          height: 48px;
          background: #a855f7;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-icon svg {
          width: 28px;
          height: 28px;
        }
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          letter-spacing: -0.5px;
        }
        .logo-text span {
          color: #22c55e;
        }
        .header-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* VEHICLE INFO SECTION */
        .vehicle-info-box {
          border: 1.5px solid #1f2937;
          margin-bottom: 20px;
        }
        .vehicle-info-header {
          font-weight: bold;
          font-size: 11px;
          background: #f3f4f6;
          padding: 8px 12px;
          border-bottom: 1px solid #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .vehicle-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }
        .vehicle-field {
          border-right: 1px solid #d1d5db;
          border-bottom: 1px solid #d1d5db;
          padding: 10px 12px;
          min-height: 42px;
        }
        .vehicle-field:nth-child(3n) {
          border-right: none;
        }
        .vehicle-field:nth-child(n+4) {
          border-bottom: none;
        }
        .vehicle-field-label {
          font-weight: bold;
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .vehicle-field-value {
          font-size: 13px;
          color: #1f2937;
          font-weight: 500;
        }
        
        /* CHECKLIST SECTION */
        .section-title {
          font-weight: bold;
          font-size: 12px;
          margin: 0 0 12px 0;
          padding-bottom: 6px;
          border-bottom: 2px solid #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .checklist-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .checklist-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .category-section {
          margin-bottom: 4px;
        }
        
        .category-header {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #e5e7eb;
          text-transform: uppercase;
          color: #374151;
        }
        
        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox {
          width: 14px;
          height: 14px;
          border: 1.5px solid #374151;
          flex-shrink: 0;
        }
        
        .item-text {
          font-size: 11px;
          color: #1f2937;
        }
        
        /* SERVICE HISTORY TABLE */
        .service-section {
          margin-bottom: 20px;
        }
        
        .service-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        
        .service-table th {
          background: #f3f4f6;
          border: 1px solid #1f2937;
          padding: 10px 8px;
          text-align: left;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10px;
        }
        
        .service-table td {
          border: 1px solid #d1d5db;
          padding: 14px 8px;
          min-height: 32px;
        }
        
        /* OBSERVATIONS */
        .obs-section {
          margin-bottom: 20px;
          flex-grow: 1;
        }
        
        .obs-box {
          border: 1.5px solid #1f2937;
          min-height: 100px;
          padding: 12px;
        }
        
        /* FOOTER */
        .footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: auto;
          padding-top: 30px;
        }
        
        .footer-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .footer-line {
          border-bottom: 1px solid #1f2937;
          height: 28px;
        }
        
        .footer-label {
          font-size: 11px;
          color: #374151;
          text-align: center;
        }
        
        .date-field .footer-label {
          text-align: left;
        }
        
        /* Print break rules */
        .vehicle-info-box,
        .category-section,
        .service-section,
        .service-table,
        .obs-section {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page { 
            margin: 0; 
            padding: 15mm 18mm;
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- HEADER COM LOGO -->
        <div class="header">
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17H21C21.27 17 21.5 16.89 21.71 16.71C21.9 16.5 22 16.27 22 16V14C22 12.9 21.1 12 20 12H18L16.5 9.5C16.17 8.9 15.53 8.5 14.83 8.5H9.17C8.47 8.5 7.83 8.9 7.5 9.5L6 12H4C2.9 12 2 12.9 2 14V16C2 16.27 2.1 16.5 2.29 16.71C2.5 16.89 2.73 17 3 17H5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="7" cy="17" r="2" stroke="white" stroke-width="2"/>
                <circle cx="17" cy="17" r="2" stroke="white" stroke-width="2"/>
              </svg>
            </div>
            <div class="logo-text">Velo<span>Stock</span></div>
          </div>
          <div class="header-title">Checklist de Inspeção de Veículos</div>
        </div>

        <!-- INFORMAÇÕES DO VEÍCULO -->
        <div class="vehicle-info-box">
          <div class="vehicle-info-header">Informações do Veículo</div>
          <div class="vehicle-info-grid">
            <div class="vehicle-field">
              <div class="vehicle-field-label">Marca:</div>
              <div class="vehicle-field-value">${escapeHtml(vehicle.brand || '')}</div>
            </div>
            <div class="vehicle-field">
              <div class="vehicle-field-label">Modelo:</div>
              <div class="vehicle-field-value">${escapeHtml(vehicle.model || '')}</div>
            </div>
            <div class="vehicle-field">
              <div class="vehicle-field-label">Ano:</div>
              <div class="vehicle-field-value">${escapeHtml(String(vehicle.year || ''))}</div>
            </div>
            <div class="vehicle-field">
              <div class="vehicle-field-label">Placa:</div>
              <div class="vehicle-field-value">${escapeHtml(vehicle.plate || '')}</div>
            </div>
            <div class="vehicle-field">
              <div class="vehicle-field-label">Cor:</div>
              <div class="vehicle-field-value">${escapeHtml(vehicle.color || '')}</div>
            </div>
            <div class="vehicle-field">
              <div class="vehicle-field-label">KM:</div>
              <div class="vehicle-field-value">${vehicle.kmOdometer ? escapeHtml(vehicle.kmOdometer.toLocaleString('pt-BR')) : ''}</div>
            </div>
          </div>
        </div>

        <!-- CHECKLIST DE INSPEÇÃO -->
        <div class="section-title">Checklist de Inspeção</div>
        <div class="checklist-container">
          <!-- Coluna Esquerda -->
          <div class="checklist-column">
            <!-- PNEUS -->
            <div class="category-section">
              <div class="category-header">${categories.pneus}</div>
              <div class="checkbox-list">
                ${(items.pneus || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- INTERIOR / BANCOS -->
            <div class="category-section">
              <div class="category-header">${categories.interior}</div>
              <div class="checkbox-list">
                ${(items.interior || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- LATARIA / PINTURA -->
            <div class="category-section">
              <div class="category-header">${categories.lataria}</div>
              <div class="checkbox-list">
                ${(items.lataria || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <!-- Coluna Direita -->
          <div class="checklist-column">
            <!-- SOM / ELÉTRICA -->
            <div class="category-section">
              <div class="category-header">${categories.somEletrica}</div>
              <div class="checkbox-list">
                ${(items.somEletrica || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- DOCUMENTAÇÃO -->
            <div class="category-section">
              <div class="category-header">${categories.documentacao}</div>
              <div class="checkbox-list">
                ${(items.documentacao || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- EQUIPAMENTOS DE SEGURANÇA -->
            <div class="category-section">
              <div class="category-header">${categories.equipamentos}</div>
              <div class="checkbox-list">
                ${(items.equipamentos || []).map(item => `
                  <div class="checkbox-item">
                    <div class="checkbox"></div>
                    <div class="item-text">${item}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- HISTÓRICO DE SERVIÇOS -->
        <div class="service-section">
          <div class="section-title">Histórico de Serviços</div>
          <table class="service-table">
            <thead>
              <tr>
                <th style="width: 30%">Tipo de Serviço</th>
                <th style="width: 15%">Data</th>
                <th style="width: 15%">Local</th>
                <th style="width: 40%">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <!-- OBSERVAÇÕES GERAIS -->
        <div class="obs-section">
          <div class="section-title">Observações Gerais</div>
          <div class="obs-box"></div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-field">
            <div class="footer-line"></div>
            <div class="footer-label">Responsável pela Inspeção</div>
          </div>
          <div class="footer-field date-field">
            <div class="footer-label">Data: ____/____/________</div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"></script>
      <script>
        window.onload = function() {
          const opt = {
            margin: 0,
            filename: 'checklist-${escapeHtml(vehicle.brand || '')}-${escapeHtml(vehicle.model || '')}-${escapeHtml(vehicle.plate || '')}.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              logging: false
            },
            jsPDF: { format: 'a4', orientation: 'portrait' }
          };
          html2pdf().set(opt).from(document.querySelector('.page')).save();
          setTimeout(() => window.close(), 2000);
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
