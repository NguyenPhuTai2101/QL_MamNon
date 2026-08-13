/**
 * Utility functions for exporting reports and data tables to Excel (.csv UTF-8 BOM) and PDF (Printable Document Window).
 */

export function exportToExcel(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  // Add UTF-8 BOM for Microsoft Excel Vietnamese character support
  const BOM = "\uFEFF";
  
  const escapeCsvValue = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCsvValue).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");

  const csvContent = BOM + headerRow + "\n" + dataRows;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(
  reportTitle: string,
  headers: string[],
  rows: (string | number | undefined | null)[][],
  summaryInfo?: { label: string; value: string }[]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Vui lòng cho phép mở cửa sổ bật lên (popup) để in/xuất file PDF!");
    return;
  }

  const dateStr = new Date().toLocaleDateString("vi-VN");

  const summaryHtml = summaryInfo && summaryInfo.length > 0 
    ? `
      <div style="margin-bottom: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        ${summaryInfo.map(item => `<div style="font-size: 13px; font-weight: bold; margin-bottom: 4px; color: #1e293b;">• ${item.label}: <span style="color: #4f46e5;">${item.value}</span></div>`).join("")}
      </div>
    `
    : "";

  const tableHeadersHtml = headers.map(h => `<th style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; text-align: left; font-size: 12px;">${h}</th>`).join("");

  const tableRowsHtml = rows.map((row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      ${row.map(cell => `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 12px;">${cell ?? ""}</td>`).join("")}
    </tr>
  `).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 20px; }
        .school-info { text-align: left; }
        .school-name { font-size: 18px; font-weight: bold; color: #4338ca; text-transform: uppercase; }
        .school-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
        .title { text-align: center; font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 15px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
        .signature-box { width: 200px; }
        .signature-title { font-weight: bold; font-size: 13px; margin-bottom: 60px; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; text-align: right;">
        <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
          🖨️ In / Lưu thành file PDF
        </button>
      </div>

      <div class="header">
        <div class="school-info">
          <div class="school-name">TRƯỜNG MẦM NON</div>
          <div class="school-sub">Hệ thống Quản lý ERP Mầm Non Chuyên Nghiệp</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          <div>Ngày xuất báo cáo: ${dateStr}</div>
          <div>Mã chứng từ: BCO-${Date.now().toString().slice(-6)}</div>
        </div>
      </div>

      <div class="title">${reportTitle}</div>

      ${summaryHtml}

      <table>
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <div class="signature-box">
          <div class="signature-title">NGƯỜI LẬP BÁO CÁO</div>
          <div style="font-size: 12px; color: #94a3b8;">(Ký và ghi rõ họ tên)</div>
        </div>
        <div class="signature-box">
          <div class="signature-title">BAN GIÁM HIỆU MẦM NON</div>
          <div style="font-size: 12px; color: #94a3b8;">(Ký tên & Đóng dấu)</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
