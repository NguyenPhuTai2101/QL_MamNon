"use client";

import React, { useState, useMemo } from 'react';
import { 
  Wallet, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, 
  Trash2, X, Calendar, DollarSign, TrendingUp, TrendingDown, CheckCircle2 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Types
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

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-08-01', type: 'INCOME', category: 'TUITION', amount: 15000000, description: 'Học phí tháng 8 Lớp Mầm 1', createdBy: 'Admin' },
  { id: '2', date: '2026-08-02', type: 'EXPENSE', category: 'KITCHEN', amount: 2500000, description: 'Mua thực phẩm tuần 1', createdBy: 'Thủ quỹ' },
  { id: '3', date: '2026-08-03', type: 'INCOME', category: 'MEAL_FEE', amount: 5000000, description: 'Phí bán trú tháng 8 Lớp Mầm 1', createdBy: 'Admin' },
  { id: '4', date: '2026-08-04', type: 'EXPENSE', category: 'EQUIPMENT', amount: 1200000, description: 'Mua văn phòng phẩm', createdBy: 'Thủ quỹ' },
  { id: '5', date: '2026-08-05', type: 'EXPENSE', category: 'UTILITY', amount: 3500000, description: 'Thanh toán tiền điện nước tháng 7', createdBy: 'Kế toán' },
  { id: '6', date: '2026-08-05', type: 'INCOME', category: 'PARENT_FUND', amount: 2000000, description: 'Thu quỹ phụ huynh đợt 1', createdBy: 'Admin' },
  { id: '7', date: '2026-08-06', type: 'EXPENSE', category: 'SALARY', amount: 25000000, description: 'Trả lương giáo viên tháng 7', createdBy: 'Kế toán' },
  { id: '8', date: '2026-08-06', type: 'INCOME', category: 'OTHER_INCOME', amount: 500000, description: 'Bán phế liệu', createdBy: 'Admin' },
  { id: '9', date: '2026-08-07', type: 'EXPENSE', category: 'OTHER_EXPENSE', amount: 800000, description: 'Sửa chữa vòi nước', createdBy: 'Thủ quỹ' },
  { id: '10', date: '2026-08-08', type: 'INCOME', category: 'TUITION', amount: 12000000, description: 'Học phí tháng 8 Lớp Chồi 1', createdBy: 'Admin' },
];

export default function FinanceTab() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'ALL'>('ALL');
  const [filterMonth, setFilterMonth] = useState('2026-08');

  // Add form state
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

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bút toán này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: addForm.date,
      type: addForm.type,
      category: addForm.category,
      amount: Number(addForm.amount),
      description: addForm.description,
      createdBy: 'Admin', // Mock
    };
    setTransactions([newTransaction, ...transactions]);
    setIsAddModalOpen(false);
    setAddForm({
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      category: 'TUITION',
      amount: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            Sổ Thu Chi
          </h2>
          <p className="text-slate-500 mt-1">Quản lý các khoản thu và chi tiêu của trường</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm bút toán
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng Thu (Tháng)</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng Chi (Tháng)</p>
            <p className="text-xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${balance >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Số Dư Quỹ (Tháng)</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
              {balance > 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Số Bút Toán (Tháng)</p>
            <p className="text-xl font-bold text-slate-800">{transactionCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="ALL">Tất cả danh mục</option>
              <optgroup label="Danh mục Thu">
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </optgroup>
              <optgroup label="Danh mục Chi">
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterType === type 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type === 'INCOME' ? 'Khoản Thu' : 'Khoản Chi'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-medium">Ngày</th>
                <th className="p-4 font-medium">Loại</th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium">Mô tả</th>
                <th className="p-4 font-medium text-right">Số tiền</th>
                <th className="p-4 font-medium">Người tạo</th>
                <th className="p-4 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Không tìm thấy bút toán nào
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-700">
                      {new Date(tx.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      {tx.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                          <ArrowUpRight className="w-3 h-3" /> Thu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                          <ArrowDownRight className="w-3 h-3" /> Chi
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {CATEGORY_LABELS[tx.category]}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className={`p-4 text-right font-medium ${tx.type === 'INCOME' ? 'text-green-600' : 'text-rose-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {tx.createdBy}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Thêm Bút Toán Mới</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAddForm(prev => ({ ...prev, type: 'INCOME', category: INCOME_CATEGORIES[0] }))
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    addForm.type === 'INCOME' 
                      ? 'bg-white text-green-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Khoản Thu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddForm(prev => ({ ...prev, type: 'EXPENSE', category: EXPENSE_CATEGORIES[0] }))
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    addForm.type === 'EXPENSE' 
                      ? 'bg-white text-rose-700 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Khoản Chi
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date"
                    required
                    value={addForm.date}
                    onChange={(e) => setAddForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                <select
                  required
                  value={addForm.category}
                  onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  {(addForm.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền (VNĐ)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number"
                    required
                    min="0"
                    placeholder="Nhập số tiền..."
                    value={addForm.amount}
                    onChange={(e) => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea 
                  required
                  placeholder="Nhập lý do thu/chi..."
                  value={addForm.description}
                  onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-y"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors shadow-sm"
                >
                  Lưu bút toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
