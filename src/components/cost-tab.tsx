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
  Download,
  Loader2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { ToastNotification, ConfirmDeleteModal, ToastState } from "@/components/crud-feedback";

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

  // CRUD Animation & Feedback states
  const [toast, setToast] = useState<ToastState | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: IngredientCost | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    item: null,
    isLoading: false,
  });

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
          const mapped: IngredientCost[] = data.map((item: any) => {
            const rawName = item.name || "Nguyên liệu";
            const codeMatch = rawName.match(/^\[(.*?)\]/);
            const cleanName = rawName.replace(/^\[.*?\]\s*/, "");
            const code = codeMatch ? codeMatch[1] : `TP0${item.id}`;
            const unitPrice = item.unitPrice || 0;
            const quantity = item.quantity || 0;

            let supplier = "Chợ đầu mối";
            if (item.notes && item.notes.includes("Nhà cung cấp: ")) {
              supplier = item.notes.replace("Nhà cung cấp: ", "").trim();
            }

            let category = "Rau củ & Gia vị";
            if (cleanName.includes("Thịt") || cleanName.includes("Cá") || cleanName.includes("Tôm") || cleanName.includes("Trứng")) {
              category = "Thịt & Thức ăn chính";
            } else if (cleanName.includes("Sữa") || cleanName.includes("Bánh") || cleanName.includes("Sữa chua")) {
              category = "Sữa & Bữa phụ";
            }

            return {
              id: item.id.toString(),
              code,
              name: cleanName,
              quantity,
              unit: item.unit || "kg",
              unitPrice,
              total: quantity * unitPrice,
              supplier,
              date: item.date ? item.date.split("T")[0] : "2026-08-10",
              category,
            };
          });
          setIngredients(mapped);
        }
      })
      .catch((err) => console.error("Lỗi tải thực phẩm từ DB:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name || newIngredient.quantity <= 0 || newIngredient.unitPrice <= 0) return;

    setIsSubmitting(true);
    const total = newIngredient.quantity * newIngredient.unitPrice;
    const generatedId = Date.now().toString();
    const addedCode = newIngredient.code || `TP0${ingredients.length + 10}`;
    const added: IngredientCost = {
      id: generatedId,
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

    setIngredients((prev) => [added, ...prev]);
    setShowAddModal(false);
    setHighlightedId(generatedId);

    setToast({
      type: "success",
      title: "Nhập kho thành công",
      message: `Đã thêm thực phẩm "${added.name}" (${added.quantity} ${added.unit}) vào kho bếp.`
    });

    setTimeout(() => setHighlightedId(null), 2500);

    try {
      const res = await fetch("/api/ingredients", {
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
      const data = await res.json();
      if (data?.data?.id) {
        setIngredients((prev) =>
          prev.map((item) => (item.id === generatedId ? { ...item, id: data.data.id.toString() } : item))
        );
      }
    } catch (err) {
      console.error("Lỗi lưu thực phẩm vào DB:", err);
      setToast({
        type: "error",
        title: "Lỗi lưu kho",
        message: "Không thể lưu dữ liệu nguyên liệu lên máy chủ."
      });
    } finally {
      setIsSubmitting(false);
    }

    setNewIngredient({ code: "", name: "", quantity: 0, unit: "kg", unitPrice: 0, supplier: "Cửa hàng A", category: "Thịt & Thức ăn chính", date: new Date().toISOString().split("T")[0] });
  };

  const handlePromptDelete = (item: IngredientCost) => {
    setDeleteModal({
      isOpen: true,
      item,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    const itemToDelete = deleteModal.item;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await fetch(`/api/ingredients?id=${itemToDelete.id}`, { method: "DELETE" });

      setDeletingId(itemToDelete.id);
      setDeleteModal({ isOpen: false, item: null, isLoading: false });

      setTimeout(() => {
        setIngredients((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setDeletingId(null);
        setToast({
          type: "delete",
          title: "Đã xóa thực phẩm",
          message: `Đã xóa mặt hàng "${itemToDelete.name}" khỏi danh mục kho bếp.`
        });
      }, 350);
    } catch (err: any) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      setToast({
        type: "error",
        title: "Lỗi xóa thực phẩm",
        message: err.message || "Không thể xóa thực phẩm lúc này."
      });
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
    const summary = [
      { label: "Tháng báo cáo", value: selectedMonth },
      { label: "Tổng chi phí thực tế", value: formatCurrency(totalMonthlyCost) },
      { label: "Số mặt hàng xuất/nhập", value: `${filteredIngredients.length} loại` }
    ];
    exportToExcel(`Chi_Phi_Bep_Kho_Thuc_Pham_${selectedMonth}`, headers, rows, summary);
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
      { label: "Tổng chi phí thực tế", value: formatCurrency(totalMonthlyCost) },
      { label: "Số mặt hàng xuất/nhập", value: `${filteredIngredients.length} loại` }
    ];
    exportToPDF(
      `BÁO CÁO CHI PHÍ BẾP & KHO NGUYÊN LIỆU THỰC PHẨM - THÁNG ${selectedMonth}`,
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Toast Feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa thực phẩm"
        itemName={deleteModal.item ? `${deleteModal.item.name} (${deleteModal.item.quantity} ${deleteModal.item.unit})` : ""}
        itemType="mặt hàng thực phẩm"
        isLoading={deleteModal.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, isLoading: false })}
      />

      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-500/20 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Chi Phí & Định Mức Bếp Ăn
                </h1>
                <span className="text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Tháng {selectedMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Quản lý kho nguyên liệu, tính toán định mức suất ăn và đối soát công nợ nhà cung cấp thực phẩm.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            <button
              onClick={handleExportExcel}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Xuất file Excel"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="In PDF chi phí bếp"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>In PDF</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Nhập Thực Phẩm Kho</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tổng Chi Thực Phẩm Tháng</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalMonthlyCost)}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Định Mức Tiền Ăn / Trẻ</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">30.000 <span className="text-xs font-bold text-slate-400">đ/ngày</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Mặt Hàng Trong Kho</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{filteredIngredients.length} <span className="text-xs font-bold text-slate-400">loại thực phẩm</span></h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Table Container */}
      <div className="table-pro-container">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 w-full sm:w-auto transition-all"
            />

            <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {["ALL", "Thịt & Thức ăn chính", "Rau củ & Gia vị", "Sữa & Bữa phụ"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat ? "bg-white text-amber-700 shadow-2xs" : "text-slate-600"
                  }`}
                >
                  {cat === "ALL" ? "Tất cả nhóm" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên thực phẩm, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Mã TP</th>
                <th>Tên thực phẩm</th>
                <th>Nhóm thực phẩm</th>
                <th>Số lượng</th>
                <th>Đơn vị</th>
                <th>Đơn giá (VNĐ)</th>
                <th>Thành tiền (VNĐ)</th>
                <th>Nhà cung cấp</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Không có mặt hàng thực phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((item) => {
                  const isHighlighted = highlightedId === item.id;
                  const isDeleting = deletingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-all duration-300",
                        isHighlighted && "animate-row-add",
                        isDeleting && "animate-row-delete"
                      )}
                    >
                      <td className="font-mono text-xs font-bold text-amber-700 bg-amber-50/50 px-2.5 py-1 rounded-lg w-fit">
                        {item.code || `TP0${item.id}`}
                      </td>
                      <td className="font-bold text-slate-900">{item.name}</td>
                      <td>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                          {item.category}
                        </span>
                      </td>
                      <td className="font-extrabold text-slate-900">{item.quantity}</td>
                      <td className="text-slate-600 text-xs font-medium">{item.unit}</td>
                      <td className="text-slate-700 font-medium">{formatCurrency(item.unitPrice)}</td>
                      <td className="font-black text-amber-700">{formatCurrency(item.total)}</td>
                      <td>
                        <span className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200/50">
                          {item.supplier || "Chợ đầu mối"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handlePromptDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 rounded-lg transition-all cursor-pointer"
                          title="Xóa thực phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-modal-content">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl shadow-md shadow-amber-500/30">
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
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm font-mono"
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
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
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
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Đơn vị tính</label>
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="con">con</option>
                      <option value="quả">quả</option>
                      <option value="bó">bó</option>
                      <option value="lít">lít</option>
                      <option value="hộp">hộp</option>
                      <option value="thùng">thùng</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Đơn giá (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="120000"
                      value={newIngredient.unitPrice || ""}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unitPrice: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Nhóm Thực Phẩm</label>
                    <select
                      value={newIngredient.category}
                      onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Thịt & Thức ăn chính">Thịt & Thức ăn chính</option>
                      <option value="Rau củ & Gia vị">Rau củ & Gia vị</option>
                      <option value="Sữa & Bữa phụ">Sữa & Bữa phụ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Nhà Cung Cấp</label>
                    <input
                      type="text"
                      placeholder="VD: HTX Rau Sạch"
                      value={newIngredient.supplier}
                      onChange={(e) => setNewIngredient({ ...newIngredient, supplier: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Thành tiền ước tính:</span>
                  <span className="text-lg font-black text-amber-700">
                    {formatCurrency(newIngredient.quantity * newIngredient.unitPrice)}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang lưu nguyên liệu...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Lưu vào kho thực phẩm</span>
                      </>
                    )}
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
