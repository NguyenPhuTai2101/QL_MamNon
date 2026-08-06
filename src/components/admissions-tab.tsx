"use client";

import React, { useState } from 'react';
import { UserPlus, Plus, Search, Filter, Phone, Mail, Calendar, CheckCircle2, Clock, XCircle, ArrowRight, UserCheck, Trash2, X } from 'lucide-react';

const mockLeads = [
  { id: 1, parentName: 'Nguyễn Thị Hương', childName: 'Trần Minh Tuấn', ageGroup: '3-4 tuổi', phone: '0901234567', email: 'huong.nguyen@example.com', source: 'Facebook', status: 'NEW', date: '01/08/2026', notes: 'Hỏi về học phí' },
  { id: 2, parentName: 'Trần Văn Dũng', childName: 'Lê Mai Trang', ageGroup: '4-5 tuổi', phone: '0901234568', email: 'dung.tran@example.com', source: 'Website', status: 'CONTACTED', date: '02/08/2026', notes: 'Đã gọi tư vấn' },
  { id: 3, parentName: 'Lê Thị Thu', childName: 'Phạm Gia Bảo', ageGroup: '2-3 tuổi', phone: '0901234569', email: 'thu.le@example.com', source: 'Giới thiệu', status: 'VISITED', date: '03/08/2026', notes: 'Đã hẹn t7 qua trường' },
  { id: 4, parentName: 'Phạm Văn Thành', childName: 'Hoàng Bảo Yến', ageGroup: '5-6 tuổi', phone: '0901234570', email: 'thanh.pham@example.com', source: 'Google', status: 'ENROLLED', date: '04/08/2026', notes: 'Đã đóng học phí' },
  { id: 5, parentName: 'Hoàng Thị Lan', childName: 'Nguyễn Quốc Việt', ageGroup: '3-4 tuổi', phone: '0901234571', email: 'lan.hoang@example.com', source: 'Facebook', status: 'REJECTED', date: '05/08/2026', notes: 'Trường xa nhà' },
  { id: 6, parentName: 'Ngô Văn Nam', childName: 'Đinh Phương Anh', ageGroup: '2-3 tuổi', phone: '0901234572', email: 'nam.ngo@example.com', source: 'Zalo', status: 'NEW', date: '06/08/2026', notes: 'Xin thực đơn' },
];

const STATUSES = {
  'NEW': { label: 'Hồ sơ mới', color: 'text-sky-600 bg-sky-100' },
  'CONTACTED': { label: 'Đã tư vấn', color: 'text-indigo-600 bg-indigo-100' },
  'VISITED': { label: 'Tham quan', color: 'text-purple-600 bg-purple-100' },
  'ENROLLED': { label: 'Đã nhập học', color: 'text-emerald-600 bg-emerald-100' },
  'REJECTED': { label: 'Từ chối', color: 'text-rose-600 bg-rose-100' },
};

export default function AdmissionsTab() {
  const [leads, setLeads] = useState(mockLeads);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Lead Form State
  const [formData, setFormData] = useState({
    parentName: '', childName: '', ageGroup: '', phone: '', email: '', source: '', notes: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = {
      id: leads.length + 1,
      ...formData,
      status: 'NEW',
      date: new Date().toLocaleDateString('vi-VN'),
    };
    setLeads([newLead, ...leads]);
    setShowAddModal(false);
    setFormData({ parentName: '', childName: '', ageGroup: '', phone: '', email: '', source: '', notes: '' });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesTab = activeTab === 'ALL' || lead.status === activeTab;
    const matchesSearch = lead.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.phone.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const enrolledCount = leads.filter(l => l.status === 'ENROLLED').length;
  const conversionRate = Math.round((enrolledCount / leads.length) * 100) || 0;

  return (
    <div className="animate-fadeIn p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tuyển sinh</h1>
          <p className="text-slate-500">Theo dõi quy trình tư vấn và đăng ký nhập học</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mở trang Đăng ký Online phụ huynh</span>
          </a>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hồ sơ mới</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-indigo-600 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tổng hồ sơ tư vấn</p>
              <h3 className="text-3xl font-bold text-slate-800">{leads.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <UserPlus className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-purple-600 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Đã hẹn tham quan</p>
              <h3 className="text-3xl font-bold text-slate-800">{leads.filter(l => l.status === 'VISITED').length}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-emerald-600 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Đã nhập học</p>
              <h3 className="text-3xl font-bold text-slate-800">{enrolledCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-sky-600 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tỷ lệ chuyển đổi</p>
              <h3 className="text-3xl font-bold text-slate-800">{conversionRate}%</h3>
            </div>
            <div className="p-3 bg-sky-50 rounded-xl">
              <ArrowRight className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
              <button onClick={() => setActiveTab('ALL')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Tất cả</button>
              <button onClick={() => setActiveTab('NEW')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'NEW' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}>Hồ sơ mới</button>
              <button onClick={() => setActiveTab('CONTACTED')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'CONTACTED' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Đã tư vấn</button>
              <button onClick={() => setActiveTab('VISITED')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'VISITED' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>Tham quan trường</button>
              <button onClick={() => setActiveTab('ENROLLED')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'ENROLLED' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>Đã nhập học</button>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm phụ huynh, bé, SĐT..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-medium">Phụ huynh / Bé</th>
                <th className="p-4 font-medium">Độ tuổi</th>
                <th className="p-4 font-medium">SĐT / Email</th>
                <th className="p-4 font-medium">Nguồn tư vấn</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Ngày đăng ký</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{lead.parentName}</div>
                    <div className="text-sm text-slate-500">Bé: {lead.childName}</div>
                  </td>
                  <td className="p-4 text-slate-600">{lead.ageGroup}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-800"><Phone className="w-3 h-3 text-slate-400" /> {lead.phone}</div>
                    <div className="flex items-center gap-1 text-sm text-slate-500"><Mail className="w-3 h-3 text-slate-400" /> {lead.email}</div>
                  </td>
                  <td className="p-4 text-slate-600">{lead.source}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUSES[lead.status as keyof typeof STATUSES].color}`}>
                      {STATUSES[lead.status as keyof typeof STATUSES].label}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{lead.date}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Cập nhật trạng thái"><Clock className="w-4 h-4" /></button>
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Nhập học"><UserCheck className="w-4 h-4" /></button>
                      <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Không tìm thấy hồ sơ nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Thêm hồ sơ tư vấn</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tên phụ huynh *</label>
                  <input required type="text" value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tên bé *</label>
                  <input required type="text" value={formData.childName} onChange={(e) => setFormData({...formData, childName: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Số điện thoại *</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Độ tuổi của bé</label>
                  <select value={formData.ageGroup} onChange={(e) => setFormData({...formData, ageGroup: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                    <option value="">Chọn độ tuổi</option>
                    <option value="1-2 tuổi">1-2 tuổi</option>
                    <option value="2-3 tuổi">2-3 tuổi</option>
                    <option value="3-4 tuổi">3-4 tuổi</option>
                    <option value="4-5 tuổi">4-5 tuổi</option>
                    <option value="5-6 tuổi">5-6 tuổi</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nguồn biết đến trường</label>
                <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="">Chọn nguồn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Google">Tìm kiếm Google</option>
                  <option value="Giới thiệu">Người quen giới thiệu</option>
                  <option value="Zalo">Zalo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors font-medium">Lưu hồ sơ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
