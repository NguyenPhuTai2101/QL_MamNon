"use client";

import React, { useEffect, useState } from "react";
import Portal from "@/components/portal";
import { CheckCircle2, AlertTriangle, Trash2, X, Info, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastState {
  id?: string;
  type: "success" | "error" | "delete" | "info";
  title?: string;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: ToastState | null;
  onClose: () => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  const [progress, setProgress] = useState(100);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!toast) return;
    setProgress(100);
    const duration = toast.duration || 3500;

    const dismissTimer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isDelete = toast.type === "delete";
  const isError = toast.type === "error";

  return (
    <Portal>
      <div className="fixed bottom-6 right-6 z-50 animate-toast max-w-sm w-full pointer-events-auto">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl shadow-2xl border p-4 text-slate-900 bg-white/95 backdrop-blur-md transition-all",
            isSuccess && "border-emerald-200 shadow-emerald-500/10",
            isDelete && "border-rose-200 shadow-rose-500/10",
            isError && "border-red-200 shadow-red-500/15",
            !isSuccess && !isDelete && !isError && "border-indigo-200 shadow-indigo-500/10"
          )}
        >
          {/* Top accent glow line */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1",
              isSuccess && "bg-gradient-to-r from-emerald-500 to-teal-400",
              isDelete && "bg-gradient-to-r from-rose-500 to-red-400",
              isError && "bg-gradient-to-r from-red-600 to-rose-500",
              !isSuccess && !isDelete && !isError && "bg-gradient-to-r from-indigo-500 to-purple-400"
            )}
          />

          <div className="flex items-start gap-3 pt-1">
            <div
              className={cn(
                "p-2 rounded-xl shrink-0 text-white shadow-sm",
                isSuccess && "bg-emerald-600 shadow-emerald-600/30",
                isDelete && "bg-rose-600 shadow-rose-600/30",
                isError && "bg-red-600 shadow-red-600/30",
                !isSuccess && !isDelete && !isError && "bg-indigo-600 shadow-indigo-600/30"
              )}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {isDelete && <Trash2 className="w-5 h-5" />}
              {isError && <AlertTriangle className="w-5 h-5" />}
              {!isSuccess && !isDelete && !isError && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1 pr-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {toast.title || (isSuccess ? "Thành công" : isDelete ? "Đã xóa mục" : isError ? "Lỗi thao tác" : "Thông báo")}
              </h4>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Progress Countdown Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
            <div
              className={cn(
                "h-full transition-all duration-75 ease-linear",
                isSuccess && "bg-emerald-500",
                isDelete && "bg-rose-500",
                isError && "bg-red-500",
                !isSuccess && !isDelete && !isError && "bg-indigo-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title = "Xác nhận xóa dữ liệu",
  itemName,
  itemType = "mục này",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-backdrop">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 animate-modal-content space-y-4 relative overflow-hidden">
          {/* Top Danger Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner shrink-0 border border-rose-100">
              <Trash2 className="w-6 h-6 animate-bounce-soft" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs text-slate-700 font-medium leading-relaxed">
            Bạn có chắc chắn muốn xóa {itemType} <strong className="text-rose-700 font-black">"{itemName}"</strong> khỏi hệ thống CSDL không?
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Xác nhận xóa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
