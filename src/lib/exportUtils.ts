/**
 * Utility functions for exporting reports and data tables to native Excel (.xlsx) and PDF (Printable Document Window).
 * Formatted identically with official school header, report title, summary metadata, styled data table, and signatures.
 */

function formatFilenameToTitle(filename: string): string {
  if (filename.includes("Diem_Danh")) {
    return "BẢNG ĐIỂM DANH CHUYÊN CẦN HỌC SINH";
  }
  if (filename.includes("Danh_Sach_Thu_Hoc_Phi") || filename.includes("Hoc_Phi")) {
    return "BÁO CÁO THU HỌC PHÍ & BIỂU PHÍ HỌC SINH";
  }
  if (filename.includes("Danh_Sach_Hoc_Sinh")) {
    return "DANH SÁCH HỒ SƠ HỌC SINH TOÀN TRƯỜNG";
  }
  if (filename.includes("Thuc_Don")) {
    return "BẢNG THỰC ĐƠN DINH DƯỠNG TUẦN HỌC";
  }
  if (filename.includes("So_Thu_Chi")) {
    return "SỔ QUỸ THU CHI TÀI CHÍNH";
  }
  if (filename.includes("Chi_Phi_Bep")) {
    return "BÁO CÁO CHI PHÍ BẾP & KHO NGUYÊN LIỆU THỰC PHẨM";
  }
  if (filename.includes("Danh_Sach_Ho_So_Giao_Vien")) {
    return "DANH SÁCH HỒ SƠ NHÂN SỰ & GIÁO VIÊN";
  }
  if (filename.includes("Bang_Theo_Doi_Ngay_Cong")) {
    return "BẢNG THEO DÕI NGÀY CÔNG & BẢNG LƯƠNG NHÂN SỰ";
  }
  if (filename.includes("Bao_Cao_Doanh_Thu")) {
    return "BÁO CÁO TỔNG HỢP DOANH THU & THỐNG KÊ BI";
  }
  return filename.replace(/_/g, " ").toUpperCase();
}

/**
 * Xuất dữ liệu ra file Excel chuẩn định dạng .xlsx gốc (Native OpenXML):
 * - Không bị cảnh báo Extension Mismatch / Corrupted file của Microsoft Excel
 * - Có đầy đủ Header tên trường, mã chứng từ, ngày xuất
 * - Tiêu đề báo cáo nổi bật (Merged cells)
 * - Khung thông tin tổng hợp (Summary info)
 * - Bảng dữ liệu tự động căn chỉnh độ rộng cột
 * - Chân trang có ngày ký & 2 ô chữ ký Người lập + Ban giám hiệu
 */
export async function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][],
  summaryInfo?: { label: string; value: string }[],
  customTitle?: string
) {
  try {
    const XLSX = await import("xlsx");
    const dateStr = new Date().toLocaleDateString("vi-VN");
    const docCode = `BCO-${Date.now().toString().slice(-6)}`;
    const displayTitle = customTitle || formatFilenameToTitle(filename);
    const totalCols = Math.max(headers.length, 6);

    // 1. Tạo ma trận dữ liệu 2D cho Sheet
    const wsData: any[][] = [];

    // Hàng 1: Đơn vị & Mã chứng từ
    const row1 = new Array(totalCols).fill("");
    row1[0] = "TRƯỜNG MẦM NON NVSOFT";
    row1[totalCols - 2] = `Mã chứng từ: ${docCode}`;
    wsData.push(row1);

    // Hàng 2: Phụ đề & Ngày xuất
    const row2 = new Array(totalCols).fill("");
    row2[0] = "Hệ thống Quản lý ERP Mầm Non Chuyên Nghiệp";
    row2[totalCols - 2] = `Ngày xuất: ${dateStr}`;
    wsData.push(row2);

    // Hàng 3: Dòng trống
    wsData.push(new Array(totalCols).fill(""));

    // Hàng 4: Tiêu đề báo cáo
    const titleRowIndex = wsData.length;
    const rowTitle = new Array(totalCols).fill("");
    rowTitle[0] = displayTitle;
    wsData.push(rowTitle);

    // Hàng 5: Dòng trống
    wsData.push(new Array(totalCols).fill(""));

    // Hàng 6: Hộp thông tin tóm tắt (nếu có)
    let summaryRowIndex = -1;
    if (summaryInfo && summaryInfo.length > 0) {
      summaryRowIndex = wsData.length;
      const summaryText = summaryInfo.map((item) => `• ${item.label}: ${item.value}`).join("   |   ");
      const summaryRow = new Array(totalCols).fill("");
      summaryRow[0] = summaryText;
      wsData.push(summaryRow);
      wsData.push(new Array(totalCols).fill(""));
    }

    // Hàng 7: Tiêu đề cột dữ liệu
    wsData.push(headers);

    // Hàng 8...N: Dữ liệu chi tiết
    rows.forEach((row) => {
      wsData.push(row.map((cell) => (cell !== undefined && cell !== null ? cell : "")));
    });

    // Dòng trống cách chân trang
    wsData.push(new Array(totalCols).fill(""));

    // Dòng ngày tháng ký
    const dateRow = new Array(totalCols).fill("");
    const rightColIdx = Math.max(totalCols - 3, 2);
    dateRow[rightColIdx] = `......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`;
    wsData.push(dateRow);

    // Tiêu đề chữ ký
    const signTitleRow = new Array(totalCols).fill("");
    signTitleRow[0] = "NGƯỜI LẬP BÁO CÁO";
    signTitleRow[rightColIdx] = "BAN GIÁM HIỆU MẦM NON";
    wsData.push(signTitleRow);

    // Ghi chú chữ ký
    const signNoteRow = new Array(totalCols).fill("");
    signNoteRow[0] = "(Ký và ghi rõ họ tên)";
    signNoteRow[rightColIdx] = "(Ký tên & Đóng dấu)";
    wsData.push(signNoteRow);

    // 2. Chuyển đổi thành Worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 3. Thiết lập Merges (Gộp ô tiêu đề và tóm tắt)
    const merges: any[] = [
      { s: { r: titleRowIndex, c: 0 }, e: { r: titleRowIndex, c: totalCols - 1 } },
    ];
    if (summaryRowIndex >= 0) {
      merges.push({ s: { r: summaryRowIndex, c: 0 }, e: { r: summaryRowIndex, c: totalCols - 1 } });
    }
    ws["!merges"] = merges;

    // 4. Tự động tính toán độ rộng cột (Column Widths)
    const colWidths = headers.map((h, colIdx) => {
      let maxLen = h.length;
      rows.forEach((r) => {
        const val = String(r[colIdx] ?? "");
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 14), 45) };
    });
    ws["!cols"] = colWidths;

    // 5. Tạo Workbook và xuất file .xlsx
    const wb = XLSX.utils.book_new();
    const safeSheetName = (filename.slice(0, 28) || "BaoCao").replace(/[\/\\?*:[\]]/g, "_");
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    // Fallback sang CSV chuẩn UTF-8 nếu xảy ra lỗi
    const BOM = "\uFEFF";
    const escapeCsv = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvContent =
      BOM +
      headers.map(escapeCsv).join(",") +
      "\n" +
      rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
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
}

/**
 * In hoặc Xuất file PDF chuẩn A4 chuyên nghiệp
 */
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

  const summaryHtml =
    summaryInfo && summaryInfo.length > 0
      ? `
      <div style="margin-bottom: 20px; padding: 12px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
        ${summaryInfo
          .map(
            (item) =>
              `<div style="font-size: 13px; font-weight: bold; margin-bottom: 4px; color: #1e293b;">• ${item.label}: <span style="color: #4f46e5;">${item.value}</span></div>`
          )
          .join("")}
      </div>
    `
      : "";

  const tableHeadersHtml = headers
    .map(
      (h) =>
        `<th style="padding: 10px 8px; border: 1px solid #cbd5e1; background: #4f46e5; color: #ffffff; text-align: center; font-size: 12px; font-weight: bold;">${h}</th>`
    )
    .join("");

  const tableRowsHtml = rows
    .map(
      (row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      ${row
        .map((cell, cIdx) => {
          const isNum = typeof cell === "number";
          const align = isNum ? "right" : cIdx === 0 || String(cell).length <= 4 ? "center" : "left";
          return `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 12px; text-align: ${align};">${cell ?? ""}</td>`;
        })
        .join("")}
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 15px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 16px; }
        .school-info { text-align: left; }
        .school-name { font-size: 18px; font-weight: bold; color: #4338ca; text-transform: uppercase; }
        .school-sub { font-size: 12px; color: #64748b; margin-top: 3px; }
        .title { text-align: center; font-size: 18px; font-weight: bold; color: #1e1b4b; margin-bottom: 16px; text-transform: uppercase; padding: 10px; background: #e0e7ff; border-radius: 8px; border: 1px solid #c7d2fe; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .date-right { text-align: right; font-style: italic; font-size: 12px; color: #475569; margin-top: 30px; margin-bottom: 10px; }
        .footer { display: flex; justify-content: space-between; text-align: center; }
        .signature-box { width: 220px; }
        .signature-title { font-weight: bold; font-size: 13px; margin-bottom: 70px; color: #1e293b; }
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
          <div class="school-name">TRƯỜNG MẦM NON NVSOFT</div>
          <div class="school-sub">Hệ thống Quản lý ERP Mầm Non Chuyên Nghiệp</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          <div><b>Ngày xuất:</b> ${dateStr}</div>
          <div><b>Mã chứng từ:</b> BCO-${Date.now().toString().slice(-6)}</div>
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

      <div class="date-right">
        ......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
      </div>

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
