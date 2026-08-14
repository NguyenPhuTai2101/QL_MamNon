"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import {
  UtensilsCrossed,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Copy,
  Check,
  Calculator,
  Scale,
  X,
  Printer,
  Download,
  ShoppingCart,
  Save,
  Sparkles,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Info,
  Layers,
  CheckCircle2,
  RefreshCw,
  Soup,
  Apple,
  Milk,
  Drumstick,
  Carrot,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface DailyMenuItem {
  id?: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Thứ Hai", "Thứ Ba"...
  breakfast: string;
  lunch: string;
  snack: string;
  costPerStudent: number;
}

interface GroceryItem {
  id: string;
  name: string;
  category: "PROTEIN" | "CARB" | "VEG" | "FRUIT_DAIRY" | "SPICE_OTHER";
  standardPerKidGrams: number; // Định lượng gram/trẻ lý thuyết
  theoreticalQty: number; // Khối lượng lý thuyết (kg/lít/quả)
  actualQty: number; // Khối lượng đi chợ thực tế (kg/lít/quả)
  unit: string; // kg, lít, quả, bó, chai
  unitPrice: number; // VNĐ
  totalCost: number; // actualQty * unitPrice
  supplier: string;
}

// Bảng định lượng dinh dưỡng chuẩn cho 1 trẻ mầm non (Bộ GD&ĐT)
const STANDARD_INGREDIENT_TEMPLATES: Record<string, Omit<GroceryItem, "id" | "theoreticalQty" | "actualQty" | "totalCost">> = {
  thit_heo: { name: "Thịt heo nạc xay", category: "PROTEIN", standardPerKidGrams: 70, unit: "kg", unitPrice: 140000, supplier: "Công ty Thực phẩm CP" },
  thit_bo: { name: "Thịt bò tươi", category: "PROTEIN", standardPerKidGrams: 50, unit: "kg", unitPrice: 240000, supplier: "Cửa hàng Thịt sạch" },
  tom_dong: { name: "Tôm đồng tươi", category: "PROTEIN", standardPerKidGrams: 45, unit: "kg", unitPrice: 180000, supplier: "Chợ hải sản" },
  trung_ga: { name: "Trứng gà ta", category: "PROTEIN", standardPerKidGrams: 40, unit: "quả", unitPrice: 3500, supplier: "Nông trại Ba Vì" },
  gao_tam: { name: "Gạo tẻ ST25", category: "CARB", standardPerKidGrams: 80, unit: "kg", unitPrice: 26000, supplier: "Đại lý Gạo sạch" },
  bi_do: { name: "Bí đỏ hồ lô", category: "VEG", standardPerKidGrams: 50, unit: "kg", unitPrice: 18000, supplier: "HTX Rau an toàn" },
  cai_ngot: { name: "Rau cải ngọt hữu cơ", category: "VEG", standardPerKidGrams: 50, unit: "kg", unitPrice: 22000, supplier: "HTX Rau an toàn" },
  chuoi_tieu: { name: "Chuối tiêu chín", category: "FRUIT_DAIRY", standardPerKidGrams: 60, unit: "kg", unitPrice: 20000, supplier: "Vựa trái cây" },
  sua_tuoi: { name: "Sữa tươi tiệt trùng Vinamilk", category: "FRUIT_DAIRY", standardPerKidGrams: 180, unit: "lít", unitPrice: 34000, supplier: "Đại lý Vinamilk" },
  gia_vi: { name: "Dầu ăn & Gia vị an toàn", category: "SPICE_OTHER", standardPerKidGrams: 10, unit: "gói/chai", unitPrice: 15000, supplier: "Bách Hóa Xanh" },
};

export default function MenuTab() {
  // Lịch sử các tuần làm việc
  const weeksList = [
    { id: "2026-W33", label: "Tuần 33 (18/08/2026 - 24/08/2026)", start: "2026-08-18", end: "2026-08-24" },
    { id: "2026-W32", label: "Tuần 32 (11/08/2026 - 17/08/2026)", start: "2026-08-11", end: "2026-08-17" },
    { id: "2026-W31", label: "Tuần 31 [Hiện tại] (04/08/2026 - 10/08/2026)", start: "2026-08-04", end: "2026-08-10" },
    { id: "2026-W30", label: "Tuần 30 [Tuần trước] (28/07/2026 - 03/08/2026)", start: "2026-07-28", end: "2026-08-03" },
  ];

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(2); // Mặc định Tuần 31
  const [weeklyMenus, setWeeklyMenus] = useState<DailyMenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Thêm / Sửa Thực đơn ngày
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<DailyMenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    date: new Date().toISOString().split("T")[0],
    breakfast: "",
    lunch: "",
    snack: "",
    costPerStudent: 30000,
  });

  // =========================================================================
  // PHẦN 2: ĐỊNH LƯỢNG THỰC TẾ ĐI CHỢ
  // =========================================================================
  const [selectedGroceryDate, setSelectedGroceryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [groceryKidCount, setGroceryKidCount] = useState<number>(25);
  const [mealFeePerKid, setMealFeePerKid] = useState<number>(30000);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isSavingGroceries, setIsSavingGroceries] = useState(false);

  // Modal Thêm món đi chợ mới
  const [isAddGroceryModalOpen, setIsAddGroceryModalOpen] = useState(false);
  const [newGroceryForm, setNewGroceryForm] = useState({
    name: "",
    category: "PROTEIN" as GroceryItem["category"],
    actualQty: 1,
    unit: "kg",
    unitPrice: 50000,
    supplier: "Chợ đầu mối",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tải danh sách thực đơn từ CSDL theo tuần được chọn
  const loadMenus = async () => {
    setIsLoadingMenus(true);
    const currWeek = weeksList[selectedWeekIndex];
    try {
      const res = await fetch(`/api/menus?startDate=${currWeek.start}&endDate=${currWeek.end}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Chuẩn hóa ngày thành danh sách ngày trong tuần
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const mapped: DailyMenuItem[] = data.map((m: any) => {
          const d = new Date(m.date);
          const dateStr = d.toISOString().split("T")[0];
          return {
            id: m.id,
            date: dateStr,
            dayOfWeek: dayNames[d.getDay()] || "Thứ Hai",
            breakfast: m.breakfast || "",
            lunch: m.lunch || "",
            snack: m.snack || "",
            costPerStudent: m.costPerStudent || 30000,
          };
        });
        setWeeklyMenus(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  // Tải nguyên liệu thực phẩm đi chợ của ngày được chọn
  const loadGroceries = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/ingredients?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: GroceryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: "PROTEIN",
          standardPerKidGrams: 50,
          theoreticalQty: item.quantity,
          actualQty: item.quantity,
          unit: item.unit || "kg",
          unitPrice: item.unitPrice || 0,
          totalCost: item.totalCost || item.quantity * item.unitPrice,
          supplier: item.notes || "Chợ đầu mối",
        }));
        setGroceryItems(mapped);
      } else {
        // Tự động khởi tạo danh sách mẫu theo sĩ số nếu ngày đó chưa có
        generateDefaultGroceries(groceryKidCount);
      }
    } catch (e) {
      console.error(e);
      generateDefaultGroceries(groceryKidCount);
    }
  };

  // Hàm sinh danh sách nguyên liệu đi chợ mẫu theo chuẩn dinh dưỡng và sĩ số
  const generateDefaultGroceries = (kidCount: number) => {
    const list: GroceryItem[] = Object.entries(STANDARD_INGREDIENT_TEMPLATES).map(([key, tpl], idx) => {
      let theoretical = 0;
      if (tpl.unit === "kg") {
        theoretical = parseFloat(((kidCount * tpl.standardPerKidGrams) / 1000).toFixed(2));
      } else if (tpl.unit === "lít") {
        theoretical = parseFloat(((kidCount * tpl.standardPerKidGrams) / 1000).toFixed(2));
      } else if (tpl.unit === "quả") {
        theoretical = Math.ceil((kidCount * tpl.standardPerKidGrams) / 40);
      } else {
        theoretical = 1;
      }
      return {
        id: `tpl-${idx}-${Date.now()}`,
        name: tpl.name,
        category: tpl.category,
        standardPerKidGrams: tpl.standardPerKidGrams,
        theoreticalQty: theoretical,
        actualQty: theoretical, // Mặc định khối lượng thực tế bằng lý thuyết
        unit: tpl.unit,
        unitPrice: tpl.unitPrice,
        totalCost: Math.round(theoretical * tpl.unitPrice),
        supplier: tpl.supplier,
      };
    });
    setGroceryItems(list);
  };

  useEffect(() => {
    loadMenus();
  }, [selectedWeekIndex]);

  useEffect(() => {
    loadGroceries(selectedGroceryDate);
  }, [selectedGroceryDate]);

  // Cập nhật khối lượng lý thuyết khi đổi sĩ số học sinh
  const handleUpdateKidCount = (count: number) => {
    const validCount = Math.max(1, count);
    setGroceryKidCount(validCount);
    setGroceryItems((prev) =>
      prev.map((item) => {
        let theoretical = item.theoreticalQty;
        if (item.standardPerKidGrams) {
          if (item.unit === "kg" || item.unit === "lít") {
            theoretical = parseFloat(((validCount * item.standardPerKidGrams) / 1000).toFixed(2));
          } else if (item.unit === "quả") {
            theoretical = Math.ceil((validCount * item.standardPerKidGrams) / 40);
          }
        }
        return {
          ...item,
          theoreticalQty: theoretical,
          // Giữ nguyên actualQty nếu người dùng đã tự chỉnh, hoặc đồng bộ
        };
      })
    );
  };

  // Cập nhật khối lượng thực tế của 1 món đi chợ
  const handleActualQtyChange = (id: string, newQty: number) => {
    setGroceryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qty = Math.max(0, newQty);
          return {
            ...item,
            actualQty: qty,
            totalCost: Math.round(qty * item.unitPrice),
          };
        }
        return item;
      })
    );
  };

  // Cập nhật đơn giá thực tế của 1 món đi chợ
  const handleUnitPriceChange = (id: string, newPrice: number) => {
    setGroceryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const price = Math.max(0, newPrice);
          return {
            ...item,
            unitPrice: price,
            totalCost: Math.round(item.actualQty * price),
          };
        }
        return item;
      })
    );
  };

  // Xóa 1 món đi chợ
  const handleDeleteGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Thêm món đi chợ mới vào bảng
  const handleAddGroceryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryForm.name || newGroceryForm.actualQty <= 0) return;

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      name: newGroceryForm.name,
      category: newGroceryForm.category,
      standardPerKidGrams: 0,
      theoreticalQty: newGroceryForm.actualQty,
      actualQty: newGroceryForm.actualQty,
      unit: newGroceryForm.unit,
      unitPrice: newGroceryForm.unitPrice,
      totalCost: Math.round(newGroceryForm.actualQty * newGroceryForm.unitPrice),
      supplier: newGroceryForm.supplier,
    };

    setGroceryItems((prev) => [newItem, ...prev]);
    setIsAddGroceryModalOpen(false);
    setNewGroceryForm({
      name: "",
      category: "PROTEIN",
      actualQty: 1,
      unit: "kg",
      unitPrice: 50000,
      supplier: "Chợ đầu mối",
    });
    showToast("Đã thêm món thực phẩm vào bảng đi chợ!");
  };

  // Lưu bảng đi chợ thực tế vào CSDL
  const handleSaveGroceriesToDB = async () => {
    setIsSavingGroceries(true);
    try {
      // Lưu từng món qua API /api/ingredients
      for (const item of groceryItems) {
        await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            quantity: item.actualQty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            notes: item.supplier,
            date: selectedGroceryDate,
          }),
        });
      }
      showToast(`🎉 Đã lưu thành công ${groceryItems.length} món thực phẩm đi chợ ngày ${selectedGroceryDate} vào CSDL!`);
    } catch (e) {
      console.error(e);
      showToast("Lỗi khi lưu dữ liệu đi chợ vào CSDL.");
    } finally {
      setIsSavingGroceries(false);
    }
  };

  // Thao tác Lưu / Sửa Thực Đơn Ngày
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.breakfast || !menuForm.lunch || !menuForm.snack) {
      alert("Vui lòng nhập đầy đủ món cho Bữa sáng, Bữa trưa và Bữa xế!");
      return;
    }

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMenu?.id,
          date: menuForm.date,
          breakfast: menuForm.breakfast,
          lunch: menuForm.lunch,
          snack: menuForm.snack,
          costPerStudent: menuForm.costPerStudent,
        }),
      });

      const result = await res.json();
      if (result.success || result.id) {
        showToast("Đã lưu thực đơn ngày thành công vào CSDL!");
        setIsMenuModalOpen(false);
        setEditingMenu(null);
        loadMenus();
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi lưu thực đơn.");
    }
  };

  // Thao tác Xóa Thực Đơn Ngày
  const handleDeleteMenu = async (menuItem: DailyMenuItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thực đơn ngày ${menuItem.date} (${menuItem.dayOfWeek}) không?`)) {
      return;
    }

    try {
      const url = menuItem.id ? `/api/menus?id=${menuItem.id}` : `/api/menus?date=${menuItem.date}`;
      const res = await fetch(url, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        showToast("Đã xóa thực đơn ngày thành công!");
        loadMenus();
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa thực đơn.");
    }
  };

  // Mở Modal Sửa Thực đơn
  const handleOpenEditMenu = (menu: DailyMenuItem) => {
    setEditingMenu(menu);
    setMenuForm({
      date: menu.date,
      breakfast: menu.breakfast,
      lunch: menu.lunch,
      snack: menu.snack,
      costPerStudent: menu.costPerStudent,
    });
    setIsMenuModalOpen(true);
  };

  // Mở Modal Thêm Thực đơn Mới
  const handleOpenAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      date: new Date().toISOString().split("T")[0],
      breakfast: "",
      lunch: "",
      snack: "",
      costPerStudent: 30000,
    });
    setIsMenuModalOpen(true);
  };

  // Thống kê Ngân sách vs Chi phí đi chợ thực tế
  const totalBudget = groceryKidCount * mealFeePerKid;
  const totalActualGroceryCost = useMemo(() => {
    return groceryItems.reduce((acc, item) => acc + item.totalCost, 0);
  }, [groceryItems]);
  const balanceDifference = totalBudget - totalActualGroceryCost;

  // Xuất Excel Thực đơn
  const handleExportMenuExcel = () => {
    const headers = ["Ngày", "Thứ", "Bữa Sáng", "Bữa Trưa Chính", "Bữa Xế (Phụ)", "Đơn Giá (VNĐ/trẻ)"];
    const rows = weeklyMenus.map((m) => [
      m.date,
      m.dayOfWeek,
      m.breakfast,
      m.lunch,
      m.snack,
      m.costPerStudent,
    ]);
    exportToExcel(`Thuc_Don_${weeksList[selectedWeekIndex].id}`, headers, rows);
  };

  // In PDF Thực đơn
  const handleExportMenuPDF = () => {
    const headers = ["Thứ / Ngày", "Bữa Sáng", "Bữa Trưa Chính", "Bữa Xế", "Định Mức"];
    const rows = weeklyMenus.map((m) => [
      `${m.dayOfWeek}\n(${m.date})`,
      m.breakfast,
      m.lunch,
      m.snack,
      formatCurrency(m.costPerStudent),
    ]);
    exportToPDF(`THỰC ĐƠN DINH DƯỠNG TUẦN - ${weeksList[selectedWeekIndex].label.toUpperCase()}`, headers, rows);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ERP MODULE HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-500/20">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Thực Đơn & Định Lượng Đi Chợ Thực Tế
                </h1>
                <span className="text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Chuẩn Bộ GD&ĐT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Thiết lập thực đơn hàng ngày, tự động tính toán khối lượng dinh dưỡng và nhập sổ đi chợ thực tế cho bếp ăn.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            <button
              onClick={handleExportMenuExcel}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportMenuPDF}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>In PDF Thực Đơn</span>
            </button>

            <button
              onClick={handleOpenAddMenu}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Thêm Thực Đơn Ngày Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WEEK SELECTOR & QUICK NAVIGATION */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            disabled={selectedWeekIndex >= weeksList.length - 1}
            onClick={() => setSelectedWeekIndex((prev) => prev + 1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title="Tuần trước đó"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 h-9 px-3.5 rounded-xl border border-slate-200 flex-1 sm:flex-initial">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={selectedWeekIndex}
              onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
              className="bg-transparent font-extrabold text-slate-800 text-xs focus:outline-none cursor-pointer"
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
            onClick={() => setSelectedWeekIndex((prev) => prev - 1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title="Tuần tiếp theo"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-semibold">
            Đơn giá suất ăn định mức: <strong className="text-amber-600 font-black">30.000 đ / trẻ / ngày</strong>
          </span>
          <button
            onClick={loadMenus}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Tải lại thực đơn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. WEEKLY DAILY MENU CARDS (THÊM, XÓA, SỬA TỪNG NGÀY) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>📅 Thực Đơn Các Ngày Trong Tuần</span>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              {weeklyMenus.length} ngày đã lên lịch
            </span>
          </h3>
        </div>

        {weeklyMenus.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Tuần này chưa có thực đơn nào được lưu trong CSDL</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bạn có thể bấm nút dưới đây để tạo thực đơn ngày mới hoặc nhập nhanh khẩu phần ăn.
            </p>
            <button
              onClick={handleOpenAddMenu}
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Thực Đơn Ngày Mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {weeklyMenus.map((menu) => (
              <div
                key={menu.id || menu.date}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-amber-300 hover:shadow-md transition-all group"
              >
                {/* Day Header */}
                <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs block">{menu.dayOfWeek}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{menu.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMenu(menu)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa thực đơn ngày này"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Xóa thực đơn ngày này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meals Content */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  <div>
                    <span className="font-black text-indigo-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Soup className="w-3 h-3" /> Bữa sáng
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">{menu.breakfast}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="font-black text-emerald-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Drumstick className="w-3 h-3" /> Bữa trưa chính
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">{menu.lunch}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5">
                    <span className="font-black text-amber-600 block uppercase tracking-wider text-[10px] mb-0.5 flex items-center gap-1">
                      <Apple className="w-3 h-3" /> Bữa xế (phụ)
                    </span>
                    <p className="text-slate-800 font-bold leading-relaxed">{menu.snack}</p>
                  </div>
                </div>

                {/* Footer Cost */}
                <div className="bg-slate-50 p-3 border-t border-slate-100 text-center text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Định mức/bé:</span>
                  <span className="text-amber-600 font-black">{formatCurrency(menu.costPerStudent)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. SECTION NHẬP ĐỊNH LƯỢNG THỨC ĂN ĐI CHỢ THỰC TẾ (CORE ERP WORKFLOW) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Sổ Nhập Định Lượng & Khối Lượng Đi Chợ Thực Tế
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tự động quy đổi khối lượng dinh dưỡng theo sĩ số và cho phép thủ kho / cô nuôi nhập thực phẩm thực tế mua ngoài chợ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => generateDefaultGroceries(groceryKidCount)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              title="Khôi phục danh mục mẫu theo chuẩn dinh dưỡng"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nạp Mẫu Dinh Dưỡng</span>
            </button>

            <button
              onClick={() => setIsAddGroceryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thêm Món Đi Chợ</span>
            </button>

            <button
              onClick={handleSaveGroceriesToDB}
              disabled={isSavingGroceries}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingGroceries ? "Đang lưu..." : "Lưu Sổ Đi Chợ Vào CSDL"}</span>
            </button>
          </div>
        </div>

        {/* Filters & Parameter Setup (3 Step Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              📅 Ngày Đi Chợ / Nấu Ăn
            </label>
            <input
              type="date"
              value={selectedGroceryDate}
              onChange={(e) => setSelectedGroceryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              👥 Số Trẻ Đi Học Thực Tế (Sĩ số ăn)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                value={groceryKidCount}
                onChange={(e) => handleUpdateKidCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-indigo-600 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-xs font-bold text-slate-500 shrink-0">trẻ</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-600 block mb-1 uppercase tracking-wider">
              💰 Đơn Giá Thu Tiền Ăn / Trẻ
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1000"
                value={mealFeePerKid}
                onChange={(e) => setMealFeePerKid(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <span className="text-xs font-bold text-slate-500 shrink-0">đ/ngày</span>
            </div>
          </div>
        </div>

        {/* Live Financial Budget vs Grocery Cost Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                Tổng Ngân Sách Tiền Ăn Thu Được
              </span>
              <span className="text-lg font-black text-indigo-700 mt-0.5 block">
                {formatCurrency(totalBudget)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">({groceryKidCount} trẻ × {formatCurrency(mealFeePerKid)})</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                Tổng Tiền Đi Chợ Thực Tế
              </span>
              <span className="text-lg font-black text-amber-700 mt-0.5 block">
                {formatCurrency(totalActualGroceryCost)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">({groceryItems.length} món thực phẩm)</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl text-amber-600 shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              balanceDifference >= 0
                ? "bg-emerald-50/60 border-emerald-100 text-emerald-800"
                : "bg-rose-50/60 border-rose-100 text-rose-800"
            }`}
          >
            <div>
              <span className="text-[11px] font-extrabold uppercase block">
                {balanceDifference >= 0 ? "Tiết Kiệm / Cân Bằng Quỹ" : "Vượt Định Mức Ngân Sách"}
              </span>
              <span className="text-lg font-black mt-0.5 block">
                {balanceDifference >= 0 ? `+${formatCurrency(balanceDifference)}` : formatCurrency(balanceDifference)}
              </span>
              <span className="text-[10px] font-medium">
                {balanceDifference >= 0 ? "✓ Chi tiêu an toàn hợp lý" : "⚠️ Cần rà soát lại đơn giá/khối lượng"}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl shadow-xs">
              {balanceDifference >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
            </div>
          </div>
        </div>

        {/* Grocery Items Table with Editable Actual Quantities & Prices */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Tên Thực Phẩm / Nguyên Liệu</th>
                <th className="py-3 px-4">Định Lượng Chuẩn (Lý thuyết)</th>
                <th className="py-3 px-4 w-36">Khối Lượng Đi Chợ Thực Tế</th>
                <th className="py-3 px-4 w-36">Đơn Giá Mua (VNĐ)</th>
                <th className="py-3 px-4">Thành Tiền</th>
                <th className="py-3 px-4">Nguồn Gốc / Nhà Cung Cấp</th>
                <th className="py-3 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {groceryItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Chưa có món nào trong sổ đi chợ. Hãy bấm &ldquo;Nạp Mẫu Dinh Dưỡng&rdquo; hoặc &ldquo;Thêm Món Đi Chợ&rdquo;.
                  </td>
                </tr>
              ) : (
                groceryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{item.name}</div>
                      {item.standardPerKidGrams > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Chuẩn: {item.standardPerKidGrams}g / trẻ
                        </span>
                      )}
                    </td>

                    {/* Theoretical Qty */}
                    <td className="py-3 px-4 text-slate-600 font-bold">
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                        {item.theoreticalQty} {item.unit}
                      </span>
                    </td>

                    {/* Editable Actual Quantity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.actualQty}
                          onChange={(e) => handleActualQtyChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs font-black text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <span className="text-[11px] font-bold text-slate-500">{item.unit}</span>
                      </div>
                    </td>

                    {/* Editable Unit Price */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUnitPriceChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      {formatCurrency(item.totalCost)}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 text-slate-600 font-medium max-w-xs truncate">
                      {item.supplier}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteGroceryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Xóa món này khỏi sổ đi chợ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM / SỬA THỰC ĐƠN NGÀY */}
      {/* ========================================================================= */}
      {isMenuModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {editingMenu ? "Cập Nhật Thực Đơn Ngày" : "Thêm Thực Đơn Ngày Mới"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Lưu trực tiếp vào CSDL toàn trường</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Ngày áp dụng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={menuForm.date}
                      onChange={(e) => setMenuForm({ ...menuForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Đơn giá suất ăn (VNĐ/trẻ)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={menuForm.costPerStudent}
                      onChange={(e) => setMenuForm({ ...menuForm, costPerStudent: parseFloat(e.target.value) || 30000 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-indigo-700 block mb-1 flex items-center gap-1">
                    <Soup className="w-3.5 h-3.5" /> Bữa sáng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cháo thịt bằm cà rốt, Sữa tươi tiệt trùng"
                    value={menuForm.breakfast}
                    onChange={(e) => setMenuForm({ ...menuForm, breakfast: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-emerald-700 block mb-1 flex items-center gap-1">
                    <Drumstick className="w-3.5 h-3.5" /> Bữa trưa chính <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="VD: Cơm trắng, Thịt bò xào củ quả, Canh bí đỏ tôm thịt"
                    value={menuForm.lunch}
                    onChange={(e) => setMenuForm({ ...menuForm, lunch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-amber-700 block mb-1 flex items-center gap-1">
                    <Apple className="w-3.5 h-3.5" /> Bữa xế (bữa phụ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Chuối tiêu chín, Sữa chua lên men tự nhiên"
                    value={menuForm.snack}
                    onChange={(e) => setMenuForm({ ...menuForm, snack: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMenuModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-extrabold shadow-md shadow-amber-600/20 cursor-pointer"
                  >
                    {editingMenu ? "Cập Nhật Thực Đơn" : "Lưu Thực Đơn Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THÊM MÓN ĐI CHỢ MỚI */}
      {/* ========================================================================= */}
      {isAddGroceryModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Thêm Món Thực Phẩm Đi Chợ</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Bổ sung nguyên liệu ngoài chợ vào sổ</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddGroceryModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGroceryItem} className="space-y-4 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Tên thực phẩm / nguyên liệu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cá hồi phi lê, Su hào, Nước mắm..."
                    value={newGroceryForm.name}
                    onChange={(e) => setNewGroceryForm({ ...newGroceryForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Số lượng thực tế <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      min="0.1"
                      value={newGroceryForm.actualQty}
                      onChange={(e) => setNewGroceryForm({ ...newGroceryForm, actualQty: parseFloat(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Đơn vị tính
                    </label>
                    <select
                      value={newGroceryForm.unit}
                      onChange={(e) => setNewGroceryForm({ ...newGroceryForm, unit: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="lít">lít (Lít)</option>
                      <option value="quả">quả / trái</option>
                      <option value="bó">bó / gói</option>
                      <option value="thùng">thùng / hộp</option>
                      <option value="chai">chai / hũ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Đơn giá mua (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1000"
                      required
                      value={newGroceryForm.unitPrice}
                      onChange={(e) => setNewGroceryForm({ ...newGroceryForm, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">
                      Nhóm thực phẩm
                    </label>
                    <select
                      value={newGroceryForm.category}
                      onChange={(e) => setNewGroceryForm({ ...newGroceryForm, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="PROTEIN">Chất đạm (Thịt, cá, trứng)</option>
                      <option value="CARB">Tinh bột (Gạo, bún, mì)</option>
                      <option value="VEG">Rau củ quả sạch</option>
                      <option value="FRUIT_DAIRY">Sữa & Trái cây</option>
                      <option value="SPICE_OTHER">Gia vị & Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Nhà cung cấp / Nguồn mua
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Siêu thị WinMart, Chợ đầu mối phía Nam"
                    value={newGroceryForm.supplier}
                    onChange={(e) => setNewGroceryForm({ ...newGroceryForm, supplier: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddGroceryModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Thêm Vào Bảng
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
