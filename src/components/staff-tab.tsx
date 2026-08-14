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
  DollarSign,
  FileSpreadsheet,
  Printer,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';

type Position = 'TEACHER' | 'ASSISTANT' | 'COOK' | 'GUARD' | 'ADMIN_STAFF';
type Status = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';

interface Staff {
  id: string;
  fullName: string;
  dob?: string;
  cccd?: string;
  position: Position;
  phone: string;
  email: string;
  specialty?: string;
  degree: string;
  startDate: string;
  assignedClass: string;
  status: Status;
  workDays?: number;
  leaveDays?: number;
  salary: number;
  notes: string;
}

const mockData: Staff[] = [
  { id: '1', fullName: 'Nguyễn Thị Hương', dob: '1993-06-15', cccd: '034193008811', position: 'TEACHER', phone: '0987654321', email: 'huong.nt@example.com', specialty: 'Sư phạm Mầm non', degree: 'Đại học Sư phạm', startDate: '2023-08-01', assignedClass: 'Chồi 1', status: 'ACTIVE', workDays: 26, leaveDays: 0, salary: 12000000, notes: 'Giáo viên giỏi cấp trường' },
  { id: '2', fullName: 'Trần Văn Mạnh', dob: '1988-11-20', cccd: '034188009922', position: 'GUARD', phone: '0912345678', email: 'manh.tv@example.com', specialty: 'An ninh học đường', degree: 'THPT', startDate: '2022-05-15', assignedClass: '', status: 'ACTIVE', workDays: 26, leaveDays: 1, salary: 7000000, notes: 'Trực ca ngày' },
  { id: '3', fullName: 'Lê Thị Lan', dob: '1995-03-10', cccd: '034195007733', position: 'COOK', phone: '0909090909', email: 'lan.lt@example.com', specialty: 'Dinh dưỡng Mầm non', degree: 'Chứng chỉ Nấu ăn Pro', startDate: '2024-01-10', assignedClass: '', status: 'ON_LEAVE', workDays: 18, leaveDays: 8, salary: 8500000, notes: 'Nghỉ thai sản' },
  { id: '4', fullName: 'Phạm Minh Tuấn', dob: '1991-09-05', cccd: '034191006644', position: 'ADMIN_STAFF', phone: '0888888888', email: 'tuan.pm@example.com', specialty: 'Quản trị mạng & ERP', degree: 'Cử nhân CNTT', startDate: '2023-11-20', assignedClass: '', status: 'ACTIVE', workDays: 26, leaveDays: 0, salary: 10000000, notes: 'Quản trị hệ thống' },
  { id: '5', fullName: 'Đỗ Thu Hà', dob: '1997-12-18', cccd: '034197005555', position: 'ASSISTANT', phone: '0777777777', email: 'ha.dt@example.com', specialty: 'Chăm sóc trẻ mầm non', degree: 'Cao đẳng Sư phạm', startDate: '2024-02-01', assignedClass: 'Chồi 1', status: 'ACTIVE', workDays: 25, leaveDays: 1, salary: 8000000, notes: '' },
  { id: '6', fullName: 'Hoàng Quốc Việt', dob: '1990-04-25', cccd: '034190004466', position: 'TEACHER', phone: '0666666666', email: 'viet.hq@example.com', specialty: 'Giáo dục Thể chất', degree: 'Đại học', startDate: '2021-09-05', assignedClass: 'Lá 2', status: 'RESIGNED', workDays: 0, leaveDays: 0, salary: 13000000, notes: 'Chuyển công tác' },
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
  const [activeSubTab, setActiveSubTab] = useState<'PROFILE' | 'SALARY'>('PROFILE');
  const [staffList, setStaffList] = useState<Staff[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'edit' | 'delete' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'edit' | 'delete' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  useEffect(() => {
    fetch('/api/staff')
      .then((res) => res.json())
      .then((dbStaff) => {
        if (Array.isArray(dbStaff) && dbStaff.length > 0) {
          const mapped: Staff[] = dbStaff.map((s: any) => ({
            id: s.id,
            fullName: s.fullName,
            dob: s.dob ? s.dob.split('T')[0] : '1994-05-15',
            cccd: s.cccd || '034194000123',
            position: s.position as Position,
            phone: s.phone,
            email: s.email || '',
            specialty: s.specialty || 'Sư phạm Mầm non',
            degree: s.degree || '',
            startDate: s.startDate ? s.startDate.split('T')[0] : '2024-09-01',
            assignedClass: s.assignedClass || '',
            status: s.status as Status,
            workDays: s.workDays ?? 26,
            leaveDays: s.leaveDays ?? 0,
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
    dob: '1994-05-15',
    cccd: '',
    phone: '',
    email: '',
    position: 'TEACHER',
    specialty: 'Sư phạm Mầm non',
    degree: 'Cử nhân Sư phạm',
    startDate: new Date().toISOString().split('T')[0],
    assignedClass: '',
    workDays: 26,
    leaveDays: 0,
    salary: 8000000,
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      dob: '1994-05-15',
      cccd: '',
      phone: '',
      email: '',
      position: 'TEACHER',
      specialty: 'Sư phạm Mầm non',
      degree: 'Cử nhân Sư phạm',
      startDate: new Date().toISOString().split('T')[0],
      assignedClass: '',
      workDays: 26,
      leaveDays: 0,
      salary: 8000000,
      notes: '',
    });
    setEditingStaffId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      fullName: staff.fullName,
      dob: staff.dob || '1994-05-15',
      cccd: staff.cccd || '',
      phone: staff.phone,
      email: staff.email || '',
      position: staff.position,
      specialty: staff.specialty || 'Sư phạm Mầm non',
      degree: staff.degree || '',
      startDate: staff.startDate,
      assignedClass: staff.assignedClass || '',
      workDays: staff.workDays ?? 26,
      leaveDays: staff.leaveDays ?? 0,
      salary: staff.salary,
      notes: staff.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Vui lòng điền đầy đủ Họ và tên và Số điện thoại!');
      return;
    }

    const savedName = formData.fullName;

    try {
      if (editingStaffId) {
        // CẬP NHẬT NHÂN VIÊN
        setStaffList((prev) =>
          prev.map((item) =>
            item.id === editingStaffId ? ({ ...item, ...formData } as Staff) : item
          )
        );
        setIsAddModalOpen(false);
        showToast(`Đã cập nhật thành công hồ sơ nhân viên "${savedName}"!`, 'edit');

        await fetch('/api/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStaffId, ...formData }),
        });
      } else {
        // THÊM NHÂN VIÊN MỚI
        const tempId = Date.now().toString();
        const tempStaff: Staff = {
          fullName: formData.fullName || '',
          dob: formData.dob || '1994-05-15',
          cccd: formData.cccd || '',
          phone: formData.phone || '',
          email: formData.email || '',
          position: formData.position || 'TEACHER',
          specialty: formData.specialty || 'Sư phạm Mầm non',
          degree: formData.degree || 'Cử nhân Sư phạm',
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          assignedClass: formData.assignedClass || '',
          workDays: formData.workDays ?? 26,
          leaveDays: formData.leaveDays ?? 0,
          salary: formData.salary || 8000000,
          notes: formData.notes || '',
          id: tempId,
          status: 'ACTIVE',
        };

        setStaffList((prev) => [tempStaff, ...prev]);
        setIsAddModalOpen(false);
        showToast(`Đã thêm mới hồ sơ nhân viên "${savedName}" thành công!`, 'success');

        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const dbItem = await res.json();
          setStaffList((prev) =>
            prev.map((item) =>
              item.id === tempId ? { ...item, id: dbItem.id } : item
            )
          );
        }
      }

      resetForm();
    } catch (err) {
      console.error('Lỗi lưu nhân viên vào DB:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const target = staffList.find((s) => s.id === id);
    const targetName = target ? target.fullName : 'nhân viên';

    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ nhân viên "${targetName}" khỏi CSDL?`)) {
      setStaffList(staffList.filter((item) => item.id !== id));
      showToast(`Đã xóa thành công hồ sơ "${targetName}" khỏi hệ thống!`, 'delete');
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

  const handleExportExcel = () => {
    if (activeSubTab === 'PROFILE') {
      const headers = ['Họ và tên', 'Ngày sinh', 'Số CCCD', 'Chức vụ', 'SĐT', 'Email', 'Chuyên môn', 'Bằng cấp', 'Lớp phụ trách', 'Ngày vào làm', 'Trạng thái'];
      const rows = filteredStaff.map((s) => [
        s.fullName,
        s.dob || '',
        s.cccd || '',
        POSITION_MAP[s.position].label,
        s.phone,
        s.email,
        s.specialty || '',
        s.degree,
        s.assignedClass || 'Không',
        s.startDate,
        STATUS_MAP[s.status].label,
      ]);
      exportToExcel('Danh_Sach_Ho_So_Giao_Vien', headers, rows);
    } else {
      const headers = ['Họ và tên', 'Chức vụ', 'SĐT', 'Số ngày công', 'Số ngày nghỉ phép', 'Mức lương cơ bản (VNĐ)', 'Lương thực nhận ước tính (VNĐ)', 'Ghi chú'];
      const rows = filteredStaff.map((s) => {
        const estSalary = Math.round((s.salary || 0) * ((s.workDays ?? 26) / 26));
        return [
          s.fullName,
          POSITION_MAP[s.position].label,
          s.phone,
          s.workDays ?? 26,
          s.leaveDays ?? 0,
          s.salary,
          estSalary,
          s.notes || '',
        ];
      });
      exportToExcel('Bang_Theo_Doi_Ngay_Cong_Va_Luong', headers, rows);
    }
  };

  const handleExportPDF = () => {
    if (activeSubTab === 'PROFILE') {
      const headers = ['STT', 'Họ và tên', 'Ngày sinh', 'CCCD', 'Chức vụ', 'SĐT', 'Bằng cấp & Chuyên môn', 'Phụ trách', 'Trạng thái'];
      const rows = filteredStaff.map((s, idx) => [
        idx + 1,
        s.fullName,
        s.dob || '—',
        s.cccd || '—',
        POSITION_MAP[s.position].label,
        s.phone,
        `${s.degree} (${s.specialty || 'Sư phạm'})`,
        s.assignedClass ? `Lớp ${s.assignedClass}` : '—',
        STATUS_MAP[s.status].label,
      ]);
      const summary = [
        { label: 'Tổng số nhân sự', value: `${staffList.length} người` },
        { label: 'Giáo viên đang đứng lớp', value: `${activeTeachers} cô` },
        { label: 'Đang nghỉ phép', value: `${onLeaveCount} người` },
      ];
      exportToPDF('BÁO CÁO HỒ SƠ & TRÌNH ĐỘ GIÁO VIÊN - NHÂN SỰ', headers, rows, summary);
    } else {
      const headers = ['STT', 'Họ và tên', 'Chức vụ', 'SĐT', 'Ngày công', 'Nghỉ phép', 'Lương cơ bản', 'Thực nhận ước tính', 'Ghi chú'];
      const rows = filteredStaff.map((s, idx) => {
        const estSalary = Math.round((s.salary || 0) * ((s.workDays ?? 26) / 26));
        return [
          idx + 1,
          s.fullName,
          POSITION_MAP[s.position].label,
          s.phone,
          `${s.workDays ?? 26}/26 ngày`,
          `${s.leaveDays ?? 0} ngày`,
          formatCurrency(s.salary),
          formatCurrency(estSalary),
          s.notes || '—',
        ];
      });
      const totalEstSalary = filteredStaff.reduce((sum, s) => sum + Math.round((s.salary || 0) * ((s.workDays ?? 26) / 26)), 0);
      const summary = [
        { label: 'Tổng số nhân sự theo dõi', value: `${filteredStaff.length} người` },
        { label: 'Tổng quỹ lương định mức', value: formatCurrency(totalSalary) },
        { label: 'Tổng quỹ lương thực nhận ước tính', value: formatCurrency(totalEstSalary) },
      ];
      exportToPDF('BẢNG BÁO CÁO THEO DÕI NGÀY CÔNG & CHẤM LƯƠNG NHÂN SỰ', headers, rows, summary);
    }
  };

  const totalStaff = staffList.length;
  const activeTeachers = staffList.filter((s) => s.position === 'TEACHER' && s.status === 'ACTIVE').length;
  const onLeaveCount = staffList.filter((s) => s.status === 'ON_LEAVE').length;
  const totalSalary = staffList
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, curr) => acc + (curr.salary || 0), 0);

  const totalWorkDays = staffList.reduce((acc, curr) => acc + (curr.workDays ?? 26), 0);
  const avgWorkDays = Math.round(totalWorkDays / (totalStaff || 1));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Giáo viên & Nhân sự</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách hồ sơ chuyên môn, phân công giảng dạy, theo dõi ngày công và bảng lương.</p>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên mới
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('PROFILE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSubTab === 'PROFILE'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Hồ Sơ & Chuyên Môn ({staffList.length})
          </button>

          <button
            onClick={() => setActiveSubTab('SALARY')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSubTab === 'SALARY'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            2. Theo Dõi Ngày Công & Lương ({staffList.length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-extrabold transition-all border border-emerald-200/80 cursor-pointer shadow-sm"
            title="Xuất CSV Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Xuất Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-extrabold transition-all border border-indigo-200/80 cursor-pointer shadow-sm"
            title="In báo cáo PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            In PDF
          </button>
        </div>
      </div>

      {activeSubTab === 'PROFILE' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang làm việc</p>
                  <h3 className="text-2xl font-bold text-purple-700 mt-1">{staffList.filter(s => s.status === 'ACTIVE').length} <span className="text-sm font-medium text-slate-500">người</span></h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

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
                    <th>Thông tin Cá nhân</th>
                    <th>Chức vụ & Chuyên môn</th>
                    <th>Liên hệ</th>
                    <th>Phân công & Bằng cấp</th>
                    <th>Trạng thái làm việc</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy nhân viên nào phù hợp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const posInfo = POSITION_MAP[staff.position];
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
                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                  <span>NS: {staff.dob || '1994-05-15'}</span>
                                  <span>•</span>
                                  <span>CCCD: {staff.cccd || '034194000123'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${posInfo.color}`}>
                              {posInfo.label}
                            </span>
                            <span className="block text-[11px] text-indigo-600 font-semibold mt-1">
                              {staff.specialty || 'Sư phạm Mầm non'}
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
                          <td className="text-xs">
                            <div className="font-semibold text-slate-800">{staff.degree || 'Cử nhân'}</div>
                            {staff.assignedClass ? (
                              <span className="inline-block mt-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded border border-indigo-100/60">
                                Phụ trách: Lớp {staff.assignedClass}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">—</span>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">Vào làm: {staff.startDate}</div>
                          </td>
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
                                onClick={() => handleOpenEditModal(staff)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa hồ sơ"
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
        </div>
      )}

      {activeSubTab === 'SALARY' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Ngày công</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalWorkDays} <span className="text-sm font-medium text-slate-500">ngày</span></h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-sky-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TB Ngày công / NV</p>
                  <h3 className="text-2xl font-bold text-sky-600 mt-1">{avgWorkDays} <span className="text-sm font-medium text-slate-500">ngày/tháng</span></h3>
                </div>
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nghỉ phép tháng</p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1">
                    {staffList.reduce((acc, curr) => acc + (curr.leaveDays ?? 0), 0)} <span className="text-sm font-medium text-slate-500">lượt ngày</span>
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="table-pro-container">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, SĐT nhân sự..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all"
                />
              </div>

              <div className="text-xs font-bold text-slate-500">
                Định mức ngày công chuẩn: <span className="text-indigo-600 font-extrabold">26 ngày/tháng</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Chức vụ & SĐT</th>
                    <th>Theo dõi Ngày công</th>
                    <th>Theo dõi Nghỉ phép</th>
                    <th>Mức lương cơ bản</th>
                    <th>Thực nhận ước tính</th>
                    <th>Ghi chú</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy thông tin chấm công nhân viên nào.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const posInfo = POSITION_MAP[staff.position];
                      const workDays = staff.workDays ?? 26;
                      const leaveDays = staff.leaveDays ?? 0;
                      const progressPct = Math.min(100, Math.round((workDays / 26) * 100));
                      const estSalary = Math.round((staff.salary || 0) * (workDays / 26));

                      return (
                        <tr key={staff.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-xs shadow-sm ring-2 ring-indigo-50 shrink-0">
                                {getInitials(staff.fullName)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {staff.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">CCCD: {staff.cccd || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${posInfo.color}`}>
                              {posInfo.label}
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{staff.phone}</div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                                {workDays}/26 công
                              </span>
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                                <div 
                                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${leaveDays > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-400'}`}>
                              {leaveDays} ngày
                            </span>
                          </td>
                          <td className="font-bold text-slate-700 text-xs">{formatCurrency(staff.salary)}</td>
                          <td className="font-black text-emerald-600 text-sm">{formatCurrency(estSalary)}</td>
                          <td className="text-xs text-slate-500 max-w-[150px] truncate">{staff.notes || '—'}</td>
                          <td className="text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditModal(staff)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-100"
                              title="Cập nhật ngày công & lương"
                            >
                              Sửa lương/công
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
        </div>
      )}

      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <UserCog className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      {editingStaffId ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên / Giáo Viên Mới'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {editingStaffId ? 'Cập nhật lại các thông tin cá nhân, chuyên môn và quá trình làm việc' : 'Khai báo thông tin hồ sơ và phân công công tác trong nhà trường'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block mb-2">1. Thông tin cá nhân</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Thị Hương"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
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
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày sinh</label>
                      <input
                        type="date"
                        value={formData.dob || '1994-05-15'}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-semibold transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số CCCD / CMND</label>
                      <input
                        type="text"
                        placeholder="034194000123"
                        value={formData.cccd || ''}
                        onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Email</label>
                      <input
                        type="email"
                        placeholder="huong@school.edu.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block mb-2">2. Chuyên môn & Bằng cấp</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Chức vụ</label>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value as Position })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        {Object.keys(POSITION_MAP).map((pos) => (
                          <option key={pos} value={pos}>
                            {POSITION_MAP[pos as Position].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Chuyên môn</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Sư phạm Mầm non, Âm nhạc..."
                        value={formData.specialty || ''}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Bằng cấp</label>
                      <input
                        type="text"
                        placeholder="Đại học Sư phạm mầm non..."
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Lớp phụ trách</label>
                      <input
                        type="text"
                        placeholder="Mầm 1, Chồi 2... (nếu có)"
                        value={formData.assignedClass}
                        onChange={(e) => setFormData({ ...formData, assignedClass: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block mb-2">3. Theo dõi Ngày công & Lương</span>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày công tháng</label>
                      <input
                        type="number"
                        min={0}
                        max={31}
                        value={formData.workDays ?? 26}
                        onChange={(e) => setFormData({ ...formData, workDays: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-bold transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Số ngày nghỉ phép</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={formData.leaveDays ?? 0}
                        onChange={(e) => setFormData({ ...formData, leaveDays: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-bold transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Mức lương (VNĐ)</label>
                      <input
                        type="number"
                        step={500000}
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-extrabold text-indigo-700 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày vào làm</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ghi chú</label>
                      <input
                        type="text"
                        placeholder="Ghi chú kinh nghiệm, khen thưởng..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <UserCog className="w-4 h-4" />
                    {editingStaffId ? 'Cập nhật hồ sơ nhân viên' : 'Lưu hồ sơ nhân viên mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Toast Notification Banner */}
      {toast.show && (
        <Portal>
          <div className="fixed top-6 right-6 z-[9999] animate-slide-in-right">
            <div
              className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-white border-emerald-500/40 shadow-emerald-950/40'
                  : toast.type === 'edit'
                  ? 'bg-indigo-950/90 text-white border-indigo-500/40 shadow-indigo-950/40'
                  : 'bg-rose-950/90 text-white border-rose-500/40 shadow-rose-950/40'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : toast.type === 'edit'
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 animate-bounce" />}
                {toast.type === 'edit' && <UserCog className="w-5 h-5 animate-pulse" />}
                {toast.type === 'delete' && <Trash2 className="w-5 h-5 animate-bounce" />}
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  {toast.type === 'success' && 'Tạo Mới Thành Công'}
                  {toast.type === 'edit' && 'Cập Nhật Thành Công'}
                  {toast.type === 'delete' && 'Đã Xóa Dữ Liệu'}
                </h4>
                <p className="text-xs font-semibold text-white mt-0.5">{toast.message}</p>
              </div>

              <button
                onClick={() => setToast({ ...toast, show: false })}
                className="ml-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}
