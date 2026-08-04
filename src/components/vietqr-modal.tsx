"use client";

import React, { useState } from "react";
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
    <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-100">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Thanh toán qua VietQR</h3>
          <p className="text-xs text-slate-500">Mở ứng dụng Ngân hàng (App Banking) bất kỳ để quét mã</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative">
          <img 
            src={qrUrl} 
            alt="Mã VietQR Thanh toán Học phí" 
            className="w-64 h-64 object-contain rounded-xl shadow-md bg-white p-2"
          />
          <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tự động điền số tiền và nội dung chuyển khoản
          </span>
        </div>

        {/* Details Box */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Học sinh:</span>
            <span className="font-bold text-slate-800">{studentName}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Số tiền học phí:</span>
            <span className="font-extrabold text-indigo-600 text-sm">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Tài khoản thụ hưởng:</span>
            <span className="font-semibold text-slate-700">{bankAccountNo} ({accountName})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Nội dung chuyển khoản:</span>
            <button 
              onClick={handleCopyMemo}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-mono font-bold bg-indigo-50 px-2 py-1 rounded-md"
            >
              {memo}
              <Copy className="w-3 h-3" />
            </button>
          </div>
          {copied && (
            <p className="text-[10px] text-emerald-600 font-semibold text-right">Đã sao chép nội dung!</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onConfirmPayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác nhận Đã chuyển khoản thành công
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors text-xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
