"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Portal from "@/components/portal";
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  X, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  Download,
  Printer,
  Loader2,
  CreditCard
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { ToastNotification, ConfirmDeleteModal, ToastState } from "@/components/crud-feedback";

type TransactionType = 'INCOME' | 'EXPENSE';
type IncomeCategory = 'TUITION' | 'MEAL_FEE' | 'PARENT_FUND' | 'OTHER_INCOME';
type ExpenseCategory = 'SALARY' | 'KITCHEN' | 'EQUIPMENT' | 'UTILITY' | 'OTHER_EXPENSE';
type TransactionCategory = IncomeCategory | ExpenseCategory;

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  createdBy: string;
}

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  TUITION: 'Học phí',
  MEAL_FEE: 'Phí bán trú',
  PARENT_FUND: 'Quỹ phụ huynh',
  OTHER_INCOME: 'Thu khác',
  SALARY: 'Lương nhân viên',
  KITCHEN: 'Chi phí bếp ăn',
  EQUIPMENT: 'Mua sắm thiết bị',
  UTILITY: 'Điện nước',
  OTHER_EXPENSE: 'Chi khác',
};

const INCOME_CATEGORIES: IncomeCategory[] = ['TUITION', 'MEAL_FEE', 'PARENT_FUND', 'OTHER_INCOME'];
const EXPENSE_CATEGORIES: ExpenseCategory[] = ['SALARY', 'KITCHEN', 'EQUIPMENT', 'UTILITY', 'OTHER_EXPENSE'];

export default function FinanceTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'ALL'>('ALL');
  const [filterMonth, setFilterMonth] = useState('2026-08');

  // Tải Sổ Thu Chi trực tiếp từ CSDL PostgreSQL Supabase
  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const mapped: Transaction[] = resData.data.map((t: any) => ({
            id: t.id,
            date: t.date ? t.date.split('T')[0] : '2026-08-01',
            type: t.type as TransactionType,
            category: t.category as TransactionCategory,
            amount: t.amount || 0,
            description: t.description,
            createdBy: t.createdBy || 'Admin',
          }));
          setTransactions(mapped);
        }
      })
      .catch((err) => console.error('Lỗi tải Sổ Thu Chi từ DB:', err));
  }, []);

  // CRUD Animation & Feedback states
  const [toast, setToast] = useState<ToastState | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: Transaction | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    item: null,
    isLoading: false,
  });

  const [addForm, setAddForm] = useState<{
    date: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: string;
    description: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    type: 'INCOME',
    category: 'TUITION',
    amount: '',
    description: '',
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchCategory = filterCategory === 'ALL' || t.category === filterCategory;
      const matchMonth = t.date.startsWith(filterMonth);
      return matchSearch && matchType && matchCategory && matchMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth]);

  const { totalIncome, totalExpense } = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(filterMonth))
      .reduce((acc, curr) => {
        if (curr.type === 'INCOME') acc.totalIncome += curr.amount;
        else acc.totalExpense += curr.amount;
        return acc;
      }, { totalIncome: 0, totalExpense: 0 });
  }, [transactions, filterMonth]);

  const balance = totalIncome - totalExpense;
  const transactionCount = transactions.filter(t => t.date.startsWith(filterMonth)).length;

  const handlePromptDelete = (item: Transaction) => {
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
      await fetch(`/api/transactions?id=${itemToDelete.id}`, { method: 'DELETE' });

      // Animate exit
      setDeletingId(itemToDelete.id);
      setDeleteModal({ isOpen: false, item: null, isLoading: false });

      setTimeout(() => {
        setTransactions((prev) => prev.filter((t) => t.id !== itemToDelete.id));
        setDeletingId(null);
        setToast({
          type: "delete",
          title: "Đã xóa bút toán",
          message: `Đã xóa giao dịch "${itemToDelete.description}" (${formatCurrency(itemToDelete.amount)}) khỏi sổ quỹ.`
        });
      }, 350);
    } catch (err: any) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      setToast({
        type: "error",
        title: "Lỗi xóa bút toán",
        message: err.message || "Không thể xóa bút toán lúc này."
      });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.amount || !addForm.description) return;

    setIsSubmitting(true);
    try {
      const generatedId = Date.now().toString();
      const newTransaction: Transaction = {
        id: generatedId,
        date: addForm.date,
        type: addForm.type,
        category: addForm.category,
        amount: parseFloat(addForm.amount),
        description: addForm.description,
        createdBy: 'Admin',
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      setIsAddModalOpen(false);
      setHighlightedId(generatedId);

      setToast({
        type: "success",
        title: "Tạo bút toán thành công",
        message: `Đã ghi nhận bút toán ${newTransaction.type === 'INCOME' ? 'Thu' : 'Chi'}: ${formatCurrency(newTransaction.amount)}.`
      });

      setTimeout(() => setHighlightedId(null), 2500);

      // Lưu bút toán vào CSDL Supabase
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newTransaction.date,
          type: newTransaction.type,
          category: newTransaction.category,
          amount: newTransaction.amount,
          description: newTransaction.description,
          createdBy: newTransaction.createdBy,
        }),
      });
      const data = await res.json();
      if (data?.data?.id) {
        // Cập nhật id thật từ DB nếu có
        setTransactions((prev) =>
          prev.map((t) => (t.id === generatedId ? { ...t, id: data.data.id } : t))
        );
      }
    } catch (err) {
      console.error('Lỗi tạo bút toán:', err);
      setToast({
        type: "error",
        title: "Lỗi lưu bút toán",
        message: "Không thể lưu bút toán vào máy chủ."
      });
    } finally {
      setIsSubmitting(false);
    }

    setAddForm({
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      category: 'TUITION',
      amount: '',
      description: '',
    });
  };

  const handleExportExcel = () => {
    const headers = ["STT", "Ngày giao dịch", "Loại", "Danh mục", "Số tiền (VNĐ)", "Nội dung bút toán", "Người tạo"];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.date,
      t.type === 'INCOME' ? 'Thu (+)' : 'Chi (-)',
      CATEGORY_LABELS[t.category] || t.category,
      t.type === 'INCOME' ? t.amount : -t.amount,
      t.description,
      t.createdBy
    ]);
    exportToExcel(`So_Thu_Chi_Tai_Chinh_${filterMonth}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["STT", "Ngày", "Loại", "Danh mục", "Số tiền", "Nội dung", "Người tạo"];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      t.date,
      t.type === 'INCOME' ? 'THU' : 'CHI',
      CATEGORY_LABELS[t.category] || t.category,
      formatCurrency(t.amount),
      t.description,
      t.createdBy
    ]);
    const summary = [
      { label: "Kỳ báo cáo", value: filterMonth },
      { label: "Tổng Thu", value: formatCurrency(totalIncome) },
      { label: "Tổng Chi", value: formatCurrency(totalExpense) },
      { label: "Số Dư Quỹ", value: formatCurrency(balance) }
    ];
    exportToPDF(`SỔ QUỸ VÀ BÚT TOÁN THU CHI - THÁNG ${filterMonth}`, headers, rows, summary);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa bút toán thu chi"
        itemName={deleteModal.item ? `${deleteModal.item.description} (${formatCurrency(deleteModal.item.amount)})` : ""}
        itemType="bút toán"
        isLoading={deleteModal.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, item: null, isLoading: false })}
      />

      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 rounded-2xl text-white shadow-md shadow-emerald-500/20 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Sổ Quỹ Thu Chi & Dòng Tiền
                </h1>
                <span className="text-xs font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tháng {filterMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Theo dõi dòng tiền thu học phí, tiền ăn, hoạt động và các khoản mục chi phí trường học.
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
              title="In PDF sổ thu chi"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>In PDF</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tạo Bút Toán Thu Chi</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tổng Thu Tháng</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalIncome)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tổng Chi Tháng</p>
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Số Dư Quỹ Hiện Tại</p>
              <h3 className={`text-xl sm:text-2xl font-black mt-1 ${balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                {formatCurrency(balance)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Số Bút Toán</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{transactionCount} <span className="text-xs font-bold text-slate-400">giao dịch</span></h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table UI-UX PRO MAX */}
      <div className="table-pro-container">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Month Filter */}
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-full sm:w-auto transition-all"
            />

            {/* Type Toggle Tabs */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterType === 'ALL' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('INCOME')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterType === 'INCOME' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Khu vực Thu
              </button>
              <button
                onClick={() => setFilterType('EXPENSE')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  filterType === 'EXPENSE' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Khu vực Chi
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nội dung thu chi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Ngày giao dịch</th>
                <th>Phân loại</th>
                <th>Danh mục Quỹ</th>
                <th>Diễn giải / Nội dung thu chi</th>
                <th>Số tiền (VNĐ)</th>
                <th>Người tạo</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Không có bút toán thu chi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item) => {
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
                      <td className="font-mono text-xs text-slate-500 font-bold">
                        {item.date}
                      </td>
                      <td>
                        {item.type === 'INCOME' ? (
                          <span className="badge-pill badge-pill-emerald">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Thu tiền
                          </span>
                        ) : (
                          <span className="badge-pill badge-pill-rose">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Chi tiền
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-900">{item.description}</td>
                      <td className={`font-black text-sm ${item.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>
                      <td className="text-slate-500 text-xs font-semibold">{item.createdBy}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handlePromptDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 rounded-lg transition-all cursor-pointer"
                          title="Xóa bút toán"
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

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-modal-content">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Tạo Bút Toán Thu Chi Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ghi nhận giao dịch vào sổ quỹ tài chính nhà trường</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Loại giao dịch</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAddForm({ ...addForm, type: 'INCOME', category: 'TUITION' })}
                      className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all shadow-sm ${
                        addForm.type === 'INCOME'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50/80 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" /> Bút Toán Thu (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddForm({ ...addForm, type: 'EXPENSE', category: 'KITCHEN' })}
                      className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all shadow-sm ${
                        addForm.type === 'EXPENSE'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20'
                          : 'bg-slate-50/80 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      <ArrowDownRight className="w-4 h-4" /> Bút Toán Chi (-)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày giao dịch</label>
                    <input
                      type="date"
                      required
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Danh mục</label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({ ...addForm, category: e.target.value as TransactionCategory })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      {addForm.type === 'INCOME'
                        ? INCOME_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))
                        : EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số tiền (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 1500000"
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Diễn giải / Nội dung *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ghi rõ nội dung thu hoặc chi..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang lưu giao dịch...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Lưu giao dịch tài chính</span>
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
