"use client";

import React, { useState } from "react";
import Portal from "@/components/portal";
import { generateVietQRUrl } from "@/lib/vietqr";
import { QrCode, CheckCircle2, Copy, Printer, X, User } from "lucide-react";

export interface BreakdownItem {
  name: string;
  amount: number;
  note?: string;
}

export interface BreakdownDetails {
  items?: BreakdownItem[];
  monthlyItems?: BreakdownItem[];
  oneTimeItems?: BreakdownItem[];
  baseTuition?: number;
  semiBoarding?: number;
  mealFee?: number;
  facilityFee?: number;
  mathLogic?: number;
  english?: number;
  rhythmDance?: number;
  leaveDays?: number;
  refundMealFee?: number;
  discountAmount?: number;
  discountPercent?: number;
}

interface VietQRModalProps {
  studentName: string;
  className?: string;
  parentName?: string;
  amount: number;
  month?: number;
  year?: number;
  issueDate?: string;
  invoiceId?: string;
  breakdown?: BreakdownDetails | any;
  onClose: () => void;
  onConfirmPayment: () => void;
}

export default function VietQRModal({
  studentName,
  className = "Mầm 1",
  amount,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear(),
  issueDate = new Date().toLocaleDateString("vi-VN"),
  breakdown,
  onClose,
  onConfirmPayment,
}: VietQRModalProps) {
  const [copied, setCopied] = useState(false);

  const bankAccountNo = "6785 2715 78";
  const bankAccountNoRaw = "6785271578";
  const bankId = "TCB";
  const accountHolder = "HO KINH DOANH LOP MAM NON DOC LAP ANH BINH MINH";
  const schoolName = "Lớp Mầm non Độc lập Ánh Bình Minh";

  // Nội dung chuyển khoản theo chuẩn: "Họ tên bé + Tên lớp"
  const transferMemo = `HP ${studentName} ${className}`;

  // Chuẩn hóa toàn bộ danh sách các mục thu thực tế của bé (Lọc bỏ các mục 0đ)
  let itemsList: BreakdownItem[] = [];

  if (breakdown && (Array.isArray(breakdown.monthlyItems) || Array.isArray(breakdown.items))) {
    const primary = breakdown.monthlyItems || breakdown.items || [];
    const oneTime = Array.isArray(breakdown.oneTimeItems) ? breakdown.oneTimeItems : [];
    itemsList = [...primary, ...oneTime]
      .filter((i: any) => i.amount && i.amount > 0)
      .map((i: any) => ({
        name: i.name,
        amount: i.amount,
        note: i.note,
      }));
  } else if (breakdown) {
    if (breakdown.baseTuition && breakdown.baseTuition > 0) itemsList.push({ name: "Học phí chính khóa", amount: breakdown.baseTuition });
    if (breakdown.semiBoarding && breakdown.semiBoarding > 0) itemsList.push({ name: "Tiền bán trú", amount: breakdown.semiBoarding });
    if (breakdown.mealFee && breakdown.mealFee > 0) itemsList.push({ name: "Tiền ăn", amount: breakdown.mealFee });
    if (breakdown.facilityFee && breakdown.facilityFee > 0) itemsList.push({ name: "Cơ sở vật chất", amount: breakdown.facilityFee });
    if (breakdown.mathLogic && breakdown.mathLogic > 0) itemsList.push({ name: "Toán Tư Duy", amount: breakdown.mathLogic });
    if (breakdown.english && breakdown.english > 0) itemsList.push({ name: "Anh Văn Cambridge", amount: breakdown.english });
    if (breakdown.rhythmDance && breakdown.rhythmDance > 0) itemsList.push({ name: "Nhịp điệu & Múa", amount: breakdown.rhythmDance });
  }

  // Fallback nếu không có mục nào
  if (itemsList.length === 0) {
    const mealEst = 990000;
    const baseEst = Math.max(0, (amount || 3200000) - mealEst);
    itemsList = [
      { name: "Học phí chính khóa", amount: baseEst },
      { name: "Tiền ăn bán trú (22 ngày)", amount: mealEst },
    ];
  }

  const discountAmount = breakdown?.discountAmount || 0;
  const discountPercent = breakdown?.discountPercent || 0;
  const refundMealFee = breakdown?.refundMealFee || 0;
  const leaveDays = breakdown?.leaveDays || 0;

  // Tính toán tổng cộng
  const rawSum = itemsList.reduce((sum, item) => sum + item.amount, 0);
  const computedTotal = amount > 0 ? amount : Math.max(0, rawSum - discountAmount - refundMealFee);

  const qrUrl = generateVietQRUrl({
    bankId: bankId,
    accountNo: bankAccountNoRaw,
    accountName: accountHolder,
    amount: computedTotal,
    memo: transferMemo,
  });

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(`"${studentName} + ${className}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // In Dọc (Portrait) chuẩn đẹp, chiếm trọn trang in cân đối
  const handlePrint = () => {
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const itemsHtml = itemsList
      .map(
        (item) => `
        <div class="row-item">
          <span class="item-name">${item.name}</span>
          <span class="row-item-val">${item.amount.toLocaleString("vi-VN")} đ</span>
        </div>
      `
      )
      .join("");

    const discountHtml =
      discountAmount > 0
        ? `
        <div class="row-item text-danger">
          <span>Giảm ${discountPercent > 0 ? `${discountPercent}%` : ""} học phí:</span>
          <span class="row-item-val">-${discountAmount.toLocaleString("vi-VN")} đ</span>
        </div>
      `
        : "";

    const refundHtml =
      refundMealFee > 0
        ? `
        <div class="row-item text-danger">
          <span>Hoàn trả tiền ăn (${leaveDays ? `${leaveDays} ngày` : ""}):</span>
          <span class="row-item-val">-${refundMealFee.toLocaleString("vi-VN")} đ</span>
        </div>
      `
        : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu Báo Học Phí - ${studentName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: portrait;
              margin: 8mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, -apple-system, BlinkMacSystemFont;
              background: #ffffff;
              color: #0f172a;
              padding: 0;
              margin: 0;
              display: flex;
              justify-content: center;
              width: 100%;
            }
            .receipt-card {
              width: 100%;
              max-width: 820px;
              border: 3.5px solid #38bdf8;
              border-radius: 40px;
              padding: 28px 36px;
              background: #ffffff;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .header-school {
              text-align: center;
              font-size: 25px;
              font-weight: 700;
              color: #356799;
              margin-bottom: 3px;
            }
            .header-title {
              text-align: center;
              font-size: 30px;
              font-weight: 900;
              color: #2e9c4b;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              margin-bottom: 3px;
            }
            .header-date {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              color: #1b6b80;
              margin-bottom: 12px;
            }
            .student-info {
              margin-bottom: 10px;
              font-size: 20.5px;
              padding-bottom: 10px;
              border-bottom: 2.5px dashed #cbd5e1;
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }
            .student-name {
              font-weight: 900;
              text-transform: uppercase;
              color: #000000;
              font-size: 22px;
            }
            .items-container {
              display: flex;
              flex-direction: column;
              gap: 6px;
              margin-bottom: 10px;
            }
            .row-item {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              font-size: 20px;
              color: #1e293b;
              line-height: 1.45;
            }
            .item-name {
              font-weight: 500;
              color: #334155;
            }
            .row-item-val {
              font-weight: 700;
              color: #0f172a;
              white-space: nowrap;
              margin-left: 12px;
              font-size: 21px;
            }
            .text-danger {
              color: #dc2626 !important;
              font-weight: 600;
            }
            .row-total {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 3px solid #0f172a;
            }
            .total-text {
              font-size: 23.5px;
              font-weight: 900;
              color: #000000;
              text-transform: uppercase;
            }
            .total-num {
              font-size: 28px;
              font-weight: 900;
              color: #000000;
            }
            .row-memo {
              font-size: 17.5px;
              color: #334155;
              padding-top: 4px;
              padding-bottom: 10px;
              border-bottom: 2.5px dashed #cbd5e1;
            }
            .qr-section {
              display: flex;
              justify-content: center;
              margin-top: 10px;
            }
            .qr-box {
              width: 100%;
              max-width: 295px;
              border: 2.5px solid #38bdf8;
              border-radius: 28px;
              padding: 10px 14px;
              text-align: center;
              background: #ffffff;
            }
            .qr-box-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 3px;
              font-size: 14px;
            }
            .tcb-brand {
              font-size: 13.5px;
              font-weight: 900;
              color: #da251c;
            }
            .qr-img-wrapper {
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              padding: 5px;
              margin: 5px 0;
              display: flex;
              justify-content: center;
            }
            .qr-img-wrapper img {
              width: 200px;
              height: 200px;
              object-fit: contain;
            }
            .qr-sub-logos {
              font-size: 13px;
              font-weight: 900;
              color: #005baa;
              margin: 2px 0;
            }
            .qr-acc-name {
              font-size: 11.5px;
              font-weight: 700;
              color: #334155;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-acc-no {
              font-size: 17px;
              font-weight: 900;
              color: #000000;
              letter-spacing: 0.6px;
              margin-top: 1px;
            }
            .qr-box-footer {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header-school">${schoolName}</div>
            <div class="header-title">HỌC PHÍ THÁNG ${month < 10 ? `0${month}` : month}/${year}</div>
            <div class="header-date">(Ngày ${issueDate})</div>

            <div class="student-info">
              <div><strong>Họ và Tên: </strong><span class="student-name">${studentName}</span></div>
              <div><strong>Lớp: </strong><span style="font-weight:700;">${className}</span></div>
            </div>

            <div class="items-container">
              ${itemsHtml}
              ${discountHtml}
              ${refundHtml}
            </div>

            <div class="row-total">
              <span class="total-text">Tổng Cộng:</span>
              <span class="total-num">${computedTotal.toLocaleString("vi-VN")} đ</span>
            </div>

            <div class="row-memo">
              <strong>Nội dung CK: </strong><span>"${studentName} + ${className}"</span>
            </div>

            <div class="qr-section">
              <div class="qr-box">
                <div class="qr-box-header">
                  <span>☀️</span>
                  <div style="display:flex; align-items:center; gap:2px;">
                    <span class="tcb-brand">TECHCOMBANK</span>
                    <span style="display:inline-block; width:5px; height:5px; background:#da251c; transform:rotate(45deg);"></span>
                  </div>
                  <span>🌈</span>
                </div>

                <div class="qr-img-wrapper">
                  <img src="${qrUrl}" alt="VietQR" />
                </div>

                <div class="qr-sub-logos">
                  <span>VIET<span style="color:#ed1c24;">QR</span></span>
                  <span style="color:#cbd5e1; margin:0 2px;">|</span>
                  <span>napas<span style="color:#f68b1f;">247</span></span>
                </div>

                <div class="qr-acc-name">${accountHolder}</div>
                <div class="qr-acc-no">${bankAccountNo}</div>

                <div class="qr-box-footer">
                  <span>🏫</span>
                  <span>🌱🌸🌼</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 400);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[95vh]">
          {/* Header Bar của Modal */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 shrink-0 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Phiếu Báo Học Phí & Mã VietQR</h3>
                <p className="text-[11px] text-slate-500 font-medium">Lớp Mầm non Độc lập Ánh Bình Minh</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="h-8 px-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Bấm để in phiếu báo học phí"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nội dung Phiếu Báo Học Phí hiển thị trên màn hình: 2 Cột Cân Đối, Không Scroll, Mã QR To Rõ Ràng */}
          <div className="p-5 sm:p-6 bg-slate-100/60 flex justify-center items-center overflow-y-auto">
            <div
              id="printable-tuition-receipt"
              className="w-full bg-white border-[2px] border-[#38bdf8] rounded-[28px] p-5 sm:p-6 shadow-md relative"
            >
              {/* Tiêu đề Đầu Phiếu */}
              <div className="text-center space-y-0.5 mb-4">
                <h1 className="text-base sm:text-lg font-bold text-[#356799] tracking-tight">
                  {schoolName}
                </h1>
                <h2 className="text-lg sm:text-xl font-black text-[#2e9c4b] tracking-wider uppercase">
                  HỌC PHÍ THÁNG {month < 10 ? `0${month}` : month}/{year}
                </h2>
                <p className="text-xs font-bold text-[#1b6b80]">(Ngày {issueDate})</p>
              </div>

              {/* Bố cục 2 Cột Rộng Rãi: Trái là Danh Sách Mục Thu, Phải là Thẻ VietQR To Rõ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* CỘT TRÁI (Danh sách tất cả các mục thu & Tổng tiền) */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-2 text-xs sm:text-[13px] text-slate-900 leading-relaxed pr-0 md:pr-2">
                  <div className="pb-1.5 border-b border-dashed border-slate-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-slate-500">Họ và Tên: </span>
                      <span className="font-black text-slate-950 uppercase">{studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Lớp: </span>
                      <span className="font-bold text-slate-800">{className}</span>
                    </div>
                  </div>

                  {/* Danh sách động các mục thu */}
                  <div className="space-y-1.5 py-1">
                    {itemsList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-700 font-medium">{item.name}:</span>
                        <span className="font-bold text-slate-900 shrink-0">
                          {item.amount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    ))}

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-baseline gap-2 text-rose-600 font-bold pt-1 border-t border-dashed border-slate-200">
                        <span>Giảm {discountPercent > 0 ? `${discountPercent}%` : ""} học phí:</span>
                        <span className="shrink-0">-{discountAmount.toLocaleString("vi-VN")} đ</span>
                      </div>
                    )}

                    {refundMealFee > 0 && (
                      <div className="flex justify-between items-baseline gap-2 text-rose-600 font-bold">
                        <span>Hoàn trả tiền ăn ({leaveDays ? `${leaveDays} ngày` : ""}):</span>
                        <span className="shrink-0">-{refundMealFee.toLocaleString("vi-VN")} đ</span>
                      </div>
                    )}
                  </div>

                  {/* Dòng Tổng cộng */}
                  <div className="pt-2 border-t-2 border-slate-950 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-black text-slate-950 uppercase">
                      Tổng Cộng:
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-950">
                      {computedTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="text-[11px] text-slate-700 pt-1">
                    <span className="font-bold">Nội dung CK: </span>
                    <span className="font-semibold text-slate-900">"{studentName} + {className}"</span>
                  </div>
                </div>

                {/* CỘT PHẢI (Thẻ VietQR To, Đẹp, Dễ Quét) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[240px] bg-white border-2 border-[#38bdf8] rounded-[24px] p-3.5 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                    <div className="w-full flex items-center justify-between px-1 mb-1">
                      <span className="text-sm">☀️</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black tracking-tighter text-[#da251c]">
                          TECHCOMBANK
                        </span>
                        <div className="w-3 h-3 bg-[#da251c] rotate-45" />
                      </div>
                      <span className="text-sm">🌈</span>
                    </div>

                    {/* Mã QR code To và Rõ */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs my-1 w-full flex items-center justify-center">
                      <img
                        src={qrUrl}
                        alt={`Mã VietQR ${studentName}`}
                        className="w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 my-1">
                      <span className="text-[9px] font-black text-[#005baa] uppercase tracking-wider">
                        VIET<span className="text-[#ed1c24]">QR</span>
                      </span>
                      <span className="text-[8px] text-slate-300">|</span>
                      <span className="text-[9px] font-extrabold text-[#0054a6]">
                        napas<span className="text-[#f68b1f]">247</span>
                      </span>
                    </div>

                    <div className="space-y-0.5 w-full pt-1 border-t border-slate-100">
                      <div className="text-[8.5px] font-bold text-slate-700 uppercase truncate">
                        {accountHolder}
                      </div>
                      <div className="text-xs font-black text-slate-900 tracking-wider">
                        {bankAccountNo}
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between px-1 mt-1 text-[11px]">
                      <span>🏫</span>
                      <span>🌱🌸🌼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <button
                onClick={handleCopyMemo}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border border-indigo-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Đã copy cú pháp CK!" : "Copy cú pháp CK"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onConfirmPayment}
                className="h-9 px-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận Đã thu tiền</span>
              </button>
              <button
                onClick={onClose}
                className="h-9 px-4 inline-flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
