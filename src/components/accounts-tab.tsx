"use client";

import React, { useState, useEffect } from "react";
import Portal from "@/components/portal";
import { 
  UserCog, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  HeartHandshake, 
  Key, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2,
  Mail,
  Phone,
  GraduationCap
} from "lucide-react";

interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "PARENT";
  email?: string;
  phone?: string;
  students?: Array<{ id: string; firstName: string; lastName: string; class?: { name: string } }>;
  createdAt?: string;
}

interface StudentOption {
  id: string;
  name: string;
  className: string;
}

export default function AccountsTab() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "TEACHER" | "PARENT">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "PARENT" as "ADMIN" | "TEACHER" | "PARENT",
    email: "",
    phone: "",
    studentId: ""
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Users & Students from DB
  const fetchUsersAndStudents = async () => {
    try {
      const [resUsers, resStudents] = await Promise.all([
        fetch("/api/users").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/students").then(r => r.json()).catch(() => ([]))
      ]);

      if (resUsers.success && Array.isArray(resUsers.data)) {
        setUsers(resUsers.data);
      }

      if (Array.isArray(resStudents)) {
        const mappedStudents = resStudents.map((st: any) => ({
          id: st.id,
          name: `${st.lastName} ${st.firstName}`.trim(),
          className: st.class?.name || "Mầm 1"
        }));
        setStudentOptions(mappedStudents);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách tài khoản:", err);
    }
  };

  useEffect(() => {
    fetchUsersAndStudents();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      name: "",
      role: "PARENT",
      email: "",
      phone: "",
      studentId: ""
    });
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // để trống nếu không muốn đổi pass
      name: user.name,
      role: user.role,
      email: user.email || "",
      phone: user.phone || "",
      studentId: user.students && user.students.length > 0 ? user.students[0].id : ""
    });
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name) {
      setErrorMsg("Vui lòng nhập Họ và tên!");
      return;
    }

    try {
      if (editingUser) {
        // Cập nhật tài khoản
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUser.id,
            name: formData.name,
            role: formData.role,
            email: formData.email,
            phone: formData.phone,
            password: formData.password || undefined,
            studentId: formData.studentId
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể cập nhật tài khoản.");

        setNotification(`🎉 Đã cập nhật tài khoản "${formData.name}" thành công!`);
      } else {
        // Tạo tài khoản mới
        if (!formData.username || !formData.password) {
          setErrorMsg("Vui lòng nhập Tên đăng nhập và Mật khẩu!");
          return;
        }

        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tạo tài khoản.");

        setNotification(`🎉 Đã tạo tài khoản mới "${formData.name}" thành công!`);
      }

      setIsAddModalOpen(false);
      fetchUsersAndStudents();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi CSDL?`)) {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể xóa tài khoản.");

        setNotification(`🎉 Đã xóa tài khoản "${name}" thành công!`);
        fetchUsersAndStudents();
        setTimeout(() => setNotification(null), 4000);
      } catch (err: any) {
        alert(err.message || "Lỗi xóa tài khoản.");
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery)) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getInitials = (name: string) => {
    if (!name) return "US";
    return name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. ERP MODULE HEADER BANNER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 rounded-2xl text-white shadow-md shadow-indigo-500/20 shrink-0">
              <UserCog className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Trị Người Dùng & Phân Quyền Hệ Thống
                </h1>
                <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {users.length} tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Quản lý danh sách tài khoản đăng nhập, cấp quyền và liên kết tài khoản Phụ huynh với Học sinh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            <button
              onClick={handleOpenAddModal}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tạo Tài Khoản Mới</span>
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Users Table Container */}
      <div className="table-pro-container">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Tên, Username, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-extrabold shrink-0 mr-1">Vai trò:</span>
            <button
              onClick={() => setRoleFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                roleFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                roleFilter === "ADMIN"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Ban Giám Hiệu
            </button>
            <button
              onClick={() => setRoleFilter("TEACHER")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                roleFilter === "TEACHER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Giáo Viên
            </button>
            <button
              onClick={() => setRoleFilter("PARENT")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                roleFilter === "PARENT"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Phụ Huynh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Tên đăng nhập (Username)</th>
                <th>Vai trò</th>
                <th>Thông tin liên hệ</th>
                <th>Con học tại trường</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initials = getInitials(user.name);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ${
                            user.role === "ADMIN" ? "bg-gradient-to-br from-indigo-500 to-purple-600 ring-indigo-50" :
                            user.role === "TEACHER" ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-emerald-50" :
                            "bg-gradient-to-br from-pink-500 to-purple-500 ring-pink-50"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {user.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/50 px-2.5 py-1 rounded-lg w-fit">
                        {user.username}
                      </td>
                      <td>
                        {user.role === "ADMIN" && (
                          <span className="badge-pill badge-pill-indigo">
                            <ShieldCheck className="w-3.5 h-3.5" /> Ban Giám Hiệu
                          </span>
                        )}
                        {user.role === "TEACHER" && (
                          <span className="badge-pill badge-pill-emerald">
                            <UserCheck className="w-3.5 h-3.5" /> Giáo Viên
                          </span>
                        )}
                        {user.role === "PARENT" && (
                          <span className="badge-pill badge-pill-amber">
                            <HeartHandshake className="w-3.5 h-3.5" /> Phụ Huynh
                          </span>
                        )}
                      </td>
                      <td className="text-xs space-y-0.5">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
                            <Phone className="w-3 h-3 text-slate-400" /> {user.phone}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                        {user.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                          </div>
                        )}
                      </td>
                      <td>
                        {user.students && user.students.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.students.map((s) => (
                              <span key={s.id} className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md text-[11px] border border-indigo-100/60">
                                {s.lastName} {s.firstName} ({s.class?.name})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">—</span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa tài khoản"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa tài khoản"
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

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />
              
              <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <UserCog className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {editingUser ? "Chỉnh sửa Tài khoản" : "Tạo Tài khoản Người dùng Mới"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Cấp quyền và quản lý tài khoản truy cập hệ thống</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Tên đăng nhập (Username) *</label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Vd: phuhuynh.an"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    {editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mật khẩu bảo mật..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Họ và tên người dùng *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vd: Nguyễn Văn Hùng"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Vai trò hệ thống *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        formData.role === "ADMIN" ? "bg-indigo-600 text-white border-indigo-500 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Ban Giám Hiệu
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "TEACHER" })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        formData.role === "TEACHER" ? "bg-emerald-600 text-white border-emerald-500 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Giáo Viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: "PARENT" })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        formData.role === "PARENT" ? "bg-pink-600 text-white border-pink-500 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Phụ Huynh
                    </button>
                  </div>
                </div>

                {formData.role === "PARENT" && (
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">Liên kết Học sinh (Con)</label>
                    <select
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Chưa liên kết học sinh --</option>
                      {studentOptions.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.className})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">Email liên hệ</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="parent@..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
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
