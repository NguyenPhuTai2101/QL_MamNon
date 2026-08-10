"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Calendar, ChevronLeft, ChevronRight, Edit, Copy, Check, Calculator, Scale } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
    "week-30": {
      "Thứ Hai": { breakfast: "Cháo thịt bằm, Sữa tươi", lunch: "Cơm, Thịt kho, Canh bí đỏ, Rau cải", snack: "Chuối chín, Sữa đậu nành", cost: 30000 },
      "Thứ Ba": { breakfast: "Bún mọc heo, Sữa tươi", lunch: "Cơm trắng, Thịt gà kho gừng, Canh bí đỏ thịt băm", snack: "Sữa chua nếp cẩm", cost: 30000 },
      "Thứ Tư": { breakfast: "Súp hải sản, Sữa hạt điều", lunch: "Cơm trắng, Cá lóc kho tộ, Canh rêu bắp cải", snack: "Bánh flan, Nước dưa hấu", cost: 30000 },
      "Thứ Năm": { breakfast: "Cháo lươn Thanh Hóa, Sữa bắp", lunch: "Cơm trắng, Bò xào củ quả, Canh chua tôm", snack: "Chè hạt sen, Thanh long", cost: 30000 },
      "Thứ Sáu": { breakfast: "Phở bò truyền thống, Nước ép táo", lunch: "Cơm trắng, Sườn xào chua ngọt, Canh tôm mồng mồng", snack: "Váng sữa Monte", cost: 30000 },
    },
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState("Thứ Hai");
  const [editForm, setEditForm] = useState<MenuItem>({ breakfast: "", lunch: "", snack: "", cost: 30000 });

  const currentWeekInfo = weeksList[selectedWeekIndex];
  const currentWeekMenu = menuHistory[currentWeekInfo.id] || {};

  const handleCopyPreviousWeek = () => {
    if (selectedWeekIndex < weeksList.length - 1) {
      const prevWeekId = weeksList[selectedWeekIndex + 1].id;
      const prevMenu = menuHistory[prevWeekId];
      if (prevMenu) {
        setMenuHistory({
          ...menuHistory,
          [currentWeekInfo.id]: JSON.parse(JSON.stringify(prevMenu))
        });
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 3000);
      }
    }
  };

  const handleOpenEdit = (day: string) => {
    setEditingDay(day);
    setEditForm(currentWeekMenu[day] || { breakfast: "", lunch: "", snack: "", cost: 30000 });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuHistory({
      ...menuHistory,
      [currentWeekInfo.id]: {
        ...currentWeekMenu,
        [editingDay]: editForm
      }
    });
    setShowEditModal(false);
  };

  // Portion Calculation Logic (Exact formula from demo.docx Section 6)
  // Base for 1 child: Gạo: 85g (0.085kg), Thịt: 50g (0.05kg), Tôm: 15g (0.015kg), Rau cải: 20g (0.02kg), Bí đỏ: 30g (0.03kg), Chuối: 40g (0.04kg), Sữa: 360ml (0.36L)
  const calcIngredients = {
    gao: (portionStudentCount * 0.085).toFixed(1),
    thit: (portionStudentCount * 0.05).toFixed(1),
    tom: (portionStudentCount * 15).toFixed(0), // in grams
    rauCai: (portionStudentCount * 20).toFixed(0), // in grams
    biDo: (portionStudentCount * 30).toFixed(0), // in grams
    chuoi: (portionStudentCount * 40).toFixed(0), // in grams
    sua: (portionStudentCount * 0.36).toFixed(1), // in Liters
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Thực đơn & Định lượng Khẩu phần</h2>
          <p className="text-sm text-slate-500 mt-1">Lên lịch thực đơn tuần, in thực đơn và tự động tính định lượng nguyên liệu theo sĩ số trẻ đi học.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            In Thực đơn
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
        {Object.entries(currentWeekMenu).map(([day, menu]) => (
          <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="bg-slate-900 text-white p-3 text-center flex justify-between items-center">
              <span className="font-bold text-sm tracking-wide">{day}</span>
              <button
                onClick={() => handleOpenEdit(day)}
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
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">Bước 1: Chọn ngày</label>
            <input
              type="date"
              value={portionDate}
              onChange={(e) => setPortionDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">Chọn nhóm lớp</label>
            <select
              value={portionAgeGroup}
              onChange={(e) => setPortionAgeGroup(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none"
            >
              <option value="12-24T">Lớp 12 - 24 tháng (Nhà trẻ)</option>
              <option value="24-36T">Lớp 24 - 36 tháng</option>
              <option value="3-4T">Lớp 3 - 4 tuổi (Mầm)</option>
              <option value="4-5T">Lớp 4 - 5 tuổi (Chồi)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase">Trẻ đi học thực tế (Sĩ số)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={portionStudentCount}
              onChange={(e) => setPortionStudentCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-indigo-600 focus:outline-none"
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
              <span className="text-lg font-extrabold text-indigo-700">{calcIngredients.gao} kg</span>
            </div>
            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Thịt</span>
              <span className="text-lg font-extrabold text-rose-700">{calcIngredients.thit} kg</span>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Tôm</span>
              <span className="text-lg font-extrabold text-amber-700">{calcIngredients.tom} g</span>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Rau cải</span>
              <span className="text-lg font-extrabold text-emerald-700">{calcIngredients.rauCai} g</span>
            </div>
            <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Bí đỏ</span>
              <span className="text-lg font-extrabold text-orange-700">{calcIngredients.biDo} g</span>
            </div>
            <div className="bg-yellow-50/60 p-3 rounded-xl border border-yellow-100 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Chuối</span>
              <span className="text-lg font-extrabold text-yellow-700">{calcIngredients.chuoi} g</span>
            </div>
            <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Sữa</span>
              <span className="text-lg font-extrabold text-sky-700">{calcIngredients.sua} lít</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Meal Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
              Cập nhật Thực Đơn - {editingDay} ({currentWeekInfo.label.split(" ")[0]})
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bữa sáng</label>
                <input
                  type="text"
                  required
                  value={editForm.breakfast}
                  onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bữa trưa</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.lunch}
                  onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bữa xế (phụ)</label>
                <input
                  type="text"
                  required
                  value={editForm.snack}
                  onChange={(e) => setEditForm({ ...editForm, snack: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md text-xs"
                >
                  Lưu thực đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
