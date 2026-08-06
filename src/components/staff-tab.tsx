"use client"

import React, { useState } from 'react';
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Position = 'TEACHER' | 'ASSISTANT' | 'COOK' | 'GUARD' | 'ADMIN_STAFF';
type Status = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';

interface Staff {
  id: string;
  fullName: string;
  position: Position;
  phone: string;
  email: string;
  degree: string;
  startDate: string;
  assignedClass: string;
  status: Status;
  salary: number;
  notes: string;
}

const mockData: Staff[] = [
  { id: '1', fullName: 'Nguyễn Thị Hương', position: 'TEACHER', phone: '0987654321', email: 'huong.nt@example.com', degree: 'Đại học', startDate: '2023-08-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 12000000, notes: '' },
  { id: '2', fullName: 'Trần Văn Mạnh', position: 'GUARD', phone: '0912345678', email: 'manh.tv@example.com', degree: 'Trung học phổ thông', startDate: '2022-05-15', assignedClass: '', status: 'ACTIVE', salary: 7000000, notes: '' },
  { id: '3', fullName: 'Lê Thị Lan', position: 'COOK', phone: '0909090909', email: 'lan.lt@example.com', degree: 'Chứng chỉ nghề', startDate: '2024-01-10', assignedClass: '', status: 'ON_LEAVE', salary: 8500000, notes: 'Nghỉ sinh' },
  { id: '4', fullName: 'Phạm Minh Tuấn', position: 'ADMIN_STAFF', phone: '0888888888', email: 'tuan.pm@example.com', degree: 'Cao đẳng', startDate: '2023-11-20', assignedClass: '', status: 'ACTIVE', salary: 10000000, notes: '' },
  { id: '5', fullName: 'Đỗ Thu Hà', position: 'ASSISTANT', phone: '0777777777', email: 'ha.dt@example.com', degree: 'Cao đẳng', startDate: '2024-02-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 8000000, notes: '' },
  { id: '6', fullName: 'Hoàng Quốc Việt', position: 'TEACHER', phone: '0666666666', email: 'viet.hq@example.com', degree: 'Đại học', startDate: '2021-09-05', assignedClass: 'Lá 2', status: 'RESIGNED', salary: 13000000, notes: '' },
];

const POSITION_MAP: Record<Position, { label: string; color: string }> = {
  TEACHER: { label: 'Giáo viên', color: 'bg-blue-100 text-blue-700' },
  ASSISTANT: { label: 'Trợ giảng', color: 'bg-cyan-100 text-cyan-700' },
  COOK: { label: 'Nhân viên bếp', color: 'bg-orange-100 text-orange-700' },
  GUARD: { label: 'Bảo vệ', color: 'bg-slate-100 text-slate-700' },
  ADMIN_STAFF: { label: 'Hành chính', color: 'bg-purple-100 text-purple-700' },
};

const STATUS_MAP: Record<Status, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang làm', color: 'bg-green-100 text-green-700' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-amber-100 text-amber-700' },
  RESIGNED: { label: 'Đã nghỉ', color: 'bg-red-100 text-red-700' },
};

export default function StaffTab() {
  const [staffList, setStaffList] = useState<Staff[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Staff>>({
    fullName: '',
    phone: '',
    email: '',
    position: 'TEACHER',
    degree: '',
    startDate: '',
    assignedClass: '',
    salary: 0,
    notes: '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: Staff = {
      ...formData,
      id: Date.now().toString(),
      status: 'ACTIVE',
    } as Staff;
    
    setStaffList([newStaff, ...staffList]);
    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      position: 'TEACHER',
      degree: '',
      startDate: '',
      assignedClass: '',
      salary: 0,
      notes: '',
    });
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân sự này?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || staff.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  // Stats calculation
  const totalStaff = staffList.length;
  const activeTeachers = staffList.filter(s => s.position === 'TEACHER' && s.status === 'ACTIVE').length;
  const onLeaveCount = staffList.filter(s => s.status === 'ON_LEAVE').length;
  const totalSalary = staffList.reduce((acc, curr) => acc + (curr.status !== 'RESIGNED' ? curr.salary : 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng nhân sự</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalStaff}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserCog className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Giáo viên đang làm</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeTeachers}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Nghỉ phép</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{onLeaveCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Quỹ lương tháng</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalSalary)}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as Position | 'ALL')}
              className="pl-9 pr-4 py-2 w-full sm:w-48 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all"
            >
              <option value="ALL">Tất cả chức vụ</option>
              <option value="TEACHER">Giáo viên</option>
              <option value="ASSISTANT">Trợ giảng</option>
              <option value="COOK">Nhân viên bếp</option>
              <option value="GUARD">Bảo vệ</option>
              <option value="ADMIN_STAFF">Hành chính</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân sự</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nhân sự</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Chức vụ</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Liên hệ</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Lớp phụ trách</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Mức lương</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {getInitials(staff.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{staff.fullName}</p>
                          <p className="text-xs text-slate-500">{staff.degree}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${POSITION_MAP[staff.position].color}`}>
                        {POSITION_MAP[staff.position].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{staff.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 font-medium">{staff.assignedClass || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(staff.salary)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[staff.status].color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          staff.status === 'ACTIVE' ? 'bg-green-600' : 
                          staff.status === 'ON_LEAVE' ? 'bg-amber-600' : 'bg-red-600'
                        }`} />
                        {STATUS_MAP[staff.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy nhân sự nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Thêm nhân sự mới</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-staff-form" onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Họ và tên *</label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Chức vụ *</label>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value as Position })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="TEACHER">Giáo viên</option>
                      <option value="ASSISTANT">Trợ giảng</option>
                      <option value="COOK">Nhân viên bếp</option>
                      <option value="GUARD">Bảo vệ</option>
                      <option value="ADMIN_STAFF">Hành chính</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Số điện thoại *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Bằng cấp</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Ngày bắt đầu *</label>
                    <input
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Lớp phụ trách</label>
                    <input
                      type="text"
                      value={formData.assignedClass}
                      onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="VD: Chồi 1, Lá 2..."
                      disabled={formData.position !== 'TEACHER' && formData.position !== 'ASSISTANT'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Mức lương (VNĐ) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="add-staff-form"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                Lưu nhân sự
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
