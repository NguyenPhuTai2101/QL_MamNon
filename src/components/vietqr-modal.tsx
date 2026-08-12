"use client";

import React, { useState } from "react";
import Portal from "@/components/portal";
import { generateVietQRUrl } from "@/lib/vietqr";
import { formatCurrency } from "@/lib/utils";
import { QrCode, CheckCircle2, Copy, ShieldCheck, X } from "lucide-react";

interface VietQRModalProps {
  studentName: string;
  parentName: string;
  amount: number;
  invoiceId?: string;
  onClose: () => void;
  onConfirmPayment: () => void;
}

export default function VietQRModal({
  studentName,
  parentName,
  amount,
  invoiceId = "HP-2026-08",
  onClose,
  onConfirmPayment
}: VietQRModalProps) {
  const [copied, setCopied] = useState(false);
  const memo = `HOC PHI ${invoiceId} ${studentName}`;
  const bankAccountNo = "090123456789";
  const bankName = "MBBank (Ngân hàng Quân Đội)";
  const accountName = "TRUONG MAM NON NVSOFT";

  const qrUrl = generateVietQRUrl({
    bankId: "MB",
    accountNo: bankAccountNo,
    accountName: accountName,
    amount: amount,
    memo: memo
  });

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />
          
          {/* Top Header Ribbon & Close Button */}
          <div className="flex items-center justify-between p-6 pb-4 shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight">Thanh toán qua VietQR</h3>
                <p className="text-xs text-slate-500 mt-0.5">Dùng App Ngân hàng quét mã bên dưới</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 pt-4 space-y-5 overflow-y-auto flex-1">

          {/* QR Code Container (Compact & Crisp) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative">
            <img 
              src={qrUrl} 
              alt="Mã VietQR Thanh toán Học phí" 
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl shadow-md bg-white p-2"
            />
            <span className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tự động điền số tiền & nội dung chuyển khoản
            </span>
          </div>

          {/* Detailed Fee Breakdown Table (Section 3 in demo.docx) */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold">Học sinh / Lớp:</span>
              <span className="font-extrabold text-slate-800">{studentName}</span>
            </div>

            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between text-slate-600"><span>• Học phí cơ bản:</span><span>1.620.000 đ</span></div>
              <div className="flex justify-between text-slate-600"><span>• Tiền ăn (30k/ngày):</span><span>780.000 đ</span></div>
              <div className="flex justify-between text-slate-600"><span>• Phí bán trú:</span><span>400.000 đ</span></div>
              <div className="flex justify-between text-slate-600"><span>• Anh văn mầm non:</span><span>150.000 đ</span></div>
              <div className="flex justify-between text-slate-600"><span>• Toán tư duy:</span><span>100.000 đ</span></div>
              <div className="flex justify-between text-slate-600"><span>• Nhịp điệu & Múa:</span><span>150.000 đ</span></div>
              <div className="flex justify-between text-emerald-600 font-bold"><span>• Miễn giảm tháng đầu (10%):</span><span>-180.000 đ</span></div>
              <div className="flex justify-between text-purple-600 font-bold"><span>• Quà tặng:</span><span>1 Bộ Đồng phục</span></div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-700 font-bold">Tổng thanh toán:</span>
              <span className="font-extrabold text-indigo-600 text-base">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Copy memo section */}
          <div className="flex justify-between items-center bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 text-xs">
            <span className="text-slate-600 font-medium">Nội dung CK:</span>
            <button 
              onClick={handleCopyMemo}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-mono font-bold bg-white px-2 py-1 rounded-md transition-all shadow-sm"
            >
              {memo}
              <Copy className="w-3 h-3 text-indigo-600" />
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <button
              onClick={onConfirmPayment}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận Đã chuyển khoản thành công
            </button>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-2xl transition-colors text-xs"
            >
              Đóng cửa sổ
            </button>
          </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
