"use client";

import React, { useState } from "react";
import { UtensilsCrossed, Calendar, ChevronLeft, ChevronRight, Edit, Copy, Check } from "lucide-react";
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

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1); // Default to Week 31 (Current)
  const [copiedNotification, setCopiedNotification] = useState(false);

  // History menu store indexed by week id
  const [menuHistory, setMenuHistory] = useState<Record<string, Record<string, MenuItem>>>({
    "week-31": {
      "Thứ Hai": { breakfast: "Cháo sườn heo, Sữa hạt sen", lunch: "Cơm trắng, Thịt kho trứng, Canh bí đao", snack: "Bánh bông lan, Nước cam", cost: 35000 },
      "Thứ Ba": { breakfast: "Súp gà ngô ngọt, Sữa tươi", lunch: "Cơm trắng, Tôm ram thịt băm, Canh cải ngọt", snack: "Sữa chua, Trái cây mùa vụ", cost: 38000 },
      "Thứ Tư": { breakfast: "Bún bò viên, Sữa đậu nành", lunch: "Cơm trắng, Cá thu sốt cà, Canh khoai tây hầm xương", snack: "Chè đậu xanh, Nước dừa", cost: 37000 },
      "Thứ Năm": { breakfast: "Phở gà, Sữa bắp", lunch: "Cơm trắng, Trứng đúc thịt, Canh cải thảo tôm khô", snack: "Bánh pudding, Chuối chín", cost: 36000 },
      "Thứ Sáu": { breakfast: "Mì Ý sốt bò băm, Nước ép dứa", lunch: "Cơm trắng, Gà chiên nước mắm, Canh chua cá lóc", snack: "Váng sữa, Nho đen", cost: 40000 },
    },
    "week-30": {
      "Thứ Hai": { breakfast: "Cháo tôm bí đỏ, Sữa hạt óc chó", lunch: "Cơm trắng, Thịt băm sốt cà, Canh rau ngót", snack: "Bánh su kem, Táo tây", cost: 34000 },
      "Thứ Ba": { breakfast: "Bún mọc heo, Sữa tươi", lunch: "Cơm trắng, Thịt gà kho gừng, Canh bí đỏ thịt băm", snack: "Sữa chua nếp cẩm", cost: 36000 },
      "Thứ Tư": { breakfast: "Súp hải sản, Sữa hạt điều", lunch: "Cơm trắng, Cá lóc kho tộ, Canh rêu bắp cải", snack: "Bánh flan, Nước dưa hấu", cost: 38000 },
      "Thứ Năm": { breakfast: "Cháo lươn Thanh Hóa, Sữa bắp", lunch: "Cơm trắng, Bò xào củ quả, Canh chua tôm", snack: "Chè hạt sen, Thanh long", cost: 39000 },
      "Thứ Sáu": { breakfast: "Phở bò truyền thống, Nước ép táo", lunch: "Cơm trắng, Sườn xào chua ngọt, Canh tôm mồng mồng", snack: "Váng sữa Monte", cost: 41000 },
    },
    "week-29": {
      "Thứ Hai": { breakfast: "Cháo gà nấm hương, Sữa tươi", lunch: "Cơm trắng, Thịt kho tàu, Canh ra ngót nấu thịt", snack: "Chè đậu đỏ, Quýt đường", cost: 35000 },
      "Thứ Ba": { breakfast: "Mì tôm thịt băm, Sữa đậu nành", lunch: "Cơm trắng, Trứng chiên thịt, Canh mướp đắng", snack: "Bánh mì ngọt, Nước cam", cost: 34000 },
      "Thứ Tư": { breakfast: "Bún gà nấm, Sữa hạt sen", lunch: "Cơm trắng, Thịt bò sốt vang, Canh khoai môn", snack: "Sữa chua uống, Chuối", cost: 37000 },
      "Thứ Năm": { breakfast: "Súp cua ngô non, Sữa bắp", lunch: "Cơm trắng, Chả lốt nướng, Canh rau cải tôm", snack: "Bánh cookie, Dưa hấu", cost: 36000 },
      "Thứ Sáu": { breakfast: "Cháo lợn băm, Nước ép ổi", lunch: "Cơm trắng, Cá diêu hồng chiên xù, Canh bầu", snack: "Váng sữa, Lê đường", cost: 38000 },
    },
    "week-32": {
      "Thứ Hai": { breakfast: "Cháo sườn heo, Sữa hạt sen", lunch: "Cơm trắng, Thịt kho trứng, Canh bí đao", snack: "Bánh bông lan, Nước cam", cost: 35000 },
      "Thứ Ba": { breakfast: "Súp gà ngô ngọt, Sữa tươi", lunch: "Cơm trắng, Tôm ram thịt băm, Canh cải ngọt", snack: "Sữa chua, Trái cây mùa vụ", cost: 38000 },
      "Thứ Tư": { breakfast: "Bún bò viên, Sữa đậu nành", lunch: "Cơm trắng, Cá thu sốt cà, Canh khoai tây hầm xương", snack: "Chè đậu xanh, Nước dừa", cost: 37000 },
      "Thứ Năm": { breakfast: "Phở gà, Sữa bắp", lunch: "Cơm trắng, Trứng đúc thịt, Canh cải thảo tôm khô", snack: "Bánh pudding, Chuối chín", cost: 36000 },
      "Thứ Sáu": { breakfast: "Mì Ý sốt bò băm, Nước ép dứa", lunch: "Cơm trắng, Gà chiên nước mắm, Canh chua cá lóc", snack: "Váng sữa, Nho đen", cost: 40000 },
    }
  });

  // Modal edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState("Thứ Hai");
  const [editForm, setEditForm] = useState<MenuItem>({ breakfast: "", lunch: "", snack: "", cost: 35000 });

  const currentWeekInfo = weeksList[selectedWeekIndex];
  const currentWeekMenu = menuHistory[currentWeekInfo.id] || {};

  // Copy previous week menu
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
    setEditForm(currentWeekMenu[day] || { breakfast: "", lunch: "", snack: "", cost: 35000 });
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý & Lịch sử Thực đơn Dinh dưỡng</h2>
          <p className="text-sm text-slate-500 mt-1">Xem lại thực đơn các tuần trước hoặc lên kế hoạch thực đơn cho các tuần sắp tới.</p>
        </div>

        {/* Copy menu quick action */}
        <button
          onClick={handleCopyPreviousWeek}
          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Copy className="w-4 h-4 text-indigo-600" />
          Sao chép thực đơn tuần trước
        </button>
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

        <div className="text-xs text-slate-500 font-medium">
          {currentWeekInfo.isCurrent ? (
            <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full border border-emerald-100">
              ● Đang áp dụng thực đơn tuần này
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-full">
              📜 Lịch sử thực đơn đã lưu
            </span>
          )}
        </div>
      </div>

      {/* Weekly Menu Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(currentWeekMenu).map(([day, menu]) => (
          <div key={day} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-indigo-600 text-base">{day}</h4>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  Suất ăn: {formatCurrency(menu.cost)}
                </span>
                <button
                  onClick={() => handleOpenEdit(day)}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Chỉnh sửa ngày này"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-semibold">Sáng (7:30 - 8:30)</span>
                <p className="text-slate-700 font-medium mt-0.5">{menu.breakfast}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-semibold">Trưa (10:30 - 11:30)</span>
                <p className="text-slate-700 font-medium mt-0.5">{menu.lunch}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-semibold">Xế chiều (14:00)</span>
                <p className="text-slate-700 font-medium mt-0.5">{menu.snack}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa thực đơn - {editingDay}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Món ăn Bữa Sáng</label>
                <input 
                  type="text" 
                  required
                  value={editForm.breakfast}
                  onChange={(e) => setEditForm({...editForm, breakfast: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Món ăn Bữa Trưa</label>
                <input 
                  type="text" 
                  required
                  value={editForm.lunch}
                  onChange={(e) => setEditForm({...editForm, lunch: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Món ăn Bữa Xế (Phụ)</label>
                <input 
                  type="text" 
                  required
                  value={editForm.snack}
                  onChange={(e) => setEditForm({...editForm, snack: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Chi phí ước tính / trẻ (VND)</label>
                <input 
                  type="number" 
                  required
                  value={editForm.cost}
                  onChange={(e) => setEditForm({...editForm, cost: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/10"
              >
                Cập nhật thực đơn
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
