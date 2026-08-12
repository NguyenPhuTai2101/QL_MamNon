"use client";

import React, { useState } from "react";
import Portal from "@/components/portal";
import { UtensilsCrossed, Calendar, ChevronLeft, ChevronRight, Edit, Copy, Check, Calculator, Scale, X, Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface MenuItem {
  breakfast: string;
  lunch: string;
  snack: string;
  cost: number;
}

export default function MenuTab() {
  // Available weeks in history
  const weeksList = [
    { id: "week-32", label: "Tuần 32 (11/08/2026 - 17/08/2026)", isCurrent: false },
    { id: "week-31", label: "Tuần 31 [Hiện tại] (04/08/2026 - 10/08/2026)", isCurrent: true },
    { id: "week-30", label: "Tuần 30 [Tuần trước] (28/07/2026 - 03/08/2026)", isCurrent: false },
    { id: "week-29", label: "Tuần 29 (21/07/2026 - 27/07/2026)", isCurrent: false },
  ];

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Ingredient Proportion Calculator State (Mục 6 demo.docx)
  const [portionDate, setPortionDate] = useState("2026-08-03");
  const [portionAgeGroup, setPortionAgeGroup] = useState("12-24T");
  const [portionStudentCount, setPortionStudentCount] = useState(20);

  const [menuHistory, setMenuHistory] = useState<Record<string, Record<string, MenuItem>>>({
    "week-31": {
      "Thứ Hai": { breakfast: "Cháo thịt bằm, Sữa tươi", lunch: "Cơm, Thịt kho trứng, Canh bí đỏ, Rau cải", snack: "Chuối chín, Sữa đậu nành", cost: 30000 },
      "Thứ Ba": { breakfast: "Súp gà ngô ngọt, Sữa tươi", lunch: "Cơm trắng, Tôm ram thịt băm, Canh cải ngọt", snack: "Sữa chua, Trái cây mùa vụ", cost: 30000 },
      "Thứ Tư": { breakfast: "Bún bò viên, Sữa đậu nành", lunch: "Cơm trắng, Cá thu sốt cà, Canh khoai tây hầm xương", snack: "Chè đậu xanh, Nước dừa", cost: 30000 },
      "Thứ Năm": { breakfast: "Phở gà, Sữa bắp", lunch: "Cơm trắng, Trứng đúc thịt, Canh cải thảo tôm khô", snack: "Bánh pudding, Chuối chín", cost: 30000 },
      "Thứ Sáu": { breakfast: "Mì Ý sốt bò băm, Nước ép dứa", lunch: "Cơm trắng, Gà chiên nước mắm, Canh chua cá lóc", snack: "Váng sữa, Nho đen", cost: 30000 },
    },
  });

  const currentWeekInfo = weeksList[selectedWeekIndex];
  const currentMenu = menuHistory[currentWeekInfo.id] || {
    "Thứ Hai": { breakfast: "Cháo gà, Sữa tươi", lunch: "Cơm, Thịt bằm kho, Canh mồng tơi", snack: "Bánh bông lan, Sữa", cost: 30000 },
    "Thứ Ba": { breakfast: "Súp hải sản, Sữa tươi", lunch: "Cơm, Trứng chiên thịt, Canh rau ngót", snack: "Sữa chua, Táo", cost: 30000 },
    "Thứ Tư": { breakfast: "Bún riêu cua, Sữa đậu nành", lunch: "Cơm, Cá sốt cà, Canh bí xanh", snack: "Chè hạt sen", cost: 30000 },
    "Thứ Năm": { breakfast: "Phở bò, Sữa hạt", lunch: "Cơm, Thịt kho tàu, Canh cải cúc", snack: "Bánh quy, Dưa hấu", cost: 30000 },
    "Thứ Sáu": { breakfast: "Cháo tôm bí đỏ, Sữa tươi", lunch: "Cơm, Đậu phụ dồn thịt, Canh chua", snack: "Váng sữa, Cam", cost: 30000 },
  };

  const daysOfWeek = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu"];

  // Modal edit meal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState("");
  const [editForm, setEditForm] = useState<MenuItem>({ breakfast: "", lunch: "", snack: "", cost: 30000 });

  const handleOpenEditModal = (day: string) => {
    setEditingDay(day);
    setEditForm(currentMenu[day] || { breakfast: "", lunch: "", snack: "", cost: 30000 });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWeek = {
      ...currentMenu,
      [editingDay]: editForm,
    };
    setMenuHistory({
      ...menuHistory,
      [currentWeekInfo.id]: updatedWeek,
    });
    setShowEditModal(false);
  };

  const handleCopyPreviousWeek = () => {
    const prevWeekId = weeksList[selectedWeekIndex + 1]?.id || "week-31";
    const sourceMenu = menuHistory[prevWeekId] || menuHistory["week-31"];
    setMenuHistory({
      ...menuHistory,
      [currentWeekInfo.id]: { ...sourceMenu },
    });
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Calculated proportions for 20 kids (or dynamic count)
  const proportions = {
    gao: (portionStudentCount * 0.08).toFixed(1), // in kg
    thit: (portionStudentCount * 0.07).toFixed(1), // in kg
    rau: (portionStudentCount * 0.1).toFixed(1), // in kg
    chuoi: (portionStudentCount * 40).toFixed(0), // in grams
    sua: (portionStudentCount * 0.36).toFixed(1), // in Liters
  };

  const handleExportExcel = () => {
    const headers = ["Ngày", "Bữa sáng", "Bữa trưa chính", "Bữa xế (bữa phụ)", "Định mức (VNĐ/trẻ)"];
    const rows = daysOfWeek.map((day) => [
      day,
      currentMenu[day]?.breakfast || "---",
      currentMenu[day]?.lunch || "---",
      currentMenu[day]?.snack || "---",
      currentMenu[day]?.cost || 30000
    ]);
    exportToExcel(`Thuc_Don_Tuan_${currentWeekInfo.id}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["Ngày", "Bữa sáng", "Bữa trưa chính", "Bữa xế (bữa phụ)", "Định mức"];
    const rows = daysOfWeek.map((day) => [
      day,
      currentMenu[day]?.breakfast || "---",
      currentMenu[day]?.lunch || "---",
      currentMenu[day]?.snack || "---",
      formatCurrency(currentMenu[day]?.cost || 30000)
    ]);
    const summary = [
      { label: "Thời gian áp dụng", value: currentWeekInfo.label },
      { label: "Định lượng tính cho", value: `${portionStudentCount} trẻ (${portionAgeGroup})` }
    ];
    exportToPDF(`THỰC ĐƠN BÁN TRÚ TOÀN TRƯỜNG - ${currentWeekInfo.label.toUpperCase()}`, headers, rows, summary);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Thực đơn & Định lượng Khẩu phần</h2>
          <p className="text-sm text-slate-500 mt-1">Lên lịch thực đơn tuần, in thực đơn và tự động tính định lượng nguyên liệu theo sĩ số trẻ đi học.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="Xuất file Excel CSV"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            title="In PDF thực đơn"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            In PDF
          </button>
          <button
            onClick={handleCopyPreviousWeek}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Copy className="w-4 h-4 text-indigo-600" />
            Sao chép thực đơn tuần trước
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          Đã sao chép thành công thực đơn của tuần trước vào {currentWeekInfo.label}!
        </div>
      )}

      {/* Week Selector Navigator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            disabled={selectedWeekIndex >= weeksList.length - 1}
            onClick={() => setSelectedWeekIndex(prev => prev + 1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Tuần trước đó"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer"
            >
              {weeksList.map((w, idx) => (
                <option key={w.id} value={idx}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={selectedWeekIndex <= 0}
            onClick={() => setSelectedWeekIndex(prev => prev - 1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Tuần tiếp theo"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-indigo-50/50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100">
          Đơn giá bữa ăn cố định: <strong className="text-indigo-600 font-extrabold">30.000 VNĐ / trẻ / ngày</strong>
        </div>
      </div>

      {/* Weekly Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(currentMenu).map(([day, menu]: [string, MenuItem]) => (
          <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="bg-slate-900 text-white p-3 text-center flex justify-between items-center">
              <span className="font-bold text-sm tracking-wide">{day}</span>
              <button
                onClick={() => handleOpenEditModal(day)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Chỉnh sửa bữa ăn"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-3 flex-1 text-xs">
              <div>
                <span className="font-extrabold text-indigo-600 block uppercase tracking-wider text-[10px] mb-0.5">✓ Bữa sáng</span>
                <p className="text-slate-700 font-medium">{menu.breakfast}</p>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <span className="font-extrabold text-emerald-600 block uppercase tracking-wider text-[10px] mb-0.5">✓ Bữa trưa</span>
                <p className="text-slate-700 font-medium">{menu.lunch}</p>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <span className="font-extrabold text-amber-600 block uppercase tracking-wider text-[10px] mb-0.5">✓ Bữa xế</span>
                <p className="text-slate-700 font-medium">{menu.snack}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 border-t border-slate-100 text-center text-[11px] font-bold text-slate-600">
              Chi phí: <span className="text-indigo-600 font-extrabold">{formatCurrency(menu.cost)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 6 IN DEMO.DOCX: Tool Định Lượng Khẩu Phần Cho 1 Trẻ / Toàn Lớp */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Định Lượng Khẩu Phần Ăn Trong Ngày</h3>
              <p className="text-xs text-slate-500">Phần mềm tự động tính khối lượng nguyên liệu đi chợ theo sĩ số trẻ đi học thực tế</p>
            </div>
          </div>
        </div>

        {/* Step 1 & 2 Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bước 1: Chọn ngày</label>
            <input
              type="date"
              value={portionDate}
              onChange={(e) => setPortionDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Chọn nhóm lớp</label>
            <select
              value={portionAgeGroup}
              onChange={(e) => setPortionAgeGroup(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold cursor-pointer transition-all shadow-sm"
            >
              <option value="12-24T">Lớp 12 - 24 tháng (Nhà trẻ)</option>
              <option value="24-36T">Lớp 24 - 36 tháng</option>
              <option value="3-4T">Lớp 3 - 4 tuổi (Mầm)</option>
              <option value="4-5T">Lớp 4 - 5 tuổi (Chồi)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Trẻ đi học thực tế (Sĩ số)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={portionStudentCount}
              onChange={(e) => setPortionStudentCount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-indigo-600 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-extrabold transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Step 3: Auto Computed Ingredients Output Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> Bước 3: Phần mềm tự động tính Nguyên liệu cần đi chợ cho {portionStudentCount} trẻ
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Gạo</span>
              <span className="text-lg font-extrabold text-indigo-700">{proportions.gao} kg</span>
            </div>
            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Thịt</span>
              <span className="text-lg font-extrabold text-rose-700">{proportions.thit} kg</span>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Rau củ</span>
              <span className="text-lg font-extrabold text-amber-700">{proportions.rau} kg</span>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Chuối</span>
              <span className="text-lg font-extrabold text-emerald-700">{proportions.chuoi} g</span>
            </div>
            <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Sữa</span>
              <span className="text-lg font-extrabold text-sky-700">{proportions.sua} lít</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Meal Modal */}
      {showEditModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Cập Nhật Thực Đơn</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{editingDay} ({currentWeekInfo.label.split(" ")[0]})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bữa sáng</label>
                  <input
                    type="text"
                    required
                    value={editForm.breakfast}
                    onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                    placeholder="Cháo thịt bằm, Sữa tươi..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bữa trưa chính</label>
                  <textarea
                    rows={2}
                    required
                    value={editForm.lunch}
                    onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                    placeholder="Cơm, Thịt kho trứng, Canh bí đỏ..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bữa xế (bữa phụ)</label>
                  <input
                    type="text"
                    required
                    value={editForm.snack}
                    onChange={(e) => setEditForm({ ...editForm, snack: e.target.value })}
                    placeholder="Chuối, Sữa đậu nành..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    Lưu thay đổi thực đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
