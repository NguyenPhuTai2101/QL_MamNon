"use client";

import React, { useState, useEffect } from "react";
import Portal from "@/components/portal";
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
  PieChart,
  Store,
  X,
  Download
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface IngredientCost {
  id: string;
  code?: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  supplier?: string;
  date: string;
  category: string;
}

export default function CostTab() {
  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newIngredient, setNewIngredient] = useState({
    code: "",
    name: "",
    quantity: 0,
    unit: "kg",
    unitPrice: 0,
    supplier: "Cửa hàng A",
    category: "Thịt & Thức ăn chính",
    date: new Date().toISOString().split("T")[0],
  });

  // Tải nguyên liệu thực tế từ Database PostgreSQL Supabase
  useEffect(() => {
    fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: IngredientCost[] = data.map((item: any, idx: number) => {
            const rawCode = item.name.match(/\[(.*?)\]/)?.[1] || `TP00${idx + 1}`;
            const cleanName = item.name.replace(/\[.*?\]/, "").trim();
            return {
              id: item.id,
              code: rawCode,
              name: cleanName,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              total: item.totalCost || item.quantity * item.unitPrice,
              supplier: item.notes?.replace("Nhà cung cấp: ", "") || "Chợ đầu mối",
              date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
              category: idx % 2 === 0 ? "Thịt & Thức ăn chính" : "Rau củ & Gia vị",
            };
          });
          setIngredients(mapped);
        } else {
          setIngredients([
            { id: "1", code: "TP001", name: "Thịt heo nạc đùi", quantity: 15, unit: "kg", unitPrice: 120000, total: 1800000, supplier: "Cửa hàng A", category: "Thịt & Thức ăn chính", date: "2026-08-01" },
            { id: "2", code: "TP002", name: "Cá lóc phi lê tươi", quantity: 10, unit: "kg", unitPrice: 140000, total: 1400000, supplier: "Công ty Thực phẩm Sạch B", category: "Thịt & Thức ăn chính", date: "2026-08-02" },
            { id: "3", code: "TP003", name: "Sữa tươi Vinamilk 100%", quantity: 3, unit: "thùng", unitPrice: 380000, total: 1140000, supplier: "Đại lý Vinamilk C", category: "Sữa & Đồ uống", date: "2026-08-03" },
          ]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải nguyên liệu kho:", err);
        setIsLoading(false);
      });
  }, []);

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name || newIngredient.quantity <= 0 || newIngredient.unitPrice <= 0) return;

    const total = newIngredient.quantity * newIngredient.unitPrice;
    const addedCode = newIngredient.code || `TP0${ingredients.length + 10}`;
    const added: IngredientCost = {
      id: Date.now().toString(),
      code: addedCode,
      name: newIngredient.name,
      quantity: Number(newIngredient.quantity),
      unit: newIngredient.unit,
      unitPrice: Number(newIngredient.unitPrice),
      total,
      supplier: newIngredient.supplier,
      date: newIngredient.date,
      category: newIngredient.category,
    };

    setIngredients([added, ...ingredients]);
    setShowAddModal(false);

    try {
      await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `[${added.code}] ${added.name}`,
          quantity: added.quantity,
          unit: added.unit,
          unitPrice: added.unitPrice,
          notes: `Nhà cung cấp: ${added.supplier}`,
          date: added.date,
        }),
      });
    } catch (err) {
      console.error("Lỗi lưu thực phẩm vào DB:", err);
    }

    setNewIngredient({ code: "", name: "", quantity: 0, unit: "kg", unitPrice: 0, supplier: "Cửa hàng A", category: "Thịt & Thức ăn chính", date: new Date().toISOString().split("T")[0] });
  };

  const handleDeleteIngredient = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thực phẩm này khỏi CSDL?")) {
      setIngredients(ingredients.filter((item) => item.id !== id));
      try {
        await fetch(`/api/ingredients?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Lỗi xóa thực phẩm khỏi DB:", err);
      }
    }
  };

  const filteredIngredients = ingredients
    .filter((item) => selectedCategory === "ALL" || item.category === selectedCategory)
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())));

  const totalMonthlyCost = filteredIngredients.reduce((sum, item) => sum + item.total, 0);

  const handleExportExcel = () => {
    const headers = ["Mã TP", "Tên thực phẩm", "Nhóm", "Số lượng", "Đơn vị", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)", "Nhà cung cấp", "Ngày nhập"];
    const rows = filteredIngredients.map((item) => [
      item.code || "TP-001",
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.total,
      item.supplier || "Chợ đầu mối",
      item.date
    ]);
    exportToExcel(`Chi_Phi_Bep_Kho_Thuc_Pham_${selectedMonth}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["Mã TP", "Tên thực phẩm", "Nhóm", "Số lượng", "Đơn giá", "Thành tiền", "Nhà cung cấp"];
    const rows = filteredIngredients.map((item) => [
      item.code || "TP-001",
      item.name,
      item.category,
      `${item.quantity} ${item.unit}`,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
      item.supplier || "Chợ đầu mối"
    ]);
    const summary = [
      { label: "Tháng báo cáo", value: selectedMonth },
      { label: "Tổng số mặt hàng nhập kho", value: `${filteredIngredients.length} thực phẩm` },
      { label: "Tổng chi phí bếp", value: formatCurrency(totalMonthlyCost) }
    ];
    exportToPDF(`BÁO CÁO CHI PHÍ BẾP & KHO THỰC PHẨM - THÁNG ${selectedMonth}`, headers, rows, summary);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dữ Liệu Thực Phẩm Đầu Vào & Chi Phí Bếp</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý kho nguyên liệu, tính toán tự động Thành tiền = Số lượng × Đơn giá và Nhà cung cấp.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            title="Xuất file Excel CSV"
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            title="In PDF báo cáo kho"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In PDF</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thực phẩm</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Giá Trị Nhập Kho</span>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
              {formatCurrency(totalMonthlyCost)}
            </h3>
            <span className="text-xs text-slate-500 font-medium mt-1 block">Tự động cộng dồn nguyên liệu</span>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Số Loại Thực Phẩm</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{filteredIngredients.length} <span className="text-sm font-medium text-slate-500">mặt hàng</span></h3>
            <span className="text-xs text-emerald-600 font-medium mt-1 block">✓ Đầy đủ dinh dưỡng</span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-500" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn Vị Cung Cấp</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">8 <span className="text-sm font-medium text-slate-500">nhà cung cấp</span></h3>
            <span className="text-xs text-slate-500 font-medium mt-1 block">Cửa hàng A, B, Vinamilk...</span>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
            <Store className="w-6 h-6" />
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
            placeholder="Tìm theo Mã TP, Tên, NCC..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-2xl text-xs bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Ingredient Expenditure Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-slate-800 text-lg">Bảng Dữ Liệu Thực Phẩm Đầu Vào</h3>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            Tổng giá trị: {formatCurrency(totalMonthlyCost)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="px-4 py-3 rounded-l-xl">Mã TP</th>
                <th className="px-4 py-3">Tên thực phẩm</th>
                <th className="px-4 py-3">Đơn vị</th>
                <th className="px-4 py-3">Số lượng</th>
                <th className="px-4 py-3">Đơn giá (đ)</th>
                <th className="px-4 py-3">Thành tiền (đ)</th>
                <th className="px-4 py-3">Nhà cung cấp</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredIngredients.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600">{item.code || `TP0${item.id}`}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs font-medium">{item.unit}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-800">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3.5 font-extrabold text-indigo-600">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3.5 text-slate-700 text-xs font-medium">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {item.supplier || "Chợ đầu mối"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
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
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Nhập Thực Phẩm Vào Kho</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Tự động tính Thành tiền = Số lượng × Đơn giá</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddIngredient} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Mã Thực Phẩm</label>
                    <input
                      type="text"
                      placeholder="VD: TP016"
                      value={newIngredient.code}
                      onChange={(e) => setNewIngredient({ ...newIngredient, code: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Tên thực phẩm *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Thịt bò tươi"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số lượng *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newIngredient.quantity || ""}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Đơn vị tính</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="kg">kg</option>
                      <option value="Quả">Quả</option>
                      <option value="Hộp">Hộp</option>
                      <option value="Chai">Chai</option>
                      <option value="bao">bao</option>
                      <option value="thùng">thùng</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Đơn giá (đ) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={newIngredient.unitPrice || ""}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unitPrice: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Nhà Cung Cấp</label>
                  <input
                    type="text"
                    placeholder="VD: Cửa hàng A, Vinamilk, Chợ đầu mối..."
                    value={newIngredient.supplier}
                    onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex justify-between items-center text-xs font-bold text-indigo-700">
                  <span>Thành tiền tự động:</span>
                  <span className="text-sm font-extrabold">
                    {formatCurrency((newIngredient.quantity || 0) * (newIngredient.unitPrice || 0))}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu thực phẩm vào kho
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
