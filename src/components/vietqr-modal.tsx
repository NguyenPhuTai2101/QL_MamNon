"use client";

import React, { useState, useRef } from "react";
import Portal from "@/components/portal";
import { generateVietQRUrl } from "@/lib/vietqr";
import { formatCurrency } from "@/lib/utils";
import { QrCode, CheckCircle2, Copy, Printer, Download, X, User } from "lucide-react";

export interface BreakdownDetails {
  baseTuition?: number;      // Học phí
  semiBoarding?: number;     // Bán trú
  mealFee?: number;          // Tiền ăn
  facilityFee?: number;      // CSVC
  mathLogic?: number;        // Toán Tư Duy
  english?: number;          // Anh Văn
  rhythmDance?: number;      // Nhịp điệu
  leaveDays?: number;        // Tổng ngày phép
  refundMealFee?: number;    // Trả Tiền Ăn
  discountAmount?: number;   // Giảm % học phí
  discountPercent?: number;  // % giảm (VD: 10)
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
  breakdown?: BreakdownDetails;
  onClose: () => void;
  onConfirmPayment: () => void;
}

export default function VietQRModal({
  studentName,
  className = "Mầm 1",
  parentName = "Phụ huynh",
  amount,
  month = 8,
  year = 2025,
  issueDate = "03/08/2026",
  invoiceId = "HP-08",
  breakdown,
  onClose,
  onConfirmPayment
}: VietQRModalProps) {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const bankAccountNo = "6785 2715 78";
  const bankAccountNoRaw = "6785271578";
  const bankId = "TCB";
  const accountHolder = "HO KINH DOANH LOP MAM NON DOC LAP ANH BINH MINH";
  const schoolName = "Lớp Mầm non Độc lập Ánh Bình Minh";

  // Nội dung chuyển khoản theo chuẩn: "Họ tên bé + Tên lớp"
  const transferMemo = `HP ${studentName} ${className}`;

  // Chuẩn hóa breakdown chi tiết
  const defaultBreakdown: BreakdownDetails = {
    baseTuition: 1620000,
    semiBoarding: 400000,
    mealFee: 780000,
    facilityFee: 0,
    mathLogic: 0,
    english: 0,
    rhythmDance: 0,
    leaveDays: 0,
    refundMealFee: 0,
    discountAmount: 162000,
    discountPercent: 10,
  };

  const details = breakdown || defaultBreakdown;

  // Tính toán tổng cộng nếu không truyền amount
  const computedTotal = amount || (
    (details.baseTuition || 0) +
    (details.semiBoarding || 0) +
    (details.mealFee || 0) +
    (details.facilityFee || 0) +
    (details.mathLogic || 0) +
    (details.english || 0) +
    (details.rhythmDance || 0) -
    (details.refundMealFee || 0) -
    (details.discountAmount || 0)
  );

  const qrUrl = generateVietQRUrl({
    bankId: bankId,
    accountNo: bankAccountNoRaw,
    accountName: accountHolder,
    amount: computedTotal,
    memo: transferMemo
  });

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(`"${studentName} + ${className}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatItemValue = (val?: number) => {
    if (!val || val === 0) return "-";
    return val.toLocaleString("vi-VN");
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[96vh]">
          
          {/* Header Bar của Modal */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
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
                className="h-8 px-3 inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="In phiếu báo học phí này"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
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

          {/* Nội dung Phiếu Báo Học Phí (Khung viền tròn Cyan/Teal chuẩn theo mẫu hình ảnh của người dùng) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 flex justify-center items-center">
            
            <div
              ref={printRef}
              id="printable-tuition-receipt"
              className="w-full max-w-xl bg-white border-[2.5px] border-[#38bdf8] rounded-[36px] sm:rounded-[42px] p-6 sm:p-8 shadow-md relative print:border-2 print:border-teal-500 print:rounded-[36px] print:shadow-none print:m-0 print:p-6"
            >
              {/* Tiêu đề Đầu Phiếu */}
              <div className="text-center space-y-1 mb-6">
                <h1 className="text-lg sm:text-2xl font-bold text-[#356799] tracking-tight">
                  {schoolName}
                </h1>
                <h2 className="text-xl sm:text-3xl font-black text-[#2e9c4b] tracking-wider uppercase">
                  HỌC PHÍ THÁNG {month < 10 ? `0${month}` : month}/{year}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[#1b6b80]">
                  (Ngày {issueDate})
                </p>
              </div>

              {/* Bố cục 2 Cột: Bên Trái là Bóc tách Chi tiết, Bên Phải là Thẻ VietQR Khung Mầm Non */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* CỘT TRÁI (Bóc tách học phí) */}
                <div className="md:col-span-7 space-y-1.5 text-xs sm:text-[13px] text-slate-900 font-medium leading-relaxed pr-0 md:pr-2">
                  <div className="pb-1">
                    <span className="font-bold">Họ và Tên: </span>
                    <span className="font-black text-slate-950 uppercase tracking-wide">{studentName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Học phí:</span>
                    <span className="font-bold">{formatItemValue(details.baseTuition)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Bán trú:</span>
                    <span className="font-bold">{formatItemValue(details.semiBoarding)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tiền ăn:</span>
                    <span className="font-bold">{formatItemValue(details.mealFee)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>CSVC:</span>
                    <span className="font-bold">{formatItemValue(details.facilityFee)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Toán Tư Duy:</span>
                    <span className="font-bold">{formatItemValue(details.mathLogic)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Anh Văn:</span>
                    <span className="font-bold">{formatItemValue(details.english)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Nhịp điệu:</span>
                    <span className="font-bold">{formatItemValue(details.rhythmDance)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tổng ngày phép:</span>
                    <span className="font-bold">{details.leaveDays ? `${details.leaveDays} ngày` : "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Trả Tiền Ăn:</span>
                    <span className="font-bold">{formatItemValue(details.refundMealFee)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Giảm {details.discountPercent || 10}% học phí:</span>
                    <span className="font-bold">{formatItemValue(details.discountAmount)}</span>
                  </div>

                  {/* Dòng Tổng cộng */}
                  <div className="pt-2 mt-2 border-t border-slate-200/80 flex justify-between items-baseline">
                    <span className="text-base sm:text-lg font-black text-slate-950">Tổng Cộng:</span>
                    <span className="text-base sm:text-xl font-black text-slate-950">
                      {computedTotal.toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="pt-1 text-slate-800 text-[11px] sm:text-xs">
                    <span className="font-bold">Nội dung CK: </span>
                    <span className="font-semibold text-slate-900">"Họ tên bé + Tên lớp"</span>
                  </div>
                </div>

                {/* CỘT PHẢI (Thẻ VietQR viền hoạt họa Mầm Non Đẹp Mắt) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[240px] bg-white border-2 border-[#38bdf8] rounded-[28px] p-3.5 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                    
                    {/* Họa tiết Mầm non Trang trí Đầu Thẻ (Mặt trời, Cầu vồng, Mây) */}
                    <div className="w-full flex items-center justify-between px-1 mb-1">
                      {/* SVG Mặt trời cute */}
                      <svg className="w-6 h-6 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                        <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.17-6.83l-1.42 1.42M6.59 17.41l-1.42 1.42m0-12.83l1.42 1.42m10.82 10.82l1.42 1.42" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      </svg>

                      {/* Ngân hàng Techcombank */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black tracking-tighter text-[#da251c]">TECHCOMBANK</span>
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          {/* Logo Kim Cương Đỏ Techcombank */}
                          <div className="w-2.5 h-2.5 bg-[#da251c] rotate-45" />
                        </div>
                      </div>

                      {/* SVG Cầu vồng */}
                      <svg className="w-6 h-6" viewBox="0 0 32 32">
                        <path d="M4 24 A12 12 0 0 1 28 24" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                        <path d="M7 24 A9 9 0 0 1 25 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                        <path d="M10 24 A6 6 0 0 1 22 24" fill="none" stroke="#10b981" strokeWidth="2.5" />
                        <path d="M13 24 A3 3 0 0 1 19 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      </svg>
                    </div>

                    {/* Mã QR code Chính */}
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs my-1 w-full flex items-center justify-center">
                      <img
                        src={qrUrl}
                        alt={`Mã VietQR ${studentName}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                      />
                    </div>

                    {/* Dải logo VietQR + Napas 247 */}
                    <div className="flex items-center justify-center gap-2 mt-1 mb-1.5">
                      <span className="text-[9px] font-black text-[#005baa] uppercase tracking-wider">
                        VIET<span className="text-[#ed1c24]">QR</span>
                      </span>
                      <span className="text-[8px] text-slate-300">|</span>
                      <span className="text-[9px] font-extrabold text-[#0054a6] tracking-tight">
                        napas<span className="text-[#f68b1f]">247</span>
                      </span>
                    </div>

                    {/* Tên chủ tài khoản & Số tài khoản */}
                    <div className="space-y-0.5 w-full pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-[8.5px] font-bold text-slate-700 uppercase leading-tight">
                        <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{accountHolder}</span>
                      </div>
                      <div className="text-xs font-black text-slate-900 tracking-wider">
                        {bankAccountNo}
                      </div>
                    </div>

                    {/* Họa tiết Mầm non Chân Thẻ (Ngôi nhà trường & Cỏ hoa) */}
                    <div className="w-full flex items-center justify-between px-1 mt-1 text-[11px]">
                      {/* Ngôi trường mầm non */}
                      <span>🏫</span>
                      {/* Hoa cỏ mầm non */}
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
