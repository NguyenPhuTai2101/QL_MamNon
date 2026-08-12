"use client";

import React, { useState, useEffect } from 'react';
import Portal from "@/components/portal";
import { Building2, Plus, Search, Filter, Wrench, AlertTriangle, CheckCircle2, Trash2, Edit3, ShieldAlert, PackageCheck, DollarSign, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type AssetStatus = 'GOOD' | 'MAINTENANCE' | 'BROKEN';
type AssetCategory = 'ELECTRONIC' | 'FURNITURE' | 'TOY' | 'KITCHEN' | 'OTHER';

interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  location: string;
  quantity: number;
  unitPrice: number;
  status: AssetStatus;
}

const categoryLabels: Record<AssetCategory, string> = {
  ELECTRONIC: 'Điện tử',
  FURNITURE: 'Bàn ghế',
  TOY: 'Đồ chơi',
  KITCHEN: 'Bếp ăn',
  OTHER: 'Khác',
};

const statusConfig: Record<AssetStatus, { label: string; icon: any; colorClass: string; bgClass: string }> = {
  GOOD: { label: 'Tốt', icon: CheckCircle2, colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50' },
  MAINTENANCE: { label: 'Bảo trì', icon: Wrench, colorClass: 'text-amber-700', bgClass: 'bg-amber-50' },
  BROKEN: { label: 'Hỏng', icon: AlertTriangle, colorClass: 'text-rose-700', bgClass: 'bg-rose-50' },
};

export default function AssetsTab() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Tải danh sách Tài sản trực tiếp từ PostgreSQL Supabase
  useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((dbAssets) => {
        if (Array.isArray(dbAssets) && dbAssets.length > 0) {
          const mapped: Asset[] = dbAssets.map((a: any) => ({
            id: a.id,
            name: a.name,
            category: a.category as AssetCategory,
            location: a.location || 'Kho trường',
            quantity: a.quantity || 1,
            unitPrice: a.unitPrice || 0,
            status: a.status as AssetStatus,
          }));
          setAssets(mapped);
        }
      })
      .catch((err) => console.error('Lỗi tải tài sản từ DB:', err));
  }, []);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    category: 'ELECTRONIC',
    location: '',
    quantity: 1,
    unitPrice: 0,
    status: 'GOOD',
  });

  const totalAssets = assets.reduce((sum, a) => sum + a.quantity, 0);
  const goodAssets = assets.filter(a => a.status === 'GOOD').reduce((sum, a) => sum + a.quantity, 0);
  const maintenanceAssets = assets.filter(a => a.status !== 'GOOD').reduce((sum, a) => sum + a.quantity, 0);
  const totalValue = assets.reduce((sum, a) => sum + (a.quantity * a.unitPrice), 0);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `TS${String(assets.length + 1).padStart(3, '0')}`;
      const addedLocal = { ...newAsset, id } as Asset;
      setAssets([addedLocal, ...assets]);
      setIsAddModalOpen(false);

      await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      });

      setNewAsset({ name: '', category: 'ELECTRONIC', location: '', quantity: 1, unitPrice: 0, status: 'GOOD' });
    } catch (err) {
      console.error('Lỗi thêm tài sản vào DB:', err);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài sản này khỏi CSDL?')) {
      setAssets(assets.filter(a => a.id !== id));
      try {
        await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Lỗi xóa tài sản khỏi DB:', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Quản lý Tài sản & Thiết bị
          </h2>
          <p className="text-slate-500 mt-1">Theo dõi, bảo trì và quản lý cơ sở vật chất nhà trường</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Thêm tài sản</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-indigo-600 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <PackageCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng tài sản</p>
            <p className="text-2xl font-bold text-slate-800">{totalAssets}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-600 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đang sử dụng tốt</p>
            <p className="text-2xl font-bold text-slate-800">{goodAssets}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-600 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Cần bảo trì/sửa</p>
            <p className="text-2xl font-bold text-slate-800">{maintenanceAssets}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-purple-600 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng giá trị tài sản</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên tài sản..."
              className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400 mr-2" />
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Tất cả
            </button>
            {(Object.keys(categoryLabels) as AssetCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Mã TS</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Tên tài sản</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Loại</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Vị trí phân bổ</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Số lượng</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-right">Đơn giá</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="py-3 px-4 text-sm font-semibold text-slate-600 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const statusInfo = statusConfig[asset.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-indigo-600">{asset.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium">{asset.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{categoryLabels[asset.category]}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{asset.location}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium text-right">{asset.quantity}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 text-right">{formatCurrency(asset.unitPrice)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgClass} ${statusInfo.colorClass}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setNewAsset({
                                name: asset.name,
                                category: asset.category,
                                location: asset.location,
                                quantity: asset.quantity,
                                unitPrice: asset.unitPrice,
                                status: asset.status,
                              });
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Chỉnh sửa tài sản"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không tìm thấy tài sản nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Thêm Tài Sản Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Khai báo tài sản, thiết bị học tập và cơ sở vật chất mới</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddAsset} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Tên tài sản <span className="text-rose-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    placeholder="Nhập tên tài sản..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Loại tài sản</label>
                    <select 
                      value={newAsset.category}
                      onChange={e => setNewAsset({...newAsset, category: e.target.value as AssetCategory})}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      {(Object.keys(categoryLabels) as AssetCategory[]).map(cat => (
                        <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Trạng thái</label>
                    <select 
                      value={newAsset.status}
                      onChange={e => setNewAsset({...newAsset, status: e.target.value as AssetStatus})}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="GOOD">Tốt</option>
                      <option value="MAINTENANCE">Bảo trì</option>
                      <option value="BROKEN">Hỏng</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Vị trí phân bổ</label>
                  <input 
                    type="text" 
                    value={newAsset.location}
                    onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    placeholder="VD: Phòng học Mầm 1, Kho tổng..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số lượng <span className="text-rose-500">*</span></label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={newAsset.quantity}
                      onChange={e => setNewAsset({...newAsset, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Đơn giá (VNĐ)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="1000"
                      value={newAsset.unitPrice}
                      onChange={e => setNewAsset({...newAsset, unitPrice: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu tài sản mới
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

