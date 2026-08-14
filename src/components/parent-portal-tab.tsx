"use client";

import React, { useState, useEffect } from "react";
import VietQRModal from "@/components/vietqr-modal";
import { 
  HeartHandshake, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  CreditCard, 
  CalendarDays, 
  HeartPulse, 
  Phone, 
  UserCheck, 
  QrCode, 
  ShieldCheck,
  Bell,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StudentDetail {
  id: string;
  name: string;
  className: string;
  teacherName: string;
  birthDate: string;
  gender: string;
  tuitionAmount: number;
  tuitionStatus: "PAID" | "UNPAID" | "OVERDUE";
  heightCm: number;
  weightKg: number;
  allergies: string;
  attendanceToday: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT";
  pickupPerson: string;
  healthNotes: string;
}

export default function ParentPortalTab() {
  const [parentName, setParentName] = useState("Phụ huynh");
  const [child, setChild] = useState<StudentDetail>({
    id: "",
    name: "Đang tải dữ liệu học sinh...",
    className: "---",
    teacherName: "Chưa phân công",
    birthDate: "---",
    gender: "---",
    tuitionAmount: 0,
    tuitionStatus: "UNPAID",
    heightCm: 0,
    weightKg: 0,
    allergies: "Không có",
    attendanceToday: "PRESENT",
    pickupPerson: "Chưa đăng ký",
    healthNotes: "Chưa có ghi chú"
  });

  const [pickupInput, setPickupInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [savedPickup, setSavedPickup] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.name) setParentName(parsed.name);
      } catch (e) {}
    }

    // Tải dữ liệu con từ DB API
    fetch("/api/students")
      .then(res => res.json())
      .then(dbStudents => {
        if (Array.isArray(dbStudents) && dbStudents.length > 0) {
          const st = dbStudents[0];
          const studentObj: StudentDetail = {
            id: st.id,
            name: `${st.lastName} ${st.firstName}`.trim(),
            className: st.class?.name || "Chưa xếp lớp",
            teacherName: st.class?.teacher || "Cô giáo chủ nhiệm",
            birthDate: st.birthDate ? new Date(st.birthDate).toLocaleDateString("vi-VN") : "---",
            gender: st.gender || "Nam",
            tuitionAmount: st.invoices && st.invoices.length > 0 ? st.invoices[0].amount : 3200000,
            tuitionStatus: st.invoices && st.invoices.length > 0 ? st.invoices[0].status : "UNPAID",
            heightCm: st.healthRecords && st.healthRecords.length > 0 ? st.healthRecords[0].heightCm || 0 : 0,
            weightKg: st.healthRecords && st.healthRecords.length > 0 ? st.healthRecords[0].weightKg || 0 : 0,
            allergies: st.healthRecords && st.healthRecords.length > 0 ? st.healthRecords[0].allergies || "Không có" : "Không có",
            attendanceToday: "PRESENT",
            pickupPerson: st.parentName || "Phụ huynh",
            healthNotes: "Bình thường"
          };
          setChild(studentObj);
          setPickupInput(studentObj.pickupPerson);
          setNotesInput(studentObj.healthNotes);
        } else {
          setChild(prev => ({ ...prev, name: "Chưa có hồ sơ học sinh trong CSDL" }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePickup = (e: React.FormEvent) => {
    e.preventDefault();
    setChild(prev => ({ ...prev, pickupPerson: pickupInput, healthNotes: notesInput }));
    setSavedPickup(true);
    setTimeout(() => setSavedPickup(false), 3000);
  };

  const todayStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome Banner for Parent */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-600/15">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-3xl -skew-x-12 transform translate-x-8" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Cổng Phụ Huynh Mầm Non NVSOFT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Xin chào {parentName}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium max-w-xl">
              Theo dõi tình hình điểm danh, nhật ký học tập, sức khỏe và thực đơn dinh dưỡng hàng ngày của bé <strong className="text-white underline">{child.name}</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black text-base shadow-md">
              {child.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">{child.name}</h3>
              <span className="text-xs text-indigo-200 font-bold bg-indigo-500/40 px-2 py-0.5 rounded-md">
                Lớp {child.className}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Kid Info & Attendance & Pickup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Kid Profile & Health Overview */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" /> Hồ sơ Thông tin của Bé
              </h3>
              <span className="text-xs font-bold text-slate-400">Năm học 2026-2027</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ngày sinh</span>
                <strong className="text-slate-900 text-sm mt-0.5 block">{child.birthDate}</strong>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Giới tính</span>
                <strong className="text-slate-900 text-sm mt-0.5 block">{child.gender}</strong>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chiều cao</span>
                <strong className="text-indigo-600 text-sm mt-0.5 block">{child.heightCm} cm</strong>
              </div>
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cân nặng</span>
                <strong className="text-emerald-600 text-sm mt-0.5 block">{child.weightKg} kg</strong>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Giáo viên chủ nhiệm phụ trách:</span>
                  <strong className="text-slate-900 font-bold">{child.teacherName}</strong>
                </div>
              </div>
              <a
                href={`tel:0987654321`}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Gọi cô
              </a>
            </div>
          </div>

          {/* Card 2: Attendance & Pickup Registration */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" /> Nhật ký Điểm danh & Đón trẻ
                </h3>
                <span className="text-xs text-slate-400 font-medium mt-0.5 block capitalize">{todayStr}</span>
              </div>
              <span className="badge-pill badge-pill-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bé đã có mặt tại lớp
              </span>
            </div>

            {savedPickup && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã lưu thông tin người đón bé và dặn dò thành công tới cô giáo!
              </div>
            )}

            <form onSubmit={handleSavePickup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Đăng ký người đón bé chiều nay
                  </label>
                  <input
                    type="text"
                    value={pickupInput}
                    onChange={(e) => setPickupInput(e.target.value)}
                    placeholder="Vd: Mẹ (Nguyễn Thị Mai) - 0912..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Lời nhắn / Ghi chú sức khỏe cho cô
                  </label>
                  <input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Vd: Nhờ cô cho bé uống thuốc sau ăn trưa..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Gửi lời nhắn & Lưu người đón</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Tuition VietQR & Daily Menu */}
        <div className="space-y-6">
          {/* Tuition & VietQR Payment Card */}
          <div className="glass-card p-6 space-y-4 border-l-4 border-l-indigo-600">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Học phí tháng 8/2026</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(child.tuitionAmount)}</h3>
              </div>
              <span className="badge-pill badge-pill-amber">
                <AlertCircle className="w-3.5 h-3.5" /> Chờ thanh toán
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Bao gồm học phí chính khóa, phí bán trú và tiền thực phẩm tháng 8.
            </p>

            <button
              onClick={() => setShowQRModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs px-4 py-3 rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Quét mã VietQR Thanh toán 1-Click</span>
            </button>
          </div>

          {/* Daily Menu Widget */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UtensilsCrossed className="w-5 h-5 text-indigo-600" /> Thực đơn ngày hôm nay
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bữa Sáng (07:30)</span>
                <strong className="text-slate-900 block mt-0.5">Súp gà ngô ngọt + Sữa tươi Vinamilk</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bữa Trưa (11:00)</span>
                <strong className="text-slate-900 block mt-0.5">Cơm trắng + Thịt kho trứng cút + Canh bí đỏ thịt băm</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bữa Xế Phụ (14:15)</span>
                <strong className="text-slate-900 block mt-0.5">Bánh su kem + Nước cam ép nguyên chất</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VietQR Modal */}
      {showQRModal && (
        <VietQRModal
          studentName={child.name}
          parentName={parentName}
          amount={child.tuitionAmount}
          onClose={() => setShowQRModal(false)}
          onConfirmPayment={() => {
            setChild(prev => ({ ...prev, tuitionStatus: "PAID" }));
            setShowQRModal(false);
          }}
        />
      )}
    </div>
  );
}
