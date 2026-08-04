"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Plus, 
  Filter, 
  Printer, 
  Search, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  PieChart
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface IngredientCost {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  date: string;
  category: string;
}

export default function CostTab() {
  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock initial dataset with date & category tags for rich report filtering
  const [ingredients, setIngredients] = useState<IngredientCost[]>([
    { id: "1", name: "Thịt heo nạc tươi", quantity: 15, unit: "kg", unitPrice: 120000, total: 1800000, date: "2026-08-04", category: "Thịt & Thức ăn chính" },
    { id: "2", name: "Gà ta thả vườn sạch", quantity: 12, unit: "kg", unitPrice: 110000, total: 1320000, date: "2026-08-03", category: "Thịt & Thức ăn chính" },
    { id: "3", name: "Sữa tươi TH True Milk", quantity: 5, unit: "thùng", unitPrice: 380000, total: 1900000, date: "2026-08-02", category: "Sữa & Bữa phụ" },
    { id: "4", name: "Rau củ quả hữu cơ tổng hợp", quantity: 30, unit: "kg", unitPrice: 25000, total: 750000, date: "2026-08-04", category: "Rau củ quả" },
    { id: "5", name: "Gạo thơm ST25", quantity: 50, unit: "kg", unitPrice: 28000, total: 1400000, date: "2026-08-01", category: "Gia vị & Lương thực" },
    { id: "6", name: "Cá thu tươi nguyên con", quantity: 8, unit: "kg", unitPrice: 160000, total: 1280000, date: "2026-08-02", category: "Thịt & Thức ăn chính" },
    { id: "7", name: "Trái cây mùa vụ (Dưa hấu, Cam)", quantity: 20, unit: "kg", unitPrice: 30000, total: 600000, date: "2026-08-03", category: "Sữa & Bữa phụ" },
  ]);

  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
    unitPrice: 0,
    category: "Thịt & Thức ăn chính",
    date: new Date().toISOString().split("T")[0],
  });

  // Filter ingredients based on Month, Search query, and Category
  const filteredIngredients = ingredients.filter((item) => {
    const matchesMonth = item.date.startsWith(selectedMonth);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesMonth && matchesSearch && matchesCategory;
  });

  // Aggregated totals for report
  const totalCost = filteredIngredients.reduce((acc, curr) => acc + curr.total, 0);
  const totalItems = filteredIngredients.length;

  // Comparison with collected meal budget (Estimated collected meal fee = 12.500.000 VND)
  const collectedMealBudget = 12500000;
  const remainingMealBudget = collectedMealBudget - totalCost;

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name || newIngredient.quantity <= 0 || newIngredient.unitPrice <= 0) return;

    const added: IngredientCost = {
      id: (ingredients.length + 1).toString(),
      name: newIngredient.name,
      quantity: Number(newIngredient.quantity),
      unit: newIngredient.unit,
      unitPrice: Number(newIngredient.unitPrice),
      total: Number(newIngredient.quantity) * Number(newIngredient.unitPrice),
      date: newIngredient.date,
      category: newIngredient.category,
    };

    setIngredients([added, ...ingredients]);
    setNewIngredient({ name: "", quantity: 0, unit: "kg", unitPrice: 0, category: "Thịt & Thức ăn chính", date: new Date().toISOString().split("T")[0] });
    setShowAddModal(false);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý & Báo cáo Chi phí Bếp ăn</h2>
          <p className="text-sm text-slate-500 mt-1">Lọc ngân sách mua thực phẩm theo tháng, đối chiếu tiền ăn và xuất báo cáo.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Xuất Báo Cáo Bếp Ăn
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            Nhập thực phẩm mới
          </button>
        </div>
      </div>

      {/* Financial Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Tổng chi thực tế tháng này</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalCost)}</h3>
            <span className="text-xs text-indigo-600 font-medium mt-1 block">
              Gồm {totalItems} lượt nhập hàng
            </span>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Quỹ Tiền ăn thu từ Phụ huynh</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(collectedMealBudget)}</h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 block">
              Tính trên tổng sĩ số trẻ
            </span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Dư / Hụt Ngân sách Bếp</span>
            <h3 className={`text-2xl font-bold mt-1 ${remainingMealBudget >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(remainingMealBudget)}
            </h3>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              {remainingMealBudget >= 0 ? "Thặng dư an toàn" : "Vượt hạn mức ngân sách"}
            </span>
          </div>
          <div className={`p-4 rounded-xl ${remainingMealBudget >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Report Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-slate-400">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2026-08">Tháng 08 / 2026</option>
              <option value="2026-07">Tháng 07 / 2026</option>
              <option value="2026-06">Tháng 06 / 2026</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold">
            <span className="text-xs text-slate-400">Phân loại:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả nguyên liệu</option>
              <option value="Thịt & Thức ăn chính">Thịt & Thức ăn chính</option>
              <option value="Rau củ quả">Rau củ quả</option>
              <option value="Sữa & Bữa phụ">Sữa & Bữa phụ</option>
              <option value="Gia vị & Lương thực">Gia vị & Lương thực</option>
            </select>
          </div>
        </div>

        {/* Keyword Search Input */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lọc tên thực phẩm..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Ingredient Expenditure Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredIngredients.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Ngày nhập</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Tên Nguyên liệu</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Nhóm thực phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Số lượng</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Đơn giá</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Thành tiền</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIngredients.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{item.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-md">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(item.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteIngredient(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa thực phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-100">
                <td colSpan={5} className="px-6 py-4 text-sm font-bold text-slate-700 text-right">Tổng chi phí thực phẩm trong bộ lọc:</td>
                <td colSpan={2} className="px-6 py-4 text-base font-extrabold text-indigo-600">{formatCurrency(totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            Không tìm thấy thực phẩm nào khớp với bộ lọc tháng {selectedMonth}.
          </div>
        )}
      </div>

      {/* Add Ingredient Modal - Ultra Premium UI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative border border-slate-100 overflow-hidden">
            {/* Top Decorative Gradient Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header with Icon */}
            <div className="flex justify-between items-start pt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Nhập thực phẩm mới</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nhập số lượng & đơn giá để tự động tính ngân sách bếp ăn</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Ngày nhập kho</label>
                  <input 
                    type="date" 
                    required
                    value={newIngredient.date}
                    onChange={(e) => setNewIngredient({...newIngredient, date: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Nhóm thực phẩm</label>
                  <select 
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <option value="Thịt & Thức ăn chính">Thịt & Thức ăn chính</option>
                    <option value="Rau củ quả">Rau củ quả</option>
                    <option value="Sữa & Bữa phụ">Sữa & Bữa phụ</option>
                    <option value="Gia vị & Lương thực">Gia vị & Lương thực</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Tên nguyên liệu / Thực phẩm</label>
                <input 
                  type="text" 
                  required
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  placeholder="Ví dụ: Thịt bò tươi, Bắp cải ngọt..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Số lượng nhập</label>
                  <input 
                    type="number" 
                    required
                    min="0.1"
                    step="any"
                    value={newIngredient.quantity || ""}
                    onChange={(e) => setNewIngredient({...newIngredient, quantity: Number(e.target.value)})}
                    placeholder="10"
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Đơn vị tính</label>
                  <input 
                    type="text" 
                    required
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                    placeholder="kg / lít / thùng..."
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Đơn giá nhập (VND)</label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  step="1000"
                  value={newIngredient.unitPrice || ""}
                  onChange={(e) => setNewIngredient({...newIngredient, unitPrice: Number(e.target.value)})}
                  placeholder="120000"
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Total preview calculation */}
              {newIngredient.quantity > 0 && newIngredient.unitPrice > 0 && (
                <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 flex justify-between items-center text-xs">
                  <span className="text-indigo-700 font-semibold">Dự toán thành tiền:</span>
                  <span className="text-indigo-900 font-extrabold text-sm">
                    {formatCurrency(newIngredient.quantity * newIngredient.unitPrice)}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Lưu vào danh sách chi phí bếp ăn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
