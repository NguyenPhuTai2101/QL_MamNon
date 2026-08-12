"use client";

import React, { useState, useEffect } from 'react';
import Portal from "@/components/portal";
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
  X,
  Users,
  Calendar,
  DollarSign
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
  { id: '1', fullName: 'Nguyễn Thị Hương', position: 'TEACHER', phone: '0987654321', email: 'huong.nt@example.com', degree: 'Đại học Sư phạm', startDate: '2023-08-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 12000000, notes: 'Giáo viên giỏi cấp trường' },
  { id: '2', fullName: 'Trần Văn Mạnh', position: 'GUARD', phone: '0912345678', email: 'manh.tv@example.com', degree: 'THPT', startDate: '2022-05-15', assignedClass: '', status: 'ACTIVE', salary: 7000000, notes: 'Trực ca ngày' },
  { id: '3', fullName: 'Lê Thị Lan', position: 'COOK', phone: '0909090909', email: 'lan.lt@example.com', degree: 'Chứng chỉ Nấu ăn Pro', startDate: '2024-01-10', assignedClass: '', status: 'ON_LEAVE', salary: 8500000, notes: 'Nghỉ thai sản' },
  { id: '4', fullName: 'Phạm Minh Tuấn', position: 'ADMIN_STAFF', phone: '0888888888', email: 'tuan.pm@example.com', degree: 'Cử nhân CNTT', startDate: '2023-11-20', assignedClass: '', status: 'ACTIVE', salary: 10000000, notes: 'Quản trị hệ thống' },
  { id: '5', fullName: 'Đỗ Thu Hà', position: 'ASSISTANT', phone: '0777777777', email: 'ha.dt@example.com', degree: 'Cao đẳng Sư phạm', startDate: '2024-02-01', assignedClass: 'Chồi 1', status: 'ACTIVE', salary: 8000000, notes: '' },
  { id: '6', fullName: 'Hoàng Quốc Việt', position: 'TEACHER', phone: '0666666666', email: 'viet.hq@example.com', degree: 'Đại học', startDate: '2021-09-05', assignedClass: 'Lá 2', status: 'RESIGNED', salary: 13000000, notes: 'Chuyển công tác' },
];

const POSITION_MAP: Record<Position, { label: string; color: string }> = {
  TEACHER: { label: 'Giáo viên', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ASSISTANT: { label: 'Trợ giảng', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  COOK: { label: 'Cấp dưỡng / Bếp', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  GUARD: { label: 'Bảo vệ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ADMIN_STAFF: { label: 'Hành chính', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const STATUS_MAP: Record<Status, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang làm việc', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RESIGNED: { label: 'Đã nghỉ việc', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function StaffTab() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Tải danh sách Nhân viên trực tiếp từ Supabase PostgreSQL CSDL
  useEffect(() => {
    fetch('/api/staff')
      .then((res) => res.json())
      .then((dbStaff) => {
        if (Array.isArray(dbStaff) && dbStaff.length > 0) {
          const mapped: Staff[] = dbStaff.map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
            position: s.position as Position,
            phone: s.phone,
            email: s.email || '',
            degree: s.degree || '',
            startDate: s.startDate ? s.startDate.split('T')[0] : '2024-09-01',
            assignedClass: s.assignedClass || '',
            status: s.status as Status,
            salary: s.salary || 8000000,
            notes: s.notes || '',
          }));
          setStaffList(mapped);
        }
      })
      .catch((err) => console.error('Lỗi tải nhân sự từ DB:', err));
  }, []);

  const [formData, setFormData] = useState<Partial<Staff>>({
    fullName: '',
    phone: '',
    email: '',
    position: 'TEACHER',
    degree: '',
    startDate: new Date().toISOString().split('T')[0],
    assignedClass: '',
    salary: 8000000,
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

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    try {
      const newStaff: Staff = {
        ...formData,
        id: Date.now().toString(),
        status: 'ACTIVE',
      } as Staff;
      
      setStaffList([newStaff, ...staffList]);
      setIsAddModalOpen(false);

      // Lưu trực tiếp vào Database Supabase
      await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        position: 'TEACHER',
        degree: '',
        startDate: new Date().toISOString().split('T')[0],
        assignedClass: '',
        salary: 8000000,
        notes: '',
      });
    } catch (err) {
      console.error('Lỗi lưu nhân viên vào DB:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hồ sơ nhân viên này khỏi CSDL?')) {
      setStaffList(staffList.filter((item) => item.id !== id));
      try {
        await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Lỗi xóa nhân viên khỏi DB:', err);
      }
    }
  };

  const filteredStaff = staffList.filter((item) => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.phone.includes(searchQuery) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || item.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  // Calculate statistics
  const totalStaff = staffList.length;
  const activeTeachers = staffList.filter((s) => s.position === 'TEACHER' && s.status === 'ACTIVE').length;
  const onLeaveCount = staffList.filter((s) => s.status === 'ON_LEAVE').length;
  const totalSalary = staffList
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.salary || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Giáo viên & Nhân sự</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách nhân viên, gán lớp phụ trách, mức lương và trạng thái làm việc.</p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên mới
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng nhân sự</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalStaff} <span className="text-sm font-medium text-slate-500">người</span></h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GV Đứng lớp</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeTeachers} <span className="text-sm font-medium text-slate-500">cô</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang nghỉ phép</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{onLeaveCount} <span className="text-sm font-medium text-slate-500">người</span></h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quỹ lương tháng</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(totalSalary)}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table UI-UX PRO MAX */}
      <div className="table-pro-container">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, email nhân sự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-extrabold shrink-0 mr-1">Chức vụ:</span>
            <button
              onClick={() => setPositionFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                positionFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả ({staffList.length})
            </button>
            {(Object.keys(POSITION_MAP) as Position[]).map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                  positionFilter === pos
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {POSITION_MAP[pos].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Chức vụ</th>
                <th>Thông tin liên hệ</th>
                <th>Lớp phụ trách</th>
                <th>Bằng cấp</th>
                <th>Mức lương</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy nhân viên nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const posInfo = POSITION_MAP[staff.position];
                  const statusInfo = STATUS_MAP[staff.status];
                  return (
                    <tr key={staff.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm ring-2 ring-indigo-50 shrink-0">
                            {getInitials(staff.fullName)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {staff.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Vào làm: {staff.startDate}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${posInfo.color}`}>
                          {posInfo.label}
                        </span>
                      </td>
                      <td className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-mono font-semibold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {staff.phone}
                        </div>
                        {staff.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {staff.email}
                          </div>
                        )}
                      </td>
                      <td>
                        {staff.assignedClass ? (
                          <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-indigo-100/60">
                            Lớp {staff.assignedClass}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="text-slate-700 text-xs font-medium">{staff.degree || '—'}</td>
                      <td className="font-black text-slate-900">{formatCurrency(staff.salary)}</td>
                      <td>
                        {staff.status === 'ACTIVE' && (
                          <span className="badge-pill badge-pill-emerald">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đang làm việc
                          </span>
                        )}
                        {staff.status === 'ON_LEAVE' && (
                          <span className="badge-pill badge-pill-amber">
                            Nghỉ phép
                          </span>
                        )}
                        {staff.status === 'RESIGNED' && (
                          <span className="badge-pill badge-pill-rose">
                            Đã nghỉ
                          </span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setFormData({
                              fullName: staff.fullName,
                              phone: staff.phone,
                              email: staff.email || '',
                              position: staff.position,
                              degree: staff.degree || '',
                              startDate: staff.startDate,
                              assignedClass: staff.assignedClass || '',
                              salary: staff.salary,
                              notes: staff.notes || '',
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa nhân viên"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <UserCog className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Thêm Nhân Viên / Giáo Viên Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Khai báo thông tin hồ sơ và phân công công tác trong nhà trường</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Thị Mai"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0987654321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      placeholder="example@school.edu.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Chức vụ</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value as Position })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      {Object.keys(POSITION_MAP).map((pos) => (
                        <option key={pos} value={pos}>
                          {POSITION_MAP[pos as Position].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bằng cấp / Chuyên môn</label>
                    <input
                      type="text"
                      placeholder="Đại học Sư phạm mầm non..."
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Lớp phụ trách</label>
                    <input
                      type="text"
                      placeholder="Mầm 1, Chồi 2... (nếu có)"
                      value={formData.assignedClass}
                      onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày vào làm</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Mức lương (VNĐ)</label>
                    <input
                      type="number"
                      step={500000}
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú kinh nghiệm, khen thưởng..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserCog className="w-4 h-4" />
                    Lưu hồ sơ nhân viên
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
